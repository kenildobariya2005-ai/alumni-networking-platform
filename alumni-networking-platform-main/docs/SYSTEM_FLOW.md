# AlumniConnect — System Flow & Workflows

This document outlines the detailed workflows across all platform capabilities in **AlumniConnect**.

---

## 1. User Registration Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Alumni
    participant Client as React Client (RegisterPage)
    participant API as Express API (/api/auth/register)
    participant DB as MongoDB (User Collection)

    User->>Client: Enters fullName, email, password, and selects Role (Student/Alumni)
    Client->>Client: Client-side validation (Password strength >= 8, email regex)
    Client->>API: POST /api/auth/register { fullName, email, password, role }
    API->>API: express-validator checks payload (blocks role='admin')
    API->>DB: User.findOne({ email })
    alt Email already exists
        DB-->>API: User found
        API-->>Client: 400 Bad Request ("User with this email already exists")
        Client-->>User: Displays inline error
    else Email is unique
        API->>API: Hashes password with bcryptjs (salt rounds = 10)
        API->>DB: User.create({ fullName, email, password: hash, role })
        DB-->>API: Created User Document
        API->>API: Signs JWT token with 7-day expiration
        API-->>Client: 201 Created + { token, user } + Set-Cookie
        Client->>Client: Stores token in localStorage & AuthContext
        Client-->>User: Redirects to role dashboard (/student or /alumni)
    end
```

---

## 2. Authentication & Login Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Client as React Client (LoginPage)
    participant API as Express API (/api/auth/login)
    participant DB as MongoDB (User Collection)

    User->>Client: Enters email and password
    Client->>API: POST /api/auth/login { email, password }
    API->>DB: User.findOne({ email })
    alt User not found OR password mismatch
        API-->>Client: 401 Unauthorized ("Invalid email or password")
        Client-->>User: Shows error notification
    else Account is deactivated
        API-->>Client: 403 Forbidden ("Account is deactivated. Please contact support.")
        Client-->>User: Shows account deactivated banner
    else Credentials Valid & Active
        API->>API: Signs JWT token
        API-->>Client: 200 OK + { token, user }
        Client->>Client: AuthContext initializes and establishes Socket connection
        Client-->>User: Redirects to appropriate dashboard (/student, /alumni, /admin)
    end
```

---

## 3. Student Workflow

```mermaid
graph TD
    Login["Student Signs In"] --> Dash["Student Dashboard"]
    Dash --> Profile["1. Complete Profile (Branch, Semester, Skills, Resume PDF)"]
    Dash --> Jobs["2. Browse Jobs & Internships"]
    Dash --> Mentors["3. Find Alumni Mentors"]
    Dash --> Projects["4. Browse Collaborative Projects"]
    Dash --> Feed["5. Community Feed & Chat"]

    Jobs --> ApplyJob["Submit Job Application with Cover Letter"]
    ApplyJob --> TrackApp["Track Status: Applied -> Reviewing -> Shortlisted -> Accepted"]

    Mentors --> ReqMentor["Send Mentorship Request (Topic, Note, Date)"]
    ReqMentor --> TrackMentor["Session Scheduled -> Attend Meeting -> Submit 1-5 Star Review"]

    Projects --> ApplyProject["Apply to Join Project Team"]
    ApplyProject --> TeamMember["Accepted -> Added to Team Roster"]
```

---

## 4. Alumni Workflow

```mermaid
graph TD
    AlumniLogin["Alumni Signs In"] --> AlumniDash["Alumni Dashboard"]
    AlumniDash --> AlumniProf["1. Complete Profile (Company, Role, Experience, Mentor Toggle)"]
    AlumniDash --> JobMgmt["2. Job Portal Management"]
    AlumniDash --> MentorMgmt["3. Mentorship Center"]
    AlumniDash --> ProjMgmt["4. Project Initiatives"]

    JobMgmt --> PostJob["Create Job Posting (Skills, Deadline, Salary)"]
    PostJob --> ReviewApps["Review Student Applications & PDF Resumes"]
    ReviewApps --> UpdateStage["Update Status: Reviewing / Shortlisted / Accepted / Rejected"]

    MentorMgmt --> IncomingReqs["Receive Student Mentorship Requests"]
    IncomingReqs --> AcceptReq["Accept Request -> Schedule Datetime & Video Meeting Link"]
    AcceptReq --> CompleteSess["Conduct Session -> Mark Completed"]

    ProjMgmt --> CreateProj["Create Project Initiative (Tech Stack, Max Team)"]
    CreateProj --> ReviewProjApps["Review Join Requests -> Accept Student into Team Roster"]
```

---

## 5. Job Application Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Applied: Student applies with Resume & Cover Letter
    Applied --> Reviewing: Alumni opens candidate profile
    Reviewing --> Shortlisted: Candidate meets requirements
    Reviewing --> Rejected: Candidate does not qualify
    Shortlisted --> Accepted: Candidate selected for role / interview
    Shortlisted --> Rejected: Final rejection
    Accepted --> [*]
    Rejected --> [*]
```

---

## 6. Mentorship Request Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending: Student submits mentorship request
    pending --> cancelled: Student cancels request
    pending --> rejected: Mentor declines request
    pending --> accepted: Mentor accepts request
    accepted --> scheduled: Mentor sets Date/Time & Video Meeting URL
    scheduled --> completed: Session conducted
    completed --> feedback_submitted: Student leaves 1-5 Star Rating & Review
    feedback_submitted --> [*]
    cancelled --> [*]
    rejected --> [*]
```

---

## 7. Collaborative Project Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Alumni as Alumni Lead
    actor Student as Student
    participant API as Express API
    participant DB as MongoDB

    Alumni->>API: POST /api/projects (Create project with max team size)
    API->>DB: Save project (status: 'recruiting')
    
    Student->>API: POST /api/projects/:id/apply (Submits join note & skills)
    API->>DB: Save ProjectApplication (status: 'pending')
    API->>DB: Create Notification for Alumni Lead
    
    Alumni->>API: GET /api/projects/:id/applications (Reviews applicant)
    Alumni->>API: PATCH /api/project-applications/:id/accept
    API->>DB: Update application status -> 'accepted'
    API->>DB: Add student ID to Project.teamMembers array
    API->>DB: Create Notification for Student ("Accepted to project team")
```

---

## 8. Alumni Verification & Moderation Workflow (Admin)

```mermaid
graph TD
    Reg["Alumni Registers on Platform"] --> PendingVerif["isVerified: false (Pending Review)"]
    PendingVerif --> AdminQueue["Admin Reviews Credentials in Verification Portal"]
    AdminQueue -->|Matches University Records| GrantBadge["PATCH /api/admin/alumni/:id/verify -> isVerified: true"]
    AdminQueue -->|Fraudulent/Unverified| RevokeBadge["PATCH /api/admin/alumni/:id/unverify -> isVerified: false"]
    GrantBadge --> Audit["Action logged in Immutable AuditLog Collection with Admin ID & IP"]
    RevokeBadge --> Audit
```
