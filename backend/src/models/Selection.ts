import mongoose, { Schema, Document } from 'mongoose';

export interface ISelection extends Document {
  albumId: mongoose.Types.ObjectId;
  clientName: string;
  clientPhone: string;
  selectedIds: string[];
  comments: Record<string, string>;
  createdAt: Date;
}

const SelectionSchema: Schema = new Schema({
  albumId: { type: Schema.Types.ObjectId, ref: 'Album', required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  selectedIds: { type: [String], default: [] },
  comments: { type: Map, of: String, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISelection>('Selection', SelectionSchema);
