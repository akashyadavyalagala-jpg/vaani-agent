.PHONY: dev test lint install

dev:
	@echo "Starting development environment..."
	start /B pnpm dev &
	cd apps/api && .\venv\Scripts\Activate.ps1 && fastapi dev vaani/main.py

test:
	@echo "Running tests..."
	cd apps/api && .\venv\Scripts\Activate.ps1 && pytest
	# pnpm test is empty for now, assuming nextjs skeleton

lint:
	@echo "Running linters..."
	cd apps/api && .\venv\Scripts\Activate.ps1 && ruff check . && ruff format --check . && mypy .
	pnpm lint

install:
	@echo "Installing dependencies..."
	pnpm install
	cd apps/api && python -m venv venv && .\venv\Scripts\Activate.ps1 && pip install -r requirements.txt -r requirements-dev.txt
