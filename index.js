import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PORT } from './src/config.js';
import { connectDB } from './src/database.js';
import { StorageModel } from './src/models.js';
import { authMiddleware } from './src/middleware.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.json({ status: true, message: 'Prabath-MD Secure Storage API is Running 🚀' });
});

// ==========================
// 📥 SAVE DATA (POST)
// ==========================
app.post('/api/save', authMiddleware, async (req, res) => {
  try {
    const { key, data } = req.body;

    if (!key || !data) {
      return res.status(400).json({ status: false, message: 'Key and Data required' });
    }

    await StorageModel.findOneAndUpdate(
      { key },
      { payload: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ status: true, message: 'Data Secured' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Internal Error' });
  }
});

// ==========================
// 📤 FETCH DATA (GET)
// ==========================
app.get('/api/fetch/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const result = await StorageModel.findOne({ key }).lean();

    if (!result) {
      return res.status(404).json({ status: false, message: 'Data Expired or Not Found' });
    }

    res.json({ status: true, data: result.payload });

  } catch (error) {
    res.status(500).json({ status: false, error: 'Internal Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
