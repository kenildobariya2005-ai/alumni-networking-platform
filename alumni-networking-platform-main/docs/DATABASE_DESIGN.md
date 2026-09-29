# AlumniConnect — Database Design & Data Dictionary

AlumniConnect utilizes **MongoDB** with **Mongoose ODM**. The database schema comprises **13 distinct collections**.

---

## Collections Overview

| # | Model Name | Collection Name | Purpose | Primary Reference |
|---|:---|:---|:---|:---|
| 1 | `User` | `users` | Base authentication, identity & account status | Core Anchor |
| 2 | `StudentProfile` | `studentprofiles` | Academic background, skills, and resume PDF | `User` (1-to-1) |
| 3 | `AlumniProfile` | `alumniprofiles` | Professional experience, skills, and mentor availability | `User` (1-to-1) |
| 4 | `Job` | `jobs` | Job postings and internships created by Alumni/Admin | `User` (PostedBy) |
| 5 | `Application` | `applications` | Student job applications and recruitment status | `User` + `Job` |
| 6 | `MentorshipRequest` | `mentorshiprequests` | 1-on-1 mentorship bookings, scheduling & reviews | `User` (Student + Mentor) |
| 7 | `Project` | `projects` | Collaborative engineering initiatives & team rosters | `User` (CreatedBy + Members) |
| 8 | `ProjectApplication` | `projectapplications` | Student applications to join project teams | `Project` + `User` |
| 9 | `Post` | `posts` | Community feed discussions and media links | `User` (Author) |
| 10 | `Comment` | `comments` | Threaded discussions attached to community posts | `Post` + `User` (Author) |
| 11 | `Message` | `messages` | Direct chat messages with read status | `User` (Sender + Receiver) |
| 12 | `Notification` | `notifications` | System & activity push notifications | `User` (Recipient + Sender) |
| 13 | `AuditLog` | `auditlogs` | Immutable administrative security audit trail | `User` (Admin) |

---

## Detailed Model Specifications

### 1. `User` Model (`models/User.js`)
Stores core identity and credentials for all platform actors.

| Field | Type | Validation / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto-generated | Primary identifier |
| `fullName` | `String` | Required, Trimmed, Max: 50 | Full name of the user |
| `email` | `String` | Required, Unique, Lowercase, Trimmed | Normalized email address |
| `password` | `String` | Required, Min: 6 | Bcrypt hashed password (hidden in queries) |
| `role` | `String` | Enum: `['student', 'alumni', 'admin']`, Default: `'student'` | Access role |
| `profilePicture` | `String` | Default: `''` | Avatar image URL |
| `isVerified` | `Boolean`| Default: `false` | Verification status (for alumni badges) |
| `isActive` | `Boolean`| Default: `true` | Account active state (admin suspension toggle) |
| `createdAt` | `Date` | Auto-timestamp | Account creation date |
| `updatedAt` | `Date` | Auto-timestamp | Last profile update date |

**Methods / Hooks**:
- `pre('save')`: Hashes password using `bcryptjs` with salt work factor of 10 if modified.
- `comparePassword(candidatePassword)`: Validates plain text against stored hash.

---

### 2. `StudentProfile` Model (`models/StudentProfile.js`)
Extended profile containing academic information and resume for student users.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Ref: `'User'`, Required, Unique Index | Associated student user |
| `enrollmentNumber` | `String` | Optional, Trimmed | University enrollment / roll number |
| `branch` | `String` | Optional, Trimmed | Academic department (e.g., Computer Science) |
| `semester` | `Number` | Optional, Min: 1, Max: 8 | Current academic semester |
| `graduationYear` | `Number` | Optional | Projected / actual graduation year |
| `bio` | `String` | Optional, Max: 500 | Short student self-summary |
| `skills` | `[String]` | Array of Strings, Default: `[]` | Technical & soft skill tags |
| `interests` | `[String]` | Array of Strings, Default: `[]` | Career & domain interest tags |
| `resumeUrl` | `String` | Optional | PDF file URL of student resume |
| `github` | `String` | Optional | GitHub profile URL |
| `linkedin` | `String` | Optional | LinkedIn profile URL |
| `portfolio` | `String` | Optional | Personal portfolio / website URL |
| `profileCompleted` | `Boolean` | Default: `false` | Profile completion flag |

---

### 3. `AlumniProfile` Model (`models/AlumniProfile.js`)
Professional profile detailing corporate experience and mentoring preferences.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Ref: `'User'`, Required, Unique Index | Associated alumni user |
| `company` | `String` | Optional, Trimmed | Current employer / organization |
| `designation` | `String` | Optional, Trimmed | Current professional title / role |
| `experienceYears` | `Number` | Optional, Min: 0, Default: 0 | Total years of industry experience |
| `location` | `String` | Optional, Trimmed | Geographic city / country |
| `bio` | `String` | Optional, Max: 1000 | Professional summary & achievements |
| `skills` | `[String]` | Array of Strings, Default: `[]` | Professional skills & expertise |
| `linkedin` | `String` | Optional | LinkedIn profile URL |
| `mentorAvailable` | `Boolean` | Default: `true` | Willingness to mentor students |
| `profileCompleted` | `Boolean` | Default: `false` | Profile completion flag |

---

### 4. `Job` Model (`models/Job.js`)
Career and internship opportunities published by alumni or administrators.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `title` | `String` | Required, Trimmed, Max: 100 | Job title |
| `description` | `String` | Required, Trimmed | Detailed job description & responsibilities |
| `company` | `String` | Required, Trimmed | Hiring organization |
| `location` | `String` | Required, Trimmed | Office location or "Remote" |
| `jobType` | `String` | Enum: `['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance']`, Required | Employment contract type |
| `salaryRange` | `String` | Optional, Trimmed | Compensation description |
| `requiredSkills` | `[String]` | Array of Strings, Default: `[]` | Prerequisite technical skills |
| `deadline` | `Date` | Required | Application deadline date |
| `postedBy` | `ObjectId` | Ref: `'User'`, Required | Alumni or Admin poster |
| `status` | `String` | Enum: `['Open', 'Closed']`, Default: `'Open'` | Current recruitment status |

---

### 5. `Application` Model (`models/Application.js`)
Records student submissions for job openings.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `student` | `ObjectId` | Ref: `'User'`, Required | Candidate student |
| `job` | `ObjectId` | Ref: `'Job'`, Required | Targeted job posting |
| `resumeUrl` | `String` | Required | PDF resume link for this application |
| `coverLetter` | `String` | Optional, Max: 2000 | Candidate's personal statement |
| `status` | `String` | Enum: `['Applied', 'Reviewing', 'Shortlisted', 'Accepted', 'Rejected']`, Default: `'Applied'` | Recruitment stage |
| `appliedAt` | `Date` | Default: `Date.now` | Submission timestamp |

**Compound Index**: `{ student: 1, job: 1 }` (Unique to prevent duplicate applications).

---

### 6. `MentorshipRequest` Model (`models/MentorshipRequest.js`)
Structured 1-on-1 mentorship session lifecycle.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `student` | `ObjectId` | Ref: `'User'`, Required | Requesting student |
| `mentor` | `ObjectId` | Ref: `'User'`, Required | Targeted alumni mentor |
| `topic` | `String` | Required, Trimmed, Max: 100 | Discussion topic (e.g., Resume Review) |
| `message` | `String` | Required, Max: 1000 | Context and specific questions |
| `preferredDate` | `Date` | Optional | Student's requested timeframe |
| `status` | `String` | Enum: `['pending', 'accepted', 'rejected', 'cancelled', 'completed']`, Default: `'pending'` | Lifecycle stage |
| `meetingLink` | `String` | Optional | Video conference URL (Google Meet, Zoom) |
| `scheduledAt` | `Date` | Optional | Final confirmed session date and time |
| `completedAt` | `Date` | Optional | Timestamp when marked complete |
| `feedback` | `String` | Optional, Max: 1000 | Post-session student written review |
| `rating` | `Number` | Optional, Min: 1, Max: 5 | 1–5 star rating |

---

### 7. `Project` Model (`models/Project.js`)
Collaborative engineering and research initiatives.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `title` | `String` | Required, Trimmed, Max: 100 | Project name |
| `description` | `String` | Required, Trimmed | Project overview and objectives |
| `createdBy` | `ObjectId` | Ref: `'User'`, Required | Project lead (Alumni or Admin) |
| `requiredSkills` | `[String]` | Array of Strings, Default: `[]` | Tech stack & required competencies |
| `category` | `String` | Required, Trimmed | Domain (e.g., AI/ML, Web Dev) |
| `teamMembers` | `[ObjectId]` | Array of Refs: `'User'`, Default: `[]` | Current team member roster |
| `maxTeamSize` | `Number` | Min: 1, Max: 50, Default: 5 | Maximum student collaborators |
| `status` | `String` | Enum: `['recruiting', 'in-progress', 'completed', 'cancelled']`, Default: `'recruiting'` | Project phase |
| `deadline` | `Date` | Optional | Targeted completion deadline |
| `repositoryUrl` | `String` | Optional | GitHub / GitLab repository URL |
| `demoUrl` | `String` | Optional | Live deployment URL |
| `isDeleted` | `Boolean` | Default: `false` | Soft-delete flag |

---

### 8. `ProjectApplication` Model (`models/ProjectApplication.js`)
Student applications to join a collaborative project team.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `project` | `ObjectId` | Ref: `'Project'`, Required | Targeted collaboration project |
| `student` | `ObjectId` | Ref: `'User'`, Required | Applicant student |
| `message` | `String` | Required, Max: 1000 | Why student wants to join |
| `skills` | `[String]` | Array of Strings, Default: `[]` | Relevant skills applicant brings |
| `status` | `String` | Enum: `['pending', 'accepted', 'rejected', 'withdrawn']`, Default: `'pending'` | Application state |

**Compound Index**: `{ project: 1, student: 1 }` (Unique to prevent duplicate applications).

---

### 9. `Post` Model (`models/Post.js`)
Community feed knowledge-sharing posts.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `author` | `ObjectId` | Ref: `'User'`, Required | Post author |
| `content` | `String` | Required, Max: 5000 | Text content of the post |
| `image` | `String` | Optional | Embedded media / image URL |
| `visibility` | `String` | Enum: `['public', 'students-only', 'alumni-only']`, Default: `'public'` | Target audience |
| `likes` | `[ObjectId]` | Array of Refs: `'User'`, Default: `[]` | Users who liked the post |
| `likesCount` | `Number` | Default: 0 | Cached count of total likes |
| `commentsCount` | `Number` | Default: 0 | Cached count of total comments |
| `tags` | `[String]` | Array of Strings, Default: `[]` | Topic tags (e.g. `#career`, `#interview`) |
| `status` | `String` | Enum: `['active', 'hidden', 'deleted']`, Default: `'active'` | Moderation status |

---

### 10. `Comment` Model (`models/Comment.js`)
Threaded discussions attached to community posts.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `post` | `ObjectId` | Ref: `'Post'`, Required | Parent post |
| `author` | `ObjectId` | Ref: `'User'`, Required | Comment author |
| `content` | `String` | Required, Max: 1000 | Comment text |
| `status` | `String` | Enum: `['active', 'hidden', 'deleted']`, Default: `'active'` | Moderation status |

---

### 11. `Message` Model (`models/Message.js`)
Direct real-time and persistent chat messages between users.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `sender` | `ObjectId` | Ref: `'User'`, Required | Sender user |
| `receiver` | `ObjectId` | Ref: `'User'`, Required | Recipient user |
| `message` | `String` | Required, Max: 2000 | Text message payload |
| `isRead` | `Boolean` | Default: `false` | Read receipt flag |
| `readAt` | `Date` | Optional | Timestamp when recipient read the message |
| `isDeleted` | `Boolean` | Default: `false` | Soft-delete flag |

---

### 12. `Notification` Model (`models/Notification.js`)
Event-driven activity alerts and notifications.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `recipient` | `ObjectId` | Ref: `'User'`, Required | Alert recipient |
| `sender` | `ObjectId` | Ref: `'User'`, Optional | Triggering user |
| `title` | `String` | Required, Trimmed | Notification headline |
| `message` | `String` | Required, Trimmed | Notification message body |
| `type` | `String` | Enum: `['mentorship', 'job', 'project', 'message', 'verification', 'system']`, Required | Notification category |
| `relatedId` | `ObjectId` | Optional | ID of related entity (e.g. Job ID, Request ID) |
| `relatedModel` | `String` | Optional | Name of model (e.g., `'Job'`, `'MentorshipRequest'`) |
| `isRead` | `Boolean` | Default: `false` | Read status |
| `readAt` | `Date` | Optional | Timestamp when marked as read |

---

### 13. `AuditLog` Model (`models/AuditLog.js`)
Immutable security audit trail capturing administrative modifications.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `ObjectId` | Ref: `'User'`, Required | Administrator who performed action |
| `action` | `String` | Required, Uppercase | Action code (e.g., `'ALUMNI_VERIFIED'`, `'USER_STATUS_UPDATED'`) |
| `targetType` | `String` | Required | Entity type (e.g., `'User'`, `'Job'`, `'Post'`) |
| `targetId` | `ObjectId` | Optional | Identifier of target document |
| `description` | `String` | Required | Human-readable explanation of event |
| `ipAddress` | `String` | Optional | Client IP address of administrator |
| `metadata` | `Object` | Optional | JSON snapshot of modified properties |
| `createdAt` | `Date` | Auto-timestamp | Immutable event timestamp |
