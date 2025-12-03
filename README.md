# 🚀 Prabath Storage API

A generic, high-performance, and secure **"Blind Storage" API** designed for automation tools, real-time applications, and temporary data handling. Built with **Express.js (ESM)** and **MongoDB**.

## 🔥 Features

- **Zero-Knowledge Architecture:** The server only stores encrypted payloads. It has no knowledge of the actual data content.
- **Auto-Expiration (TTL):** Data is automatically purged after 10 minutes (Configurable) to maintain low storage costs.
- **High Performance:** Uses buffered counting for analytics, ensuring zero database lag during high traffic.
- **Real-time Dashboard:** Built-in HTML status page to monitor incoming traffic stats.
- **Secure Access:** Protected via API Key authentication.

---

## 🛠️ Deployment

### Option 1: Deploy on Koyeb (Recommended)

1. Fork this repository.
2. Create a new App on [Koyeb](https://www.koyeb.com).
3. Select "GitHub" as the deployment method and choose this repo.
4. Add the following **Environment Variables**:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | Your MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster...` |
| `API_KEY` | A secret key to protect your API endpoints | `MySecretKey123` |
| `PORT` | The port to run the server | `8000` |

### Option 2: Deploy on Render / Railway

Simply connect this repository and add the environment variables listed above.

---

## 📡 API Usage

### 1. Save Data (POST)
Stores encrypted data temporarily.

**Endpoint:** `POST /api/save`  
**Headers:** `x-api-key: YOUR_API_KEY`

```json
{
  "key": "unique_session_id",
  "data": "encrypted_string_payload"
}
