"""
EcoDrone Shared API Contracts - Response Formats

Standard API response wrappers for consistency.
"""

from pydantic import BaseModel, Field
from typing import Optional, Any, List
from datetime import datetime


class APIResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Mission created successfully",
                "data": {"mission_id": "M-20260211-001"},
                "timestamp": "2026-02-11T01:15:00Z"
            }
        }


class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = False
    error_code: str
    error_message: str
    details: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "error_code": "BATTERY_TOO_LOW",
                "error_message": "Cannot start mission: battery level 15% is below minimum 20%",
                "details": {"current_battery": 15, "minimum_required": 20},
                "timestamp": "2026-02-11T01:15:00Z"
            }
        }


class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    success: bool = True
    data: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
