# AlumniConnect — Project Viva & Oral Examination Guide (42 Q&As)

This document contains 42 project-specific questions and concise, technically rigorous answers tailored for **BTech IT Project Viva, Mentor Review, and Final Project Defense**.

---

## 1. Core Architecture & Technology Stack

### Q1: What is the primary objective of the AlumniConnect project?
**Answer**: AlumniConnect is an integrated full-stack web platform that bridges the communication gap between enrolled university students and graduated alumni. It facilitates authenticated career mentorship, alumni-driven job referrals, team collaboration on technical projects, community discussion feeds, and real-time messaging with administrative oversight and audit logging.

### Q2: Why was the MERN stack selected for this project?
**Answer**: The MERN stack (MongoDB, Express.js, React.js, Node.js) allows full-stack JavaScript/JSON consistency across client and server. Node.js and Express deliver asynchronous, non-blocking I/O ideal for real-time WebSocket communication, React provides a reactive component-based UI with efficient Virtual DOM updates, and MongoDB offers a flexible schema model well-suited for evolving JSON data.

### Q3: What is the difference between SQL (Relational) and NoSQL (Document) databases in the context of this application?
**Answer**: Relational databases enforce rigid tabular schemas with table joins, whereas MongoDB (NoSQL) stores data as JSON-like BSON documents. In AlumniConnect, documents easily accommodate nested data (e.g., skill tag arrays, like references, and team member arrays) while Mongoose references and population handle cross-collection relationships with high read performance.

### Q4: Why is React (SPA) advantageous compared to traditional multi-page applications (MPAs)?
**Answer**: React Single Page Applications (SPAs) load a single HTML shell and dynamically re-render components on route changes without full-page browser reloads. This provides a fluid, app-like user experience, reduces server bandwidth, and allows stateful persistent connections like Socket.io to remain connected across route navigations.

### Q5: How does Node.js handle high concurrency despite being single-threaded?
**Answer**: Node.js operates on an event-driven, non-blocking asynchronous event loop powered by `libuv`. When I/O operations (such as MongoDB database queries or file uploads) are initiated, Node.js offloads them to system worker threads and registers a callback, freeing the main execution thread to process subsequent client requests.

---

## 2. Authentication & Security

### Q6: How does JWT-based authentication work in this system?
**Answer**: Upon valid user credentials submission (`/api/auth/login`), the backend signs a JSON Web Token containing the user ID signed with a secret key (`JWT_SECRET`) and a 7-day expiration. The token is sent to the client, stored in `localStorage`, and attached as a `Bearer <token>` header on subsequent HTTP requests via Axios interceptors. The `protect` middleware decodes and verifies the signature on each protected route.

### Q7: Why is JWT preferred over traditional session-based (cookie/memory) authentication?
**Answer**: JWTs are completely stateless. The server does not maintain an in-memory session table or database session store. The token itself contains the signed cryptographic claim, allowing the backend to scale horizontally across multiple instances without shared session state replication.

### Q8: How is password security implemented?
**Answer**: Passwords are never stored in plain text. A Mongoose `pre('save')` hook hashes the password using `bcryptjs` with a salt factor of 10 rounds. When logging in, `bcrypt.compare()` compares the plain password with the hashed digest. Password fields are excluded from queries using `.select('-password')`.

### Q9: How is Role-Based Access Control (RBAC) enforced?
**Answer**: RBAC is enforced in two layers:
1. **Backend**: The `authorizeRoles(...roles)` middleware checks the authenticated `req.user.role` against an endpoint whitelist (e.g., `authorizeRoles('alumni', 'admin')`). Unauthorized requests return `403 Forbidden`.
2. **Frontend**: The `ProtectedRoute` component checks `user.role` before rendering child routes, redirecting unauthorized users to `/unauthorized`.

### Q10: How do you prevent public users from creating Admin accounts?
**Answer**: The `registerValidator` express-validator middleware validates that `role` must strictly be either `'student'` or `'alumni'`. The controller enforces that any attempted assignment of `'admin'` defaults to `'student'`. Admin accounts can only be provisioned through secure direct database seeding or administrative promotion.

### Q11: What is Cross-Origin Resource Sharing (CORS) and how is it configured?
**Answer**: CORS is a browser security mechanism that blocks scripts from requesting resources from a different origin domain. The backend uses the `cors` middleware configured with `origin: process.env.CLIENT_URL` and `credentials: true` to exclusively allow trusted frontend origins.

### Q12: What role does Helmet.js play in your backend?
**Answer**: `helmet()` automatically sets crucial security HTTP response headers, including Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Content-Type-Options (prevents MIME sniffing), and X-Frame-Options (prevents clickjacking attacks).

---

## 3. Database Design & Mongoose Modeling

### Q13: How many collections/models exist in the database, and what are their names?
**Answer**: There are **13 Mongoose models**: `User`, `StudentProfile`, `AlumniProfile`, `Job`, `Application`, `MentorshipRequest`, `Project`, `ProjectApplication`, `Post`, `Comment`, `Message`, `Notification`, and `AuditLog`.

### Q14: How are 1-to-1 relationships modeled (e.g., User to StudentProfile)?
**Answer**: The `StudentProfile` model contains a `user` field of type `mongoose.Schema.Types.ObjectId` referencing the `'User'` model with a `unique: true` index constraint. This ensures each student user has at most one associated extended profile.

### Q15: How are duplicate applications prevented in the database?
**Answer**: Both the `Application` and `ProjectApplication` schemas enforce unique compound indexes:
- `Application`: `{ student: 1, job: 1 }` with `{ unique: true }`
- `ProjectApplication`: `{ project: 1, student: 1 }` with `{ unique: true }`
If a student attempts to apply twice to the same job or project, MongoDB rejects the insert and throws a duplicate key error (`E11000`).

### Q16: How does Mongoose `populate()` work?
**Answer**: `populate()` is Mongoose's mechanism for referencing documents in other collections. When querying a document with an `ObjectId` foreign key (e.g., `Job.find().populate('postedBy', 'fullName email')`), Mongoose executes an internal secondary lookup to replace the ID with the matching document fields.

---

## 4. Real-Time Communication (Socket.io)

### Q17: What is the fundamental difference between HTTP polling and WebSockets (Socket.io)?
**Answer**: HTTP is a request-response protocol requiring the client to initiate every transaction, resulting in header overhead and latency when polling. WebSockets establish an initial HTTP handshake and upgrade to a persistent, full-duplex TCP connection, enabling the server to push events to clients with minimal latency and near-zero header overhead.

### Q18: How does Socket.io authenticate incoming connections?
**Answer**: Socket.io uses connection middleware (`io.use()`). During the initial handshake, the client sends `{ auth: { token } }`. The server extracts and verifies the JWT token using `jwt.verify()`, queries the user in MongoDB, and attaches `socket.userId` before accepting the connection. Unauthenticated handshakes are rejected with an error.

### Q19: How are private direct messages routed to specific users without broadcasting to everyone?
**Answer**: Upon successful socket connection, each user automatically joins a private socket room named after their unique `userId` (`socket.join(userId)`). When a message is sent, the server saves it to MongoDB and emits specifically to the recipient's room: `io.to(receiverId).emit('message:receive', messageData)`.

### Q20: How are online presence indicators implemented?
**Answer**: The backend maintains an in-memory `Map<userId, Set<socketId>>`. When a user connects their first socket, the server broadcasts `user:online` to all peers. When the user disconnects all active tabs/devices, their ID is removed from the map and `user:offline` is broadcast.

### Q21: How are typing indicators and read receipts handled in real-time?
**Answer**: 
- **Typing Indicator**: The client listens to the text input and emits `typing:start` (debounced with a 2-second timeout before emitting `typing:stop`), which is forwarded to the recipient's room.
- **Read Receipts**: When the recipient views the active chat, the client emits `message:read`. The server updates `isRead: true` in MongoDB and emits `conversation:read` to the sender, turning the delivery checkmark green.

---

## 5. Feature Workflows & Business Logic

### Q22: Explain the complete lifecycle of a Job Application.
**Answer**:
1. Alumni/Admin creates a job via `POST /api/jobs`.
2. Student views job details (`/jobs/:id`) and applies via `POST /api/applications/jobs/:id/apply` with a PDF resume URL and cover letter.
3. Status is initialized to `'Applied'`.
4. Alumni reviews candidate applications under `/alumni/applications` and updates status to `'Reviewing'`, `'Shortlisted'`, `'Accepted'`, or `'Rejected'`.
5. An automated notification is generated and pushed to the student.

### Q23: Explain the complete lifecycle of a Mentorship Request.
**Answer**:
1. Student searches verified mentors (`/mentorship`) and submits a request specifying topic, message, and preferred date (`POST /api/mentorship/request`, status: `'pending'`).
2. Alumni receives incoming request (`/alumni/mentorships`) and accepts it (`PATCH /api/mentorship/:id/accept`).
3. Alumni schedules session by picking a date-time and entering a video meeting URL (`PATCH /api/mentorship/:id/schedule`).
4. After the meeting, alumni marks the session complete (`PATCH /api/mentorship/:id/complete`).
5. Student submits a 1–5 star rating and written review (`POST /api/mentorship/:id/feedback`).

### Q24: How does the Collaborative Project feature work?
**Answer**: Alumni create engineering project initiatives specifying tech stack, category, and maximum team size (`POST /api/projects`). Students apply to join with a pitch note. When the alumni creator accepts an application (`PATCH /api/project-applications/:id/accept`), the student's ID is automatically appended to the project's `teamMembers` array.

### Q25: How does Content Moderation work?
**Answer**: Administrators access `/admin/moderation` to view all community posts and comments. Admins can toggle post visibility (`PATCH /api/admin/moderation/posts/:id/hide`), restore content (`/restore`), or permanently remove offensive posts (`DELETE /api/admin/moderation/posts/:id`).

### Q26: How does the Alumni Verification workflow function?
**Answer**: When alumni register, their account has `isVerified: false`. Administrators review their professional credentials and LinkedIn URLs in the verification portal (`/admin/alumni-verification`) and approve them via `PATCH /api/admin/alumni/:id/verify`. This awards a verified badge and authorizes mentorship and job posting privileges.

### Q27: What is recorded in the System Audit Log?
**Answer**: Every administrative modification (verifying alumni, deactivating accounts, closing jobs, hiding posts) generates an immutable document in `AuditLog` storing `admin` (User ID), `action` (e.g. `'ALUMNI_VERIFIED'`), `targetType`, `targetId`, `description`, `ipAddress`, and `metadata`.

---

## 6. Frontend State & Component Design

### Q28: How does AuthContext manage user state across page reloads?
**Answer**: On initial mount, `AuthContext` checks `localStorage` for `alumniconnect_token`. If present, it makes an asynchronous call to `GET /api/auth/profile` to validate the token against the server. If valid, the user state is populated; if expired/invalid, credentials are wiped and the user is redirected to login.

### Q29: How is global error handling structured on the frontend?
**Answer**: Axios response interceptors standardize all error payloads into `{ status, message, errors }`. If a `401 Unauthorized` is returned on a protected route, the interceptor wipes local storage and emits `auth:unauthorized`, triggering a toast message and login redirect. An `ErrorBoundary` component wraps the UI to gracefully catch runtime render errors.

### Q30: How is component reusability achieved across the frontend?
**Answer**: Common UI primitives (`Button`, `Input`, `Modal`, `Loader`, `EmptyState`, `Pagination`) are abstracted into `components/common/`. Entity cards (`JobCard`, `MentorCard`, `ProjectCard`, `PostCard`, `StatCard`) encapsulate consistent visual styling and action handlers across both student and alumni pages.

### Q31: How is responsive layout implemented?
**Answer**: Using Tailwind CSS mobile-first breakpoint classes (`sm:`, `md:`, `lg:`). The sidebar collapses into an off-canvas drawer with backdrop blur on screens $< 768\text{px}$, and tables are wrapped in `overflow-x-auto` containers to prevent horizontal viewport clipping.

---

## 7. File Uploads, Performance & Limitations

### Q32: How are file uploads handled and validated?
**Answer**: The backend uses `multer` disk storage configured in `uploadMiddleware.js`. It checks file extensions and MIME types (`application/pdf` for resumes; `image/png`, `image/jpeg` for avatars) and enforces a 5 MB file size limit. Files are saved with sanitized UUID filenames.

### Q33: How is database query performance optimized for large datasets?
**Answer**: All listing endpoints (jobs, projects, community posts, audit logs, admin users) implement pagination using `.skip((page - 1) * limit).limit(limit)` and return pagination metadata (`page`, `pages`, `total`). Key fields (`email`, `postedBy`, `mentor`, `student`) are indexed.

### Q34: What are the current genuine limitations of the platform?
**Answer**:
1. Video mentorship calls rely on external links (Google Meet/Zoom) rather than built-in WebRTC video conferencing.
2. Search relies on regex and skill arrays rather than AI semantic vector matching.
3. Offline alerts rely on in-app notifications rather than outbound SMS/email gateways.
4. WebSocket clustering runs on a single node without a Redis Pub/Sub adapter.

### Q35: What is the planned future scope for AlumniConnect?
**Answer**: Key future milestones include AI-powered mentor matching using vector embeddings, in-browser WebRTC video calls, bidirectional Google Calendar scheduling integration, and mobile apps built with React Native.

---

## 8. Viva Quick Fire Definitions

### Q36: What is a RESTful API?
**Answer**: Representational State Transfer (REST) is an architectural style for stateless, client-server web services utilizing standard HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) with JSON payloads and uniform URI endpoints.

### Q37: What is the difference between `PUT` and `PATCH`?
**Answer**: `PUT` replaces the entire target resource with the supplied payload, whereas `PATCH` applies partial modifications to specific fields of the existing resource.

### Q38: What does the HTTP 401 vs 403 status code mean?
**Answer**: `401 Unauthorized` means authentication is missing or invalid (the server doesn't know who you are). `403 Forbidden` means authentication succeeded, but the user does not have permission for that action.

### Q39: What is MongoDB BSON?
**Answer**: Binary JSON (BSON) is a binary serialization format used by MongoDB to store documents, supporting additional data types like `ObjectId`, `Date`, and raw binary data.

### Q40: What is an Express Middleware?
**Answer**: A function that has access to the request object (`req`), response object (`res`), and the next middleware function (`next`) in the application request-response lifecycle.

### Q41: Why use `bcryptjs` instead of simple hashing like MD5 or SHA256?
**Answer**: MD5 and SHA256 are fast cryptographic hashes vulnerable to brute-force and rainbow table attacks. `bcrypt` incorporates key stretching with configurable work factors and cryptographic salting, making brute-force dictionary attacks computationally infeasible.

### Q42: What is the purpose of `react-hot-toast` in this application?
**Answer**: It provides non-blocking, accessible, lightweight toast notifications that display immediate user feedback for successful operations, network failures, and validation warnings.
