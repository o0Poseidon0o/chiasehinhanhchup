import axios from 'axios';



export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  webContentLink?: string;
}

export const getImagesFromFolder = async (folderId: string): Promise<DriveFile[]> => {
  try {
    // Chỉ lấy các file ảnh và không bị xóa
    const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`;
    const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
      params: {
        q: query,
        fields: 'files(id,name,mimeType,size,createdTime,webContentLink)',
        key: process.env.GOOGLE_API_KEY,
        pageSize: 1000,
      },
    });

    return response.data.files || [];
  } catch (error: any) {
    console.error('Error fetching images from Google Drive:', error.response?.data || error.message);
    throw new Error('Could not fetch images from Google Drive');
  }
};

// Hàm tiện ích trích xuất folder ID từ một đường link Google Drive
export const extractFolderId = (url: string): string | null => {
  const match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  const matchId = url.match(/id=([a-zA-Z0-9-_]+)/);
  if (matchId && matchId[1]) {
    return matchId[1];
  }
  return null;
};
