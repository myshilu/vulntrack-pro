from __future__ import annotations

import sys
import time
import urllib.request


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: wait_for_url.py <url> [timeout_seconds]")
        return 2

    url = sys.argv[1]
    timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 60
    deadline = time.time() + timeout

    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if 200 <= response.status < 400:
                    return 0
        except Exception:
            time.sleep(1)

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
