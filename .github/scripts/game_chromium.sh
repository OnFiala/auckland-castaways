#!/usr/bin/env bash
set -euo pipefail

# The hosted Ubuntu image already supplies the desktop libraries. On a lean
# runner, let Playwright install the missing ones before the real playthrough.
python -m playwright install --only-shell chromium
if ! python - <<'PY'
from playwright.sync_api import sync_playwright
with sync_playwright() as api:
    api.chromium.launch().close()
PY
then
    python -m playwright install-deps chromium
fi
