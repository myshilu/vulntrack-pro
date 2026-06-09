"""Common FastAPI dependencies for VulnTrack Pro.

This module defines reusable dependency functions used throughout the
application. The ``get_db`` dependency yields a SQLite connection and
ensures it is closed after the request. The ``get_current_user``
dependency retrieves the current authenticated user based on a session
token provided in the ``Authorization`` header. If no token is provided
or the session does not exist, an HTTP 401 error is raised.

The dependencies in this module are intentionally lightweight and avoid
SQLAlchemy. All database operations are performed using Python's built‑in
``sqlite3`` module via the helper functions provided in
``vulntrack_pro.backend.app.database``.
"""

from __future__ import annotations

from typing import Generator

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from .database import get_connection

# The OAuth2PasswordBearer utility extracts a bearer token from the
# Authorization header. Although our authentication mechanism does not
# follow OAuth2 flows, we use this utility to parse the token for us.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_db() -> Generator:
    """Yield a SQLite connection for the duration of the request.

    The connection's row factory is configured in ``database.get_connection``
    to return rows as dictionary‑like objects. After the request is
    complete the connection is automatically closed.
    """
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    """Retrieve the currently authenticated user based on a session token.

    :param token: The bearer token extracted from the ``Authorization`` header.
    :param db: A SQLite connection provided by the ``get_db`` dependency.
    :raises HTTPException: If the token is missing, invalid or the user no
        longer exists.
    :return: A row object representing the user record (columns: id, email,
        password_hash, salt, created_at).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        # No token provided
        raise credentials_exception
    cur = db.cursor()
    # Look up the session by token
    cur.execute("SELECT user_id FROM sessions WHERE token = ?", (token,))
    session_row = cur.fetchone()
    if session_row is None:
        # Session not found or expired
        raise credentials_exception
    user_id = session_row["user_id"]
    # Retrieve the user record
    cur.execute(
        "SELECT id, email, password_hash, salt, created_at FROM users WHERE id = ?",
        (user_id,),
    )
    user_row = cur.fetchone()
    if user_row is None:
        # User has been deleted but session remains
        raise credentials_exception
    return user_row