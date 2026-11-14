#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$PROJECT_DIR"
: "${CAPTURE_URL:?Set CAPTURE_URL to the exact preview URL}"
: "${CAPTURE_DIR:?Set CAPTURE_DIR for screenshot evidence}"
: "${RUNTIME_DIR:?RUNTIME_DIR must point to the worker runtime}"
/usr/bin/time -p node -e 'const u = new URL(process.argv[1]); if (!/^https?:$/.test(u.protocol)) throw new Error("CAPTURE_URL must use HTTP or HTTPS.")' "$CAPTURE_URL"
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
# The runtime capture helper classifies browser/navigation infrastructure errors
# as 75 and rendering/script defects as 1, and always closes its own browser.
export CAPTURE_READY_SELECTOR='#startScreen:not(.hidden)'
export CAPTURE_AUTO_START=false
export CAPTURE_STRICT=1
/usr/bin/time -p node "$RUNTIME_DIR/scripts/default-capture.mjs"
