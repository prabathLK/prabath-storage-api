import mongoose from 'mongoose';

const StorageSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  payload: { 
    type: String,
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 600
  }
});

export const StorageModel = mongoose.model('TempData', StorageSchema);
