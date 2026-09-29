# AlumniConnect — Non-Functional Requirements (NFRs)

This document details the quality attributes, operational constraints, and non-functional requirements implemented in **AlumniConnect**.

---

## 1. Quality Attribute Matrix

| Dimension | Target Standard | Implementation & Architecture Technique |
| :--- | :--- | :--- |
| **Performance** | API response time $< 200\text{ ms}$ under standard loads | Mongoose lean queries, compound indexes on foreign keys, and paginated data queries (`limit=10-15`) |
| **Security** | OWASP Top 10 compliance | JWT stateless auth, bcrypt password hashing (10 salt rounds), Helmet security headers, CORS origin restrictions, and strict RBAC |
| **Scalability** | Horizontal scalability ready | Stateless Express server architecture; database indexing; isolated Socket.io room broadcasts |
| **Availability** | $99.9\%$ operational uptime | Graceful error catching via Express error middleware; uncaught promise rejection handling |
| **Usability** | Intuitive SaaS experience | Cohesive design system using Tailwind CSS; instant feedback via `react-hot-toast`; dedicated empty and loading states |
| **Responsiveness**| 100% viewport fluidity (320px to 1440px+) | Mobile-first Tailwind grid layouts, responsive table containers (`overflow-x-auto`), slide-out drawer navigation |
| **Accessibility** | WCAG 2.1 Level AA principles | Semantic HTML5 elements (`<header>`, `<main>`, `<aside>`, `<nav>`), `aria-label` on icon-only controls, high contrast typography |
| **Maintainability**| Clean Code & Separation of Concerns | Modular MVC structure on backend; component-driven architecture with custom hooks (`useAuth`, `useSocket`) on frontend |

---

## 2. Detailed Non-Functional Specifications

### A. Performance & Optimization
1. **Database Indexing**:
   - Unique single-field index on `User.email` for $O(1)$ login lookups.
   - Unique compound indexes on `Application (student, job)` and `ProjectApplication (student, project)` preventing duplicate inserts at the database engine level.
   - Foreign key indexes on `Job.postedBy`, `MentorshipRequest.mentor`, and `Message.receiver` to optimize query speed.
2. **Frontend Asset Bundling**:
   - Vite 5 transforms and bundles JavaScript modules into code-split chunks with Gzip compression.
   - Lucide/Heroicons SVG components imported individually to eliminate bundle bloat.

### B. Security & Integrity
1. **Credential Protection**: User passwords are automatically excluded using Mongoose projection transforms and explicit `.select('-password')` clauses.
2. **Input Sanitization**: All endpoint inputs are validated and normalized using `express-validator` (e.g., `normalizeEmail()`, `trim()`, integer range bounds).
3. **Auditability**: Administrative actions are tracked in the immutable `AuditLog` collection, logging the actor ID, target entity, timestamp, and IP address.

### C. UI Fluidity & Responsive Breakpoints
The user interface supports the following breakpoints:
- **Mobile Small (320px – 375px)**: Stacked single-column layouts, full-width buttons, collapsible sidebar drawer.
- **Mobile Large / Phablet (425px – 640px)**: 2-column stat card grids, optimized touch targets ($\ge 44\text{px}$).
- **Tablet (768px – 1023px)**: Hybrid layouts with collapsible navigation and scrollable data tables.
- **Desktop (1024px – 1440px+)**: Fixed 64-character sidebar, multi-column dashboard card matrices, side-by-side chat layout.
