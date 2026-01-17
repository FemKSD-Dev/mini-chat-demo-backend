#!/bin/sh
# Health check script for Docker container

set -e

# Check if the API is responding
response=$(wget --no-verbose --tries=1 --spider http://localhost:4001/api/users 2>&1 || true)

if echo "$response" | grep -q "200 OK"; then
    echo "✅ Health check passed"
    exit 0
else
    echo "❌ Health check failed"
    exit 1
fi
