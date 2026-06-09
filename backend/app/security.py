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

import hashlib
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