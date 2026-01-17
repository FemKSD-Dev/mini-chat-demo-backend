#!/bin/bash
# Setup test database

set -e

echo "🗄️  Setting up test database..."

# Load test environment
export $(cat .env.test | grep -v '^#' | xargs)

# Create test database if it doesn't exist
echo "Creating test database..."
psql -h localhost -U root_chat -d postgres -c "CREATE DATABASE mini_chat_test;" 2>/dev/null || echo "Database already exists"

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Seed test data
echo "Seeding test data..."
npx prisma db seed

echo "✅ Test database setup complete!"
