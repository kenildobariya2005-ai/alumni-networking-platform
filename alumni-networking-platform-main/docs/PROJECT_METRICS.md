# AlumniConnect — Verified Project Codebase Metrics & Statistics

This document provides exact, verified codebase statistics for **AlumniConnect** based on static code analysis.

---

## 1. Summary Metrics Table

| Metric Category | Count / Quantity | Verification Reference |
| :--- | :---: | :--- |
| **User Roles** | **3** | `student`, `alumni`, `admin` (`models/User.js`) |
| **Database Models** | **13** | Schema files in `backend/src/models/` |
| **Backend Route Files** | **19** | Router files in `backend/src/routes/` |
| **Backend REST Endpoints** | **48** | Distinct REST route definitions across all modules |
| **Backend Controllers** | **19** | Controller modules in `backend/src/controllers/` |
| **Backend Validators** | **13** | Express-validator schemas in `backend/src/validators/` |
| **Backend Middlewares** | **4** | `authMiddleware`, `roleMiddleware`, `uploadMiddleware`, `errorMiddleware` |
| **Socket.io Custom Events** | **14** | Active event handlers in `backend/src/socket/socketServer.js` |
| **Frontend Page Components** | **47** | Routed views in `frontend/src/pages/` |
| **Frontend Reusable Components** | **16** | Atomic UI & layout components in `frontend/src/components/` |
| **Frontend API Service Modules** | **13** | Axios API client modules in `frontend/src/services/` |
| **Context Providers** | **2** | `AuthContext.jsx`, `SocketContext.jsx` |
| **Custom React Hooks** | **2** | `useAuth.js`, `useSocket.js` |
| **Structured Test Cases** | **38** | Documented & executed test cases in `docs/TESTING.md` |
| **Production Build Modules** | **204** | Transformed modules compiled via Vite build engine |

---

## 2. Granular Inventory Breakdown

### A. Database Models (13 Models)
1. `User.js`
2. `StudentProfile.js`
3. `AlumniProfile.js`
4. `Job.js`
5. `Application.js`
6. `MentorshipRequest.js`
7. `Project.js`
8. `ProjectApplication.js`
9. `Post.js`
10. `Comment.js`
11. `Message.js`
12. `Notification.js`
13. `AuditLog.js`

### B. Backend Route Modules (19 Routers)
1. `authRoutes.js`
2. `studentProfileRoutes.js`
3. `alumniProfileRoutes.js`
4. `jobRoutes.js`
5. `applicationRoutes.js`
6. `mentorshipRoutes.js`
7. `projectRoutes.js`
8. `projectApplicationRoutes.js`
9. `postRoutes.js`
10. `commentRoutes.js`
11. `messageRoutes.js`
12. `notificationRoutes.js`
13. `adminDashboardRoutes.js`
14. `adminUserRoutes.js`
15. `adminJobRoutes.js`
16. `adminProjectRoutes.js`
17. `adminModerationRoutes.js`
18. `adminMentorshipRoutes.js`
19. `auditRoutes.js`

### C. Socket.io Events Handled (14 Events)
1. `connection`
2. `user:online_list`
3. `user:online`
4. `user:offline`
5. `message:send`
6. `message:receive`
7. `message:delivered`
8. `message:sent`
9. `message:read`
10. `conversation:read`
11. `typing:start`
12. `typing:stop`
13. `notification:new`
14. `disconnect`

### D. Frontend API Client Services (13 Services)
1. `api.js` (Central Axios interceptor instance)
2. `authService.js`
3. `studentService.js`
4. `alumniService.js`
5. `jobService.js`
6. `applicationService.js`
7. `mentorshipService.js`
8. `projectService.js`
9. `communityService.js`
10. `messageService.js`
11. `notificationService.js`
12. `adminService.js`
13. `socketService.js`
