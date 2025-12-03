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

// ==========================
// 📊 PUBLIC DASHBOARD
// ==========================
app.get('/', async (req, res) => {
  const stats = await getFormattedStats();
  
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>Prabath Storage API</title>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="5">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      :root { --bg: #09090b; --card: #18181b; --text: #e4e4e7; --accent: #3b82f6; --success: #22c55e; }
      body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
      .container { background: var(--card); padding: 2rem; border-radius: 1rem; border: 1px solid #27272a; width: 90%; max-width: 420px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
      h1 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; letter-spacing: -0.025em; color: #fff; }
      .live-indicator { display: inline-block; width: 8px; height: 8px; background: var(--success); border-radius: 50%; margin-right: 8px; box-shadow: 0 0 8px var(--success); animation: pulse 2s infinite; }
      .card { background: #27272a; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; text-align: left; position: relative; overflow: hidden; }
      .card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; border-radius: 4px 0 0 4px; }
      .card.purple { background: rgba(139, 92, 246, 0.1); } .card.purple::before { background: #8b5cf6; }
      .card.blue { background: rgba(59, 130, 246, 0.1); } .card.blue::before { background: #3b82f6; }
      .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; display: block; margin-bottom: 0.5rem; }
      .value { font-size: 1.75rem; font-weight: 700; color: #fff; display: block; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.1); }
      .stat-mini { font-size: 0.875rem; color: #d4d4d8; } .stat-mini span { color: #71717a; font-size: 0.75rem; margin-right: 4px; }
      .footer { margin-top: 2rem; font-size: 0.75rem; color: #52525b; }
      @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    </style>
  </head>
  <body>
    <div class="container">
      <h1><span class="live-indicator"></span>API SYSTEM STATUS</h1>
      
      <div class="card purple">
        <span class="label">Total Lifetime Requests</span>
        <span class="value">${stats.allTime.total.toLocaleString()}</span>
        <div class="grid">
          <div class="stat-mini"><span>GET</span> ${stats.allTime.get.toLocaleString()}</div>
          <div class="stat-mini"><span>POST</span> ${stats.allTime.post.toLocaleString()}</div>
        </div>
      </div>

      <div class="card blue">
        <span class="label">Today's Traffic (${stats.today.date})</span>
        <span class="value">${stats.today.total.toLocaleString()}</span>
        <div class="grid">
          <div class="stat-mini"><span>GET</span> ${stats.today.get.toLocaleString()}</div>
          <div class="stat-mini"><span>POST</span> ${stats.today.post.toLocaleString()}</div>
        </div>
      </div>

      <div class="footer">
        PRABATH STORAGE API<br>
        High Performance Secure Storage
      </div>
    </div>
  </body>
  </html>
  `;
  res.send(html);
});

// ==========================
// 📤 API ROUTES
// ==========================

app.post('/api/save', authMiddleware, async (req, res) => {
  try {
    const { key, data } = req.body;
    if (!key || !data) return res.status(400).json({ status: false, error: 'Missing parameters' });

    await StorageModel.findOneAndUpdate(
      { key },
      { payload: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ status: true, message: 'Securely Stored' });
  } catch (error) {
    res.status(500).json({ status: false, error: 'Internal Server Error' });
  }
});

app.get('/api/fetch/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const result = await StorageModel.findOne({ key }).lean();

    if (!result) return res.status(404).json({ status: false, error: 'Not Found or Expired' });

    res.json({ status: true, data: result.payload });
  } catch (error) {
    res.status(500).json({ status: false, error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Storage API running on port ${PORT}`);
});
