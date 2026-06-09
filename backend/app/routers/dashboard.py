"""Dashboard statistics routes.

Provides an endpoint to retrieve aggregated statistics for the current user.
Statistics include total report count, counts by severity and status, and
a list of the five most recent reports. These numbers drive the dashboard
widgets and charts on the frontend.

This implementation uses raw SQL queries against SQLite to compute
aggregations, avoiding external ORM dependencies. Returned structures
match the expectations of the frontend.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List

from fastapi import APIRouter, Depends

from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats(db=Depends(get_db), current_user=Depends(get_current_user)) -> Dict[str, Any]:
    """Compute aggregated dashboard statistics for the current user."""
    user_id = current_user["id"]
    cur = db.cursor()
    # Total reports
    cur.execute("SELECT COUNT(*) as count FROM reports WHERE user_id = ?", (user_id,))
    total_reports = cur.fetchone()["count"]
    # Counts by severity
    severity_counts: Dict[str, int] = defaultdict(int)
    cur.execute(
        "SELECT severity, COUNT(*) as count FROM reports WHERE user_id = ? GROUP BY severity",
        (user_id,),
    )
    for row in cur.fetchall():
        severity_counts[row["severity"]] = row["count"]
    # Counts by status
    status_counts: Dict[str, int] = defaultdict(int)
    cur.execute(
        "SELECT status, COUNT(*) as count FROM reports WHERE user_id = ? GROUP BY status",
        (user_id,),
    )
    for row in cur.fetchall():
        status_counts[row["status"]] = row["count"]
    # Five most recent reports (id, title, severity, status, created_at)
    cur.execute(
        "SELECT id, title, severity, status, created_at FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
        (user_id,),
    )
    recent_reports: List[Dict[str, Any]] = []
    for row in cur.fetchall():
        recent_reports.append(
            {
                "id": row["id"],
                "title": row["title"],
                "severity": row["severity"],
                "status": row["status"],
                "created_at": row["created_at"],
            }
        )
    return {
        "total_reports": total_reports,
        "severity_counts": severity_counts,
        "status_counts": status_counts,
        "recent_reports": recent_reports,
    }