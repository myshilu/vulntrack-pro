"""
Lightweight database layer for VulnTrack Pro.

This module uses Python's built‑in ``sqlite3`` module to persist data in a
local SQLite file. It defines helper functions for obtaining a connection
with row objects and for initialising tables on application startup. The
database file ``vulndesk.db`` lives in the parent directory of this module.

No external ORM is used to keep dependencies minimal, since SQLAlchemy
packages are not available in this environment. All SQL statements are
written manually and must be kept in sync with the Pydantic schemas in
``schemas.py``.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

# Path to the SQLite database file. The database file is created if it
# doesn't exist. It sits one directory above this module (i.e., at
# ``backend/vulntrack.db``).
DB_PATH = Path(__file__).resolve().parent.parent / "vulntrack.db"


def get_connection() -> sqlite3.Connection:
    """Return a connection to the SQLite database with row factory.

    The returned connection uses ``sqlite3.Row`` so that rows can be
    accessed like dictionaries (e.g. ``row["id"]``). Callers are
    responsible for closing the connection when finished.
    """
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """Initialise database tables if they don't exist.

    Creates tables for users, reports, status history and sessions. This
    function is idempotent and can be called multiple times. It's invoked
    during application startup.
    """
    conn = get_connection()
    with conn:
        # Users table stores unique email addresses, password hashes and
        # per‑user salts for password derivation. ``created_at`` defaults
        # to the current timestamp.
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # Reports table stores vulnerability reports. Most fields mirror
        # the report creation form. ``user_id`` links to the user that
        # created the report. ``created_at`` and ``updated_at`` track
        # timestamps. Updates to the status field should be recorded in
        # ``status_history`` separately.
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                vulnerability_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                status TEXT NOT NULL,
                affected_url TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                http_method TEXT NOT NULL,
                vulnerable_parameter TEXT,
                description TEXT NOT NULL,
                steps_to_reproduce TEXT NOT NULL,
                actual_result TEXT NOT NULL,
                expected_result TEXT NOT NULL,
                impact TEXT NOT NULL,
                remediation TEXT NOT NULL,
                raw_request TEXT,
                raw_response TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )

        # Status history table records transitions of a report's status.
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS status_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_id INTEGER NOT NULL,
                previous_status TEXT NOT NULL,
                new_status TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE
            )
            """
        )

        # Sessions table stores active session tokens. Each session maps a
        # user to a randomly generated token. When a user logs out the
        # session entry can be removed. Tokens expire implicitly when
        # removed or when no longer present in this table.
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
    conn.close()
