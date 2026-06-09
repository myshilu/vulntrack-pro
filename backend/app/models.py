"""Data model notes for VulnTrack Pro.

The application stores data in SQLite through the standard ``sqlite3``
module. Table creation lives in ``database.py`` and request/response shapes
live in ``schemas.py``. This module is intentionally kept import-safe for
older references; it does not define SQLAlchemy models.
"""

USER_TABLE = "users"
REPORT_TABLE = "reports"
STATUS_HISTORY_TABLE = "status_history"
SESSION_TABLE = "sessions"
