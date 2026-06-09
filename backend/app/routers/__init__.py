"""Aggregates router modules for easier import in ``main.py``."""

from . import auth, reports, dashboard

__all__ = ["auth", "reports", "dashboard"]