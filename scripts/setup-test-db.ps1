# Setup test database (PowerShell)

Write-Host "🗄️  Setting up test database..." -ForegroundColor Cyan

# Set environment variable
$env:DATABASE_URL = "postgresql://root_chat:root_chat@localhost:5432/mini_chat_test"

# Create test database if it doesn't exist
Write-Host "Creating test database..." -ForegroundColor Yellow
$createDbCommand = "CREATE DATABASE mini_chat_test;"
$env:PGPASSWORD = "root_chat"
psql -h localhost -U root_chat -d postgres -c $createDbCommand 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Database already exists or error occurred" -ForegroundColor Gray
}

# Run migrations
Write-Host "Running migrations..." -ForegroundColor Yellow
npx prisma migrate deploy

# Seed test data
Write-Host "Seeding test data..." -ForegroundColor Yellow
npx prisma db seed

Write-Host "✅ Test database setup complete!" -ForegroundColor Green
