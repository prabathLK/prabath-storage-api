import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PORT } from './src/config.js';
import { connectDB } from './src/database.js';
import { StorageModel } from './src/models.js';
import { authMiddleware } from './src/middleware.js';
import { trackRequest, syncStatsToDB, getFormattedStats } from './src/stats.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

connectDB();

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    trackRequest(req.method);
  }
  next();
});

setInterval(syncStatsToDB, 10000);

app.get('/', async (req, res) => {
  const stats = await getFormattedStats();
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Prabath-MD Storage Status</title>
    <meta http-equiv="refresh" content="3">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: 'Segoe UI', monospace; background: #0d1117; color: #c9d1d9; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
      .container { background: #161b22; padding: 30px; border-radius: 12px; border: 1px solid #30363d; box-shadow: 0 0 30px rgba(0,0,0,0.6); width: 90%; max-width: 400px; text-align: center; }
      h1 { color: #58a6ff; font-size: 22px; margin-bottom: 20px; letter-spacing: 1px; }
      .live-dot { height: 8px; width: 8px; background-color: #238636; border-radius: 50%; display: inline-block; margin-right: 8px; box-shadow: 0 0 8px #238636; animation: blink 1.5s infinite; }
      .card { background: #21262d; margin: 15px 0; padding: 15px; border-radius: 8px; border-left: 4px solid; text-align: left; }
      .card.purple { border-left-color: #a371f7; }
      .card.green { border-left-color: #2ea043; }
      .card-title { font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 5px; }
      .main-value { font-size: 26px; font-weight: 700; color: #f0f6fc; display: block; margin-bottom: 8px; }
      .sub-stats { display: flex; justify-content: space-between; font-size: 13px; color: #c9d1d9; background: #0d1117; padding: 8px; border-radius: 6px; }
      .stat-item span { color: #8b949e; margin-right: 4px; }
      .footer { margin-top: 25px; font-size: 11px; color: #484f58; }
      @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
    </style>
  </head>
  <body>
    <div class="container">
      <h1><span class="live-dot"></span>SYSTEM STATUS</h1>
      
      <div class="card purple">
        <span class="card-title">ALL TIME REQUESTS</span>
        <span class="main-value">${stats.allTime.total.toLocaleString()}</span>
        <div class="sub-stats">
          <div class="stat-item"><span>GET</span> ${stats.allTime.get.toLocaleString()}</div>
          <div class="stat-item"><span>POST</span> ${stats.allTime.post.toLocaleString()}</div>
        </div>
      </div>

      <div class="card green">
        <span class="card-title">TODAY'S REQUESTS (${stats.today.date})</span>
        <span class="main-value">${stats.today.total.toLocaleString()}</span>
        <div class="sub-stats">
          <div class="stat-item"><span>GET</span> ${stats.today.get.toLocaleString()}</div>
          <div class="stat-item"><span>POST</span> ${stats.today.post.toLocaleString()}</div>
        </div>
      </div>

      <div class="footer">
        PRABATH-MD SECURE STORAGE API<br>
        v2.0.0 Stable
      </div>
    </div>
  </body>
  </html>
  `;
  res.send(html);
});

app.post('/api/save', authMiddleware, async (req, res) => {
  try {
    const { key, data } = req.body;
    if (!key || !data) return res.status(400).json({ status: false });

    await StorageModel.findOneAndUpdate(
      { key },
      { payload: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ status: true });
  } catch (error) {
    res.status(500).json({ status: false });
  }
});

app.get('/api/fetch/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const result = await StorageModel.findOne({ key }).lean();
    if (!result) return res.status(404).json({ status: false });
    res.json({ status: true, data: result.payload });
  } catch (error) {
    res.status(500).json({ status: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
