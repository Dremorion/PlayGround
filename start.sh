#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$PROJECT_DIR"
: "${OPENCODE_WEB_DIR:?OPENCODE_WEB_DIR must point to the worker metadata directory}"
PORT="${PORT:-3000}"
export PORT

# This game is a dependency-free static project: its built deployment is the
# project directory, and Three.js is already vendored under vendor/.
/usr/bin/time -p test -f "$PROJECT_DIR/index.html"
/usr/bin/time -p test -f "$PROJECT_DIR/start.mjs"
/usr/bin/time -p test -f "$PROJECT_DIR/vendor/three.module.js"
/usr/bin/time -p mkdir -p "$OPENCODE_WEB_DIR"
/usr/bin/time -p node --input-type=module -e 'import { writeFileSync } from "node:fs"; import { resolve } from "node:path"; const project = resolve(process.argv[1]); const directory = resolve(process.argv[2]); if (directory !== project && !directory.startsWith(project + "/")) throw new Error("Deployment directory must be inside the project."); writeFileSync(process.env.OPENCODE_WEB_DIR + "/deployment-output.json", JSON.stringify({ project, directory }));' "$PROJECT_DIR" "$PROJECT_DIR"
exec /usr/bin/time -p node "$PROJECT_DIR/start.mjs"
