"""Database seeding for VulnTrack Pro."""

from __future__ import annotations

from datetime import datetime

from . import security
from .database import get_connection


DEMO_EMAIL = "demo@vulntrack.local"
DEMO_PASSWORD = "Demo123!"


def _sample_reports() -> list[dict]:
    now = datetime.utcnow()
    return [
        {
            "title": "IDOR allows order access",
            "vulnerability_type": "IDOR",
            "severity": "High",
            "status": "New",
            "affected_url": "http://example.com/orders/123",
            "endpoint": "/orders/{order_id}",
            "http_method": "GET",
            "vulnerable_parameter": "order_id",
            "description": "The API fails to verify ownership of the order.",
            "steps_to_reproduce": "Login as user A, intercept request, modify order_id to another order.",
            "actual_result": "Order belonging to another user is returned.",
            "expected_result": "The API should return 403 Forbidden if the user does not own the order.",
            "impact": "Attackers can view other users' orders and personal data.",
            "remediation": "Implement authorization checks to ensure the authenticated user owns the resource.",
            "raw_request": "GET /orders/123 HTTP/1.1\nHost: example.com\nCookie: session=...",
            "raw_response": "HTTP/1.1 200 OK\n...",
            "notes": "Proof of concept performed on staging.",
            "created_at": now,
        },
        {
            "title": "Reflected XSS on search page",
            "vulnerability_type": "Cross-Site Scripting",
            "severity": "Medium",
            "status": "Triaged",
            "affected_url": "http://example.com/search?q=test",
            "endpoint": "/search",
            "http_method": "GET",
            "vulnerable_parameter": "q",
            "description": "Search parameter is reflected without encoding.",
            "steps_to_reproduce": "Browse to /search?q=<script>alert(1)</script>",
            "actual_result": "Alert box is triggered.",
            "expected_result": "Search results should escape HTML before rendering.",
            "impact": "An attacker could steal user session tokens.",
            "remediation": "Encode user input when reflecting it in the HTML response.",
            "raw_request": "GET /search?q=<script>alert(1)</script> HTTP/1.1\nHost: example.com",
            "raw_response": "HTTP/1.1 200 OK\n...",
            "notes": "No CSP header present.",
            "created_at": now,
        },
        {
            "title": "SQL Injection in login form",
            "vulnerability_type": "SQL Injection",
            "severity": "Critical",
            "status": "In Progress",
            "affected_url": "http://example.com/login",
            "endpoint": "/login",
            "http_method": "POST",
            "vulnerable_parameter": "username",
            "description": "User input is concatenated into a SQL query without sanitization.",
            "steps_to_reproduce": "Submit username ' OR 1=1-- and any password.",
            "actual_result": "Login bypass occurs.",
            "expected_result": "The application should validate and parameterize SQL queries.",
            "impact": "Attackers can log in as any user without knowing their password.",
            "remediation": "Use prepared statements or ORM and validate user input.",
            "raw_request": "POST /login HTTP/1.1\nHost: example.com\n\nusername=' OR 1=1--&password=test",
            "raw_response": "HTTP/1.1 302 Found\n...",
            "notes": "Urgent fix required.",
            "created_at": now,
        },
        {
            "title": "Admin panel exposed via misconfiguration",
            "vulnerability_type": "Security Misconfiguration",
            "severity": "High",
            "status": "Resolved",
            "affected_url": "http://example.com/admin",
            "endpoint": "/admin",
            "http_method": "GET",
            "vulnerable_parameter": None,
            "description": "Admin endpoint is accessible without authentication.",
            "steps_to_reproduce": "Browse directly to /admin without logging in.",
            "actual_result": "Admin panel loads.",
            "expected_result": "Unauthenticated users should be redirected to login.",
            "impact": "Unauthenticated attackers can change application settings.",
            "remediation": "Restrict access to the admin route with proper authentication and authorization checks.",
            "raw_request": "GET /admin HTTP/1.1\nHost: example.com",
            "raw_response": "HTTP/1.1 200 OK\n...",
            "notes": "Discovered during routine scanning.",
            "created_at": now,
        },
        {
            "title": "Weak password policy",
            "vulnerability_type": "Authentication Failure",
            "severity": "Low",
            "status": "Closed",
            "affected_url": "http://example.com/register",
            "endpoint": "/register",
            "http_method": "POST",
            "vulnerable_parameter": "password",
            "description": "Password policy allows common dictionary words and short passwords.",
            "steps_to_reproduce": "Register with password '123'.",
            "actual_result": "Registration succeeds.",
            "expected_result": "Application should enforce strong password policies.",
            "impact": "Increases the risk of account compromise via brute force or credential stuffing.",
            "remediation": "Enforce minimum length and complexity requirements and implement rate limiting.",
            "raw_request": "POST /register HTTP/1.1\nHost: example.com\n\nemail=test@example.com&password=123",
            "raw_response": "HTTP/1.1 201 Created\n...",
            "notes": "Improvement ticket created.",
            "created_at": now,
        },
    ]


def seed_demo_data() -> None:
    """Create the demo user and sample reports when they are missing."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (DEMO_EMAIL,))
    row = cur.fetchone()

    if row is None:
        salt, password_hash = security.hash_password(DEMO_PASSWORD)
        cur.execute(
            "INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)",
            (DEMO_EMAIL, password_hash, salt),
        )
        user_id = cur.lastrowid
    else:
        user_id = row["id"]

    columns = [
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
        "created_at",
    ]

    for report in _sample_reports():
        cur.execute("SELECT id FROM reports WHERE user_id = ? AND title = ?", (user_id, report["title"]))
        if cur.fetchone() is not None:
            continue
        values = [user_id] + [report[column] for column in columns[1:]]
        placeholders = ",".join(["?"] * len(columns))
        cur.execute(f"INSERT INTO reports ({','.join(columns)}) VALUES ({placeholders})", tuple(values))

    conn.commit()
    conn.close()
