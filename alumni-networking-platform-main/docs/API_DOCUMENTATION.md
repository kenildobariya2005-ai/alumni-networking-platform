# AlumniConnect — Complete API Documentation

This document provides complete technical specifications for all REST API endpoints implemented in **AlumniConnect**.

---

## Master API Reference Table

| Module | Method | Endpoint | Auth Required | Required Role | Description |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Auth** | `POST` | `/api/auth/register` | No | Public | Register new Student or Alumni |
| **Auth** | `POST` | `/api/auth/login` | No | Public | Authenticate user & issue JWT |
| **Auth** | `POST` | `/api/auth/logout` | Yes | Any | Logout user & clear cookie |
| **Auth** | `GET` | `/api/auth/profile` | Yes | Any | Get current user's profile |
| **Student** | `GET` | `/api/student/profile` | Yes | Student, Admin | Get logged-in student's profile |
| **Student** | `PUT` | `/api/student/profile` | Yes | Student | Update student profile data |
| **Student** | `POST` | `/api/student/profile/resume` | Yes | Student | Upload student PDF resume |
| **Student** | `GET` | `/api/student/:id` | Yes | Any | View student profile by User ID |
| **Alumni** | `GET` | `/api/alumni` | Yes | Any | Search alumni directory |
| **Alumni** | `GET` | `/api/alumni/profile` | Yes | Alumni, Admin | Get logged-in alumni profile |
| **Alumni** | `PUT` | `/api/alumni/profile` | Yes | Alumni | Update alumni profile & availability |
| **Alumni** | `GET` | `/api/alumni/:id` | Yes | Any | View alumni profile by User ID |
| **Jobs** | `GET` | `/api/jobs` | Yes | Any | Search & filter all job postings |
| **Jobs** | `GET` | `/api/jobs/my/posted` | Yes | Alumni, Admin | View jobs posted by logged-in user |
| **Jobs** | `POST` | `/api/jobs` | Yes | Alumni, Admin | Create new job posting |
| **Jobs** | `GET` | `/api/jobs/:id` | Yes | Any | Get single job posting details |
| **Jobs** | `PUT` | `/api/jobs/:id` | Yes | Alumni (Owner), Admin | Update job posting |
| **Jobs** | `DELETE`| `/api/jobs/:id` | Yes | Alumni (Owner), Admin | Delete job posting |
| **Jobs** | `PATCH` | `/api/jobs/:id/status` | Yes | Alumni (Owner), Admin | Close / reopen job posting |
| **Applications**| `POST` | `/api/applications/jobs/:jobId/apply`| Yes | Student | Apply for a job opening |
| **Applications**| `GET` | `/api/applications/me` | Yes | Student | View own job applications |
| **Applications**| `GET` | `/api/applications/jobs/:jobId/applications`| Yes | Alumni, Admin | View applications for a job |
| **Applications**| `PATCH`| `/api/applications/:id/status` | Yes | Alumni, Admin | Update candidate application stage |
| **Mentorship** | `POST` | `/api/mentorship/request` | Yes | Student | Send 1-on-1 mentorship request |
| **Mentorship** | `GET` | `/api/mentorship/my-requests` | Yes | Student | View sent mentorship requests |
| **Mentorship** | `GET` | `/api/mentorship/incoming` | Yes | Alumni | View incoming mentorship requests |
| **Mentorship** | `GET` | `/api/mentorship/history` | Yes | Any | View past completed mentorships |
| **Mentorship** | `GET` | `/api/mentorship/:id` | Yes | Participant, Admin | View mentorship session details |
| **Mentorship** | `PATCH`| `/api/mentorship/:id/accept` | Yes | Alumni (Mentor) | Accept mentorship request |
| **Mentorship** | `PATCH`| `/api/mentorship/:id/reject` | Yes | Alumni (Mentor) | Decline mentorship request |
| **Mentorship** | `PATCH`| `/api/mentorship/:id/cancel` | Yes | Student (Requester) | Cancel pending request |
| **Mentorship** | `PATCH`| `/api/mentorship/:id/schedule` | Yes | Alumni (Mentor) | Schedule date & meeting URL |
| **Mentorship** | `PATCH`| `/api/mentorship/:id/complete` | Yes | Alumni (Mentor) | Mark session completed |
| **Mentorship** | `POST` | `/api/mentorship/:id/feedback` | Yes | Student (Requester) | Submit 1-5 star review |
| **Projects** | `GET` | `/api/projects` | Yes | Any | Browse collaboration projects |
| **Projects** | `GET` | `/api/projects/my` | Yes | Any | View own created projects |
| **Projects** | `POST` | `/api/projects` | Yes | Alumni | Create collaboration project |
| **Projects** | `GET` | `/api/projects/:id` | Yes | Any | Get project details & team roster |
| **Projects** | `PUT` | `/api/projects/:id` | Yes | Alumni (Creator) | Update project details |
| **Projects** | `DELETE`| `/api/projects/:id` | Yes | Alumni (Creator), Admin | Delete project |
| **Projects** | `PATCH`| `/api/projects/:id/status` | Yes | Alumni (Creator) | Update project phase |
| **Projects** | `POST` | `/api/projects/:projectId/apply` | Yes | Student | Apply to join project team |
| **Projects** | `GET` | `/api/projects/:projectId/applications`| Yes | Alumni (Creator), Admin | View applicants for project |
| **Project Apps**| `GET` | `/api/project-applications/me` | Yes | Student | View own project applications |
| **Project Apps**| `PATCH`| `/api/project-applications/:id/accept` | Yes | Alumni (Creator) | Accept student onto team |
| **Project Apps**| `PATCH`| `/api/project-applications/:id/reject` | Yes | Alumni (Creator) | Decline student application |
| **Project Apps**| `PATCH`| `/api/project-applications/:id/withdraw`| Yes | Student | Withdraw application |
| **Posts** | `GET` | `/api/posts` | Yes | Any | Get community feed posts |
| **Posts** | `POST` | `/api/posts` | Yes | Any | Create new community post |
| **Posts** | `GET` | `/api/posts/:id` | Yes | Any | Get single post details |
| **Posts** | `PUT` | `/api/posts/:id` | Yes | Author, Admin | Update post content |
| **Posts** | `DELETE`| `/api/posts/:id` | Yes | Author, Admin | Delete post |
| **Posts** | `POST` | `/api/posts/:id/like` | Yes | Any | Toggle like / unlike on post |
| **Comments** | `GET` | `/api/posts/:postId/comments` | Yes | Any | Get comments for a post |
| **Comments** | `POST` | `/api/posts/:postId/comments` | Yes | Any | Add comment to a post |
| **Comments** | `PUT` | `/api/comments/:id` | Yes | Author, Admin | Update comment content |
| **Comments** | `DELETE`| `/api/comments/:id` | Yes | Author, Admin | Delete comment |
| **Messages** | `GET` | `/api/messages/conversations` | Yes | Any | Get conversation summaries |
| **Messages** | `GET` | `/api/messages/conversation/:userId` | Yes | Any | Get message history with user |
| **Messages** | `POST` | `/api/messages` | Yes | Any | Send direct message (REST fallback) |
| **Messages** | `PATCH`| `/api/messages/conversation/:userId/read` | Yes | Any | Mark conversation as read |
| **Notifications**| `GET`| `/api/notifications` | Yes | Any | Get notification feed |
| **Notifications**| `GET`| `/api/notifications/unread` | Yes | Any | Get unread notifications count |
| **Notifications**| `PATCH`| `/api/notifications/read-all` | Yes | Any | Mark all notifications read |
| **Notifications**| `PATCH`| `/api/notifications/:id/read` | Yes | Any | Mark single notification read |
| **Notifications**| `DELETE`| `/api/notifications/:id` | Yes | Any | Delete a notification |
| **Admin** | `GET` | `/api/admin/dashboard/stats` | Yes | Admin | Platform-wide aggregate stats |
| **Admin** | `GET` | `/api/admin/users` | Yes | Admin | Query user accounts table |
| **Admin** | `GET` | `/api/admin/users/:id` | Yes | Admin | Get user & extended profile |
| **Admin** | `PATCH`| `/api/admin/users/:id/status` | Yes | Admin | Activate / deactivate user |
| **Admin** | `DELETE`| `/api/admin/users/:id` | Yes | Admin | Soft-delete user account |
| **Admin** | `PATCH`| `/api/admin/alumni/:id/verify` | Yes | Admin | Grant verified badge to alumni |
| **Admin** | `PATCH`| `/api/admin/alumni/:id/unverify` | Yes | Admin | Revoke verified badge |
| **Admin** | `GET` | `/api/admin/jobs` | Yes | Admin | Supervise all platform jobs |
| **Admin** | `PATCH`| `/api/admin/jobs/:id/close` | Yes | Admin | Force close job posting |
| **Admin** | `PATCH`| `/api/admin/jobs/:id/reopen` | Yes | Admin | Reopen closed job |
| **Admin** | `GET` | `/api/admin/projects` | Yes | Admin | Supervise all projects |
| **Admin** | `GET` | `/api/admin/moderation/posts` | Yes | Admin | Query posts moderation queue |
| **Admin** | `PATCH`| `/api/admin/moderation/posts/:id/hide` | Yes | Admin | Hide offensive post |
| **Admin** | `PATCH`| `/api/admin/moderation/posts/:id/restore` | Yes | Admin | Restore hidden post |
| **Admin** | `GET` | `/api/admin/mentorship` | Yes | Admin | Monitor all mentorship sessions |
| **Admin** | `GET` | `/api/admin/mentorship/statistics` | Yes | Admin | Get mentorship ratings metrics |
| **Admin** | `GET` | `/api/admin/audit-logs` | Yes | Admin | Inspect security audit trail |

---

## Detailed Endpoint Specifications & Examples

### 1. Authentication Module

#### `POST /api/auth/register`
- **Purpose**: Creates a new student or alumni account.
- **Request Body**:
  ```json
  {
    "fullName": "Aarav Patel",
    "email": "aarav.patel@university.edu",
    "password": "Password@123",
    "role": "student"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "66d4128f1423456789abcdef",
      "fullName": "Aarav Patel",
      "email": "aarav.patel@university.edu",
      "role": "student",
      "isVerified": false,
      "isActive": true
    }
  }
  ```

#### `POST /api/auth/login`
- **Purpose**: Authenticates credentials and returns a signed JWT.
- **Request Body**:
  ```json
  {
    "email": "aarav.patel@university.edu",
    "password": "Password@123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "66d4128f1423456789abcdef",
      "fullName": "Aarav Patel",
      "email": "aarav.patel@university.edu",
      "role": "student"
    }
  }
  ```

---

### 2. Mentorship Module

#### `POST /api/mentorship/request`
- **Purpose**: Student submits a mentorship request to an alumni member.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "mentorId": "66d4128f1423456789abcde0",
    "topic": "Frontend Architecture Career Guidance",
    "message": "Hello! I am preparing for frontend engineer campus placements and would love your guidance on system design.",
    "preferredDate": "2026-09-15T10:00:00.000Z"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Mentorship request submitted successfully",
    "data": {
      "_id": "66d4999f1423456789abc111",
      "student": "66d4128f1423456789abcdef",
      "mentor": "66d4128f1423456789abcde0",
      "topic": "Frontend Architecture Career Guidance",
      "status": "pending",
      "createdAt": "2026-09-01T10:00:00.000Z"
    }
  }
  ```

#### `PATCH /api/mentorship/:id/schedule`
- **Purpose**: Alumni schedules the confirmed session with a video link.
- **Request Body**:
  ```json
  {
    "scheduledAt": "2026-09-15T14:30:00.000Z",
    "meetingLink": "https://meet.google.com/xyz-abcd-uvw"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Mentorship session scheduled successfully",
    "data": {
      "_id": "66d4999f1423456789abc111",
      "status": "accepted",
      "scheduledAt": "2026-09-15T14:30:00.000Z",
      "meetingLink": "https://meet.google.com/xyz-abcd-uvw"
    }
  }
  ```

---

### 3. Jobs Module

#### `POST /api/jobs`
- **Purpose**: Alumni creates a job or internship opportunity.
- **Request Body**:
  ```json
  {
    "title": "Junior Full Stack Developer",
    "company": "TechCorp Innovations",
    "location": "Bengaluru / Hybrid",
    "jobType": "Full-time",
    "salaryRange": "₹8,00,000 - ₹12,00,000",
    "requiredSkills": ["React", "Node.js", "MongoDB", "Tailwind CSS"],
    "deadline": "2026-10-31T23:59:59.000Z",
    "description": "Looking for passionate 2026 graduates with hands-on React and Express experience."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Job created successfully",
    "job": {
      "_id": "66d4888f1423456789abc222",
      "title": "Junior Full Stack Developer",
      "company": "TechCorp Innovations",
      "status": "Open"
    }
  }
  ```

---

### 4. Admin Module

#### `GET /api/admin/dashboard/stats`
- **Purpose**: Retrieves aggregate platform performance metrics.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "users": {
        "total": 1420,
        "students": 1150,
        "alumni": 260,
        "verifiedAlumni": 210,
        "active": 1410,
        "inactive": 10
      },
      "jobs": {
        "total": 85,
        "open": 64,
        "closed": 21,
        "applications": 430
      },
      "mentorship": {
        "total": 310,
        "pending": 45,
        "accepted": 80,
        "completed": 170,
        "rejected": 15
      },
      "projects": {
        "total": 42,
        "recruiting": 28,
        "inProgress": 10,
        "completed": 4
      },
      "community": {
        "posts": 580,
        "comments": 2140
      }
    }
  }
  ```
