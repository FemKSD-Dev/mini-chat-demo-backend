.PHONY: help install dev build start docker-build docker-up docker-down docker-logs db-migrate db-seed db-reset clean

# Default target
help:
	@echo "Mini Chat Backend - Available Commands"
	@echo "======================================="
	@echo "make install      - ติดตั้ง dependencies"
	@echo "make dev          - เริ่ม development server"
	@echo "make build        - Build production"
	@echo "make start        - เริ่ม production server"
	@echo ""
	@echo "Docker Commands:"
	@echo "make docker-build - Build Docker image"
	@echo "make docker-up    - เริ่ม Docker containers (full stack)"
	@echo "make docker-down  - หยุด Docker containers"
	@echo "make docker-logs  - ดู Docker logs"
	@echo "make docker-clean - หยุดและลบ containers + volumes"
	@echo ""
	@echo "Database Commands:"
	@echo "make db-migrate   - Run database migrations"
	@echo "make db-seed      - Seed database"
	@echo "make db-reset     - Reset database"
	@echo "make db-studio    - เปิด Prisma Studio"
	@echo ""
	@echo "Test Commands:"
	@echo "make test         - Run tests"
	@echo "make test-watch   - Run tests in watch mode"
	@echo "make test-ui      - Run tests with UI"
	@echo "make test-setup   - Setup test database"
	@echo ""
	@echo "Utility Commands:"
	@echo "make clean        - ลบ node_modules และ dist"
	@echo "make type-check   - ตรวจสอบ TypeScript types"

# Installation
install:
	npm install
	npx prisma generate

# Development
dev:
	npm run dev

# Build
build:
	npm run build

# Start production
start:
	npm start

# Docker commands
docker-build:
	docker build -t mini-chat-backend:latest .

docker-up:
	docker-compose -f docker-compose.full.yml up -d
	@echo "✅ Services started!"
	@echo "Backend API: http://localhost:4001"
	@echo "Database: localhost:5432"

docker-down:
	docker-compose -f docker-compose.full.yml down

docker-logs:
	docker-compose -f docker-compose.full.yml logs -f

docker-clean:
	docker-compose -f docker-compose.full.yml down -v
	@echo "✅ Containers and volumes removed!"

# Database commands
db-migrate:
	npx prisma migrate deploy

db-seed:
	npm run db:seed

db-reset:
	npm run db:reset

db-studio:
	npx prisma studio

# Test commands
test:
	npm test

test-watch:
	npm run test:watch

test-ui:
	npm run test:ui

test-setup:
	@echo "Setting up test database..."
	@bash scripts/setup-test-db.sh || powershell -ExecutionPolicy Bypass -File scripts/setup-test-db.ps1
	@echo "✅ Test database ready!"

# Utility commands
clean:
	rm -rf node_modules dist

type-check:
	npm run type-check

# Quick start (for first time setup)
setup: install
	@echo "Setting up database..."
	docker-compose up -d
	@sleep 5
	@make db-migrate
	@make db-seed
	@echo "✅ Setup complete! Run 'make dev' to start development server"
