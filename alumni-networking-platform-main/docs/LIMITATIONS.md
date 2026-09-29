# AlumniConnect — Project Limitations & Constraints

In adherence to academic integrity and technical rigor, this document outlines the genuine technical constraints and current implementation limitations of **AlumniConnect**.

---

## 1. Third-Party Video Conferencing Dependency
- **Current State**: Mentorship scheduling allows alumni to share video conference links (e.g., Google Meet, Zoom, Microsoft Teams).
- **Limitation**: The platform does not host an internal, proprietary WebRTC video engine within the browser. Video calls occur externally via the provided link.

---

## 2. Absence of AI/ML Semantic Recommendation
- **Current State**: Search and filtering for alumni, jobs, and projects rely on database indexing, regex pattern matching, and exact skill array lookups.
- **Limitation**: Advanced AI-based semantic resume parsing, automated candidate scoring, and vector embeddings are not yet implemented.

---

## 3. Email & SMS Gateway Integration
- **Current State**: Real-time notifications are delivered in-app via Socket.io and stored in MongoDB.
- **Limitation**: Outbound transactional emails (e.g., SendGrid/AWS SES) and SMS alerts (Twilio) for offline users are not connected in the current local development build. Password recovery relies on administrator reset.

---

## 4. Single-Instance Socket.io Cluster Architecture
- **Current State**: Real-time active connections and online user presence are managed in-memory on the primary Node.js process using a `Map<userId, Set<socketId>>`.
- **Limitation**: Running multiple clustered backend instances behind a round-robin load balancer would require configuring a **Redis Pub/Sub Adapter** (`@socket.io/redis-adapter`) to synchronize socket events across distinct server processes.

---

## 5. Storage Backend Configuration
- **Current State**: Resumes and profile pictures are stored locally in `src/uploads/` via Multer disk storage.
- **Limitation**: For production multi-tenant deployment, file storage should be transitioned to cloud object storage (e.g., AWS S3, Google Cloud Storage, or Cloudinary) with signed CDN delivery URLs.

---

## 6. Mobile Platform Distribution
- **Current State**: The user interface is responsive across mobile web browsers ($320\text{px} - 768\text{px}$).
- **Limitation**: The system does not currently provide standalone compiled native mobile applications (iOS `.ipa` / Android `.apk`).
