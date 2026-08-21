# 🚀 Hướng Dẫn Triển Khai Ứng Dụng Bằng Docker (Lên Mọi Máy Chủ)

Hệ thống đã được đóng gói hoàn chỉnh bằng **Docker & Docker Compose** gồm:
1. **Frontend (`potonow_client`)**: Ứng dụng React build sẵn, phục vụ bởi web server **NGINX** siêu nhẹ, đã tối ưu nén Gzip, cache file tĩnh và định tuyến Reverse Proxy API `/api/` về Backend.
2. **Backend (`potonow_server`)**: Node.js 20 Alpine chạy Express API, kết nối MongoDB hoặc Local JSON, hỗ trợ quét Google Drive tốc độ cao.

---

## 📋 Yêu Cầu Trước Khi Cài Đặt Trên Server / VPS

Máy chủ (Ubuntu, Debian, CentOS, Rocky Linux...) chỉ cần đã cài:
- **Docker** (phiên bản 20.10 trở lên)
- **Docker Compose** (plugin `docker compose` hoặc `docker-compose`)

> *Nếu VPS mới chưa có Docker, bạn chạy 1 lệnh để cài tự động trên Ubuntu/Debian:*
> ```bash
> curl -fsSL https://get.docker.com | sh
> ```

---

## 🛠️ Các Bước Triển Khai Lên Server (Chỉ 3 Bước)

### Bước 1: Đưa Mã Nguồn Lên Máy Chủ
Bạn có thể dùng `git clone` hoặc upload thư mục dự án lên VPS:
```bash
# Ví dụ clone từ GitHub/GitLab:
git clone <URL_REPO_CUA_BAN> chiasehinhanhchup
cd chiasehinhanhchup
```

### Bước 2: Tạo File Biến Môi Trường `.env`
Tạo file `.env` tại thư mục gốc của dự án (hoặc copy từ `.env.example`):
```bash
cp .env.example .env
nano .env
```
Nội dung file `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://chonanhdb:Lenh%40n16587@chonanh.3evokx5.mongodb.net/?appName=chonanh
GOOGLE_API_KEY=AIzaSyDA1h207K_i7gUbRFyTsMZR2BZrY_1fvV0
ADMIN_PASSWORD=admin123
```
*(Bạn có thể thay đổi `ADMIN_PASSWORD` thành mật khẩu quản trị riêng của bạn).*

### Bước 3: Khởi Chạy Toàn Bộ Hệ Thống Bằng Docker Compose
Chạy lệnh sau:
```bash
docker compose up -d --build
```
> Docker sẽ tự động:
> 1. Build Client React và đóng gói vào NGINX
> 2. Build Server Node.js Alpine
> 3. Khởi chạy 2 container và liên kết mạng nội bộ bảo mật
> 4. Mở cổng **80** (Web) phục vụ người dùng toàn cầu!

Truy cập địa chỉ IP máy chủ của bạn trên trình duyệt: **`http://<IP_MAY_CHU>`**

---

## 🔒 Cài Đặt Tên Miền (Domain) & Chứng Chỉ SSL/HTTPS Miễn Phí

### Cách 1: Dùng Cloudflare (Đơn giản & nhanh nhất - Khuyên Dùng)
1. Trỏ DNS Record `A` của Domain về IP máy chủ của bạn.
2. Bật đám mây màu vàng (Proxied) trên Cloudflare.
3. Chọn chế độ SSL: **Flexible** hoặc **Full**.
4. Website của bạn sẽ tự động có **HTTPS `https://yourdomain.com`** ngay lập tức!

### Cách 2: Dùng Certbot SSL (Let's Encrypt trên VPS)
Nếu bạn muốn cài SSL trực tiếp trên server:
```bash
sudo apt update && sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## ⚙️ Các Lệnh Quản Lý Docker Tiện Dụng

| Thao Tác | Lệnh |
| :--- | :--- |
| **Xem trạng thái các container** | `docker compose ps` |
| **Xem log hoạt động thời gian thực** | `docker compose logs -f` |
| **Xem log riêng của Backend** | `docker compose logs -f server` |
| **Xem log riêng của Frontend NGINX** | `docker compose logs -f client` |
| **Khởi động lại toàn bộ hệ thống** | `docker compose restart` |
| **Dừng hệ thống** | `docker compose down` |
| **Cập nhật code mới và build lại** | `git pull && docker compose up -d --build` |

---

## 💻 Chạy Thử Trên Máy Local (Windows / Mac)
Nếu máy tính của bạn đã cài **Docker Desktop**, bạn chỉ cần mở Terminal tại thư mục dự án và chạy:
```powershell
docker compose up -d --build
```
Sau đó mở trình duyệt tại: **`http://localhost`** (Cổng 80).
