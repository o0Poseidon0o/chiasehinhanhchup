const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const testCases = [
  // MODULE 1: ĐĂNG KÝ & XÁC THỰC
  {
    module: '1. Đăng Ký & Đăng Nhập',
    id: 'TC_AUTH_01',
    title: 'Đăng ký tài khoản Khách hàng (Client) có Tỉnh/Thành, Phường/Xã',
    steps: '1. Bấm Đăng nhập / Đăng ký\n2. Chọn tab "Đăng ký mới"\n3. Chọn vai trò "Khách hàng"\n4. Nhập Tên, Email, SĐT, Mật khẩu\n5. Chọn Tỉnh/Thành (VD: Hà Nội)\n6. Chọn Phường/Xã (VD: Phường Hoàn Kiếm)\n7. Nhập Địa chỉ số nhà\n8. Bấm Đăng Ký Tài Khoản',
    expected: 'Hệ thống tạo tài khoản Khách hàng thành công, tự động đăng nhập và lưu đầy đủ Tỉnh, Phường, Địa chỉ.',
    priority: 'High',
    status: 'Pass',
    notes: 'Đã test trên live Vercel'
  },
  {
    module: '1. Đăng Ký & Đăng Nhập',
    id: 'TC_AUTH_02',
    title: 'Đăng ký Nhiếp ảnh gia (Photographer) kèm Hồ sơ năng lực & Studio',
    steps: '1. Chọn tab "Đăng ký mới"\n2. Chọn vai trò "Nhiếp ảnh gia"\n3. Nhập Tên, Email, SĐT, Pass\n4. Tải/dán Logo Studio\n5. Chọn Tỉnh/Thành và Phường/Xã Studio\n6. Nhập Địa chỉ cụ thể số nhà\n7. Nhập Giới thiệu Bio\n8. Nhập Thiết bị máy ảnh/lens\n9. Nhập Giá khởi điểm\n10. Bấm Đăng ký',
    expected: 'Hệ thống ghi nhận tài khoản NAG kèm đầy đủ Hồ sơ năng lực (Bio, Thiết bị, Giá) và Địa chỉ Studio.',
    priority: 'High',
    status: 'Pass',
    notes: 'Đầy đủ trường năng lực'
  },
  {
    module: '1. Đăng Ký & Đăng Nhập',
    id: 'TC_AUTH_03',
    title: 'Validate dữ liệu đăng ký (Mật khẩu ngắn, Trùng Email/SĐT)',
    steps: '1. Nhập mật khẩu < 6 ký tự\n2. Hoặc nhập email đã tồn tại trong DB\n3. Bấm Đăng ký',
    expected: 'Hiển thị thông báo lỗi rõ ràng, không cho phép tạo tài khoản sai quy cách.',
    priority: 'Medium',
    status: 'Pass',
    notes: ''
  },
  {
    module: '1. Đăng Ký & Đăng Nhập',
    id: 'TC_AUTH_04',
    title: 'Đăng nhập hệ thống (Email / SĐT + Mật khẩu)',
    steps: '1. Bấm Đăng nhập\n2. Nhập Email hoặc SĐT đã đăng ký\n3. Nhập Mật khẩu\n4. Bấm Đăng Nhập',
    expected: 'Đăng nhập thành công, Header cập nhật tên người dùng, mở quyền truy cập đúng vai trò.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '1. Đăng Ký & Đăng Nhập',
    id: 'TC_AUTH_05',
    title: 'Quên mật khẩu & Khôi phục tài khoản',
    steps: '1. Chọn "Quên mật khẩu?" tại modal\n2. Nhập Email tài khoản\n3. Bấm Nhận mã OTP\n4. Nhập mã OTP và Mật khẩu mới\n5. Bấm Đổi mật khẩu',
    expected: 'Hệ thống gửi mã xác thực, cho phép đặt lại mật khẩu mới an toàn.',
    priority: 'Medium',
    status: 'Pass',
    notes: ''
  },

  // MODULE 2: ĐẶT LỊCH CHỤP
  {
    module: '2. Đặt Lịch Chụp Ảnh (Booking)',
    id: 'TC_BOOK_01',
    title: 'Mở form đặt lịch chụp từ nút "Đặt Lịch" trên Menu/Banner',
    steps: '1. Bấm nút "Đặt Lịch Chụp" trên Navbar hoặc Banner\n2. Quan sát Modal đặt lịch mở ra',
    expected: 'Modal hiển thị giao diện sang trọng, tải sẵn danh mục chụp và danh sách Nhiếp ảnh gia.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '2. Đặt Lịch Chụp Ảnh (Booking)',
    id: 'TC_BOOK_02',
    title: 'Chọn Tỉnh / Thành và Phường / Xã chuẩn trong form Đặt lịch',
    steps: '1. Tại ô Tỉnh/Thành phố: Chọn tỉnh (VD: TP. Hồ Chí Minh)\n2. Quan sát ô Phường/Xã được mở khóa\n3. Chọn Phường/Xã tương ứng\n4. Nhập Địa chỉ số nhà / Địa điểm tổ chức',
    expected: 'Danh sách Phường/Xã tải động chính xác 100% từ database nội bộ GHN (0đ, không lỗi mạng).',
    priority: 'High',
    status: 'Pass',
    notes: '34 tỉnh, 3.321 phường'
  },
  {
    module: '2. Đặt Lịch Chụp Ảnh (Booking)',
    id: 'TC_BOOK_03',
    title: 'Chọn Thể loại chụp & Nhiếp ảnh gia chỉ định',
    steps: '1. Chọn gói chụp (Chân dung, Cưới, Kỷ yếu...)\n2. Chọn Nhiếp ảnh gia trong danh sách\n3. Kiểm tra tự động điền Tỉnh thành theo NAG',
    expected: 'Tự động nhận diện khu vực hoạt động của thợ ảnh để gợi ý địa bàn phù hợp.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '2. Đặt Lịch Chụp Ảnh (Booking)',
    id: 'TC_BOOK_04',
    title: 'Chọn Dịch vụ cộng thêm (Add-ons) và tính Tổng chi phí',
    steps: '1. Tích chọn Make-up chuyên nghiệp (+500k)\n2. Tích chọn Thuê trang phục (+300k)\n3. Quan sát tổng tiền tạm tính',
    expected: 'Tổng chi phí cập nhật theo thời gian thực đúng với bảng giá quy định.',
    priority: 'Medium',
    status: 'Pass',
    notes: ''
  },
  {
    module: '2. Đặt Lịch Chụp Ảnh (Booking)',
    id: 'TC_BOOK_05',
    title: 'Gửi yêu cầu đặt lịch & Tra cứu lịch chụp cá nhân',
    steps: '1. Điền Tên, SĐT, Email người đặt\n2. Bấm "Xác Nhận Đặt Lịch"\n3. Vào mục "Lịch Chụp Của Tôi" kiểm tra',
    expected: 'Tạo mã lịch chụp thành công, hiển thị trong danh sách theo dõi tiến độ của khách hàng.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },

  // MODULE 3: CẨM NANG ĐỊA ĐIỂM
  {
    module: '3. Cẩm Nang Địa Điểm (Location Guides)',
    id: 'TC_LOC_01',
    title: 'Lọc địa điểm chụp ảnh theo Vùng Miền',
    steps: '1. Cuộn đến mục "Cẩm Nang Địa Điểm Chụp"\n2. Lần lượt bấm các tab: Toàn Quốc, Miền Bắc, Miền Trung, Tây Nguyên, Miền Nam',
    expected: 'Danh sách thẻ địa điểm chuyển đổi mượt mà theo đúng vùng miền được chọn.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '3. Cẩm Nang Địa Điểm (Location Guides)',
    id: 'TC_LOC_02',
    title: 'Kiểm tra hiển thị đầy đủ thông tin trên Thẻ Địa Điểm (Card)',
    steps: '1. Quan sát từng thẻ địa điểm\n2. Kiểm tra: Tên, Huy hiệu Phường - Tỉnh, Địa chỉ chi tiết 📍, Giờ vàng, Giá vé, Mẹo góc máy, Concept tags',
    expected: 'Thẻ địa điểm hiển thị trọn vẹn, không bị khuyết ô nào, chữ rõ ràng dễ đọc.',
    priority: 'High',
    status: 'Pass',
    notes: 'Đã hoàn thiện đầy đủ'
  },
  {
    module: '3. Cẩm Nang Địa Điểm (Location Guides)',
    id: 'TC_LOC_03',
    title: 'Mở Popup xem Mẹo Chụp & Bấm nút "Chỉ Đường Maps"',
    steps: '1. Bấm vào thẻ địa điểm hoặc nút "Mẹo Chụp"\n2. Xem khung Tọa độ chi tiết\n3. Bấm nút "Chỉ Đường Maps"',
    expected: 'Popup mở giữa màn hình, nút Chỉ đường mở Google Maps chính xác địa chỉ thực tế.',
    priority: 'High',
    status: 'Pass',
    notes: 'Liên kết Google Maps chuẩn'
  },
  {
    module: '3. Cẩm Nang Địa Điểm (Location Guides)',
    id: 'TC_LOC_04',
    title: 'Xem Video Review Góc Máy Thực Tế (YouTube / TikTok)',
    steps: '1. Trong modal địa điểm, chuyển tab "Video Review"\n2. Bấm xem video hoặc bấm "Mở Video Ngay"',
    expected: 'Video phát mượt mà hoặc chuyển hướng đến clip hậu trường sống ảo thực tế.',
    priority: 'Medium',
    status: 'Pass',
    notes: ''
  },
  {
    module: '3. Cẩm Nang Địa Điểm (Location Guides)',
    id: 'TC_LOC_05',
    title: 'Thao tác liên kết từ Địa Điểm: "Đặt Lịch Chụp Tại Đây" & "Tìm NAG"',
    steps: '1. Trong popup địa điểm, bấm "Đặt Lịch Chụp Tại Đây"\n2. Hoặc bấm "Tìm Nhiếp Ảnh Gia Tại [Tỉnh]"',
    expected: 'Chuyển thẳng sang form Đặt lịch có sẵn tên địa điểm hoặc trang tìm kiếm NAG theo đúng Tỉnh.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },

  // MODULE 4: NHIẾP ẢNH GIA
  {
    module: '4. Hồ Sơ Nhiếp Ảnh Gia (Photographers)',
    id: 'TC_PHOTO_01',
    title: 'Tìm kiếm & Bộ lọc Nhiếp ảnh gia theo Tỉnh / Thể loại',
    steps: '1. Truy cập trang /photographers\n2. Gõ từ khóa tìm kiếm (tên, khu vực, thiết bị)\n3. Chọn lọc theo thể loại (Áo dài, Cưới, Chân dung...)',
    expected: 'Kết quả lọc nhanh chóng, chính xác theo từ khóa và tiêu chí.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '4. Hồ Sơ Nhiếp Ảnh Gia (Photographers)',
    id: 'TC_PHOTO_02',
    title: 'Xem trang chi tiết Hồ sơ Nhiếp ảnh gia (/photographer/:id)',
    steps: '1. Bấm vào thẻ một Nhiếp ảnh gia\n2. Kiểm tra: Bio năng lực, Thiết bị chính, Kinh nghiệm, Địa chỉ Studio, Link Portfolio, Nút Zalo, Bảng giá',
    expected: 'Trang cá nhân của thợ ảnh hiển thị đẳng cấp, chuyên nghiệp, thông tin minh bạch.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },

  // MODULE 5: STUDIO WORKSPACE & ALBUM
  {
    module: '5. Studio Workspace (Dành cho NAG)',
    id: 'TC_STUDIO_01',
    title: 'Cài đặt Hồ sơ Studio & Địa chỉ hoạt động',
    steps: '1. Đăng nhập tài khoản NAG, vào /app\n2. Chuyển mục "Cài đặt Studio & Hồ sơ"\n3. Cập nhật Tỉnh/Thành, Phường/Xã, Địa chỉ số nhà\n4. Bấm "Lưu Thông Tin"',
    expected: 'Hệ thống lưu thành công, danh sách Phường/Xã tự động đồng bộ theo Tỉnh.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '5. Studio Workspace (Dành cho NAG)',
    id: 'TC_STUDIO_02',
    title: 'Tạo Album ảnh mới & Tải ảnh hàng loạt (Bulk Upload)',
    steps: '1. Bấm "Tạo Album Mới"\n2. Nhập Tên album, Khách hàng, Mã PIN bảo mật\n3. Kéo thả hàng chục ảnh chất lượng cao vào album\n4. Đặt hạn mức số ảnh chọn (VD: 30 ảnh)\n5. Xuất bản Album',
    expected: 'Album được tạo thành công, ảnh tải lên giữ nguyên độ nét gốc không bị vỡ/nén.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '5. Studio Workspace (Dành cho NAG)',
    id: 'TC_STUDIO_03',
    title: 'Chia sẻ Link Album & Mã PIN cho Khách hàng',
    steps: '1. Bấm "Sao chép Link xem ảnh" hoặc gửi kèm mã PIN\n2. Mở trình duyệt ẩn danh kiểm tra',
    expected: 'Link truy cập trực tiếp trang chọn ảnh của khách hàng bảo mật bằng mã PIN.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },

  // MODULE 6: KHÁCH HÀNG CHỌN ẢNH
  {
    module: '6. Khách Hàng Chọn Ảnh (Client Album)',
    id: 'TC_CLIENT_01',
    title: 'Nhập mã PIN bảo mật để mở Album ảnh',
    steps: '1. Mở link /album/:id\n2. Nhập đúng mã PIN do Studio cung cấp\n3. Bấm "Mở Album"',
    expected: 'Xác thực thành công, hiển thị toàn bộ ảnh trong album.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '6. Khách Hàng Chọn Ảnh (Client Album)',
    id: 'TC_CLIENT_02',
    title: 'Trải nghiệm xem ảnh toàn màn hình (Lightbox) & Phóng to',
    steps: '1. Bấm vào bất kỳ tấm ảnh để xem kích thước lớn\n2. Bấm nút Next/Prev qua lại\n3. Thử zoom ảnh',
    expected: 'Xem ảnh siêu mượt, sắc nét trên cả điện thoại và máy tính.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '6. Khách Hàng Chọn Ảnh (Client Album)',
    id: 'TC_CLIENT_03',
    title: 'Thao tác Thả tim / Chọn ảnh & Gửi danh sách về Studio',
    steps: '1. Bấm vào biểu tượng trái tim trên các ảnh ưng ý\n2. Theo dõi thanh đếm: "Đã chọn X / Y ảnh"\n3. Nhập ghi chú chỉnh sửa (VD: "bóp eo, xóa người phía sau")\n4. Bấm "Gửi Danh Sách Ảnh Đã Chọn"',
    expected: 'Studio nhận được ngay danh sách ảnh khách đã chọn kèm ghi chú chi tiết.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },

  // MODULE 7: MASTER ADMIN
  {
    module: '7. Bảng Quản Trị Hệ Thống (Master Admin)',
    id: 'TC_ADMIN_01',
    title: 'Quản lý Cẩm nang Địa điểm (Thêm, Sửa Tỉnh/Phường/Địa chỉ, Xóa)',
    steps: '1. Đăng nhập Admin, vào mục "Cẩm nang Địa điểm"\n2. Bấm Thêm mới hoặc Sửa 1 địa điểm\n3. Thử chọn Tỉnh/Thành -> Phường/Xã -> Nhập Địa chỉ số nhà\n4. Bấm Lưu',
    expected: 'Dữ liệu cập nhật ngay lập tức lên trang chủ.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '7. Bảng Quản Trị Hệ Thống (Master Admin)',
    id: 'TC_ADMIN_02',
    title: 'Quản lý Phê duyệt Nhiếp ảnh gia & Bật/Tắt chế độ tự do',
    steps: '1. Vào mục "Quản trị Nhiếp ảnh gia"\n2. Gạt nút Bật/Tắt "Trải nghiệm Tự do" vs "Khóa kiểm duyệt"\n3. Duyệt hồ sơ hoặc Khóa tài khoản đối tác',
    expected: 'Cập nhật quyền hạn và chính sách đăng ký tức thì.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '7. Bảng Quản Trị Hệ Thống (Master Admin)',
    id: 'TC_ADMIN_03',
    title: 'Quản lý Người dùng & Xuất danh bạ Excel/CSV',
    steps: '1. Vào mục "Quản lý Người dùng"\n2. Tìm kiếm người dùng theo tên, email, khu vực địa chỉ\n3. Bấm "Xuất CSV / Danh bạ"',
    expected: 'Tải về file danh sách người dùng đầy đủ cột Họ tên, SĐT, Email, Địa chỉ, Vai trò.',
    priority: 'Medium',
    status: 'Pass',
    notes: ''
  },

  // MODULE 8: GIAO DIỆN & TỐI ƯU SEO
  {
    module: '8. Tối Ưu Hiển Thị & AI SEO',
    id: 'TC_SEO_01',
    title: 'Kiểm tra tệp robots.txt và quyền truy cập của Bot AI',
    steps: '1. Truy cập URL: /robots.txt\n2. Kiểm tra xem có mở quyền cho GPTBot, ClaudeBot, PerplexityBot, Google-Extended',
    expected: 'Trả về mã 200 OK với đầy đủ danh sách cấu hình AI Bot.',
    priority: 'High',
    status: 'Pass',
    notes: 'robots.txt chuẩn'
  },
  {
    module: '8. Tối Ưu Hiển Thị & AI SEO',
    id: 'TC_SEO_02',
    title: 'Kiểm tra tệp chuẩn AI Context: /llms.txt',
    steps: '1. Truy cập URL: /llms.txt\n2. Kiểm tra nội dung tóm tắt dịch vụ, cẩm nang và FAQ theo chuẩn LLM',
    expected: 'Trả về nội dung Markdown chuẩn chỉnh để các AI đọc hiểu trong vài ms.',
    priority: 'High',
    status: 'Pass',
    notes: 'llms.txt chuẩn'
  },
  {
    module: '8. Tối Ưu Hiển Thị & AI SEO',
    id: 'TC_SEO_03',
    title: 'Kiểm tra Thẻ Dữ Liệu Cấu Trúc Schema.org JSON-LD',
    steps: '1. Mở xem mã nguồn trang chủ (View Page Source)\n2. Tìm kiếm thẻ <script type="application/ld+json">\n3. Kiểm tra WebSite, Organization, TouristAttraction',
    expected: 'Chứa đầy đủ cấu trúc dữ liệu JSON-LD cho Google Knowledge Graph và AI Search.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  },
  {
    module: '8. Tối Ưu Hiển Thị & AI SEO',
    id: 'TC_SEO_04',
    title: 'Cơ chế chống sập trang toàn cục (ErrorBoundary)',
    steps: '1. Thao tác mọi trang trên ứng dụng\n2. Kiểm tra nếu có lỗi bất ngờ',
    expected: 'Không bao giờ xuất hiện màn hình trắng bóc; luôn hiển thị giao diện báo lỗi thân thiện kèm nút Tải lại.',
    priority: 'High',
    status: 'Pass',
    notes: ''
  }
];

// 1. Tạo file Excel .XLSX
const wsData = [
  ['BẢNG KIỂM THỬ CHỨC NĂNG HỆ THỐNG PHOTODATE (TEST CASES CHECKLIST)'],
  ['Hệ thống: Photodate - Nền tảng Đặt lịch & Chia sẻ Hình ảnh Chụp Chuyên nghiệp'],
  [`Ngày xuất bản: ${new Date().toLocaleDateString('vi-VN')} | Phiên bản: 2.0`],
  [],
  ['Mã Test Case', 'Phân Hệ / Module', 'Tiêu Đề Kiểm Thử', 'Các Bước Thực Hiện', 'Kết Quả Mong Đợi', 'Mức Độ Ưu Tiên', 'Trạng Thái', 'Người Kiểm Thử', 'Ghi Chú']
];

testCases.forEach(tc => {
  wsData.push([
    tc.id,
    tc.module,
    tc.title,
    tc.steps,
    tc.expected,
    tc.priority,
    tc.status,
    'Tester / QA',
    tc.notes
  ]);
});

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(wsData);

// Cấu hình độ rộng các cột trong Excel
ws['!cols'] = [
  { wch: 16 }, // Mã TC
  { wch: 28 }, // Module
  { wch: 36 }, // Tiêu đề
  { wch: 45 }, // Các bước
  { wch: 45 }, // Kết quả mong đợi
  { wch: 14 }, // Ưu tiên
  { wch: 12 }, // Trạng thái
  { wch: 16 }, // Tester
  { wch: 22 }  // Ghi chú
];

XLSX.utils.book_append_sheet(wb, ws, 'Photodate_TestCases');

const outputPathXlsx = path.join(__dirname, '../../Photodate_Test_Cases_Checklist.xlsx');
const clientPublicXlsx = path.join(__dirname, '../../client/public/Photodate_Test_Cases_Checklist.xlsx');

XLSX.writeFile(wb, outputPathXlsx);
XLSX.writeFile(wb, clientPublicXlsx);

// 2. Tạo file CSV (UTF-8 BOM để Excel tự động nhận font tiếng Việt)
const csvHeader = ['Mã Test Case', 'Phân Hệ / Module', 'Tiêu Đề Kiểm Thử', 'Các Bước Thực Hiện', 'Kết Quả Mong Đợi', 'Mức Độ Ưu Tiên', 'Trạng Thái', 'Người Kiểm Thử', 'Ghi Chú'];
const csvRows = testCases.map(tc => [
  `"${tc.id}"`,
  `"${tc.module}"`,
  `"${tc.title.replace(/"/g, '""')}"`,
  `"${tc.steps.replace(/"/g, '""')}"`,
  `"${tc.expected.replace(/"/g, '""')}"`,
  `"${tc.priority}"`,
  `"${tc.status}"`,
  `"Tester / QA"`,
  `"${tc.notes.replace(/"/g, '""')}"`
]);

const csvContent = '\uFEFF' + [csvHeader.join(','), ...csvRows.map(r => r.join(','))].join('\n');
const outputPathCsv = path.join(__dirname, '../../Photodate_Test_Cases_Checklist.csv');
const clientPublicCsv = path.join(__dirname, '../../client/public/Photodate_Test_Cases_Checklist.csv');

fs.writeFileSync(outputPathCsv, csvContent, 'utf8');
fs.writeFileSync(clientPublicCsv, csvContent, 'utf8');

console.log('✅ Đã tạo thành công file Excel và CSV kiểm thử!');
console.log('File 1:', outputPathXlsx);
console.log('File 2:', outputPathCsv);
