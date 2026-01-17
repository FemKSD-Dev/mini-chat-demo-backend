# Mini Chat Backend API

Backend API สำหรับแอปพลิเคชันแชทแบบเรียลไทม์ที่พัฒนาด้วย Express.js, TypeScript, Prisma และ PostgreSQL

## 📋 สารบัญ

- [คุณสมบัติ](#คุณสมบัติ)
- [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
- [ความต้องการของระบบ](#ความต้องการของระบบ)
- [การติดตั้ง](#การติดตั้ง)
  - [วิธีที่ 1: ติดตั้งแบบ Local](#วิธีที่-1-ติดตั้งแบบ-local)
  - [วิธีที่ 2: ใช้ Docker (แนะนำ)](#วิธีที่-2-ใช้-docker-แนะนำ)
- [การใช้งาน](#การใช้งาน)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [การพัฒนา](#การพัฒนา)
- [การ Deploy](#การ-deploy)

## 🎯 คุณสมบัติ

- ✅ RESTful API สำหรับระบบแชท
- ✅ รองรับการสร้างและจัดการ Conversations
- ✅ ส่งและรับข้อความแบบเรียลไทม์
- ✅ Pagination สำหรับ Conversations และ Messages
- ✅ Cursor-based pagination เพื่อประสิทธิภาพที่ดี
- ✅ CORS support สำหรับ Frontend
- ✅ Type-safe ด้วย TypeScript และ Zod
- ✅ Database migrations ด้วย Prisma

## 🛠 เทคโนโลยีที่ใช้

- **Runtime**: Node.js 22+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Validation**: Zod
- **CORS**: cors middleware

## 📦 ความต้องการของระบบ

### สำหรับการติดตั้งแบบ Local:
- Node.js 22.x หรือสูงกว่า
- npm 10.x หรือสูงกว่า
- PostgreSQL 16.x หรือสูงกว่า

### สำหรับการติดตั้งด้วย Docker:
- Docker 20.x หรือสูงกว่า
- Docker Compose 2.x หรือสูงกว่า

## 🚀 การติดตั้ง

### วิธีที่ 1: ติดตั้งแบบ Local

#### 1. Clone repository

```bash
git clone <repository-url>
cd mini-chat-application/mini-chat-backend
```

#### 2. ติดตั้ง dependencies

```bash
npm install
```

#### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` จาก `.env.example`:

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
DATABASE_URL="postgresql://root_chat:root_chat@localhost:5432/mini_chat_demo"
PORT=4001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

#### 4. เริ่ม PostgreSQL Database

ใช้ Docker Compose เพื่อเริ่ม database:

```bash
docker-compose up -d
```

หรือติดตั้ง PostgreSQL แบบ standalone และสร้าง database:

```sql
CREATE DATABASE mini_chat_demo;
CREATE USER root_chat WITH PASSWORD 'root_chat';
GRANT ALL PRIVILEGES ON DATABASE mini_chat_demo TO root_chat;
```

#### 5. Run Database Migrations

```bash
npx prisma migrate deploy
```

#### 6. Seed Database (ข้อมูลตัวอย่าง)

```bash
npm run db:seed
```

#### 7. เริ่มต้น Development Server

```bash
npm run dev
```

Server จะทำงานที่ `http://localhost:4001`

---

### วิธีที่ 2: ใช้ Docker (แนะนำ)

วิธีนี้จะติดตั้งทั้ง Database และ Backend พร้อมกัน

#### 1. Clone repository

```bash
git clone <repository-url>
cd mini-chat-application/mini-chat-backend
```

#### 2. Build และเริ่ม Services

```bash
docker-compose -f docker-compose.full.yml up -d
```

คำสั่งนี้จะ:
- สร้าง PostgreSQL container
- Build Backend Docker image
- Run database migrations
- Seed ข้อมูลตัวอย่าง
- เริ่ม Backend API

#### 3. ตรวจสอบสถานะ

```bash
docker-compose -f docker-compose.full.yml ps
```

#### 4. ดู Logs

```bash
# ดู logs ทั้งหมด
docker-compose -f docker-compose.full.yml logs -f

# ดู logs เฉพาะ backend
docker-compose -f docker-compose.full.yml logs -f backend
```

#### 5. หยุด Services

```bash
docker-compose -f docker-compose.full.yml down
```

#### 6. หยุดและลบข้อมูลทั้งหมด

```bash
docker-compose -f docker-compose.full.yml down -v
```

---

### เริ่ม pgAdmin (Optional)

หากต้องการใช้ pgAdmin สำหรับจัดการ database:

```bash
docker-compose -f docker-compose.full.yml --profile tools up -d
```

เข้าใช้งานที่: `http://localhost:5050`
- Email: `admin@admin.com`
- Password: `admin`

## 📖 การใช้งาน

### Development Mode

```bash
npm run dev
```

Server จะ auto-reload เมื่อมีการแก้ไขไฟล์

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

### Database Commands

```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database (ลบข้อมูลทั้งหมดและ seed ใหม่)
npm run db:reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

### Testing

```bash
# Setup test database (first time only)
# Windows
powershell -ExecutionPolicy Bypass -File scripts/setup-test-db.ps1

# Linux/Mac
bash scripts/setup-test-db.sh

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## 🌐 API Endpoints

### Base URL
```
http://localhost:4001/api
```

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | ดึงรายชื่อผู้ใช้ทั้งหมด |
| GET | `/users/me` | ดึงข้อมูลผู้ใช้ปัจจุบัน (จาก x-user-id header) |

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | ดึงรายการ conversations (รองรับ pagination) |
| POST | `/conversations` | สร้าง conversation ใหม่ |
| GET | `/conversations/:id/messages` | ดึงข้อความใน conversation (รองรับ pagination) |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/messages` | ส่งข้อความใหม่ |

### Query Parameters

**Pagination (Conversations & Messages):**
- `limit`: จำนวนรายการต่อหน้า (default: 20)
- `cursorAt`: Timestamp สำหรับ cursor-based pagination
- `cursorId`: ID สำหรับ cursor-based pagination

**Users:**
- `includeMe`: รวมผู้ใช้ปัจจุบันในผลลัพธ์ (true/false)

### Headers

ทุก request ต้องมี header:
```
x-user-id: <user_id>
```

### ตัวอย่าง Request

#### สร้าง Conversation

```bash
curl -X POST http://localhost:4001/api/conversations \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{"participantId": 2}'
```

#### ส่งข้อความ

```bash
curl -X POST http://localhost:4001/api/messages \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "conversationId": 1,
    "body": "Hello, World!"
  }'
```

#### ดึงข้อความ

```bash
curl http://localhost:4001/api/conversations/1/messages?limit=30 \
  -H "x-user-id: 1"
```

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://root_chat:root_chat@localhost:5432/mini_chat_demo` |
| `PORT` | Port ที่ server จะทำงาน | `4001` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |

## 🗄 Database Schema

### User
- `id`: Integer (Primary Key)
- `name`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Conversation
- `id`: Integer (Primary Key, Auto-increment)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `lastMessageAt`: DateTime (nullable)
- `lastMessageId`: Integer (nullable)

### ConversationParticipant
- `id`: Integer (Primary Key, Auto-increment)
- `conversationId`: Integer (Foreign Key)
- `userId`: Integer (Foreign Key)
- `joinedAt`: DateTime

### Message
- `id`: Integer (Primary Key, Auto-increment)
- `conversationId`: Integer (Foreign Key)
- `senderId`: Integer (Foreign Key)
- `body`: String
- `createdAt`: DateTime

## 👨‍💻 การพัฒนา

### Project Structure

```
mini-chat-backend/
├── prisma/
│   ├── migrations/      # Database migrations
│   ├── schema.prisma    # Prisma schema
│   └── seed.ts          # Seed script
├── src/
│   ├── controllers/     # Business logic
│   ├── interfaces/      # TypeScript interfaces
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── schemas/         # Zod validation schemas
│   ├── scripts/         # Utility scripts
│   ├── error.ts         # Error handling
│   ├── index.ts         # Entry point
│   └── prisma.ts        # Prisma client setup
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose (DB only)
├── docker-compose.full.yml  # Docker Compose (Full stack)
└── package.json
```

### Code Style

โปรเจคใช้ TypeScript และมี type checking:

```bash
# Type check
npm run type-check
```

### Adding New Features

1. สร้าง schema ใน `src/schemas/`
2. สร้าง interface ใน `src/interfaces/`
3. สร้าง route ใน `src/routes/`
4. เพิ่ม controller logic ใน `src/controllers/`
5. Register route ใน `src/routes/index.ts`

## 🚢 การ Deploy

### Docker Production Build

```bash
# Build image
docker build -t mini-chat-backend:latest .

# Run container
docker run -d \
  -p 4001:4001 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NODE_ENV=production \
  -e CORS_ORIGIN="https://your-frontend.com" \
  --name mini-chat-backend \
  mini-chat-backend:latest
```

### Environment Variables สำหรับ Production

อย่าลืมตั้งค่า environment variables ต่อไปนี้:

- `DATABASE_URL`: Connection string ของ production database
- `NODE_ENV`: ตั้งเป็น `production`
- `CORS_ORIGIN`: URL ของ frontend production
- `PORT`: Port ที่ต้องการ (default: 4001)

### Health Check

API มี health check endpoint:

```bash
curl http://localhost:4001/api/users
```

ถ้า server ทำงานปกติจะ return status 200

## 🔧 Troubleshooting

### ปัญหา: Database connection failed

**วิธีแก้:**
1. ตรวจสอบว่า PostgreSQL ทำงานอยู่
2. ตรวจสอบ `DATABASE_URL` ใน `.env`
3. ตรวจสอบ network connectivity

```bash
# ตรวจสอบ PostgreSQL container
docker ps | grep postgres

# ตรวจสอบ logs
docker logs mini-chat-postgres
```

### ปัญหา: Port already in use

**วิธีแก้:**
เปลี่ยน port ใน `.env`:

```env
PORT=4002
```

หรือหยุด process ที่ใช้ port 4001:

```bash
# Windows
netstat -ano | findstr :4001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4001 | xargs kill -9
```

### ปัญหา: Prisma Client not generated

**วิธีแก้:**

```bash
npx prisma generate
```

### ปัญหา: Migration failed

**วิธีแก้:**

```bash
# Reset database และ run migrations ใหม่
npm run db:reset
```

## 📝 License

ISC

## 👥 Author

Mini Chat Application Team

---

## 🔗 Related

- [Frontend Repository](../mini-chat-frontend)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
