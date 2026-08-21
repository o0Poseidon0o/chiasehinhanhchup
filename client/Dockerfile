# ==========================================
# STAGE 1: Build React Production Bundle
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies (bao gồm devDependencies để chạy Vite build)
RUN npm install --no-audit

# Copy toàn bộ mã nguồn Client
COPY . .

# Build phiên bản Production tối ưu
RUN npm run build

# ==========================================
# STAGE 2: NGINX Web Server siêu nhẹ
# ==========================================
FROM nginx:alpine AS runner

# Xóa trang mặc định của NGINX
RUN rm -rf /usr/share/nginx/html/*

# Copy kết quả build từ STAGE 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy file cấu hình NGINX đã tối ưu cho React Router & API Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cài đặt curl để phục vụ Healthcheck
RUN apk add --no-cache curl

# Mở cổng HTTP 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Khởi chạy NGINX
CMD ["nginx", "-g", "daemon off;"]
