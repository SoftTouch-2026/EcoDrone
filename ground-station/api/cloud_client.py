import asyncio
import httpx
import logging
import json
import time

logger = logging.getLogger("CloudClient")

class CloudClient:
    def __init__(self, delivery_controller, api_url: str, drone_id: str, secret: str):
        self.delivery = delivery_controller
        self.api_url = api_url.rstrip("/")
        self.drone_id = drone_id
        self.secret = secret
        self.jwt_token = None
        self._running = False
        
        # Async HTTP client
        self.client = httpx.AsyncClient(timeout=10.0)

    async def start(self):
        """Start the background loops for cloud integration."""
        self._running = True
        logger.info(f"Starting Cloud Client for Drone ID: {self.drone_id} connecting to {self.api_url}")
        
        # Initial auth attempt
        await self.authenticate()

        # Start background task loops
        asyncio.create_task(self._telemetry_loop())
        asyncio.create_task(self._polling_loop())

    async def stop(self):
        """Stop background tasks and close client."""
        self._running = False
        await self.client.aclose()
        logger.info("Cloud Client stopped.")

    async def authenticate(self) -> bool:
        """Authenticate with the cloud backend using a service secret."""
        if not self.secret:
            logger.warning("No SERVICE_SECRET provided, skipping cloud authentication.")
            return False
            
        try:
            # Note: This endpoint is part of the Backend Dev gap analysis, so it might return 404 until implemented.
            response = await self.client.post(
                f"{self.api_url}/auth/serviceSignIn",
                json={"drone_id": self.drone_id, "api_key": self.secret}
            )
            response.raise_for_status()
            data = response.json()
            # Depending on backend spec, either .data.accessToken or .accessToken
            self.jwt_token = data.get("data", {}).get("accessToken") or data.get("accessToken")
            logger.info("Successfully authenticated with cloud backend.")
            return True
        except Exception as e:
            logger.warning(f"Cloud authentication failed (Backend might not be fully implemented yet): {str(e)}")
            self.jwt_token = None
            return False

    async def _request(self, method: str, endpoint: str, **kwargs):
        """Helper for authenticated requests that auto-retries authentication."""
        url = f"{self.api_url}{endpoint}"
        headers = kwargs.pop("headers", {})
        
        if self.jwt_token:
            headers["Authorization"] = f"Bearer {self.jwt_token}"

        try:
            response = await self.client.request(method, url, headers=headers, **kwargs)
            
            # If unauthorized, try logging in once and retrying
            if response.status_code == 401 and self.secret:
                logger.debug("Token expired or invalid, attempting re-authentication...")
                if await self.authenticate():
                    headers["Authorization"] = f"Bearer {self.jwt_token}"
                    response = await self.client.request(method, url, headers=headers, **kwargs)
            
            return response
        except httpx.RequestError as e:
            logger.debug(f"Network error during {method} {url}: {str(e)}")
            return None

    async def _telemetry_loop(self):
        """Continuously push telemetry to the cloud backend."""
        while self._running:
            try:
                if self.delivery:
                    # Map delivery controller state to backend telemetry schema
                    payload = {
                        "drone_id": self.drone_id,
                        "battery_level": getattr(self.delivery.drone, "battery_level", 0) if hasattr(self.delivery, "drone") else 100,
                        "latitude": self.delivery.current_lat,
                        "longitude": self.delivery.current_lon,
                        "altitude": self.delivery.current_amsl,
                        "speed_kmh": 0.0, # Olympe doesn't surface direct scalar speed easily without computing diffs
                        "heading_deg": self.delivery.current_yaw,
                        "drone_state": getattr(self.delivery, "flying_state", "landed")
                    }
                    
                    # Only send if we have a valid initial coordinate or if we are actively moving
                    # If unconnected/simulated without fix, it stays 0.0
                    if payload["latitude"] != 0.0 or getattr(self.delivery, "connected", False):
                        await self._request("POST", "/ground-station/telemetry", json=payload)
                        
            except Exception as e:
                logger.error(f"Error in telemetry loop: {e}")
                
            await asyncio.sleep(2.0)  # Push every 2 seconds

    async def _polling_loop(self):
        """Periodically check for pending flight commands from the cloud."""
        while self._running:
            try:
                response = await self._request("GET", f"/ground-station/commands/pending/{self.drone_id}")
                
                if response and response.status_code == 200:
                    data = response.json()
                    commands = data.get("data", [])
                    
                    if commands:
                        # Process the first pending command
                        command = commands[0]
                        command_id = command.get("id")
                        command_type = command.get("command_type", "flight")
                        waypoints_raw = command.get("waypoints", "[]")
                        
                        logger.info(f"Received new pending command: {command_id} ({command_type})")
                        
                        if command_type == "cancel":
                            logger.warning(f"Cloud requested flight abort. Triggering manual override.")
                            self.delivery.trigger_manual_override()
                            await self._update_command_status(command_id, "completed")
                        
                        elif command_type == "flight":
                            if self.delivery.connected or self.delivery.drone:
                                # Ack and execute
                                await self._update_command_status(command_id, "in_progress")
                                
                                # Parse waypoints -> Expecting a list of [lat, lon] tuples/lists
                                try:
                                    if isinstance(waypoints_raw, str):
                                        waypoints = json.loads(waypoints_raw)
                                    else:
                                        waypoints = waypoints_raw
                                    
                                    # Convert to list of tuples if needed
                                    wps = [(float(wp[0]), float(wp[1])) for wp in waypoints]
                                    
                                    # Launch existing background process (don't block the polling loop)
                                    asyncio.create_task(self._execute_and_complete(command_id, wps))
                                except Exception as e:
                                    logger.error(f"Failed to parse or execute waypoints for command {command_id}: {e}")
                                    await self._update_command_status(command_id, "failed")
                            else:
                                logger.info(f"Cannot execute command {command_id}: DeliveryController is disconnected.")
                        
            except Exception as e:
                logger.error(f"Error in command polling loop: {e}")
                
            await asyncio.sleep(5.0)  # Poll every 5 seconds

    async def _update_command_status(self, command_id: str, status: str):
        """Acknowledge or update the status of a command."""
        logger.debug(f"Updating command {command_id} to {status}")
        await self._request("POST", "/ground-station/commands/acknowledge", json={
            "command_id": command_id,
            "status": status,
            "drone_id": self.drone_id
        })

    async def _execute_and_complete(self, command_id: str, waypoints: list):
        """Wrap the synchronous drone execution properly and update the cloud on completion."""
        try:
            # We must run the blocking `execute_delivery` in a threadpool so we don't block asyncio
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, self.delivery.execute_delivery, waypoints)
            
            final_status = "completed" if result.get("success") else "failed"
            await self._update_command_status(command_id, final_status)
        except Exception as e:
            logger.error(f"Delivery execution heavily failed: {e}")
            await self._update_command_status(command_id, "failed")
