# AlumniConnect — Comprehensive Testing & Quality Assurance Documentation

This document contains test cases and validation results covering **Authentication**, **Role Authorization**, **Feature Modules**, **Real-Time WebSockets**, **UI/UX Responsiveness**, and **Security**.

---

## Master Test Cases (38 Structured Test Cases)

### 1. Authentication & Session Management

| Test ID | Test Scenario / Action | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-001** | Student Registration | Full Name, valid email, strong password, `role: 'student'` | 201 Created, JWT returned, redirects to `/student` | As expected | **PASS** |
| **TC-AUTH-002** | Alumni Registration | Full Name, valid email, strong password, `role: 'alumni'` | 201 Created, JWT returned, redirects to `/alumni` | As expected | **PASS** |
| **TC-AUTH-003** | Prevent Admin Self-Registration | Attempt registration with `role: 'admin'` | 400 Bad Request, role rejected by validator | Blocked | **PASS** |
| **TC-AUTH-004** | Duplicate Email Registration | Existing registered email address | 400 Bad Request ("User with this email already exists") | Rejected | **PASS** |
| **TC-AUTH-005** | Valid User Login | Correct email and password | 200 OK, JWT returned, loads user session | Authenticated | **PASS** |
| **TC-AUTH-006** | Invalid Password Login | Correct email, wrong password | 401 Unauthorized ("Invalid email or password") | Rejected | **PASS** |
| **TC-AUTH-007** | Deactivated Account Login | Credentials of user with `isActive: false` | 403 Forbidden ("Account is deactivated") | Blocked | **PASS** |
| **TC-AUTH-008** | User Logout | Click Logout button in Topbar/Sidebar | Token cleared from `localStorage`, Socket disconnected | Logged out | **PASS** |

---

### 2. Role Authorization & Protected Routes

| Test ID | Test Scenario / Action | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-RBAC-001** | Student accessing `/alumni` | Navigate URL directly while logged in as Student | Redirected to `/unauthorized` (HTTP 403) | Blocked | **PASS** |
| **TC-RBAC-002** | Student accessing `/admin` | Navigate to `/admin/dashboard` as Student | Redirected to `/unauthorized` (HTTP 403) | Blocked | **PASS** |
| **TC-RBAC-003** | Alumni accessing `/admin` | Navigate to `/admin/audit-logs` as Alumni | Redirected to `/unauthorized` (HTTP 403) | Blocked | **PASS** |
| **TC-RBAC-004** | Unauthenticated user access | Access `/student` or `/jobs` without token | Redirected to `/login` with return URL state | Redirected | **PASS** |

---

### 3. Student Profile & Resume Management

| Test ID | Test Scenario / Action | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-STUD-001** | Fetch Student Profile | `GET /api/student/profile` | 200 OK with academic details and skills | Rendered | **PASS** |
| **TC-STUD-002** | Update Academic Profile | Update branch, semester, bio, and skills array | 200 OK, updated profile persisted in MongoDB | Updated | **PASS** |
| **TC-STUD-003** | Upload PDF Resume | Valid PDF file (< 5 MB) | 200 OK, file stored in uploads, `resumeUrl` set | Uploaded | **PASS** |
| **TC-STUD-004** | Reject Non-PDF Resume | Upload `.exe` or `.docx` file | 400 Bad Request ("Only PDF files are allowed") | Rejected | **PASS** |

---

### 4. Alumni Profile & Mentor Availability

| Test ID | Test Scenario / Action | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-ALUM-001** | Update Professional Profile | Company, designation, years of experience | 200 OK, profile updated successfully | Updated | **PASS** |
| **TC-ALUM-002** | Toggle Mentorship Availability | Switch `mentorAvailable` flag from true to false | 200 OK, updated in directory | Toggled | **PASS** |
| **TC-ALUM-003** | Search Alumni Directory | Filter by company / skills / availability | 200 OK, returns filtered array with pagination | Filtered | **PASS** |

---

### 5. Jobs & Candidate Tracking (ATS)

| Test ID | Test Scenario / Action | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-JOB-001** | Post New Job Opening | Title, company, type, deadline, skills | 201 Created, job appears on platform board | Created | **PASS** |
| **TC-JOB-002** | Student Job Application | Job ID, resume link, cover letter | 201 Created, application created with status `'Applied'` | Submitted | **PASS** |
| **TC-JOB-003** | Duplicate Job Application | Student applies second time to same job | 400 Bad Request ("Already applied to this job") | Prevented | **PASS** |
| **TC-JOB-004** | Update Applicant Stage | Alumni changes status to `'Shortlisted'` | 200 OK, status updated, student notified | Updated | **PASS** |
| **TC-JOB-005** | Close Job Posting | Alumni clicks "Close Job" | 200 OK, job status set to `'Closed'` | Closed | **PASS** |

---

### 6. Mentorship Request & Scheduling

| Test ID | Test Scenario / Action | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-MENT-001** | Send Mentorship Request | Mentor ID, topic, message, preferred date | 201 Created, request status `'pending'` | Created | **PASS** |
| **TC-MENT-002** | Accept Mentorship Request | Alumni clicks "Accept" | 200 OK, request status changed to `'accepted'` | Accepted | **PASS** |
| **TC-MENT-003** | Schedule Mentorship Session | Date-time picker + Google Meet URL | 200 OK, `scheduledAt` & `meetingLink` recorded | Scheduled | **PASS** |
| **TC-MENT-004** | Complete Session & Submit Review| Student rates 5 stars with feedback note | 200 OK, rating persisted on session | Rated | **PASS** |

---

### 7. Collaborative Engineering Projects

| Test ID | Test Scenario / Action | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-PROJ-001** | Create Collaboration Project | Title, category, required skills, max team size | 201 Created, status `'recruiting'` | Created | **PASS** |
| **TC-PROJ-002** | Student Apply to Project | Project ID, applicant pitch note, skills | 201 Created, application status `'pending'` | Submitted | **PASS** |
| **TC-PROJ-003** | Accept Student to Project Team | Alumni clicks "Accept Applicant" | 200 OK, student ID appended to `teamMembers` array | Added | **PASS** |

---

### 8. Community Feed & Comments

| Test ID | Test Scenario / Action | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-COMM-001** | Create Community Post | Content text, image URL, tags array | 201 Created, post renders in feed | Published | **PASS** |
| **TC-COMM-002** | Toggle Post Like | Click like button | 200 OK, user ID added to `likes` array, count +1 | Incremented | **PASS** |
| **TC-COMM-003** | Add Comment to Post | Post ID, comment text | 201 Created, comment appended to thread | Commented | **PASS** |

---

### 9. Real-Time Chat (Socket.io)

| Test ID | Test Scenario / Action | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-CHAT-001** | Connect with JWT Auth | Socket handshake with Bearer token | Socket connects, joins private user room | Connected | **PASS** |
| **TC-CHAT-002** | Send Real-Time Message | `message:send` with `receiverId` & text | Message saved to MongoDB & delivered to recipient | Delivered | **PASS** |
| **TC-CHAT-003** | Typing Indicator | User types in message input | Partner receives `typing:start` and `typing:stop` | Triggered | **PASS** |
| **TC-CHAT-004** | Read Receipt Delivery | Recipient opens active chat | Double checkmark turns green (`conversation:read`) | Acknowledged | **PASS** |

---

### 10. Admin Governance & Security Audit

| Test ID | Test Scenario / Action | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-ADM-001** | View Platform Statistics | `GET /api/admin/dashboard/stats` | 200 OK, returns aggregate metrics across modules | Rendered | **PASS** |
| **TC-ADM-002** | Verify Alumni Account | Admin verifies alumni user ID | `isVerified: true`, badge awarded, logged in audit | Verified | **PASS** |
| **TC-ADM-003** | Deactivate User Account | Admin toggles user status to inactive | `isActive: false`, user blocked from logging in | Deactivated | **PASS** |
| **TC-ADM-004** | Content Moderation (Hide Post) | Admin clicks "Hide Post" | `status: 'hidden'`, post removed from general feed | Hidden | **PASS** |
