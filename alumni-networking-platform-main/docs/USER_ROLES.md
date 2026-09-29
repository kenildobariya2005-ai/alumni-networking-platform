# AlumniConnect — System Roles & Access Control

AlumniConnect enforces a **Role-Based Access Control (RBAC)** model. The system defines three primary actor roles: **Student**, **Alumni**, and **Admin**. 

---

## Role Comparison Matrix

| Capability / Module | Student | Alumni | Admin |
| :--- | :---: | :---: | :---: |
| **Self-Registration** | Yes (`student`) | Yes (`alumni`) | No (Pre-provisioned) |
| **View Dashboard** | Student Dashboard | Alumni Dashboard | Admin Control Center |
| **Academic Profile & Resume PDF** | View & Edit | View Only | View Only |
| **Professional Profile & Verification Badge** | N/A | View & Edit | View & Manage |
| **Browse Jobs & Search** | Yes | Yes | Yes |
| **Post / Edit / Close Jobs** | No | Yes (Own jobs) | Yes (All jobs) |
| **Submit Job Application** | Yes | No | No |
| **Review Applicants & Resumes** | No | Yes (Own jobs) | Yes (All jobs) |
| **Search Mentors Directory** | Yes | Yes | Yes |
| **Request 1-on-1 Mentorship** | Yes | No | No |
| **Accept & Schedule Mentorship** | No | Yes | Yes (Oversee) |
| **Submit Mentorship Feedback / Rating** | Yes | No | No |
| **Browse & Apply to Projects** | Yes | Yes (Browse) | Yes (Browse) |
| **Create & Manage Projects** | No | Yes | Yes (Oversee) |
| **Community Feed (Post, Like, Comment)**| Yes | Yes | Yes |
| **Direct Real-Time Chat (Socket.io)** | Yes | Yes | Yes |
| **Receive Real-Time Notifications** | Yes | Yes | Yes |
| **User Management (Status/Deactivate)** | No | No | Yes |
| **Verify / Unverify Alumni** | No | No | Yes |
| **Content Moderation (Hide/Delete)** | No | No | Yes |
| **View Security Audit Trail** | No | No | Yes |

---

## 1. Student Role (`student`)

### Responsibilities:
- Maintain an up-to-date academic record, skill profile, and latest resume PDF.
- Explore career opportunities and submit complete applications with tailored cover letters.
- Reach out to verified alumni for career mentorship and professional advice.
- Collaborate on student-alumni engineering projects and contribute to community knowledge sharing.

### Permissions:
- `GET /api/student/profile`: Read own academic profile.
- `PUT /api/student/profile`: Update bio, branch, semester, graduation year, and skills.
- `POST /api/student/profile/resume`: Upload PDF resume file.
- `GET /api/jobs`: Search and view job listings.
- `POST /api/applications/jobs/:jobId/apply`: Submit job application with cover letter and resume link.
- `GET /api/applications/me`: View real-time status of submitted job applications.
- `GET /api/alumni`: Search alumni mentors with skills/location/availability filters.
- `POST /api/mentorship/request`: Submit mentorship request specifying topic, note, and preferred date.
- `GET /api/mentorship/my-requests`: Track submitted mentorship requests.
- `PATCH /api/mentorship/:id/cancel`: Cancel pending mentorship requests.
- `POST /api/mentorship/:id/feedback`: Submit 1–5 star rating and written review for completed sessions.
- `POST /api/projects/:projectId/apply`: Submit application to join project team.
- `GET /api/project-applications/me`: Track submitted project join requests.
- `POST /api/posts`, `POST /api/comments`, `POST /api/posts/:id/like`: Engage on community feed.
- `POST /api/messages`: Exchange direct messages via REST fallback or Socket.io.

### Restrictions:
- Cannot publish job postings or manage applicants.
- Cannot create collaborative projects (can only apply to join).
- Cannot accept mentorship requests or set mentorship schedules.
- Cannot access `/admin/*` routes or modify user statuses.

---

## 2. Alumni Role (`alumni`)

### Responsibilities:
- Maintain an accurate professional profile (current employer, designation, years of experience, LinkedIn).
- Post verified job and internship openings for students.
- Evaluate candidate resumes and progress applications through recruitment stages.
- Provide career mentorship, conduct 1-on-1 scheduled sessions, and share meeting links.
- Initiate collaborative technical projects and recruit promising student contributors.

### Permissions:
- `GET /api/alumni/profile`: Read own professional profile.
- `PUT /api/alumni/profile`: Update employment details, bio, skills, and mentor availability toggle.
- `POST /api/jobs`: Create new job postings with deadline, compensation, and skill tags.
- `GET /api/jobs/my/posted`: View own posted jobs.
- `PUT /api/jobs/:id`, `DELETE /api/jobs/:id`: Modify or delete own job postings.
- `PATCH /api/jobs/:id/status`: Toggle job status (`Open` / `Closed`).
- `GET /api/applications/jobs/:jobId/applications`: View applicant roster and candidate resumes for own jobs.
- `PATCH /api/applications/:id/status`: Update candidate stage (`Reviewing`, `Shortlisted`, `Accepted`, `Rejected`).
- `GET /api/mentorship/incoming`: View incoming student mentorship requests.
- `PATCH /api/mentorship/:id/accept`, `PATCH /api/mentorship/:id/reject`: Accept or decline mentorship requests.
- `PATCH /api/mentorship/:id/schedule`: Schedule session with date-time and video meeting URL (e.g., Google Meet / Zoom).
- `PATCH /api/mentorship/:id/complete`: Mark mentorship session as completed.
- `POST /api/projects`: Create new collaborative project initiatives.
- `GET /api/projects/my`: View own created projects.
- `PUT /api/projects/:id`, `DELETE /api/projects/:id`: Update or remove own projects.
- `PATCH /api/projects/:id/status`: Update project status (`recruiting`, `in-progress`, `completed`, `cancelled`).
- `GET /api/projects/:projectId/applications`: View student join applications.
- `PATCH /api/project-applications/:id/accept`: Accept student application and automatically add to project team roster.
- `PATCH /api/project-applications/:id/reject`: Decline student project application.

### Restrictions:
- Cannot apply for job listings (only students can submit applications).
- Cannot request mentorship from other alumni (can only provide mentorship).
- Cannot self-verify alumni credentials (requires administrator verification).
- Cannot access administrative controls or audit logs.

---

## 3. Administrator Role (`admin`)

### Responsibilities:
- Oversee institutional platform operations, user accounts, and platform compliance.
- Verify alumni professional identities and award verified badges.
- Moderate inappropriate community contributions to maintain professional standards.
- Monitor mentorship programs and job recruitment health across the university.
- Audit security and administrative event trails.

### Permissions:
- `GET /api/admin/dashboard/stats`: Retrieve aggregate platform statistics (users, jobs, mentorships, projects, posts).
- `GET /api/admin/users`: Query user account directory with role, status, and verification filters.
- `GET /api/admin/users/:id`: Inspect full user metadata including student/alumni extended profiles.
- `PATCH /api/admin/users/:id/status`: Activate or deactivate user accounts.
- `DELETE /api/admin/users/:id`: Soft-delete user accounts.
- `PATCH /api/admin/alumni/:id/verify`: Grant verified alumni badge.
- `PATCH /api/admin/alumni/:id/unverify`: Revoke verified alumni badge.
- `GET /api/admin/jobs`: View all platform job listings and applicant counts.
- `PATCH /api/admin/jobs/:id/close`, `PATCH /api/admin/jobs/:id/reopen`, `DELETE /api/admin/jobs/:id`: Override job status.
- `GET /api/admin/projects`: Supervise all collaborative project listings.
- `PATCH /api/admin/projects/:id/status`, `DELETE /api/admin/projects/:id`: Update or delete projects.
- `GET /api/admin/moderation/posts`: Query moderation queue for posts.
- `PATCH /api/admin/moderation/posts/:id/hide`, `PATCH /api/admin/moderation/posts/:id/restore`, `DELETE /api/admin/moderation/posts/:id`: Moderate posts.
- `PATCH /api/admin/moderation/comments/:id/hide`, `PATCH /api/admin/moderation/comments/:id/restore`, `DELETE /api/admin/moderation/comments/:id`: Moderate comments.
- `GET /api/admin/mentorship`: Oversee all student-alumni mentorship sessions.
- `GET /api/admin/mentorship/statistics`: Retrieve aggregate mentorship analytics and rating distributions.
- `GET /api/admin/audit-logs`: Inspect immutable system security and administrative audit logs.

### Restrictions:
- Cannot be registered via public registration API (prevents privilege escalation).
- All destructive actions are logged into the immutable `AuditLog` collection with timestamp and IP address.
