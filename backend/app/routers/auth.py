"""Authentication routes for VulnTrack Pro.

This router provides endpoints to register new users, authenticate
existing users and retrieve information about the currently logged‑in
user. Authentication is performed via session tokens rather than
JSON Web Tokens. Tokens are stored in the ``sessions`` table and are
generated using secure random strings. Clients must include the token
in the ``Authorization: Bearer <token>`` header on subsequent
requests.

Passwords are never stored in plain text. Each password is salted
individually and hashed using SHA‑256. The salt and hash are stored
in the ``users`` table.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from .. import schemas, security
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user_create: schemas.UserCreate, db=Depends(get_db)):
    """Register a new user with an email and password.

    Emails must be unique; attempting to register an existing email will
    return an HTTP 400 error. On successful registration the user
    information is returned. Clients should subsequently call the
    ``/login`` endpoint to obtain a session token.
    """
    email = user_create.email.lower()
    password = user_create.password
    cur = db.cursor()
    # Check if the email is already registered
    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cur.fetchone() is not None:
        raise HTTPException(status_code=400, detail="Email already registered")
    # Hash the password
    salt, pw_hash = security.hash_password(password)
    # Insert the new user
    cur.execute(
        "INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)",
        (email, pw_hash, salt),
    )
    db.commit()
    user_id = cur.lastrowid
    # Retrieve created_at for the new user
    cur.execute("SELECT id, email, created_at FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    return schemas.UserOut(id=row["id"], email=row["email"], created_at=row["created_at"])


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    """Authenticate a user and return a session token.

    ``OAuth2PasswordRequestForm`` provides ``username`` and ``password``
    form fields which we treat as ``email`` and ``password``. Invalid
    credentials result in a 400 error rather than 401 to avoid leaking
    information about existing accounts. When login succeeds, any
    existing sessions for the user are deleted and a new session token
    is created.
    """
    email = form_data.username.lower()
    password = form_data.password
    cur = db.cursor()
    # Look up user
    cur.execute("SELECT id, password_hash, salt FROM users WHERE email = ?", (email,))
    user_row = cur.fetchone()
    if not user_row:
        # Do not reveal whether the account exists
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    user_id = user_row["id"]
    pw_hash = user_row["password_hash"]
    salt = user_row["salt"]
    if not security.verify_password(password, salt, pw_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    # Delete existing sessions for this user (optional but prevents token buildup)
    cur.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
    # Generate a new token and store it
    token = security.generate_session_token()
    cur.execute(
        "INSERT INTO sessions (user_id, token) VALUES (?, ?)",
        (user_id, token),
    )
    db.commit()
    return schemas.Token(access_token=token, token_type="bearer")


@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user=Depends(get_current_user)):
    """Return the currently authenticated user's information."""
    return schemas.UserOut(
        id=current_user["id"],
        email=current_user["email"],
        created_at=current_user["created_at"],
    )