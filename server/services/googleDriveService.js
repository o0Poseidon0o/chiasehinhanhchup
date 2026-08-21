const axios = require('axios');

/**
 * Trích xuất folder ID từ đường link Google Drive
 * @param {string} url 
 * @returns {string|null}
 */
const extractFolderId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Format 1: /folders/1A2B3C...
  const matchFolder = url.match(/\/folders\/([a-zA-Z0-9_-]{25,64})/);
  if (matchFolder && matchFolder[1]) return matchFolder[1];
  
  // Format 2: ?id=1A2B3C... hoặc &id=1A2B3C...
  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]{25,64})/);
  if (matchId && matchId[1]) return matchId[1];
  
  // Format 3: /d/1A2B3C...
  const matchD = url.match(/\/d\/([a-zA-Z0-9_-]{25,64})/);
  if (matchD && matchD[1]) return matchD[1];

  return null;
};

/**
 * Tạo dữ liệu ảnh giả lập (Mock dataset) phục vụ kiểm thử nhanh
 * @returns {Array<Object>}
 */
const getMockImages = () => {
  return [
    {
      fileId: "mock-photo-001",
      fileName: "Wedding-Couple-001.jpg",
      thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
      embedUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=90"
    },
    {
      fileId: "mock-photo-002",
      fileName: "Wedding-Bride-002.jpg",
      thumbnailUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      embedUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=90"
    },
    {
      fileId: "mock-photo-003",
      fileName: "Wedding-Groom-003.jpg",
      thumbnailUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80",
      embedUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=90"
    },
    {
      fileId: "mock-photo-004",
      fileName: "Wedding-Ring-004.jpg",
      thumbnailUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80",
      embedUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1600&q=90"
    },
    {
      fileId: "mock-photo-005",
      fileName: "Wedding-Cake-005.jpg",
      thumbnailUrl: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=400&q=80",
      embedUrl: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1600&q=90"
    },
    {
      fileId: "mock-photo-006",
      fileName: "Wedding-Dance-006.jpg",
      thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80",
      embedUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=90"
    },
    {
      fileId: "mock-photo-007",
      fileName: "Wedding-Sunset-007.jpg",
      thumbnailUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80",
      embedUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=90"
    },
    {
      fileId: "mock-photo-008",
      fileName: "Wedding-Details-008.jpg",
      thumbnailUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80",
      embedUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=90"
    }
  ];
};

/**
 * Lấy danh sách ảnh từ thư mục Google Drive thông qua REST API v3
 * @param {string} folderId 
 * @returns {Promise<Array<Object>>}
 */
const fetchImagesFromFolder = async (folderId) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Google API Key chưa được cấu hình trong file .env hoặc Vercel Environment Variables');
  }

  const endpoint = 'https://www.googleapis.com/drive/v3/files';
  let allFiles = [];
  let pageToken = null;
  
  try {
    do {
      const response = await axios.get(endpoint, {
        params: {
          q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'photo' or mimeType = 'application/vnd.google-apps.photo') and trashed = false`,
          key: apiKey,
          fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, size)',
          pageSize: 1000,
          pageToken: pageToken || undefined,
          orderBy: 'name'
        },
        timeout: 15000
      });

      if (response.data && response.data.files) {
        allFiles = allFiles.concat(response.data.files);
      }
      pageToken = response.data?.nextPageToken;
    } while (pageToken);

    // Map lại thông tin ảnh với link thumbnail chuẩn và có signed token từ Google Drive API
    return allFiles.map(file => {
      const fileId = file.id;
      const thumb = file.thumbnailLink 
        ? file.thumbnailLink.replace(/=s\d+/, '=s600') 
        : `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
      const embed = file.thumbnailLink 
        ? file.thumbnailLink.replace(/=s\d+/, '=s1600') 
        : `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;

      return {
        fileId: fileId,
        fileName: file.name,
        thumbnailUrl: thumb,
        embedUrl: embed
      };
    });
  } catch (error) {
    const googleMsg = error.response?.data?.error?.message;
    console.error('Google Drive API Error:', googleMsg || error.message);
    
    throw new Error(
      googleMsg 
        ? `Lỗi từ Google Drive: ${googleMsg}` 
        : 'Không thể truy cập thư mục Google Drive. Vui lòng đảm bảo thư mục đã bật quyền xem công khai ("Bất kỳ ai có liên kết đều có thể xem").'
    );
  }
};

module.exports = {
  extractFolderId,
  getMockImages,
  fetchImagesFromFolder
};
