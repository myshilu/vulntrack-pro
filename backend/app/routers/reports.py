"""Routes for managing vulnerability reports.

The reports API supports CRUD operations on vulnerability reports for the
currently authenticated user. Query parameters allow simple searching,
filtering and sorting. When changing the status of a report the change
is recorded in the ``status_history`` table. All database operations
are performed using the ``sqlite3`` module and raw SQL queries. This
approach avoids the need for SQLAlchemy and ensures the backend runs in
environments where external dependencies cannot be installed.
"""

from __future__ import annotations

from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from .. import schemas
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

# Allowed sort keys and their SQL expressions. Severity sorting uses a
# custom weighting to order results by the defined severity hierarchy.
# Note: For the 'severity' sort we use a CASE expression to map textual
# severities to numeric weights. The string is concatenated to avoid
# embedding newline characters inside a quoted literal.
ALLOWED_SORTS = {
    None: "created_at DESC",  # default sorting by newest
    "newest": "created_at DESC",
    "oldest": "created_at ASC",
    "severity": (
        "CASE severity "
        "WHEN 'Critical' THEN 5 "
        "WHEN 'High' THEN 4 "
        "WHEN 'Medium' THEN 3 "
        "WHEN 'Low' THEN 2 "
        "WHEN 'Informational' THEN 1 "
        "ELSE 0 END DESC, created_at DESC"
    ),
}


def _fetch_status_history(db, report_id: int) -> List[schemas.StatusHistoryOut]:
    """Helper to fetch the status history for a report ordered by timestamp."""
    cur = db.cursor()
    cur.execute(
        "SELECT id, previous_status, new_status, timestamp FROM status_history WHERE report_id = ? ORDER BY timestamp ASC",
        (report_id,),
    )
    rows = cur.fetchall()
    history: List[schemas.StatusHistoryOut] = []
    for row in rows:
        history.append(
            schemas.StatusHistoryOut(
                id=row["id"],
                previous_status=row["previous_status"],
                new_status=row["new_status"],
                timestamp=row["timestamp"],
            )
        )
    return history


def _report_row_to_schema(row: Dict[str, Any], status_history: List[schemas.StatusHistoryOut]) -> schemas.ReportOut:
    """Convert a report row and its status history into a ReportOut schema."""
    return schemas.ReportOut(
        id=row["id"],
        user_id=row["user_id"],
        title=row["title"],
        vulnerability_type=row["vulnerability_type"],
        severity=row["severity"],
        status=row["status"],
        affected_url=row["affected_url"],
        endpoint=row["endpoint"],
        http_method=row["http_method"],
        vulnerable_parameter=row["vulnerable_parameter"],
        description=row["description"],
        steps_to_reproduce=row["steps_to_reproduce"],
        actual_result=row["actual_result"],
        expected_result=row["expected_result"],
        impact=row["impact"],
        remediation=row["remediation"],
        raw_request=row["raw_request"],
        raw_response=row["raw_response"],
        notes=row["notes"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        status_history=status_history,
    )


@router.get("", response_model=List[schemas.ReportOut])
@router.get("/", response_model=List[schemas.ReportOut], include_in_schema=False)
def read_reports(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    search: Optional[str] = Query(None, description="Search by title, URL, endpoint or vulnerability type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    sort: Optional[str] = Query(None, description="Sort by 'newest', 'oldest' or 'severity'"),
) -> List[schemas.ReportOut]:
    """Return all reports belonging to the current user with optional search and filters."""
    cur = db.cursor()
    # Base query and parameters
    query = "SELECT * FROM reports WHERE user_id = ?"
    params: List[Any] = [current_user["id"]]

    # Search filter across multiple fields using LIKE
    if search:
        search_pattern = f"%{search.lower()}%"
        query += " AND (LOWER(title) LIKE ? OR LOWER(vulnerability_type) LIKE ? OR LOWER(affected_url) LIKE ? OR LOWER(endpoint) LIKE ?)"
        params.extend([search_pattern, search_pattern, search_pattern, search_pattern])

    # Filter by severity
    if severity:
        query += " AND severity = ?"
        params.append(severity)

    # Filter by status
    if status_filter:
        query += " AND status = ?"
        params.append(status_filter)

    # Sorting
    sort_key = sort if sort in ALLOWED_SORTS else None
    order_clause = ALLOWED_SORTS[sort_key]
    query += f" ORDER BY {order_clause}"

    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    reports: List[schemas.ReportOut] = []
    for row in rows:
        history = _fetch_status_history(db, row["id"])
        reports.append(_report_row_to_schema(row, history))
    return reports


@router.post("", response_model=schemas.ReportOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=schemas.ReportOut, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_report(
    report_in: schemas.ReportCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
) -> schemas.ReportOut:
    """Create a new report for the current user."""
    cur = db.cursor()
    # Prepare insert statement with all fields
    fields = [
        "user_id",
        "title",
        "vulnerability_type",
        "severity",
        "status",
        "affected_url",
        "endpoint",
        "http_method",
        "vulnerable_parameter",
        "description",
        "steps_to_reproduce",
        "actual_result",
        "expected_result",
        "impact",
        "remediation",
        "raw_request",
        "raw_response",
        "notes",
    ]
    values = [
        current_user["id"],
        report_in.title,
        report_in.vulnerability_type,
        report_in.severity,
        report_in.status,
        report_in.affected_url,
        report_in.endpoint,
        report_in.http_method,
        report_in.vulnerable_parameter,
        report_in.description,
        report_in.steps_to_reproduce,
        report_in.actual_result,
        report_in.expected_result,
        report_in.impact,
        report_in.remediation,
        report_in.raw_request,
        report_in.raw_response,
        report_in.notes,
    ]
    placeholders = ",".join(["?"] * len(fields))
    cur.execute(
        f"INSERT INTO reports ({','.join(fields)}) VALUES ({placeholders})",
        tuple(values),
    )
    db.commit()
    report_id = cur.lastrowid
    # Fetch the newly inserted report
    cur.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    row = cur.fetchone()
    history: List[schemas.StatusHistoryOut] = []
    return _report_row_to_schema(row, history)


def _get_user_report_or_404(db, current_user, report_id: int) -> Dict[str, Any]:
    """Retrieve a report owned by the current user or raise an error."""
    cur = db.cursor()
    cur.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    row = cur.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Report not found")
    if row["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorised to access this report")
    return row


@router.get("/{report_id}", response_model=schemas.ReportOut)
def read_report(
    report_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
) -> schemas.ReportOut:
    """Get a single report by ID."""
    row = _get_user_report_or_404(db, current_user, report_id)
    history = _fetch_status_history(db, report_id)
    return _report_row_to_schema(row, history)


@router.put("/{report_id}", response_model=schemas.ReportOut)
def update_report(
    report_id: int,
    report_in: schemas.ReportUpdate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
) -> schemas.ReportOut:
    """Replace an entire report with new data.

    Partial updates can also be applied since all fields are optional.
    ``status`` changes are recorded in the status history table.
    """
    row = _get_user_report_or_404(db, current_user, report_id)
    update_data = report_in.model_dump(exclude_unset=True)
    if not update_data:
        # Nothing to update
        history = _fetch_status_history(db, report_id)
        return _report_row_to_schema(row, history)
    cur = db.cursor()
    # Track status change
    old_status = row["status"]
    new_status = update_data.get("status", old_status)
    # Build dynamic SQL for update
    set_clauses = []
    values = []
    for field, value in update_data.items():
        set_clauses.append(f"{field} = ?")
        values.append(value)
    # Always update updated_at to current timestamp
    set_clauses.append("updated_at = CURRENT_TIMESTAMP")
    sql = f"UPDATE reports SET {', '.join(set_clauses)} WHERE id = ?"
    values.append(report_id)
    cur.execute(sql, tuple(values))
    # Record status history if changed
    if "status" in update_data and new_status != old_status:
        cur.execute(
            "INSERT INTO status_history (report_id, previous_status, new_status) VALUES (?, ?, ?)",
            (report_id, old_status, new_status),
        )
    db.commit()
    # Fetch updated report
    cur.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    updated_row = cur.fetchone()
    history = _fetch_status_history(db, report_id)
    return _report_row_to_schema(updated_row, history)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Delete a report and its history."""
    _ = _get_user_report_or_404(db, current_user, report_id)
    cur = db.cursor()
    # Delete status history first
    cur.execute("DELETE FROM status_history WHERE report_id = ?", (report_id,))
    # Delete the report
    cur.execute("DELETE FROM reports WHERE id = ?", (report_id,))
    db.commit()
    return None


@router.patch("/{report_id}/status", response_model=schemas.ReportOut)
def update_report_status(
    report_id: int,
    new_status: str = Query(..., description="New status for the report"),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
) -> schemas.ReportOut:
    """Update only the status of a report and record the change."""
    row = _get_user_report_or_404(db, current_user, report_id)
    old_status = row["status"]
    if new_status == old_status:
        history = _fetch_status_history(db, report_id)
        return _report_row_to_schema(row, history)
    cur = db.cursor()
    cur.execute(
        "UPDATE reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (new_status, report_id),
    )
    cur.execute(
        "INSERT INTO status_history (report_id, previous_status, new_status) VALUES (?, ?, ?)",
        (report_id, old_status, new_status),
    )
    db.commit()
    # Fetch updated report
    cur.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    updated_row = cur.fetchone()
    history = _fetch_status_history(db, report_id)
    return _report_row_to_schema(updated_row, history)
