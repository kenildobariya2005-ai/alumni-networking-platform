# AlumniConnect

> **A Secure Alumni Networking, Mentorship & Career Collaboration Platform**

AlumniConnect is an enterprise-grade university networking platform designed to connect **Students**, **Alumni**, and **Institutional Administrators**. Built on the **MERN** stack (**MongoDB, Express.js, React.js, Node.js**) with real-time **Socket.io** channels, **Google Gemini AI Assistant**, **JWT** security, and **Tailwind CSS**.

---

## Key Features

- **Role-Based Access Control**: Tailored workspaces for `student`, `alumni`, and `admin` users.
- **AI Career & Learning Assistant (Google Gemini)**: Built-in intelligent assistant providing students with career roadmaps, interview prep, programming concepts, project ideas, and mentorship guidance based on safe academic context.
- **Identity & Credential Verification**: Admin-managed verification badge system for alumni graduates.
- **Recruitment & Applicant Tracking (ATS)**: Alumni publish jobs/internships; students apply with PDF resumes and cover letters; recruiters evaluate candidates across recruitment stages (`Applied`, `Reviewing`, `Shortlisted`, `Accepted`, `Rejected`).
- **Structured 1-on-1 Mentorship**: End-to-end booking flow from student request, alumni confirmation, date & meeting link scheduling, to 5-star review ratings.
- **Collaborative Engineering Projects**: Alumni post initiatives and recruit student developers into active project teams.
- **Community Feed & Knowledge Sharing**: Rich post sharing with tags, real-time like counters, and threaded comments.
- **Real-Time Direct Messaging (Socket.io)**: Instant low-latency chat with online status badges, live typing indicators, and read receipts.
- **Live Notifications**: Event-driven alerts with instant WebSocket updates and unread counters.
- **Administrative Governance & Audit Logs**: Platform-wide metrics, user deactivation toggles, content moderation, and tamper-evident security audit trails.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js 18.3, Vite 5.x, Tailwind CSS 3.4, React Router DOM 6.23, Axios 1.7, React Icons |
| **Backend** | Node.js (ES Modules), Express.js 4.19, Socket.io 4.7, Multer, Helmet, CORS, Morgan |
| **AI Engine** | Google Gemini API (v1beta REST API / `gemini-1.5-flash` / `gemini-2.0-flash`) |
| **Database** | MongoDB & Mongoose ODM 8.4 (13 Models with Compound Indexing) |
| **Security** | JSON Web Tokens (JWT), bcryptjs password hashing, express-validator, in-memory rate limiting |

---

## Project Structure

```
alumni-networking-platform/
├── backend/                  # Node.js Express & Socket.io REST API
│   ├── src/
│   │   ├── config/           # MongoDB database connection
│   │   ├── controllers/      # 20 controllers (including aiController.js)
│   │   ├── middleware/       # JWT auth, RBAC, rate limiter, multer upload & errors
│   │   ├── models/           # 13 Mongoose database schemas
│   │   ├── routes/           # 20 REST API route files (including aiRoutes.js)
│   │   ├── services/         # aiService.js (Google Gemini API integration)
│   │   ├── socket/           # Socket.io real-time engine (socketServer.js)
│   │   ├── validators/       # 14 express-validator schema definitions
│   │   ├── app.js            # Express application setup
│   │   └── server.js         # HTTP & WebSocket server entry point
│   ├── .env.example          # Sample backend environment file
│   └── package.json
│
├── frontend/                 # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Cards, atomic common UI, layout topbar/sidebar, ai/AIChatbot.jsx
│   │   ├── constants/        # Route paths & role redirection helpers
│   │   ├── context/          # AuthContext & SocketContext
│   │   ├── hooks/            # useAuth, useSocket custom hooks
│   │   ├── layouts/          # MainLayout & DashboardLayout
│   │   ├── pages/            # 47 page components (Admin, Alumni, Student, Features)
│   │   ├── routes/           # AppRoutes & ProtectedRoute guards
│   │   └── services/         # 14 Axios API client service modules (including aiService.js)
│   ├── .env.example          # Sample frontend environment file
│   └── package.json
│
└── docs/                     # Comprehensive University & Engineering Documentation
```

---

## Prerequisites

Before running the application, ensure you have installed:
- **Node.js** (v18.x or v20.x recommended)
- **npm** (v9.x or higher)
- **MongoDB** (Local instance running at `mongodb://localhost:27017` or a MongoDB Atlas cloud connection string)
- **Google Gemini API Key** (Free Tier available at [Google AI Studio](https://aistudio.google.com/))

---

## Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/alumni-networking-platform.git
cd alumni-networking-platform
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure `backend/.env` with your settings:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/alumniconnect
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Google Gemini AI Integration
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
GEMINI_MODEL=gemini-1.5-flash
```

> **Security Notice**: Never commit `backend/.env` or expose `GEMINI_API_KEY` in frontend code. The frontend communicates exclusively via the protected backend endpoint `POST /api/ai/chat`.

Start the backend development server:
```bash
npm run dev
# Server will start on http://localhost:5000
```

---

### 3. Frontend Setup
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
# Frontend will be live on http://localhost:5173
```

---

## AI Assistant Feature (Google Gemini Integration)

1. Log in as a **Student** (`role: 'student'`).
2. On the **Student Dashboard**, click **"Launch AI Assistant"** or the floating button at the bottom-right.
3. Choose a quick prompt (e.g. *"Suggest a career roadmap for MERN"*, *"How do I prepare for a Node.js interview?"*) or type your own question.
4. The assistant analyzes your academic context (branch, semester, skills) and returns structured recommendations directly from Google Gemini.
5. Rate limiting is enforced at **10 requests per minute** per student.

---

## Building for Production

To build the optimized frontend single-page application bundle:
```bash
cd frontend
npm run build
```
This compiles assets into `frontend/dist/` with code-splitting and Gzip optimization.

To start the production backend server:
```bash
cd backend
npm start
```

---

## Verification & Health Check

Query the backend health check endpoint in your browser or curl:
```bash
curl http://localhost:5000/api/health
```
**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "message": "AlumniConnect Backend API is active."
}
```

---

## Documentation Suite

For detailed technical documentation, review the `docs/` folder:
- [AI Assistant & Gemini Integration](docs/AI_ASSISTANT.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Database Design & Data Dictionary](docs/DATABASE_DESIGN.md)
- [Entity-Relationship Diagram](docs/ER_DIAGRAM.md)
- [Complete API Documentation](docs/API_DOCUMENTATION.md)
- [Real-Time WebSocket Communication](docs/REALTIME_COMMUNICATION.md)
- [Security Controls & Policies](docs/SECURITY.md)
- [Testing & Quality Assurance](docs/TESTING.md)
- [Viva Preparation Guide (40+ Q&A)](docs/VIVA_QUESTIONS.md)
- [Project Presentation Deck Outline](docs/PRESENTATION.md)

---

## License
This project is licensed under the ISC License. Developed for University BTech IT Project Evaluation.
