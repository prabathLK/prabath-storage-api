import mongoose from 'mongoose';
const StorageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  payload: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }
});

const StatsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global_stats' },
  totalRequests: { type: Number, default: 0 },
  today: {
    date: { type: String, default: '' },
    get: { type: Number, default: 0 },
    post: { type: Number, default: 0 }
  }
});

export const StorageModel = mongoose.model('TempData', StorageSchema);
export const StatsModel = mongoose.model('AppStats', StatsSchema);
