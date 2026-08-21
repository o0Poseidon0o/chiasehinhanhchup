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
 * Scrape danh sách ảnh trực tiếp từ trang HTML công khai của Google Drive Folder
 * (Hoạt động không cần GOOGLE_API_KEY)
 */
const scrapePublicDriveFolder = async (folderId) => {
  try {
    const url = `https://drive.google.com/drive/folders/${folderId}?hl=en`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    });

    const html = response.data || '';
    const foundMap = new Map();

    // Regex 1: Trích xuất File ID và Filename từ JS data payload
    const fileRegex = /\["([a-zA-Z0-9_-]{25,50})",\["([^"]+)"/g;
    let match;
    while ((match = fileRegex.exec(html)) !== null) {
      const id = match[1];
      const name = match[2];
      if (id && id !== folderId && name && (name.match(/\.(jpg|jpeg|png|webp|heic|gif)/i) || !name.includes('.'))) {
        foundMap.set(id, name);
      }
    }

    // Regex 2: Fallback tìm tất cả Drive File ID 33 ký tự
    if (foundMap.size === 0) {
      const idMatches = html.match(/["']([a-zA-Z0-9_-]{33})["']/g);
      if (idMatches) {
        idMatches.forEach(rawId => {
          const cleanId = rawId.replace(/["']/g, '');
          if (cleanId !== folderId && cleanId.length === 33) {
            foundMap.set(cleanId, 'Drive Photo');
          }
        });
      }
    }

    const results = [];
    foundMap.forEach((name, fileId) => {
      const proxyUrl = `/api/albums/proxy-image/${fileId}`;
      results.push({
        fileId: fileId,
        fileName: name,
        thumbnailUrl: proxyUrl,
        embedUrl: proxyUrl
      });
    });

    return results;
  } catch (err) {
    console.error('Scrape public drive folder error:', err.message);
    return [];
  }
};

/**
 * Lấy danh sách ảnh từ thư mục Google Drive thông qua REST API v3 hoặc Scraper
 */
const fetchImagesFromFolder = async (folderId) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  // 1. Thử dùng Google Drive API Key nếu có
  if (apiKey) {
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

      if (allFiles.length > 0) {
        return allFiles.map(file => {
          const fileId = file.id;
          const proxyUrl = `/api/albums/proxy-image/${fileId}`;

          return {
            fileId: fileId,
            fileName: file.name,
            thumbnailUrl: proxyUrl,
            embedUrl: proxyUrl
          };
        });
      }
    } catch (error) {
      console.error('Google Drive API Key Error, falling back to public scraper:', error.message);
    }
  }

  // 2. Thử dùng Scraper đọc trang công khai của Google Drive Folder
  const scrapedImages = await scrapePublicDriveFolder(folderId);
  if (scrapedImages.length > 0) {
    return scrapedImages;
  }

  // 3. Trả về mảng rỗng nếu thư mục riêng tư hoặc chưa có ảnh
  return [];
};

module.exports = {
  extractFolderId,
  getMockImages,
  fetchImagesFromFolder
};
