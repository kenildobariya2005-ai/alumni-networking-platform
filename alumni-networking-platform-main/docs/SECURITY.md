# AlumniConnect — Security Architecture & Best Practices

AlumniConnect implements defense-in-depth security principles across the transport, application, database, and presentation tiers.

---

## 1. Implemented Security Controls Summary

| Security Layer | Mechanism | Implementation Detail | Purpose |
| :--- | :--- | :--- | :--- |
| **Transport** | CORS Protection | `cors({ origin: allowedOrigins, credentials: true })` | Blocks unauthorized domains from making cross-origin requests |
| **Transport** | HTTP Security Headers | `helmet()` | Protects against XSS, clickjacking, MIME-sniffing, and sets CSP |
| **Authentication** | Password Hashing | `bcryptjs` (Salt work factor: 10) | Prevents plain-text password exposure even if database is dumped |
| **Authentication** | Stateless JWT | HMAC-SHA256 with 7-day expiry | Authenticates users without server-side session state storage |
| **Authorization** | Role Guard (RBAC) | `authorizeRoles('student', 'alumni', 'admin')` | Prevents horizontal and vertical privilege escalation |
| **Authorization** | Ownership Verification | `job.postedBy.toString() === req.user._id.toString()` | Prevents users from updating or deleting peer resources |
| **Input Validation** | Schema Sanitization | `express-validator` rules | Blocks SQL/NoSQL injection, malformed payloads, and invalid types |
| **Input Validation** | ObjectId Verification | `mongoose.Types.ObjectId.isValid(id)` | Protects against casting errors and invalid database lookups |
| **File Storage** | Upload Constraints | `multer` file type + size limits (5 MB) | Blocks execution of malicious scripts (e.g. `.exe`, `.sh`, `.php`) |
| **Privacy** | Sensitive Field Projection | `.select('-password')` & `SAFE_USER_FIELDS` | Ensures password hashes are never returned in public or socket payloads |
| **Governance** | Tamper-Evident Audit Trail | `AuditLog` collection with Admin IP and Action | Provides accountability for destructive administrative actions |

---

## 2. Deep Dive into Key Security Modules

### A. Privilege Escalation Prevention
- **Registration Hardening**: Public user registration (`/api/auth/register`) enforces `role: { $in: ['student', 'alumni'] }`. Attempting to register as `admin` triggers an immediate validation failure (`400 Bad Request`).
- **Administrative Endpoints**: All `/api/admin/*` routes are guarded by both `protect` (verifying token validity) and `authorizeRoles('admin')`.

### B. Ownership Verification Logic
Before allowing updates or deletions of jobs, projects, posts, or comments, the backend explicitly verifies ownership:
```javascript
// Example: Verifying job deletion rights
if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return res.status(403).json({
    success: false,
    message: 'Not authorized to delete this job posting',
  });
}
```

### C. File Upload Security
1. **MIME Type Validation**:
   - Resumes: Strictly filtered to `application/pdf`.
   - Images: Strictly filtered to `image/jpeg`, `image/png`, `image/webp`.
2. **File Size Enforcement**: Hard limit set to 5 MB per file.
3. **Filename Sanitization**: Uploaded files are renamed using UUIDs and timestamps to prevent directory traversal attacks (`../../filename`).

### D. Audit Logging for Administrative Actions
Whenever an administrator performs an action (e.g., verifying an alumni, closing a job, or hiding a post), the backend asynchronously writes an immutable audit record to `AuditLog`:
```javascript
await AuditLog.create({
  admin: req.user._id,
  action: 'ALUMNI_VERIFIED',
  targetType: 'User',
  targetId: alumniUser._id,
  description: `Admin ${req.user.fullName} verified alumni credentials for ${alumniUser.fullName}`,
  ipAddress: req.ip || req.connection.remoteAddress,
  metadata: { verifiedAt: new Date() },
});
```
