# AlumniConnect — UI Screen Inventory & Component Mapping

This document provides a comprehensive catalogue of all user interfaces implemented in **AlumniConnect**.

---

## 1. Public & Authentication Screens

| Screen Name | Route Path | Access Role | Purpose | Key UI Elements |
| :--- | :--- | :---: | :--- | :--- |
| **Landing Page** | `/` | Public | Platform value proposition, feature overview, and CTAs | Hero banner, statistics metrics, testimonials, Navbar, Footer |
| **User Sign In** | `/login` | Public | Authenticates student, alumni, or admin accounts | Email & password inputs, password show/hide, remember me checkbox, error banner |
| **User Registration** | `/register` | Public | Creates student or alumni accounts | Full name, email, password strength meter, role selector cards (`Student` / `Alumni`) |
| **Access Denied** | `/unauthorized` | Public | Displays 403 Forbidden alert when role check fails | Warning badge, return to dashboard CTA button |
| **Not Found** | `*` | Public | 404 handler for unknown routes | Custom illustration, return to home button |

---

## 2. Student Workspace Screens

| Screen Name | Route Path | Access Role | Purpose | Key UI Elements |
| :--- | :--- | :---: | :--- | :--- |
| **Student Dashboard** | `/student` | Student, Admin | Student homepage & metrics overview | Profile completion gauge, applications count, scheduled mentorships, recent activity feed |
| **Student Profile** | `/student/profile` | Student, Admin | Manage academic details, skills, and resume | View/Edit toggle, semester/branch inputs, skill tag editor, PDF resume upload dropzone |
| **My Applications** | `/student/applications` | Student, Admin | Track submitted job & internship applications | Responsive application cards, recruitment stage badges (`Applied`, `Shortlisted`, `Accepted`), cover letter modal |
| **My Mentorships** | `/student/mentorships` | Student, Admin | Manage booked 1-on-1 mentorship sessions | Session cards, scheduled date/time badges, Google Meet launch button, cancel request modal, 5-star review modal |

---

## 3. Alumni Workspace Screens

| Screen Name | Route Path | Access Role | Purpose | Key UI Elements |
| :--- | :--- | :---: | :--- | :--- |
| **Alumni Dashboard** | `/alumni` | Alumni, Admin | Alumni workspace & recruitment overview | Verification status banner, total jobs posted, candidate applications count, active mentees |
| **Alumni Profile** | `/alumni/profile` | Alumni, Admin | Manage corporate experience & mentor availability | Company/designation inputs, experience slider, mentoring availability toggle, LinkedIn URL |
| **My Posted Jobs** | `/alumni/jobs` | Alumni, Admin | Manage created recruitment listings | Job table, applicant counter, status toggle (`Open`/`Closed`), edit modal, delete confirmation |
| **Job Applicant Management**| `/alumni/applications` | Alumni, Admin | Evaluate applicants across recruitment stages | Candidate list, PDF resume viewer shortcut, cover letter modal, status dropdown (`Reviewing`, `Accepted`, etc.) |
| **Mentorship Requests** | `/alumni/mentorships` | Alumni, Admin | Review and accept incoming student guidance requests | Pending request cards, Accept/Decline actions, schedule modal (datetime picker + video link), complete trigger |
| **My Created Projects** | `/alumni/projects` | Alumni, Admin | Supervise created collaborative engineering projects | Project cards, phase dropdown (`recruiting`, `in-progress`), team roster modal, applicants shortcut |
| **Project Applications** | `/alumni/projects/:id/applications`| Alumni, Admin | Evaluate student join requests for a project | Candidate pitch notes, applicant skill tags, Accept onto team / Decline buttons |

---

## 4. Shared Feature Screens

| Screen Name | Route Path | Access Role | Purpose | Key UI Elements |
| :--- | :--- | :---: | :--- | :--- |
| **Jobs Board** | `/jobs` | All Authenticated | Search & filter opportunities across university | Search input, jobType / location filters, JobCard grid, pagination, quick apply modal |
| **Job Details View** | `/jobs/:id` | All Authenticated | Full job specifications & recruiter details | Job description, salary range, required skills badges, hiring manager snapshot, apply trigger |
| **Post a Job** | `/jobs/create` | Alumni, Admin | Form to publish new employment opportunities | Title, company, contract type dropdown, salary range, deadline datepicker, skill tag parser |
| **Find Mentors** | `/mentorship` | All Authenticated | Searchable alumni mentor directory | Filter by company / skills / availability, MentorCard grid, request mentorship modal |
| **Request Mentorship** | `/mentorship/request/:mentorId` | Student, Admin | Form to submit mentorship booking | Mentor header, topic selector, message textarea, preferred date picker |
| **Schedule Mentorship** | `/mentorship/schedule/:id` | Alumni, Admin | Form to set session date & video link | Datetime picker, Google Meet / Zoom URL input |
| **Projects Board** | `/projects` | All Authenticated | Browse collaborative initiatives | Category filter, search input, ProjectCard grid, team capacity meters, apply modal |
| **Project Details View** | `/projects/:id` | All Authenticated | Complete project scope & team list | Description, GitHub repository link, live demo URL, team members list with chat shortcuts |
| **Create Project** | `/projects/create` | Alumni, Admin | Form to initiate new collaboration | Category dropdown, max team size slider, tech stack tags, repository/demo URLs |
| **Community Feed** | `/community` | All Authenticated | Knowledge sharing stream & discussions | Quick post composer, PostCard feed, like counters, threaded comments drawer, pagination |
| **Create Post** | `/community/create` | All Authenticated | Standalone post creation interface | Content textarea, image URL input, audience visibility selector (`public`, `students-only`, `alumni-only`) |
| **Direct Messages (Chat)** | `/chat` & `/chat/:userId` | All Authenticated | Low-latency real-time direct messaging | Conversations sidebar, online presence dots, message bubble stream, typing indicator, read receipts |
| **Notifications** | `/notifications` | All Authenticated | Activity notifications & alerts stream | Notification list, icon by alert type, mark-as-read buttons, bulk "Mark all read" CTA |

---

## 5. Administrative Control Center Screens

| Screen Name | Route Path | Access Role | Purpose | Key UI Elements |
| :--- | :--- | :---: | :--- | :--- |
| **Admin Dashboard** | `/admin` | Admin | Real-time platform metrics & audit stream | StatCard metric grid (Users, Jobs, Mentorships, Projects), recent registrations list, audit snippet |
| **User Account Management**| `/admin/users` | Admin | Supervise all registered platform users | Search bar, role filter (`student`/`alumni`/`admin`), status toggle (`Active`/`Deactivated`), delete modal |
| **User Details View** | `/admin/users/:id` | Admin | Inspect full user account & profile data | User metadata, academic/alumni extended record, admin override actions |
| **Alumni Verification** | `/admin/alumni-verification` | Admin | Verify alumni professional identities | Filter (`Pending`/`Verified`), candidate company/role, LinkedIn link, Verify / Revoke actions |
| **Platform Job Management**| `/admin/jobs` | Admin | Oversee all job listings across institution | Status filter, applicant counters, Close / Reopen actions, force delete modal |
| **Platform Project Management**| `/admin/projects` | Admin | Oversee all collaborative projects | Category filter, team size monitor, phase dropdown, delete modal |
| **Content Moderation** | `/admin/moderation` | Admin | Moderate offensive community posts & comments | Post/Comment tabs, author snapshot, Hide / Restore / Delete actions |
| **Mentorship Oversight** | `/admin/mentorship` | Admin | Monitor university mentorship health | Status filter, student & mentor names, scheduled dates, session ratings distribution |
| **System Audit Trail** | `/admin/audit-logs` | Admin | Immutable administrative security log | Search input, action filter, administrator name, target ID, IP address, timestamp |
