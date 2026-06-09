"""Security helpers for VulnTrack Pro.

This module implements simple password hashing and session token generation
using only Python's standard library. The objective is to avoid external
cryptography dependencies such as PassLib or python‑jose which are not
available in the execution environment.

Passwords are salted and hashed with SHA‑256. A random 16‑byte salt is
generated for each password. When verifying a password the same salt is
prefixed to the plaintext password and hashed. The resulting digest is
compared to the stored hash.

Session tokens are random URL‑safe strings generated with ``secrets``. A
session token uniquely identifies a logged in user and is stored in the
``sessions`` table. When a user logs in, any previous sessions may be
cleared and a new session token created. The token is returned to the
client and must be presented in the ``Authorization: Bearer`` header on
subsequent requests.
"""

from __future__ import annotations

import base64
import hmac
import hashlib
import json
import os
import secrets
from typing import Tuple


def hash_password(password: str) -> Tuple[str, str]:
    """Generate a salt and SHA‑256 hash for a plaintext password.

    :param password: The plaintext password to hash.
    :return: A tuple of ``(salt, password_hash)``. The salt is a 32‑character
        hexadecimal string. The password hash is a 64‑character hexadecimal
        digest of ``salt + password``.
    """
    salt = secrets.token_hex(16)  # 16 bytes of entropy as hex → 32 chars
    hash_hex = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return salt, hash_hex


def verify_password(password: str, salt: str, password_hash: str) -> bool:
    """Verify a plaintext password against a stored salt and hash.

    :param password: The plaintext password provided by the user.
    :param salt: The salt associated with the stored password.
    :param password_hash: The stored SHA‑256 hash to compare against.
    :return: True if the provided password matches the stored hash, False otherwise.
    """
    computed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return secrets.compare_digest(computed, password_hash)


def generate_session_token() -> str:
    """Generate a random URL‑safe session token for user authentication.

    The token has 32 bytes of entropy and is encoded using the URL‑safe
    Base64 alphabet. It can be safely embedded in HTTP headers.
    """
    return secrets.token_urlsafe(32)


def _sign(message: bytes) -> str:
    secret = os.getenv("SESSION_SECRET") or os.getenv("JWT_SECRET") or "local-development-session-secret"
    return hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()


def create_access_token(user_id: int, email: str) -> str:
    """Create a signed bearer token that does not depend on session storage."""
    payload = json.dumps({"user_id": user_id, "email": email}, separators=(",", ":")).encode("utf-8")
    body = base64.urlsafe_b64encode(payload).decode("ascii").rstrip("=")
    signature = _sign(body.encode("ascii"))
    return f"vtp.{body}.{signature}"


def verify_access_token(token: str) -> dict | None:
    """Verify and decode a signed bearer token."""
    try:
      prefix, body, signature = token.split(".", 2)
      if prefix != "vtp":
          return None
      expected = _sign(body.encode("ascii"))
      if not hmac.compare_digest(expected, signature):
          return None
      padded_body = body + ("=" * (-len(body) % 4))
      return json.loads(base64.urlsafe_b64decode(padded_body.encode("ascii")))
    except Exception:
      return None
