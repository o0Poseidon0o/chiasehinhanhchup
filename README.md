# 📸 Ứng Dụng Chọn Ảnh Online (Photo Selection Web App)

Dự án này là một ứng dụng web app hỗ trợ các nhiếp ảnh gia chia sẻ album ảnh từ Google Drive cho khách hàng tự chọn ảnh trực tuyến. Hệ thống giúp tối ưu hóa thời gian giao tiếp, tự động tổng hợp danh sách file đã chọn để thợ ảnh dễ dàng copy và import vào Lightroom/Photoshop.

## 🛠 Công Nghệ Sử Dụng (Tech Stack)

Hệ thống được thiết kế theo mô hình Fullstack NodeJS:
- **Frontend**: React (Vite) + Tailwind CSS (giao diện premium, responsive, hiệu ứng mượt mà).
- **Backend**: NodeJS + Express (xử lý API, tích hợp Google Drive API).
- **Database**: MongoDB (lưu trữ thông tin album, cài đặt, và danh sách ảnh được khách hàng chọn).
- **Deployment**: Dễ dàng deploy lên Vercel, Render hoặc hosting NodeJS bất kỳ.

---

## 🔄 Quy Trình Hoạt Động Chi Tiết (Workflow)

```
[Nhiếp ảnh gia (Admin)]
        │
        ▼ (1) Nhập link Google Drive + Cấu hình Album (Mật khẩu, giới hạn ảnh, comment)
┌─────────────────────────────────┐
│     Hệ thống lưu vào MongoDB    │
└─────────────────────────────────┘
        │
        ├─────────────────────────────────────────┐
        ▼ (2a) Link Khách hàng                    ▼ (2b) Link Quản lý (Quản trị)
[Khách hàng (Client)]                     [Nhiếp ảnh gia (Admin)]
   - Nhập mật khẩu để truy cập               - Xem tiến độ chọn ảnh của khách
   - Xem ảnh dạng Grid/Lightbox              - Mở khóa hoặc chốt album
   - Tích chọn & viết ghi chú từng ảnh        - Copy nhanh danh sách tên file chọn
   - Chốt chọn ảnh & điền Tên/SĐT            - Tải file Excel/JSON nếu cần
```

### Bước 1: Nhiếp ảnh gia (Admin) tạo Album
1. Truy cập trang chủ, điền thông tin:
   - **Tên album** (Ví dụ: `Album Cưới Tú & Thư - Studio XYZ`).
   - **Đường dẫn thư mục Google Drive** chứa ảnh (Thư mục Drive cần bật quyền xem công khai: *"Bất kỳ ai có liên kết đều có thể xem"*).
   - **Mật khẩu truy cập** (Mã PIN 4-6 chữ số giúp bảo vệ album riêng tư của khách).
   - **Giới hạn số lượng ảnh được chọn** (Ví dụ: khách chỉ được tích chọn tối đa 30 tấm).
   - **Các tùy chọn bổ sung**:
     - *Cho phép khách tải ảnh về* (Mặc định: Bật, có thể tắt).
     - *Cho phép khách bình luận trên từng ảnh* (Bật/Tắt).
2. Hệ thống kiểm tra thư mục Google Drive thông qua API backend, lấy danh sách các file ảnh (gồm tên file, ID file, link xem trước/thumbnail) và lưu thông tin album vào **MongoDB**.
3. Hệ thống trả về **2 đường dẫn (Links)**:
   - Link Khách hàng: `http://.../album/<album_id>`
   - Link Quản lý: `http://.../album/<album_id>/manage` (hoặc có token bảo mật đi kèm)

### Bước 2: Khách hàng (Client) xem và chọn ảnh
1. Khách hàng truy cập link album nhận được, nhập mật khẩu xác thực nếu có.
2. Giao diện hiển thị danh sách ảnh dạng Grid mượt mà (có hỗ trợ lazy loading để tăng tốc độ tải trang).
3. Khách hàng click vào ảnh để phóng to (Lightbox), vuốt chuyển ảnh qua lại trên điện thoại.
4. Trên từng bức ảnh:
   - Bấm nút **Chọn (Thả tim / Checkbox)** để lưu ảnh vào danh sách yêu thích.
   - Bấm nút **Ghi chú** để viết nội dung yêu cầu sửa (Ví dụ: *"Chỉnh da sáng lên"*, *"Xóa người phía sau"*).
5. Phía dưới màn hình luôn hiển thị thanh trạng thái cố định (Sticky Status Bar): **Đã chọn: X / Y ảnh** (với X là số ảnh khách đã tích chọn, Y là giới hạn tối đa).
6. Khi chọn xong, khách hàng bấm **"Gửi danh sách chọn"**, điền Tên, Số điện thoại và gửi đi. Album sẽ tự động khóa lại để tránh khách hàng thay đổi sau khi đã chốt.

### Bước 3: Nhiếp ảnh gia (Admin) nhận kết quả
1. Nhiếp ảnh gia truy cập Link Quản lý của album đó.
2. Màn hình quản lý hiển thị:
   - Tổng số ảnh khách đã chọn, thông tin Tên/SĐT của khách.
   - Danh sách các bức ảnh được chọn trực quan kèm theo bình luận chi tiết dưới từng ảnh.
3. **Tính năng cốt lõi**: Nút **"Copy danh sách tên file"** giúp copy nhanh chuỗi tên file ngăn cách bằng dấu phẩy (Ví dụ: `_DSC2041, _DSC2045, _DSC2103`).
4. Thợ ảnh dán chuỗi này vào ô tìm kiếm trong **Adobe Lightroom** hoặc **Adobe Bridge** để lọc nhanh và tiến hành photoshop.

---

## 🗄 Cấu Trúc Cơ Sở Dữ Liệu (MongoDB Schema)

### 1. Album Schema (`models/Album.js`)
Lưu trữ toàn bộ thông tin cấu hình album và trạng thái chọn ảnh của khách.

```javascript
const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  driveFolderUrl: { type: String, required: true },
  driveFolderId: { type: String, required: true },
  passcode: { type: String, default: "" }, // Mật khẩu truy cập
  maxSelect: { type: Number, default: 0 },  // 0 nghĩa là không giới hạn
  allowDownload: { type: Boolean, default: true },
  allowComment: { type: Boolean, default: true },
  
  // Trạng thái album: 'selecting' (đang chọn), 'submitted' (đã chốt), 'locked' (quản trị viên đã khóa)
  status: { type: String, enum: ['selecting', 'submitted', 'locked'], default: 'selecting' },
  
  // Thông tin khách hàng chốt chọn
  clientInfo: {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    note: { type: String, default: "" },
    submittedAt: { type: Date }
  },

  // Danh sách các file ảnh lấy từ Google Drive
  images: [{
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },
    thumbnailUrl: { type: String }, // Link ảnh thu nhỏ
    embedUrl: { type: String }      // Link ảnh lớn để xem lightbox
  }],

  // Danh sách chi tiết các ảnh khách đã chọn
  selectedImages: [{
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },
    comment: { type: String, default: "" }
  }],
  
  createdAt: { type: Date, default: Date.now }
});
```

---

## 🌐 Các Endpoint API (Express API Routes)

### Nhóm API dành cho Khách hàng
*   `GET /api/albums/:id`
    - Lấy thông tin cơ bản của album (tiêu đề, trạng thái, danh sách ảnh, tùy chọn cài đặt).
    - Không trả về thông tin mật khẩu passcode hay danh sách chọn của người khác.
*   `POST /api/albums/:id/verify-passcode`
    - Xác thực mật khẩu truy cập của album.
*   `POST /api/albums/:id/submit`
    - Khách hàng gửi danh sách ảnh chọn, bình luận và thông tin liên hệ (Tên, SĐT).

### Nhóm API dành cho Nhiếp ảnh gia (Admin)
*   `POST /api/albums`
    - Tạo mới album (Lấy link Drive, phân tích file ảnh qua backend, lưu vào DB).
*   `GET /api/albums/:id/manage`
    - Lấy đầy đủ thông tin chi tiết album bao gồm danh sách ảnh khách đã chọn, thông tin khách hàng, ghi chú để chỉnh sửa.
*   `POST /api/albums/:id/unlock`
    - Mở khóa album cho phép khách hàng chọn lại hoặc chỉnh sửa danh sách chọn.

---

## 📂 Cấu Trúc Thư Mục Dự Án Đề Xuất

Dự án được cấu trúc gộp chung (Monorepo) giúp dễ dàng quản lý và triển khai trên Vercel:

```text
chiasehinhanhchup/
├── package.json
├── vercel.json           # Cấu hình deploy Vercel
├── server/               # BACKEND (ExpressJS)
│   ├── server.js         # Entrypoint server
│   ├── config/           # Cấu hình DB, Google Drive API
│   │   └── db.js
│   ├── models/           # Mongoose schemas (Album.js)
│   └── routes/           # Các api endpoint (albumRoutes.js)
└── client/               # FRONTEND (React + Tailwind CSS - Vite)
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── index.css
        ├── App.jsx
        ├── components/   # UI Components (Grid, Lightbox, SelectionBar...)
        └── pages/        # Các trang (Home, AlbumView, AdminManage...)
```

---

## 🚀 Các Bước Phát Triển Tiếp Theo

1. **Khởi tạo và cấu hình Boilerplate**: Cài đặt React + Tailwind CSS ở thư mục `client/` và Express ở `server/`.
2. **Xây dựng Giao diện Client**: Giao diện album ảnh dạng Masonry Grid bắt mắt với hiệu ứng mượt mà, lightbox xem ảnh tràn viền, thanh chọn ảnh động ở cuối trang.
3. **Kết nối Google Drive API**: Sử dụng API Key hoặc Service Account ở backend để quét các ảnh trong thư mục Drive và trả về thông tin dạng JSON cho client hiển thị.
4. **Xây dựng Database & API**: Lưu thông tin cài đặt album và ghi nhận kết quả chọn ảnh từ khách hàng.
5. **Trang Quản trị & copy tên file**: Trang dashboard tối giản, trực quan giúp thợ ảnh quản lý các album và sao chép tên file nhanh chóng.
