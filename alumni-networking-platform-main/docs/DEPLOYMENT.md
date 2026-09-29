# AlumniConnect — Deployment & Production Architecture

This document provides complete guidelines for deploying **AlumniConnect** to modern cloud hosting platforms.

---

## 1. Production Architecture Diagram

```mermaid
graph TD
    Client["User Browsers (Desktop & Mobile)"]
    
    subgraph Frontend Hosting (Vercel / Netlify / Cloudflare Pages)
        ViteBuild["Static React SPA Bundle (dist/)"]
    end
    
    subgraph Backend Hosting (Render / Railway / AWS EC2)
        ReverseProxy["Nginx / Reverse Proxy (SSL Termination)"]
        NodeServer["Node.js Express & Socket.io Server (PORT=5000)"]
    end
    
    subgraph Managed Cloud Services
        Atlas[("MongoDB Atlas (Cloud M0 / Dedicated Cluster)")]
        Storage["Cloudinary / AWS S3 (Media & Resume Hosting)"]
    end

    Client -->|HTTPS (Port 443)| ViteBuild
    Client -->|REST API & WSS (HTTPS/WSS)| ReverseProxy
    ReverseProxy --> NodeServer
    NodeServer -->|Encrypted TLS| Atlas
    NodeServer -->|Signed REST API| Storage
```

---

## 2. Environment Variables Specification

### Backend Variables (`backend/.env`)

| Variable Name | Required | Example / Recommended Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | `5000` | Local or cloud port for Express/Socket.io server |
| `NODE_ENV` | Yes | `production` | Environment mode (`development` or `production`) |
| `MONGO_URI` | Yes | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/alumniconnect?retryWrites=true&w=majority` | Connection string to MongoDB cluster |
| `JWT_SECRET` | Yes | `<64_character_random_hex_string>` | Secret key used to sign and verify JWT authentication tokens |
| `JWT_EXPIRE` | Yes | `7d` | Lifetime of issued authentication tokens |
| `CLIENT_URL` | Yes | `https://alumniconnect.youruniversity.edu` | Production frontend domain allowed in CORS configuration |
| `CLOUDINARY_CLOUD_NAME`| No | `your_cloud_name` | Cloudinary storage account name (if cloud uploads enabled) |
| `CLOUDINARY_API_KEY` | No | `your_api_key` | Cloudinary API access key |
| `CLOUDINARY_API_SECRET`| No | `your_api_secret` | Cloudinary API secret |

---

### Frontend Variables (`frontend/.env`)

| Variable Name | Required | Example / Recommended Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Yes | `https://api.alumniconnect.youruniversity.edu/api` | Base URL for Express backend REST API |
| `VITE_SOCKET_URL` | Yes | `https://api.alumniconnect.youruniversity.edu` | Base URL for Socket.io WebSocket server |

---

## 3. Step-by-Step Production Deployment

### A. Database Provisioning (MongoDB Atlas)
1. Create a free M0 or production cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Configure a database user with read/write privileges to `alumniconnect`.
3. In **Network Access**, add the IP addresses of your backend servers (or `0.0.0.0/0` with strong authentication).
4. Copy the connection URI string.

---

### B. Backend Deployment (Render / AWS EC2 / Railway)
1. Push the repository to GitHub.
2. In the cloud dashboard (e.g. Render), create a new **Web Service**.
3. Set the **Root Directory** to `backend`.
4. Configure Build and Start commands:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, populate all variables listed in the Backend table above.
6. Verify deployment by querying the health check endpoint: `GET https://your-backend.onrender.com/api/health`.

---

### C. Frontend Deployment (Vercel / Netlify)
1. In Vercel, import your GitHub repository.
2. Set the **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Configure Build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Configure Environment Variables:
   - `VITE_API_URL`: Set to your deployed backend API URL (e.g. `https://your-backend.onrender.com/api`).
   - `VITE_SOCKET_URL`: Set to your deployed backend URL (e.g. `https://your-backend.onrender.com`).
6. Deploy the service.

---

## 4. Production Health Verification

Once deployed, verify system availability using the built-in health endpoint:
```http
GET /api/health HTTP/1.1
Host: your-backend.com
```

**Expected Response**:
```json
{
  "success": true,
  "status": "healthy",
  "message": "AlumniConnect Backend API is active."
}
```
