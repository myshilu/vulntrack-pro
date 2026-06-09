"""Convenience script to run the VulnTrack Pro FastAPI server with uvicorn.

This script reads the ``HOST`` and ``PORT`` environment variables if set,
otherwise defaults to localhost:8000. Auto-reload is enabled only for local
development and disabled when ``ENVIRONMENT=production``.
"""

import os
import uvicorn

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("ENVIRONMENT", "development").lower() != "production"
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        factory=False,
    )
