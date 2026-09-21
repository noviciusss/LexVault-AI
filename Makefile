.PHONY: up seed dev backend frontend

up:
	docker compose up -d

seed:
	python -c "import asyncio; from app.seed import auto_seed_if_empty; asyncio.run(auto_seed_if_empty())"

backend:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

dev:
	npx concurrently "cd backend && uvicorn app.main:app --reload --port 8000" "cd frontend && npm run dev"
