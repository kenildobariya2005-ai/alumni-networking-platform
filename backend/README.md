# AlumniConnect Backend

Secure Alumni Networking, Mentorship & Career Collaboration Platform.

## Folder Structure

```text
backend/
├── src/
│   ├── config/          # Configuration files (Database, Cloudinary, etc.)
│   ├── controllers/     # MVC Controllers (Request handling)
│   ├── middleware/      # Express Middlewares (Auth, Error handling, Logging)
│   ├── models/          # Mongoose Database Models
│   ├── routes/          # Express API Route Declarations
│   ├── services/        # Business Logic Services (Email, Payment, etc.)
│   ├── utils/           # Utility Helper Functions
│   ├── validators/      # Express Validator Rules
│   ├── socket/          # Socket.io Configurations & Events
│   ├── uploads/         # Local File Uploads Directory
│   ├── app.js           # Express App Configuration & Middlewares
│   └── server.js        # Main Entry Point (HTTP Server & Socket init)
├── .env.example         # Template for Environment Variables
├── .gitignore           # Ignored files in git
├── package.json         # NPM Dependencies & Scripts
└── README.md            # Backend Documentation
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file from the `.env.example` file:
   ```bash
   copy .env.example .env
   ```
   Fill in your local connection string and credentials.

3. **Run in development mode**:
   ```bash
   npm run dev
   ```

4. **Run in production mode**:
   ```bash
   npm start
   ```

## Generated File Explanations

- **`package.json`**: Manages packages, settings, metadata, and scripts. Configured with `"type": "module"` for ES Module import/export support.
- **`.env.example`**: Standardized environment variable template to guide developers on configuring local/production configurations securely.
- **`.gitignore`**: Excludes system logs, editor settings, local environments, uploaded assets, and dependency folders from git tracking.
- **`src/app.js`**: Configures the Express instance. Binds global middleware like Helmet (security), CORS (cross-origin validation), Morgan (logging), Express JSON/URL parser, cookie parser, standard health check route, and attaches error handling middleware.
- **`src/server.js`**: The main execution entry point. Connects to MongoDB, spawns the Node HTTP server wrapping the Express app, links the Socket.io hub, sets up exception safety-nets (`unhandledRejection`), and boots the service port.
- **`src/config/db.js`**: Contains Mongoose connection settings to connect to the MongoDB instance and logs status.
- **`src/middleware/errorMiddleware.js`**: Houses standard fallbacks for Express, specifically catching unrouted resource requests (404 - Not Found) and custom parsing all unexpected errors into structured JSON payloads (excluding stacks in production for safety).
- **`src/socket/socket.js`**: Configures Socket.io, enables socket connections, and manages clean room-joining events to handle real-time collaboration.
