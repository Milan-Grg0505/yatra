#!/usr/bin/env bash
# Bootstrap a local .env from .env.example, never overwriting an existing one.
# Run once after cloning:  bash scripts/setup_env.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -f .env ]]; then
    echo "✓ .env already exists — not overwriting."
else
    cp .env.example .env
    echo "✓ Created .env from .env.example"
fi

# Generate a real SECRET_KEY if it's still the placeholder
if grep -q 'change-me-please' .env; then
    SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    # Cross-platform sed inline replace
    if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "s|change-me-please.*|$SECRET|" .env
    else
        sed -i "s|change-me-please.*|$SECRET|" .env
    fi
    echo "✓ Generated a random SECRET_KEY"
fi

# Sanity-check .gitignore
if ! grep -qE '^\.env(\s|$)' .gitignore 2>/dev/null; then
    echo "⚠️  .env is NOT in .gitignore — please add it before committing."
else
    echo "✓ .env is gitignored."
fi

echo
echo "Next steps:"
echo "  1. Edit .env and fill in your credentials."
echo "  2. Start Postgres + Redis (or run: docker compose up postgres redis -d)"
echo "  3. Apply migrations:    alembic upgrade head"
echo "  4. Seed demo data:      python -m scripts.seed"
echo "  5. Start the API:       uvicorn app.main:app --reload"
