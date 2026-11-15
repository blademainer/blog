#!/bin/sh
set -eu
cd "$(dirname "$0")"
npm ci
exec npm run dev -- "$@"
