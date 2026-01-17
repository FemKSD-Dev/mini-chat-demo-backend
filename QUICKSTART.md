# 🚀 Quick Start Guide - Mini Chat Backend

คู่มือเริ่มต้นใช้งานอย่างรวดเร็วสำหรับ Mini Chat Backend

## 📦 วิธีที่ 1: Docker (แนะนำสำหรับผู้เริ่มต้น)

### ขั้นตอนที่ 1: ตรวจสอบ Docker

```bash
docker --version
docker-compose --version
```

### ขั้นตอนที่ 2: เริ่มต้นใช้งาน

```bash
# เข้าไปยัง directory
cd mini-chat-backend

# เริ่ม services ทั้งหมด (Database + Backend)
docker-compose -f docker-compose.full.yml up -d
```

### ขั้นตอนที่ 3: ตรวจสอบสถานะ

```bash
# ดูว่า containers ทำงานหรือไม่
docker-compose -f docker-compose.full.yml ps

# ดู logs
docker-compose -f docker-compose.full.yml logs -f backend
```

### ขั้นตอนที่ 4: ทดสอบ API

เปิดเบราว์เซอร์หรือใช้ curl:

```bash
curl http://localhost:4001/api/users
```

### ✅ เสร็จสิ้น!

Backend API พร้อมใช้งานที่: `http://localhost:4001`

---

## 💻 วิธีที่ 2: Local Development

### ขั้นตอนที่ 1: ติดตั้ง Dependencies

```bash
npm install
```

### ขั้นตอนที่ 2: ตั้งค่า Environment

```bash
# คัดลอกไฟล์ตัวอย่าง
cp .env.example .env

# แก้ไขไฟล์ .env ตามต้องการ
```

### ขั้นตอนที่ 3: เริ่ม Database

```bash
# เริ่ม PostgreSQL ด้วย Docker
docker-compose up -d
```

### ขั้นตอนที่ 4: Setup Database

```bash
# Run migrations
npx prisma migrate deploy

# Seed ข้อมูลตัวอย่าง
npm run db:seed
```

### ขั้นตอนที่ 5: เริ่ม Development Server

```bash
npm run dev
```

### ✅ เสร็จสิ้น!

Backend API พร้อมใช้งานที่: `http://localhost:4001`

---

## 🎯 ทดสอบ API

### 1. ดึงรายชื่อผู้ใช้

```bash
curl -X GET http://localhost:4001/api/users \
  -H "x-user-id: 1"
```

### 2. สร้าง Conversation

```bash
curl -X POST http://localhost:4001/api/conversations \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{"participantId": 2}'
```

### 3. ส่งข้อความ

```bash
curl -X POST http://localhost:4001/api/messages \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "conversationId": 1,
    "body": "สวัสดีครับ!"
  }'
```

### 4. ดึงข้อความ

```bash
curl -X GET "http://localhost:4001/api/conversations/1/messages?limit=30" \
  -H "x-user-id: 1"
```

---

## 🛠 คำสั่งที่ใช้บ่อย

### Docker Commands

```bash
# ดู logs
docker-compose -f docker-compose.full.yml logs -f

# หยุด services
docker-compose -f docker-compose.full.yml down

# เริ่มใหม่
docker-compose -f docker-compose.full.yml restart

# ลบทั้งหมด (รวม volumes)
docker-compose -f docker-compose.full.yml down -v
```

### Database Commands

```bash
# เปิด Prisma Studio (Database GUI)
npx prisma studio

# Reset database
npm run db:reset

# Run migrations
npx prisma migrate deploy
```

### Development Commands

```bash
# เริ่ม dev server
npm run dev

# Build production
npm run build

# Start production
npm start

# Type check
npm run type-check
```

---

## 🔧 Troubleshooting

### ปัญหา: Port 4001 ถูกใช้งานแล้ว

**วิธีแก้:**

```bash
# Windows
netstat -ano | findstr :4001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4001 | xargs kill -9
```

### ปัญหา: Database connection failed

**วิธีแก้:**

```bash
# ตรวจสอบว่า PostgreSQL ทำงานหรือไม่
docker ps | grep postgres

# ดู logs
docker logs mini-chat-postgres

# Restart database
docker-compose restart db
```

### ปัญหา: Prisma Client error

**วิธีแก้:**

```bash
# Generate Prisma Client ใหม่
npx prisma generate

# ลองติดตั้ง dependencies ใหม่
rm -rf node_modules
npm install
```

---

## 📚 เอกสารเพิ่มเติม

- [README.md](./README.md) - เอกสารฉบับเต็ม
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)

---

## 💡 Tips

1. **ใช้ Prisma Studio** เพื่อดูและจัดการข้อมูลในฐานข้อมูล:
   ```bash
   npx prisma studio
   ```

2. **ใช้ pgAdmin** เพื่อจัดการ PostgreSQL (เปิดด้วย profile):
   ```bash
   docker-compose -f docker-compose.full.yml --profile tools up -d
   ```
   เข้าใช้งานที่: http://localhost:5050

3. **ดู API logs แบบ real-time**:
   ```bash
   docker-compose -f docker-compose.full.yml logs -f backend
   ```

4. **Reset ทุกอย่างเมื่อมีปัญหา**:
   ```bash
   docker-compose -f docker-compose.full.yml down -v
   docker-compose -f docker-compose.full.yml up -d
   ```

---

## ✅ Checklist การติดตั้ง

- [ ] ติดตั้ง Docker และ Docker Compose
- [ ] Clone repository
- [ ] รัน `docker-compose -f docker-compose.full.yml up -d`
- [ ] ตรวจสอบว่า services ทำงาน: `docker-compose ps`
- [ ] ทดสอบ API: `curl http://localhost:4001/api/users`
- [ ] เชื่อมต่อ Frontend (ถ้ามี)

**ถ้าทุกอย่างทำงาน คุณพร้อมใช้งานแล้ว! 🎉**
