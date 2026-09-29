# AlumniConnect — Requirements Traceability Matrix (RTM)

This matrix maps all core functional requirements to their corresponding **Backend Modules**, **Frontend Pages/Components**, and **Verification Status**.

---

| Req ID | Functional Requirement | Backend Module / Route | Frontend Page / Component | Status |
| :--- | :--- | :--- | :--- | :---: |
| **REQ-AUTH-01** | Student self-registration with validation | `POST /api/auth/register` | `RegisterPage.jsx` | **IMPLEMENTED** |
| **REQ-AUTH-02** | Alumni self-registration with validation | `POST /api/auth/register` | `RegisterPage.jsx` | **IMPLEMENTED** |
| **REQ-AUTH-03** | Prevent admin self-registration | `authValidator.js` | `RegisterPage.jsx` | **IMPLEMENTED** |
| **REQ-AUTH-04** | User login with JWT generation | `POST /api/auth/login` | `LoginPage.jsx` + `AuthContext.jsx` | **IMPLEMENTED** |
| **REQ-AUTH-05** | Role-based route protection | `authMiddleware.js`, `roleMiddleware.js`| `ProtectedRoute.jsx` | **IMPLEMENTED** |
| **REQ-STUD-01** | Student profile viewing & editing | `GET/PUT /api/student/profile` | `StudentProfile.jsx` | **IMPLEMENTED** |
| **REQ-STUD-02** | Student PDF resume upload | `POST /api/student/profile/resume` | `StudentProfile.jsx` | **IMPLEMENTED** |
| **REQ-STUD-03** | Student job applications dashboard | `GET /api/applications/me` | `MyApplications.jsx` | **IMPLEMENTED** |
| **REQ-STUD-04** | Student mentorship sessions tracker | `GET /api/mentorship/my-requests` | `MyMentorships.jsx` | **IMPLEMENTED** |
| **REQ-ALUM-01** | Alumni profile & experience management | `GET/PUT /api/alumni/profile` | `AlumniProfile.jsx` | **IMPLEMENTED** |
| **REQ-ALUM-02** | Mentoring availability toggle | `PUT /api/alumni/profile` | `AlumniProfile.jsx` | **IMPLEMENTED** |
| **REQ-ALUM-03** | Alumni job posting creation | `POST /api/jobs` | `CreateJob.jsx` | **IMPLEMENTED** |
| **REQ-ALUM-04** | Alumni posted jobs management | `GET /api/jobs/my/posted` | `MyJobs.jsx` | **IMPLEMENTED** |
| **REQ-ALUM-05** | Job applicant evaluation & ATS stages | `PATCH /api/applications/:id/status`| `JobApplications.jsx` | **IMPLEMENTED** |
| **REQ-ALUM-06** | Mentorship request review & scheduling | `PATCH /api/mentorship/:id/schedule`| `MentorshipRequests.jsx` | **IMPLEMENTED** |
| **REQ-ALUM-07** | Collaborative project creation & team management | `POST /api/projects` | `CreateProject.jsx`, `MyProjects.jsx` | **IMPLEMENTED** |
| **REQ-JOB-01** | Job directory with search & filters | `GET /api/jobs` | `Jobs.jsx`, `JobCard.jsx` | **IMPLEMENTED** |
| **REQ-JOB-02** | Job details view with recruiter info | `GET /api/jobs/:id` | `JobDetails.jsx` | **IMPLEMENTED** |
| **REQ-JOB-03** | Submit job application with cover letter | `POST /api/applications/jobs/:id/apply`| `JobDetails.jsx` | **IMPLEMENTED** |
| **REQ-MENT-01** | Alumni mentor directory with search | `GET /api/alumni` | `Mentors.jsx`, `MentorCard.jsx` | **IMPLEMENTED** |
| **REQ-MENT-02** | Submit 1-on-1 mentorship request | `POST /api/mentorship/request` | `MentorshipRequest.jsx` | **IMPLEMENTED** |
| **REQ-MENT-03** | Mentorship post-session review rating | `POST /api/mentorship/:id/feedback` | `MyMentorships.jsx` | **IMPLEMENTED** |
| **REQ-PROJ-01** | Collaborative projects board & filters | `GET /api/projects` | `Projects.jsx`, `ProjectCard.jsx` | **IMPLEMENTED** |
| **REQ-PROJ-02** | Apply to join collaborative project team | `POST /api/projects/:id/apply` | `ProjectDetails.jsx` | **IMPLEMENTED** |
| **REQ-COMM-01** | Community feed stream & post creation | `GET/POST /api/posts` | `CommunityFeed.jsx`, `CreatePost.jsx` | **IMPLEMENTED** |
| **REQ-COMM-02** | Post like / unlike toggling | `POST /api/posts/:id/like` | `PostCard.jsx` | **IMPLEMENTED** |
| **REQ-COMM-03** | Threaded post comments | `GET/POST /api/posts/:id/comments` | `PostCard.jsx` | **IMPLEMENTED** |
| **REQ-CHAT-01** | Real-time direct chat messaging | `Socket.io (message:send/receive)` | `Chat.jsx` | **IMPLEMENTED** |
| **REQ-CHAT-02** | Live typing indicators | `Socket.io (typing:start/stop)` | `Chat.jsx` | **IMPLEMENTED** |
| **REQ-CHAT-03** | Live read receipts | `Socket.io (message:read)` | `Chat.jsx` | **IMPLEMENTED** |
| **REQ-CHAT-04** | Live online presence badges | `Socket.io (user:online/offline)` | `Chat.jsx`, `SocketContext.jsx` | **IMPLEMENTED** |
| **REQ-NOTIF-01**| Real-time push notifications & feed | `GET/PATCH /api/notifications` | `Notifications.jsx`, `Topbar.jsx` | **IMPLEMENTED** |
| **REQ-ADM-01** | Platform metrics dashboard | `GET /api/admin/dashboard/stats` | `AdminDashboard.jsx`, `StatCard.jsx` | **IMPLEMENTED** |
| **REQ-ADM-02** | User account management & deactivation | `GET/PATCH /api/admin/users` | `UserManagement.jsx`, `UserDetails.jsx` | **IMPLEMENTED** |
| **REQ-ADM-03** | Alumni verification credential portal | `PATCH /api/admin/alumni/:id/verify` | `AlumniVerification.jsx` | **IMPLEMENTED** |
| **REQ-ADM-04** | Community content moderation | `GET/PATCH /api/admin/moderation/posts`| `Moderation.jsx` | **IMPLEMENTED** |
| **REQ-ADM-05** | Mentorship platform oversight | `GET /api/admin/mentorship` | `MentorshipManagement.jsx` | **IMPLEMENTED** |
| **REQ-ADM-06** | Immutable system security audit trail | `GET /api/admin/audit-logs` | `AuditLogs.jsx` | **IMPLEMENTED** |
