import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import Album from './models/Album';
import Selection from './models/Selection';
import { extractFolderId, getImagesFromFolder } from './services/googleDrive';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Tạo Album mới
app.post('/api/albums', async (req, res) => {
  try {
    const { driveUrl, name, limitCount, passcode } = req.body;
    
    const folderId = extractFolderId(driveUrl);
    if (!folderId) {
      return res.status(400).json({ error: 'Invalid Google Drive URL' });
    }

    // Verify folder by fetching initially
    await getImagesFromFolder(folderId);

    const newAlbum = await Album.create({
      driveFolderId: folderId,
      name,
      limitCount: limitCount || 0,
      passcode,
    });

    res.status(201).json(newAlbum);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Lấy thông tin Album và danh sách ảnh
app.get('/api/albums/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const albumData = album.toObject();
    const hasPasscode = !!albumData.passcode;
    const isAdmin = req.query.admin === 'true';
    delete albumData.passcode;

    if (hasPasscode && !isAdmin) {
      return res.json({ album: albumData, images: [], requiresPasscode: true });
    }

    const images = await getImagesFromFolder(album.driveFolderId);
    res.json({ album: albumData, images, requiresPasscode: false });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Xác thực Passcode
app.post('/api/albums/:id/verify', async (req, res) => {
  try {
    const { passcode } = req.body;
    const album = await Album.findById(req.params.id);
    
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    if (album.passcode && album.passcode !== passcode) {
      return res.status(401).json({ error: 'Invalid passcode' });
    }

    const images = await getImagesFromFolder(album.driveFolderId);
    res.json({ success: true, images });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Lưu Lựa Chọn của Khách
app.post('/api/selections', async (req, res) => {
  try {
    const { albumId, clientName, clientPhone, selectedIds, comments } = req.body;

    const selection = await Selection.create({
      albumId,
      clientName,
      clientPhone,
      selectedIds,
      comments,
    });

    res.status(201).json(selection);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Lấy danh sách lựa chọn (dành cho Admin/Photographer)
app.get('/api/albums/:id/selections', async (req, res) => {
  try {
    const selections = await Selection.find({ albumId: req.params.id }).sort({ createdAt: -1 });
    res.json(selections);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Xóa lựa chọn của khách
app.delete('/api/selections/:id', async (req, res) => {
  try {
    await Selection.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Xóa toàn bộ Album và các Lựa chọn liên quan
app.delete('/api/albums/:id', async (req, res) => {
  try {
    const albumId = req.params.id;
    await Album.findByIdAndDelete(albumId);
    await Selection.deleteMany({ albumId });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
