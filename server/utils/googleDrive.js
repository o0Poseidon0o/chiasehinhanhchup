const axios = require('axios');

/**
 * Trích xuất folder ID từ link Google Drive
 * Hỗ trợ các định dạng:
 * - https://drive.google.com/drive/folders/1A2B3C...
 * - https://drive.google.com/drive/u/0/folders/1A2B3C...
 * - https://drive.google.com/open?id=1A2B3C...
 */
const extractFolderId = (url) => {
  if (!url) return null;
  const regExp1 = /\/folders\/([a-zA-Z0-9_-]{25,50})/;
  const regExp2 = /[?&]id=([a-zA-Z0-9_-]{25,50})/;
  
  const match1 = url.match(regExp1);
  if (match1 && match1[1]) return match1[1];
  
  const match2 = url.match(regExp2);
  if (match2 && match2[1]) return match2[1];
  
  return null;
};

/**
 * Lấy danh sách ảnh từ thư mục Google Drive công khai qua API v3
 */
const fetchImagesFromFolder = async (folderId) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Google API Key chưa được cấu hình trong file .env');
  }

  const url = `https://www.googleapis.com/drive/v3/files`;
  
  try {
    const response = await axios.get(url, {
      params: {
        q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
        key: apiKey,
        fields: 'files(id, name, mimeType, thumbnailLink, webViewLink)',
        pageSize: 1000,
        orderBy: 'name' // Sắp xếp theo tên file tăng dần
      }
    });

    if (!response.data || !response.data.files) {
      return [];
    }

    // Map lại thông tin ảnh
    return response.data.files.map(file => {
      const fileId = file.id;
      
      // Sử dụng link trực tiếp chất lượng cao hỗ trợ resize của Googleusercontent
      // s400: Thumbnail lưới (400px), s1600: Xem phóng to Lightbox (1600px)
      const thumbnailUrl = `https://lh3.googleusercontent.com/d/${fileId}=s400`;
      const embedUrl = `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
      
      return {
        fileId: fileId,
        fileName: file.name,
        thumbnailUrl: thumbnailUrl,
        embedUrl: embedUrl
      };
    });
  } catch (error) {
    console.error('Error fetching from Google Drive API:', error.response ? error.response.data : error.message);
    throw new Error(
      error.response && error.response.data && error.response.data.error 
        ? error.response.data.error.message 
        : 'Không thể truy cập thư mục Google Drive. Vui lòng kiểm tra lại quyền chia sẻ thư mục (phải bật chế độ Bất kỳ ai có liên kết đều xem được).'
    );
  }
};

module.exports = {
  extractFolderId,
  fetchImagesFromFolder
};
