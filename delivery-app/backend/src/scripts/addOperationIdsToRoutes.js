const fs = require('fs')
const path = require('path')

// Mapping of route files to their endpoints and operationIds
const routeUpdates = [
    // drones.ts
    {
        file: 'drones.ts',
        endpoint: '/drones/createDrone',
        operationId: 'handleCreateDroneRequest',
    },
    {
        file: 'drones.ts',
        endpoint: '/drones/updateDrone',
        operationId: 'handleUpdateDroneRequest',
    },
    {
        file: 'drones.ts',
        endpoint: '/drones/deleteDrone',
        operationId: 'handleDeleteDroneRequest',
    },
    {
        file: 'drones.ts',
        endpoint: '/drones/assignDrone',
        operationId: 'handleAssignDroneRequest',
    },
    {
        file: 'drones.ts',
        endpoint: '/drones/getDrone',
        operationId: 'handleGetDroneRequest',
    },
    {
        file: 'drones.ts',
        endpoint: '/drones/getDrones',
        operationId: 'handleGetDronesRequest',
    },
    // locations.ts
    {
        file: 'locations.ts',
        endpoint: '/locations/createLocation',
        operationId: 'handleCreateLocationRequest',
    },
    {
        file: 'locations.ts',
        endpoint: '/locations/updateLocation',
        operationId: 'handleUpdateLocationRequest',
    },
    {
        file: 'locations.ts',
        endpoint: '/locations/deleteLocation',
        operationId: 'handleDeleteLocationRequest',
    },
    {
        file: 'locations.ts',
        endpoint: '/locations/getLocation',
        operationId: 'handleGetLocationRequest',
    },
    {
        file: 'locations.ts',
        endpoint: '/locations/getLocations',
        operationId: 'handleGetLocationsRequest',
    },
    // menu.ts
    {
        file: 'menu.ts',
        endpoint: '/menu/createMenu',
        operationId: 'handleCreateMenuRequest',
    },
    {
        file: 'menu.ts',
        endpoint: '/menu/updateMenu',
        operationId: 'handleUpdateMenuRequest',
    },
    {
        file: 'menu.ts',
        endpoint: '/menu/deleteMenu',
        operationId: 'handleDeleteMenuRequest',
    },
    {
        file: 'menu.ts',
        endpoint: '/menu/getMenu',
        operationId: 'handleGetMenuRequest',
    },
    {
        file: 'menu.ts',
        endpoint: '/menu/getMenus',
        operationId: 'handleGetMenusRequest',
    },
    // orderItem.ts
    {
        file: 'orderItem.ts',
        endpoint: '/orderItem/createOrderItem',
        operationId: 'handleCreateOrderItemRequest',
    },
    {
        file: 'orderItem.ts',
        endpoint: '/orderItem/updateOrderItem',
        operationId: 'handleUpdateOrderItemRequest',
    },
    {
        file: 'orderItem.ts',
        endpoint: '/orderItem/deleteOrderItem',
        operationId: 'handleDeleteOrderItemRequest',
    },
    {
        file: 'orderItem.ts',
        endpoint: '/orderItem/getOrderItems',
        operationId: 'handleGetOrderItemsRequest',
    },
    // orders.ts
    {
        file: 'orders.ts',
        endpoint: '/orders/createOrder',
        operationId: 'handleCreateOrderRequest',
    },
    {
        file: 'orders.ts',
        endpoint: '/orders/updateOrder',
        operationId: 'handleUpdateOrderRequest',
    },
    {
        file: 'orders.ts',
        endpoint: '/orders/deleteOrder',
        operationId: 'handleDeleteOrderRequest',
    },
    {
        file: 'orders.ts',
        endpoint: '/orders/getOrder',
        operationId: 'handleGetOrderRequest',
    },
    {
        file: 'orders.ts',
        endpoint: '/orders/getOrders',
        operationId: 'handleGetOrdersRequest',
    },
    // trips.ts
    {
        file: 'trips.ts',
        endpoint: '/trips/createTrip',
        operationId: 'handleCreateTripRequest',
    },
    {
        file: 'trips.ts',
        endpoint: '/trips/updateTrip',
        operationId: 'handleUpdateTripRequest',
    },
    {
        file: 'trips.ts',
        endpoint: '/trips/deleteTrip',
        operationId: 'handleDeleteTripRequest',
    },
    {
        file: 'trips.ts',
        endpoint: '/trips/getTrip',
        operationId: 'handleGetTripRequest',
    },
    {
        file: 'trips.ts',
        endpoint: '/trips/getTrips',
        operationId: 'handleGetTripsRequest',
    },
    {
        file: 'trips.ts',
        endpoint: '/trips/startTrip',
        operationId: 'handleStartTripRequest',
    },
    {
        file: 'trips.ts',
        endpoint: '/trips/endTrip',
        operationId: 'handleEndTripRequest',
    },
]

const routesDir = path.join(__dirname, '../routes')

// Group by file
const fileGroups = {}
for (const update of routeUpdates) {
    if (!fileGroups[update.file]) fileGroups[update.file] = []
    fileGroups[update.file].push(update)
}

for (const [fileName, updates] of Object.entries(fileGroups)) {
    const filePath = path.join(routesDir, fileName)
    let content = fs.readFileSync(filePath, 'utf-8')
    let modified = false

    for (const update of updates) {
        // Look for the endpoint path in a comment, then find the next "description:" line
        // and add operationId after it
        const lines = content.split('\n')
        let inTargetEndpoint = false
        let foundDescription = false

        for (let i = 0; i < lines.length; i++) {
            // Check if we're at the target endpoint
            if (lines[i].includes(update.endpoint + ':')) {
                inTargetEndpoint = true
                foundDescription = false
                continue
            }

            // If we're in the target endpoint and find description
            if (
                inTargetEndpoint &&
                lines[i].includes('description:') &&
                !foundDescription
            ) {
                foundDescription = true
                // Check if next line already has operationId
                if (
                    i + 1 < lines.length &&
                    lines[i + 1].includes('operationId:')
                ) {
                    inTargetEndpoint = false
                    continue
                }
                // Insert operationId after description line
                const match = lines[i].match(/^(\s*\*\s*)/)
                const indent = match ? match[1] : '     *     '
                lines.splice(
                    i + 1,
                    0,
                    `${indent}operationId: ${update.operationId}`
                )
                modified = true
                inTargetEndpoint = false
                break
            }

            // Reset if we hit another endpoint
            if (inTargetEndpoint && lines[i].includes('router.')) {
                inTargetEndpoint = false
            }
        }

        content = lines.join('\n')
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8')
        console.log(`✅ Updated ${fileName}`)
    } else {
        console.log(`⚠️  No changes needed for ${fileName}`)
    }
}

console.log('\n✅ Successfully processed all route files!')
