"""Pydantic schemas for VulnTrack Pro API.

These classes define the shapes of data exchanged between the client and
server. Separate schemas are provided for creation, update and output
operations to allow validation rules to differ in each case (e.g. required
fields on creation versus optional fields on update).
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, constr, Field


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: constr(min_length=6)  # require at least 6 characters for passwords


class UserOut(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class StatusHistoryOut(BaseModel):
    id: int
    previous_status: str
    new_status: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportBase(BaseModel):
    title: str = Field(
        ...,
        json_schema_extra={"example": "IDOR in order service allows unauthorized access"},
    )
    vulnerability_type: str
    severity: str
    status: str
    affected_url: str
    endpoint: str
    http_method: str
    vulnerable_parameter: Optional[str] = None
    description: str
    steps_to_reproduce: str
    actual_result: str
    expected_result: str
    impact: str
    remediation: str
    raw_request: Optional[str] = None
    raw_response: Optional[str] = None
    notes: Optional[str] = None


class ReportCreate(ReportBase):
    pass


class ReportUpdate(BaseModel):
    """All fields are optional on update. Only provided fields will be modified."""

    title: Optional[str] = None
    vulnerability_type: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    affected_url: Optional[str] = None
    endpoint: Optional[str] = None
    http_method: Optional[str] = None
    vulnerable_parameter: Optional[str] = None
    description: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    actual_result: Optional[str] = None
    expected_result: Optional[str] = None
    impact: Optional[str] = None
    remediation: Optional[str] = None
    raw_request: Optional[str] = None
    raw_response: Optional[str] = None
    notes: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    user_id: int
    title: str
    vulnerability_type: str
    severity: str
    status: str
    affected_url: str
    endpoint: str
    http_method: str
    vulnerable_parameter: Optional[str]
    description: str
    steps_to_reproduce: str
    actual_result: str
    expected_result: str
    impact: str
    remediation: str
    raw_request: Optional[str]
    raw_response: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    status_history: List[StatusHistoryOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
