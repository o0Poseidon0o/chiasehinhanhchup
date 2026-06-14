import mongoose, { Schema, Document } from 'mongoose';

export interface IAlbum extends Document {
  driveFolderId: string;
  name: string;
  limitCount: number;
  passcode?: string;
  createdAt: Date;
}

const AlbumSchema: Schema = new Schema({
  driveFolderId: { type: String, required: true },
  name: { type: String, required: true },
  limitCount: { type: Number, default: 0 },
  passcode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAlbum>('Album', AlbumSchema);
