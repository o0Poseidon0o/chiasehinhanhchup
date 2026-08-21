# Base image Node.js Alpine nhẹ và bảo mật
FROM node:20-alpine AS base

WORKDIR /app

# Cài đặt timezone và dependencies hệ thống cần thiết
RUN apk add --no-cache tzdata curl

# Copy package files để tối ưu hóa Docker layer caching
COPY package*.json ./

# Cài đặt dependencies (chỉ cài production dependencies)
RUN npm install --omit=dev --no-audit

# Copy toàn bộ mã nguồn server
COPY . .

# Tạo thư mục data để lưu trữ dữ liệu local JSON nếu cần
RUN mkdir -p /app/data

# Thiết lập biến môi trường mặc định
ENV NODE_ENV=production \
    PORT=5000

# Khai báo port lắng nghe
EXPOSE 5000

# Healthcheck kiểm tra trạng thái hoạt động của server
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Khởi chạy server
CMD ["node", "server.js"]
