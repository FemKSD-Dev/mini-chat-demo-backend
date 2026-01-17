# 🧪 Testing Guide - Mini Chat Backend

คู่มือการทดสอบสำหรับ Mini Chat Backend API

## 📋 สารบัญ

- [ภาพรวม](#ภาพรวม)
- [Setup](#setup)
- [การรัน Tests](#การรัน-tests)
- [โครงสร้าง Tests](#โครงสร้าง-tests)
- [การเขียน Tests](#การเขียน-tests)
- [Best Practices](#best-practices)

## 🎯 ภาพรวม

โปรเจคใช้ **Vitest** สำหรับ unit และ integration testing พร้อมกับ **Supertest** สำหรับทดสอบ HTTP endpoints

### เทคโนโลยีที่ใช้:
- **Vitest**: Test runner และ assertion library
- **Supertest**: HTTP testing library
- **PostgreSQL**: Test database (แยกจาก development)

## 🚀 Setup

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. สร้าง Test Database

#### Windows (PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-test-db.ps1
```

#### Linux/Mac:
```bash
chmod +x scripts/setup-test-db.sh
bash scripts/setup-test-db.sh
```

#### Manual Setup:
```bash
# สร้าง database
psql -h localhost -U root_chat -d postgres -c "CREATE DATABASE mini_chat_test;"

# Set environment
export DATABASE_URL="postgresql://root_chat:root_chat@localhost:5432/mini_chat_test"

# Run migrations
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

### 3. ตรวจสอบ Environment

สร้างไฟล์ `.env.test`:

```env
DATABASE_URL="postgresql://root_chat:root_chat@localhost:5432/mini_chat_test"
PORT=4002
NODE_ENV=test
CORS_ORIGIN=http://localhost:3000
```

## 🏃 การรัน Tests

### Run All Tests

```bash
npm test
```

### Watch Mode (auto-rerun on file changes)

```bash
npm run test:watch
```

### UI Mode (interactive testing)

```bash
npm run test:ui
```

### Run Specific Test File

```bash
npx vitest run src/__tests__/messages.pagination.test.ts
```

### Run Tests with Coverage

```bash
npx vitest run --coverage
```

## 📁 โครงสร้าง Tests

```
src/
├── __tests__/
│   ├── setup.ts                      # Global test setup
│   ├── messages.pagination.test.ts   # Message pagination tests
│   └── ...                           # Other test files
└── ...
```

## ✍️ การเขียน Tests

### ตัวอย่าง Test File

```typescript
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { Express } from "express";
import { createApp } from "../index";

let app: Express;

describe("Feature Name", () => {
  beforeAll(async () => {
    app = createApp();
    // Setup code here
  });

  it("should do something", async () => {
    const response = await request(app)
      .get("/api/endpoint")
      .set("x-user-id", "1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
  });
});
```

### Testing API Endpoints

#### GET Request

```typescript
const response = await request(app)
  .get("/api/users")
  .set("x-user-id", "1")
  .query({ limit: 10 });

expect(response.status).toBe(200);
expect(response.body.items).toBeInstanceOf(Array);
```

#### POST Request

```typescript
const response = await request(app)
  .post("/api/conversations")
  .set("x-user-id", "1")
  .send({ participantId: 2 });

expect(response.status).toBe(201);
expect(response.body.conversation).toBeDefined();
```

#### Testing Pagination

```typescript
// Page 1
const page1 = await request(app)
  .get("/api/conversations/1/messages?limit=10")
  .set("x-user-id", "1");

expect(page1.body.hasMore).toBe(true);
expect(page1.body.nextCursor).toBeTruthy();

// Page 2
const { cursorAt, cursorId } = page1.body.nextCursor;
const page2 = await request(app)
  .get(`/api/conversations/1/messages?limit=10&cursorAt=${cursorAt}&cursorId=${cursorId}`)
  .set("x-user-id", "1");

expect(page2.body.items).toHaveLength(10);
```

#### Testing Authorization

```typescript
// Test forbidden access
const response = await request(app)
  .get("/api/conversations/1/messages")
  .set("x-user-id", "999"); // Non-participant

expect(response.status).toBe(403);
expect(response.body.error.code).toBe("FORBIDDEN");
```

## 📝 Best Practices

### 1. แยก Test Database

- ใช้ database แยกสำหรับ testing
- อย่าใช้ development หรือ production database

### 2. Clean State

```typescript
beforeEach(async () => {
  // Clean database before each test
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
});
```

### 3. Use Descriptive Test Names

```typescript
// ❌ Bad
it("test 1", () => {});

// ✅ Good
it("should return 403 when non-participant tries to access messages", () => {});
```

### 4. Test Edge Cases

```typescript
describe("Pagination", () => {
  it("should handle empty results", async () => {
    // Test with no data
  });

  it("should handle last page", async () => {
    // Test when hasMore is false
  });

  it("should handle invalid cursor", async () => {
    // Test with invalid cursor
  });
});
```

### 5. Group Related Tests

```typescript
describe("Messages API", () => {
  describe("GET /messages", () => {
    it("should return messages", () => {});
    it("should paginate correctly", () => {});
  });

  describe("POST /messages", () => {
    it("should create message", () => {});
    it("should validate input", () => {});
  });
});
```

## 🔧 Troubleshooting

### ปัญหา: Database connection failed

**วิธีแก้:**
```bash
# ตรวจสอบว่า PostgreSQL ทำงาน
docker ps | grep postgres

# ตรวจสอบ DATABASE_URL
echo $DATABASE_URL

# สร้าง test database ใหม่
psql -h localhost -U root_chat -d postgres -c "DROP DATABASE IF EXISTS mini_chat_test;"
psql -h localhost -U root_chat -d postgres -c "CREATE DATABASE mini_chat_test;"
```

### ปัญหา: Tests timeout

**วิธีแก้:**

เพิ่ม timeout ใน `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    testTimeout: 30000, // 30 seconds
  },
});
```

### ปัญหา: Prisma Client not found

**วิธีแก้:**
```bash
npx prisma generate
```

### ปัญหา: Migration errors

**วิธีแก้:**
```bash
# Reset test database
export DATABASE_URL="postgresql://root_chat:root_chat@localhost:5432/mini_chat_test"
npx prisma migrate reset --force
```

## 📊 Test Coverage

### Generate Coverage Report

```bash
npx vitest run --coverage
```

### View Coverage Report

Coverage report จะถูกสร้างใน `coverage/` directory

```bash
# Open in browser
open coverage/index.html
```

## 🎯 Testing Checklist

- [ ] ติดตั้ง dependencies
- [ ] สร้าง test database
- [ ] ตั้งค่า `.env.test`
- [ ] Run migrations
- [ ] Seed test data
- [ ] รัน tests: `npm test`
- [ ] ตรวจสอบว่า tests ผ่านทั้งหมด

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

---

**Happy Testing! 🧪**
