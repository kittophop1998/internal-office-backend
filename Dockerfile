# --- Stage 1: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files เพื่อใช้ประโยชน์จาก Layer Caching
COPY package*.json ./

# ติดตั้ง dependencies ทั้งหมดเพื่อใช้ในการตรวจสอบ/จัดการไฟล์
RUN npm ci

# Copy source code และ config
COPY tsconfig.json ./
COPY src ./src
COPY main.ts ./

# (Optional) หากต้องการทำ Type Check สามารถเพิ่มคำสั่งได้ที่นี่
# RUN npx tsc --noEmit


# --- Stage 2: Runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app

# กำหนดสภาพแวดล้อมเป็น production
ENV NODE_ENV=production

# Copy เฉพาะ package files มาลง production deps
COPY package*.json ./

# ติดตั้งเฉพาะ production dependencies และ tsx สำหรับรัน TS
RUN npm ci --omit=dev && npm install -g tsx

# Copy source code จาก builder stage (หรือจาก local ก็ได้ แต่แนะนำจาก builder เพื่อความชัวร์)
COPY --from=builder /app/src ./src
COPY --from=builder /app/main.ts ./main.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# ใช้ User ที่ปลอดภัย (node user มีมาให้ใน alpine อยู่แล้ว)
USER node

# Expose port
EXPOSE 8000

# รันแอปพลิเคชัน
CMD ["tsx", "main.ts"]