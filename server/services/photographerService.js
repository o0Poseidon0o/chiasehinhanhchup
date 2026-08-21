const Album = require('../models/Album');
const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * Lấy số liệu thống kê tổng quan của riêng một Nhiếp Ảnh Gia
 */
const getPhotographerOverview = async (userId) => {
  if (!userId) {
    const err = new Error('Thiếu ID định danh của Nhiếp ảnh gia.');
    err.statusCode = 400;
    throw err;
  }

  const allAlbums = await Album.find();
  const safeAlbums = Array.isArray(allAlbums) ? allAlbums : [];

  // Lọc các album thuộc về riêng photographer này (Master Admin xem được tất cả)
  const isMasterAdmin = userId === 'master_admin';
  const myAlbums = safeAlbums.filter(a => isMasterAdmin || a.photographerId === userId);

  const allBookings = await Booking.find();
  const safeBookings = Array.isArray(allBookings) ? allBookings : [];
  const myBookings = safeBookings.filter(b => isMasterAdmin || b.photographerId === userId);

  const submittedAlbums = myAlbums.filter(a => a.status === 'submitted');
  const selectingAlbums = myAlbums.filter(a => a.status === 'selecting');
  const totalSelectedPhotos = myAlbums.reduce((sum, a) => sum + ((a.selectedImages && a.selectedImages.length) || (a.selectedCount) || 0), 0);

  return {
    totalAlbums: myAlbums.length,
    submittedAlbums: submittedAlbums.length,
    selectingAlbums: selectingAlbums.length,
    totalSelectedPhotos,
    totalBookings: myBookings.length,
    pendingBookings: myBookings.filter(b => b.status === 'pending').length,
    confirmedBookings: myBookings.filter(b => b.status === 'confirmed').length,
    completedBookings: myBookings.filter(b => b.status === 'completed').length,
  };
};

/**
 * Lấy danh sách Album của riêng Nhiếp Ảnh Gia
 */
const getPhotographerAlbums = async (userId, query = {}) => {
  const { search, status } = query;
  const allAlbums = await Album.find();
  const safeAlbums = Array.isArray(allAlbums) ? allAlbums : [];

  const isMasterAdmin = userId === 'master_admin';
  let myAlbums = safeAlbums.filter(a => isMasterAdmin || a.photographerId === userId);

  if (status && status !== 'all') {
    myAlbums = myAlbums.filter(a => a.status === status);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    myAlbums = myAlbums.filter(a => 
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.clientInfo?.name && a.clientInfo.name.toLowerCase().includes(q)) ||
      (a.clientInfo?.phone && a.clientInfo.phone.includes(q))
    );
  }

  // Sắp xếp mới nhất lên đầu
  myAlbums.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return myAlbums.map(a => ({
    _id: a._id,
    title: a.title,
    driveFolderUrl: a.driveFolderUrl,
    passcode: a.passcode,
    manageToken: a.manageToken,
    maxSelect: a.maxSelect,
    status: a.status,
    clientInfo: a.clientInfo,
    photoCount: a.images ? a.images.length : 0,
    selectedCount: a.selectedImages ? a.selectedImages.length : 0,
    selectedImages: a.selectedImages || [],
    createdAt: a.createdAt
  }));
};

/**
 * Lấy danh sách Khách Hàng của riêng Nhiếp Ảnh Gia (CRM)
 */
const getPhotographerClients = async (userId, query = {}) => {
  const allAlbums = await Album.find();
  const safeAlbums = Array.isArray(allAlbums) ? allAlbums : [];

  const isMasterAdmin = userId === 'master_admin';
  const myAlbums = safeAlbums.filter(a => isMasterAdmin || a.photographerId === userId);

  const allBookings = await Booking.find();
  const safeBookings = Array.isArray(allBookings) ? allBookings : [];
  const myBookings = safeBookings.filter(b => isMasterAdmin || b.photographerId === userId);

  // Map khách hàng từ Album
  const clientsMap = new Map();

  myAlbums.forEach(album => {
    const name = album.clientInfo?.name?.trim();
    const phone = album.clientInfo?.phone?.trim();

    if (name || phone) {
      const key = phone || name.toLowerCase();
      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          id: `client_album_${album._id}`,
          name: name || 'Khách hàng',
          phone: phone || '',
          email: '',
          albums: [],
          bookings: [],
          totalSelectedPhotos: 0,
          latestActivity: album.clientInfo?.submittedAt || album.createdAt
        });
      }

      const client = clientsMap.get(key);
      const selectedCount = album.selectedImages ? album.selectedImages.length : 0;
      client.albums.push({
        albumId: album._id,
        albumTitle: album.title,
        status: album.status,
        selectedCount,
        submittedAt: album.clientInfo?.submittedAt,
        note: album.clientInfo?.note || ''
      });
      client.totalSelectedPhotos += selectedCount;
      if (album.clientInfo?.submittedAt && new Date(album.clientInfo.submittedAt) > new Date(client.latestActivity)) {
        client.latestActivity = album.clientInfo.submittedAt;
      }
    }
  });

  // Map khách hàng từ Booking
  myBookings.forEach(b => {
    const name = b.clientName?.trim();
    const phone = b.clientPhone?.trim();
    const key = phone || name.toLowerCase();

    if (!clientsMap.has(key)) {
      clientsMap.set(key, {
        id: `client_booking_${b._id}`,
        name: name || 'Khách hàng',
        phone: phone || '',
        email: b.clientEmail || '',
        albums: [],
        bookings: [],
        totalSelectedPhotos: 0,
        latestActivity: b.createdAt
      });
    }

    const client = clientsMap.get(key);
    if (!client.email && b.clientEmail) client.email = b.clientEmail;
    client.bookings.push({
      bookingId: b._id,
      category: b.category,
      bookingDate: b.bookingDate,
      location: b.location,
      budget: b.budget,
      status: b.status,
      note: b.note,
      createdAt: b.createdAt
    });

    if (new Date(b.createdAt) > new Date(client.latestActivity)) {
      client.latestActivity = b.createdAt;
    }
  });

  let clientsList = Array.from(clientsMap.values());

  // Search filter
  if (query.search && query.search.trim()) {
    const q = query.search.trim().toLowerCase();
    clientsList = clientsList.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }

  // Sort by latest activity
  clientsList.sort((a, b) => new Date(b.latestActivity) - new Date(a.latestActivity));

  return clientsList;
};

/**
 * Lấy danh sách Lịch Booking của riêng Nhiếp Ảnh Gia hoặc toàn bộ cho Master Admin
 */
const getPhotographerBookings = async (userId, query = {}) => {
  const { status, search, photographerId, all } = query;
  const allBookings = await Booking.find();
  const safe = Array.isArray(allBookings) ? allBookings : [];

  let myBookings = safe;

  // Filter by photographerId if explicitly provided
  if (photographerId && photographerId !== 'all') {
    myBookings = myBookings.filter(b => 
      b.photographerId === photographerId || 
      (b.photographerName && b.photographerName.toLowerCase().includes(photographerId.toLowerCase()))
    );
  } else if (userId && userId !== 'master_admin' && !all) {
    const phBookings = myBookings.filter(b => 
      b.photographerId === userId || 
      b.photographerId === 'photographer_pro' ||
      !b.photographerId
    );
    // If the logged in user is a specific photographer with assigned bookings, return those bookings
    if (phBookings.length > 0 && userId.startsWith('ph_')) {
      myBookings = phBookings;
    }
  }

  if (status && status !== 'all') {
    myBookings = myBookings.filter(b => b.status === status);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    myBookings = myBookings.filter(b => 
      (b.clientName && b.clientName.toLowerCase().includes(q)) ||
      (b.clientPhone && b.clientPhone.includes(q)) ||
      (b.clientEmail && b.clientEmail.toLowerCase().includes(q)) ||
      (b.photographerName && b.photographerName.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.location && b.location.toLowerCase().includes(q))
    );
  }

  myBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return myBookings;
};

/**
 * Cập nhật trạng thái lịch Booking
 */
const updateBookingStatus = async (bookingId, userId, status) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error('Không tìm thấy lịch đặt chụp này.');
    err.statusCode = 404;
    throw err;
  }

  if (booking.photographerId && booking.photographerId !== userId && userId !== 'master_admin') {
    const err = new Error('Bạn không có quyền chỉnh sửa lịch booking của photographer khác.');
    err.statusCode = 403;
    throw err;
  }

  booking.status = status;
  await booking.save();

  return {
    success: true,
    message: `Đã cập nhật trạng thái lịch booking thành "${status}"`,
    data: booking
  };
};

/**
 * Cập nhật toàn bộ thông tin chi tiết của đơn Booking (cho Master Admin / Photographer)
 */
const updateBooking = async (bookingId, userId, updateData = {}) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error('Không tìm thấy lịch đặt chụp này.');
    err.statusCode = 404;
    throw err;
  }

  if (booking.photographerId && booking.photographerId !== userId && userId !== 'master_admin') {
    const err = new Error('Bạn không có quyền chỉnh sửa lịch booking của photographer khác.');
    err.statusCode = 403;
    throw err;
  }

  // Update allowed fields
  if (updateData.clientName !== undefined) booking.clientName = updateData.clientName.trim();
  if (updateData.clientPhone !== undefined) booking.clientPhone = updateData.clientPhone.trim();
  if (updateData.clientEmail !== undefined) booking.clientEmail = updateData.clientEmail.trim();
  if (updateData.category !== undefined) booking.category = updateData.category.trim();
  if (updateData.bookingDate !== undefined) booking.bookingDate = updateData.bookingDate.trim();
  if (updateData.location !== undefined) booking.location = updateData.location.trim();
  if (updateData.budget !== undefined) booking.budget = updateData.budget.trim();
  if (updateData.note !== undefined) booking.note = updateData.note.trim();
  if (updateData.status !== undefined) booking.status = updateData.status;

  if (updateData.photographerId !== undefined && (userId === 'master_admin' || !booking.photographerId)) {
    booking.photographerId = updateData.photographerId.trim();
    if (updateData.photographerName) {
      booking.photographerName = updateData.photographerName.trim();
    } else if (booking.photographerId) {
      const phUser = await User.findById(booking.photographerId);
      if (phUser) booking.photographerName = phUser.name;
    }
  }

  await booking.save();

  return {
    success: true,
    message: 'Đã cập nhật thông tin lịch booking thành công!',
    data: booking
  };
};

/**
 * Xóa đơn Booking (Master Admin hoặc photographer sở hữu)
 */
const deleteBooking = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error('Không tìm thấy lịch đặt chụp này.');
    err.statusCode = 404;
    throw err;
  }

  if (booking.photographerId && booking.photographerId !== userId && userId !== 'master_admin') {
    const err = new Error('Bạn không có quyền xóa lịch booking của photographer khác.');
    err.statusCode = 403;
    throw err;
  }

  await Booking.findByIdAndDelete(bookingId);

  return {
    success: true,
    message: 'Đã xóa đơn booking thành công.'
  };
};

/**
 * Khách hàng tạo yêu cầu đặt lịch booking mới
 */
const createBooking = async (data) => {
  const { 
    photographerId = '', 
    photographerName = '', 
    clientName, 
    clientPhone, 
    clientEmail = '', 
    category = 'Chân dung', 
    bookingDate = '', 
    timeSlot = '',
    location = '', 
    budget = '', 
    note = '' 
  } = data;

  if (!clientName || !clientName.trim()) {
    const err = new Error('Vui lòng nhập họ và tên của bạn.');
    err.statusCode = 400;
    throw err;
  }

  if (!clientPhone || !clientPhone.trim()) {
    const err = new Error('Vui lòng nhập số điện thoại / Zalo để nhận tư vấn.');
    err.statusCode = 400;
    throw err;
  }

  let finalPhotographerName = photographerName;
  if (photographerId && !finalPhotographerName) {
    const user = await User.findById(photographerId);
    if (user) finalPhotographerName = user.name;
  }

  const booking = new Booking({
    photographerId: photographerId ? photographerId.trim() : '',
    photographerName: finalPhotographerName || 'Hệ thống Studio',
    clientName: clientName.trim(),
    clientPhone: clientPhone.trim(),
    clientEmail: clientEmail ? clientEmail.trim() : '',
    category: category.trim(),
    bookingDate: bookingDate.trim(),
    timeSlot: timeSlot ? timeSlot.trim() : '',
    location: location.trim(),
    budget: budget.trim(),
    note: note.trim(),
    status: 'pending',
    createdAt: new Date()
  });

  await booking.save();

  return {
    success: true,
    message: 'Yêu cầu đặt lịch của bạn đã được gửi thành công! Nhiếp ảnh gia sẽ liên hệ tư vấn trong ít phút.',
    data: booking
  };
};

module.exports = {
  getPhotographerOverview,
  getPhotographerAlbums,
  getPhotographerClients,
  getPhotographerBookings,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  createBooking
};
