# Social Media Management System (SMMS)# Social Media Management System (SMMS)



**Version:** 1.0.0  A complete web application for managing and scheduling social media posts with role-based access control.

**Status:** ✅ Production Ready  

**Date:** November 2025## Project Information



## 👥 Team Members**Version:** 1.0.0  

- **Mevin Jose****Authors:** Mevin Jose, Prateek Meher, K Abhiram, K Rajeev  

- **Prateek Meher****Date:** November 2025  

- **K Abhiram****Status:** Draft / For Review

- **K Rajeev**

## Features Implemented

---

### Authentication & Authorization (SMMS-F-001, F-002, F-004)

## 📋 Table of Contents- ✅ User registration with email and password

1. [Overview](#overview)- ✅ Secure login with session management

2. [Quick Start](#quick-start)- ✅ Password hashing using bcrypt

3. [Features](#features-implemented)- ✅ Role-based access control (Admin/User)

4. [Installation](#installation)- ✅ Session timeout (15 minutes of inactivity)

5. [System Requirements](#system-requirements)

6. [Configuration](#configuration)### Post Management (SMMS-F-005, F-006, F-007, F-012)

7. [Database Schema](#database-schema)- ✅ Create posts with text content

8. [API Endpoints](#api-endpoints)- ✅ Optional image upload with validation

9. [Security Features](#security-features)- ✅ Save posts as drafts

10. [Testing Guide](#testing-guide)- ✅ Edit and delete scheduled/draft posts

11. [File Structure](#file-structure)- ✅ Published posts cannot be edited/deleted

12. [Developer Reference](#developer-reference)

13. [Troubleshooting](#troubleshooting)### Scheduling (SMMS-F-008, F-009)

- ✅ Schedule posts for future date/time

---- ✅ Auto-publish functionality (manual trigger)

- ✅ Automatic status updates from scheduled to published

## 📖 Overview

### Dashboard & Viewing (SMMS-F-010, F-011)

The Social Media Management System (SMMS) is a complete, production-ready web application for managing and scheduling social media posts. Built with Node.js, Express, and SQLite, it provides secure user authentication, post management, scheduling capabilities, and administrative controls.- ✅ User dashboard with quick actions

- ✅ View scheduled posts with date/time

### Key Statistics- ✅ View published posts

- **Lines of Code:** ~3,500+- ✅ View draft posts

- **API Endpoints:** 18

- **Database Tables:** 3 (users, posts, audit_logs)### Analytics (SMMS-F-013)

- **Views/Templates:** 9- ✅ Total post count

- **Route Modules:** 5- ✅ Published post count

- **Security Features:** 8+- ✅ Scheduled post count

- **Test Cases:** 18- ✅ Draft post count

- **Requirement Coverage:** 100%- ✅ Monthly activity breakdown



---### Admin Features (SMMS-F-014)

- ✅ View all users

## 🚀 Quick Start- ✅ Deactivate/activate user accounts

- ✅ Promote users to admin

### Installation (3 steps, ~5 minutes)- ✅ Demote admins to users

- ✅ Manual auto-publish trigger

```bash- ✅ System statistics dashboard

# 1. Install dependencies

npm install### Security Requirements

- ✅ SMMS-SR-001: Password hashing with bcrypt

# 2. Create uploads directory- ✅ SMMS-SR-002: Session timeout (15 minutes)

mkdir public/uploads- ✅ SMMS-SR-003: Input validation & XSS prevention

- ✅ SMMS-SR-004: Role-based authorization

# 3. Start server- ✅ SMMS-SR-005: SQL injection prevention

npm start

```## Technology Stack



**Access the application:** http://localhost:3000**Backend:**

- Node.js

**Default Admin Credentials:**- Express.js (4.18.2)

```- SQLite3

Email: admin@smms.local- bcrypt for password hashing

Password: admin123- express-session for session management

```- EJS for server-side templating

- express-validator for input validation

---

**Frontend:**

## ✅ Features Implemented- HTML5

- CSS3 (responsive design)

### User Management (SMMS-F-001 to F-004)- Vanilla JavaScript (no frameworks)

- [x] **User Registration** - New users can create accounts with email validation

- [x] **User Login** - Secure authentication with session management (15-minute timeout)**Database:**

- [x] **Password Hashing** - bcrypt encryption with 12 rounds- SQLite

- [x] **Role-Based Access Control** - Admin and regular user roles with middleware protection

## Project Structure

### Post Management (SMMS-F-005 to F-007, F-012)

- [x] **Create Post** - Text-based post creation with rich content (max 5000 chars)```

- [x] **Image Upload** - Media attachment support (5MB limit, image validation)software-engineering-project/

- [x] **Save as Draft** - Store posts without publishing├── server.js                 # Main Express application

- [x] **Edit/Delete Posts** - Full CRUD operations (drafts and scheduled posts only)├── database.js              # Database initialization and utilities

├── package.json             # Project dependencies

### Scheduling Features (SMMS-F-008 to F-011)├── README.md                # This file

- [x] **Schedule Posts** - Set future publication times with datetime picker├── .gitignore              # Git ignore rules

- [x] **Auto-Publish** - Automated publishing system (runs every 10 seconds)├── routes/

- [x] **View Scheduled Posts** - Display posts awaiting publication│   ├── auth.js             # Authentication routes

- [x] **View Published Posts** - Display live posts with published timestamps│   ├── posts.js            # Post management routes

│   ├── admin.js            # Admin-only routes

### Analytics (SMMS-F-013)│   ├── dashboard.js        # Dashboard routes

- [x] **Basic Analytics** - Post statistics, counts, and monthly breakdown charts│   └── analytics.js        # Analytics routes

├── views/

### Administration (SMMS-F-014)│   ├── login.ejs           # Login page

- [x] **Admin User Management** - View all users in system│   ├── register.ejs        # Registration page

- [x] **Deactivate/Activate Users** - Disable/enable user access│   ├── dashboard.ejs       # User dashboard

- [x] **Promote/Demote Admins** - Change user roles│   ├── create-post.ejs     # Post creation form

- [x] **Manual Auto-Publish** - Trigger scheduled post publishing│   ├── draft-posts.ejs     # Draft posts list

- [x] **System Statistics** - Overview dashboard with user/post counts│   ├── scheduled-posts.ejs # Scheduled/published posts list

- [x] **Database Backup** - Create, list, download, and delete backups│   ├── analytics.ejs       # Analytics dashboard

│   ├── admin-dashboard.ejs # Admin panel

### Additional Features│   ├── error.ejs           # Error page

- [x] **SMMS-F-015:** Flash Notifications - Success/error messages for user actions├── public/

- [x] **SMMS-NF-005:** Database Backup - Complete backup management system│   ├── style.css           # Main stylesheet

- [x] **Comprehensive Logging** - Auth logs, error logs, security logs│   └── uploads/            # User uploaded images

- [x] **Rate Limiting** - Brute-force protection on login (5 attempts, 15min lockout)└── smms.db                 # SQLite database (auto-generated)

- [x] **Input Sanitization** - XSS and SQL injection prevention```



---## Installation & Setup



## 💻 Installation### Prerequisites

- Node.js (v14+)

### System Requirements- npm (v6+)



**Minimum Requirements:**### Steps

- **Operating System:** Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)

- **Node.js:** v14.0.0 or higher (v20.18.0 recommended)1. **Clone the repository:**

- **npm:** v6.0.0 or higher   ```bash

- **RAM:** 512 MB minimum (1 GB recommended)   cd c:\Users\mjeni\OneDrive\Desktop\Software-Engineering-Project

- **Disk Space:** 200 MB (100 MB for application + 100 MB for uploads/database)   ```



**Recommended Environment:**2. **Install dependencies:**

- **Node.js:** v20.18.0   ```bash

- **npm:** v10+   npm install

- **RAM:** 1 GB+   ```

- **Disk Space:** 500 MB+

3. **Create public/uploads directory:**

### Installation Steps   ```bash

   mkdir public/uploads

1. **Navigate to Project Directory**   ```

   ```bash

   cd path/to/Software-Engineering-Project4. **Start the application:**

   ```   ```bash

   npm start

2. **Install Dependencies**   ```

   ```bash   Or for development with auto-reload:

   npm install   ```bash

   ```   npm run dev

      ```

   **Dependencies Installed:**

   - express (4.21.2) - Web framework5. **Access the application:**

   - express-session (1.17.3) - Session management   - Open your browser and navigate to: `http://localhost:3000`

   - sqlite3 (5.1.6) - Database   - You will be redirected to the login page

   - bcrypt (5.1.0) - Password hashing

   - ejs (3.1.8) - Template engine## Demo Credentials

   - multer (1.4.5-lts.1) - File uploads

   - express-validator (7.0.0) - Input validation**Admin Account:**

- Email: `admin@smms.local`

3. **Create Required Directories**- Password: `admin123`

   ```bash

   # Linux/Mac## User Guide

   mkdir -p public/uploads

   mkdir -p logs### For Regular Users

   mkdir -p backups

   1. **Register:** Click "Register here" on the login page

   # Windows (PowerShell)2. **Create Post:** Navigate to "Create Post" and fill in the form

   New-Item -ItemType Directory -Path "public\uploads" -Force3. **Save Draft:** Submit with "Save as Draft" button

   New-Item -ItemType Directory -Path "logs" -Force4. **Schedule Post:** Move posts to "Posts" section and set schedule time

   New-Item -ItemType Directory -Path "backups" -Force5. **View Analytics:** Check your post statistics in "Analytics"

   ```

### For Admins

4. **Configure Environment (Optional)**

   ```bash1. **Access Admin Panel:** Click "Admin Panel" in the navigation

   # Copy example environment file2. **Manage Users:** View, deactivate, or promote users

   cp .env.example .env3. **Auto-Publish:** Click "Auto-Publish Scheduled Posts" to publish ready posts

   4. **System Stats:** View overall system statistics

   # Edit .env with your settings (optional - defaults work fine)

   ```## API Endpoints



5. **Start the Application**### Authentication

   ```bash- `POST /auth/register` - Register new user

   # Production mode- `POST /auth/login` - Login user

   npm start- `GET /auth/logout` - Logout user

   

   # Development mode (with auto-reload if configured)### Posts

   npm run dev- `GET /posts/create` - Create post form

   ```- `POST /posts/create` - Submit new post

- `GET /posts/drafts` - View draft posts

6. **Access the Application**- `GET /posts/scheduled` - View scheduled/published posts

   - Open browser: http://localhost:3000- `POST /posts/schedule` - Schedule a post

   - Login with admin credentials: `admin@smms.local` / `admin123`- `POST /posts/publish` - Manually publish a post

- `POST /posts/edit/:postId` - Edit a post

### First-Time Setup- `DELETE /posts/:postId` - Delete a post

- `POST /posts/auto-publish` - Auto-publish scheduled posts

On first run, the application will automatically:

1. Create `smms.db` SQLite database### Admin

2. Initialize database tables (users, posts, sessions, audit_logs)- `GET /admin` - Admin dashboard

3. Seed admin user with default credentials- `POST /admin/deactivate/:userId` - Deactivate user

4. Create necessary directories- `POST /admin/activate/:userId` - Activate user

- `POST /admin/promote/:userId` - Promote to admin

---- `POST /admin/demote/:userId` - Demote from admin

- `POST /admin/publish-scheduled` - Auto-publish posts

## ⚙️ Configuration

### Dashboard & Analytics

### Environment Variables (.env)- `GET /dashboard` - User dashboard

- `GET /analytics` - Analytics dashboard

```bash

# Server Configuration## Security Considerations

PORT=3000

NODE_ENV=development1. **Password Security:** All passwords are hashed using bcrypt with a cost factor of 10

2. **Session Security:** Sessions are HTTP-only and expire after 15 minutes of inactivity

# Session Configuration (CRITICAL for production)3. **Input Validation:** All user inputs are validated and escaped to prevent XSS

SESSION_SECRET=your-secure-random-64-character-string-here-change-this4. **SQL Injection Prevention:** Using parameterized queries throughout

5. **CSRF Protection:** Session tokens are used for state management

# Database6. **File Upload Security:** Only image files are allowed, with size limits

DB_PATH=./smms.db

## Database Schema

# Upload Configuration

MAX_FILE_SIZE=5242880  # 5MB in bytes### Users Table

UPLOAD_PATH=public/uploads- `id` - Primary key

- `email` - Unique email address

# Security Settings- `password_hash` - Hashed password

BCRYPT_ROUNDS=12- `role` - 'admin' or 'user'

SESSION_TIMEOUT=900000  # 15 minutes in milliseconds- `is_active` - Account status

```- `created_at` - Registration timestamp

- `updated_at` - Last update timestamp

**⚠️ IMPORTANT:** Change `SESSION_SECRET` in production to a secure 64-character random string!

### Posts Table

### Database Configuration- `id` - Primary key

- `user_id` - Foreign key to users

The application uses SQLite and will automatically:- `title` - Post title (optional)

- Create `smms.db` on first run- `content` - Post content

- Initialize tables (users, posts, sessions, audit_logs)- `image_path` - Path to uploaded image

- Seed admin user with default credentials- `status` - 'draft', 'scheduled', or 'published'

- Handle migrations gracefully- `scheduled_time` - Scheduled publication time

- `published_at` - Actual publication time

---- `created_at` - Creation timestamp

- `updated_at` - Last update timestamp

## 🗄️ Database Schema

## Testing

### Users Table

```sql### Manual Testing Checklist

CREATE TABLE users (

  id INTEGER PRIMARY KEY AUTOINCREMENT,**Authentication:**

  email TEXT UNIQUE NOT NULL,- [ ] Register new user with valid email and password

  password_hash TEXT NOT NULL,- [ ] Login with incorrect credentials (should fail)

  role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),- [ ] Login with correct credentials (should succeed)

  is_active BOOLEAN DEFAULT 1,- [ ] Verify session timeout after 15 minutes

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,- [ ] Logout and verify redirect to login

  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

);**Posts:**

```- [ ] Create post with text only

- [ ] Create post with image upload

### Posts Table- [ ] Save post as draft

```sql- [ ] Schedule post for future date

CREATE TABLE posts (- [ ] Edit draft post

  id INTEGER PRIMARY KEY AUTOINCREMENT,- [ ] Delete draft post

  user_id INTEGER NOT NULL,- [ ] Cannot edit published post

  title TEXT,

  content TEXT NOT NULL,**Admin:**

  image_path TEXT,- [ ] Access admin panel (admin only)

  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'scheduled', 'published')),- [ ] Deactivate user account

  scheduled_time DATETIME,- [ ] Activate deactivated user

  published_at DATETIME,- [ ] Promote user to admin

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,- [ ] Demote admin to user

  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,- [ ] Auto-publish scheduled posts

  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE

);**Analytics:**

```- [ ] View post statistics

- [ ] Verify correct counts

### Audit Logs Table- [ ] Check monthly breakdown

```sql

CREATE TABLE audit_logs (## Performance Considerations

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  user_id INTEGER,- Database queries are optimized with proper indexing

  action TEXT NOT NULL,- File uploads are limited to 5MB

  details TEXT,- Sessions are stored in memory (can be upgraded to Redis for production)

  ip_address TEXT,- Static assets are cached through browser caching

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL## Future Enhancements

);

```- [ ] Real social media API integration

- [ ] Advanced analytics with engagement metrics

---- [ ] Post templates

- [ ] Bulk post scheduling

## 🔌 API Endpoints- [ ] Email notifications

- [ ] Two-factor authentication

### Authentication (3 endpoints)- [ ] OAuth integration

```- [ ] Database backup automation

POST   /auth/register           - Register new user- [ ] Post preview before publishing

POST   /auth/login              - Login user- [ ] Collaborative features

GET    /auth/logout             - Logout user

```## Troubleshooting



### Posts (7 endpoints)### Database errors

```- Delete `smms.db` and restart the application to reset database

GET    /posts/create            - Show create post form- Ensure the `public/uploads` directory exists and is writable

POST   /posts/create            - Submit new post

GET    /posts/drafts            - View draft posts### Session timeout issues

GET    /posts/scheduled         - View scheduled/published posts- Clear browser cookies

POST   /posts/schedule          - Schedule a post- Check system time is correct

POST   /posts/edit/:id          - Edit existing post- Verify session timeout setting in `server.js`

DELETE /posts/:id               - Delete post

```### File upload errors

- Ensure `public/uploads` directory has write permissions

### Dashboard (1 endpoint)- Check file size is under 5MB

```- Verify file type is an image

GET    /dashboard               - User dashboard with stats

```## Support & Contact



### Analytics (1 endpoint)For issues or questions, please refer to the Software Test Plan (STP) documentation included with this project.

```

GET    /analytics               - Analytics page with charts## License

```

MIT License - See LICENSE file for details

### Admin (6 endpoints)

```## Version History

GET    /admin                   - Admin control panel

POST   /admin/deactivate/:id    - Deactivate user**v1.0.0 (November 2025)**

POST   /admin/activate/:id      - Activate user- Initial release with all core features

POST   /admin/promote/:id       - Promote to admin- Complete security implementation

POST   /admin/demote/:id        - Demote from admin- Full admin panel

POST   /admin/publish-scheduled - Manual auto-publish trigger- Analytics dashboard

POST   /admin/backup            - Create database backup
GET    /admin/backups           - List available backups
GET    /admin/backup/download/:fileName - Download backup
DELETE /admin/backup/:fileName  - Delete backup
```

---

## 🔒 Security Features

### 1. Password Security (SMMS-SR-001)
- ✅ **bcrypt hashing** with 12 cost factor
- ✅ No plain-text passwords stored or transmitted
- ✅ Secure password validation (min 6 chars, letters + numbers required)
- ✅ Password confirmation on registration

### 2. Session Security (SMMS-SR-002)
- ✅ **15-minute inactivity timeout** with automatic logout
- ✅ HttpOnly cookies (JavaScript cannot access session cookies)
- ✅ Secure session IDs generated by express-session
- ✅ Rolling session updates to maintain active users
- ✅ sameSite: 'strict' for CSRF protection
- ✅ Session data stored securely in database

### 3. Input Validation (SMMS-SR-003)
- ✅ Email format validation (RFC 5322 compliance)
- ✅ Content length validation (max 5000 chars)
- ✅ File type validation (images only: jpg, jpeg, png, gif)
- ✅ File size limit (5 MB maximum)
- ✅ XSS prevention with custom sanitization utility
- ✅ express-validator for all form inputs
- ✅ HTML entity encoding on output

### 4. SQL Injection Prevention (SMMS-SR-005)
- ✅ **Parameterized queries** throughout entire codebase
- ✅ No string concatenation in SQL statements
- ✅ Input sanitization via custom sanitizer utility
- ✅ SQLite prepared statements for all database operations

### 5. Authorization (SMMS-SR-004)
- ✅ **Role-based access control (RBAC)** middleware
- ✅ Admin-only routes protected with `isAdmin` middleware
- ✅ Users can only access/modify their own posts
- ✅ Unauthorized actions return 403 Forbidden
- ✅ Session validation on every protected route

### 6. Security Headers
- ✅ Content Security Policy (CSP) - Prevents XSS attacks
- ✅ X-XSS-Protection: 1; mode=block
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY (Clickjacking protection)

### 7. Rate Limiting
- ✅ Login attempt tracking (5 attempts maximum)
- ✅ 15-minute lockout after failed attempts
- ✅ IP-based tracking with automatic cleanup
- ✅ Prevents brute-force attacks

### 8. Logging & Monitoring
- ✅ Authentication logs (`logs/auth.log`)
- ✅ Error logs (`logs/error.log`)
- ✅ Security event logs (`logs/smms.log`)
- ✅ Audit trail in database (user actions tracked)
- ✅ Structured logging with timestamps and severity levels

---

## 📊 Code Coverage

The project includes comprehensive test coverage to ensure code quality and reliability.

### Current Coverage Statistics

- **Lines:** 76.79% (450/586)
- **Statements:** 76.74% (452/589)
- **Functions:** 79.26% (65/82)
- **Branches:** 60.77% (110/181)

### Running Tests with Coverage

**Run all tests with coverage report:**
```bash
npm test
```

This command will:
1. Run all 89 test cases using Jest
2. Generate coverage metrics
3. Create an HTML coverage report

### Viewing the Coverage Report

After running `npm test`, open the HTML coverage report:

**Location:** `coverage/index.html`

**To view:**
- Double-click the file in Windows Explorer, or
- Open it in your browser: `file:///path/to/project/coverage/index.html`

The interactive HTML report shows:
- 🟢 **Green lines** - Covered by tests
- 🔴 **Red lines** - Not covered by tests
- 🟡 **Yellow lines** - Partially covered branches
- **Drill-down capability** - Click on folders/files to see line-by-line coverage

### Test Suites

The project includes 12 test suites covering:

1. **Integration Tests:**
   - `tests/auth.test.js` - Authentication flows (register, login, logout)
   - `tests/posts.test.js` - Post management (create, edit, delete, drafts)
   - `tests/admin.test.js` - Admin dashboard and user management
   - `tests/health.integration.test.js` - Health check endpoints

2. **Unit Tests:**
   - `tests/unit.test.js` - Post and user models
   - `tests/middleware.test.js` - Authentication and authorization middleware
   - `tests/posts.routes.test.js` - Post route handlers
   - `tests/admin.routes.test.js` - Admin route handlers
   - `tests/additional_unit.test.js` - Backup, analytics, and scheduler logic
   - `tests/publishers.test.js` - Scheduler publisher logic
   - `tests/analytics.routes.test.js` - Analytics route handlers
   - `tests/scheduler.test.js` - Background scheduler functionality

### Coverage by Module

| Module | Line Coverage | Status |
|--------|--------------|--------|
| `features/admin/backup.js` | 100% | ✅ Excellent |
| `features/analytics/queries.js` | 100% | ✅ Excellent |
| `features/analytics/routes.js` | 100% | ✅ Excellent |
| `features/scheduler/index.js` | 100% | ✅ Excellent |
| `features/auth/middleware.js` | 95.45% | ✅ Excellent |
| `features/dashboard/routes.js` | 84.61% | ✅ Good |
| `features/posts/models.js` | 82.85% | ✅ Good |
| `features/posts/routes.js` | 76.33% | ✅ Good |
| `features/auth/routes.js` | 69.51% | ⚠️ Acceptable |
| `features/admin/routes.js` | 66.03% | ⚠️ Acceptable |
| `features/admin/users.js` | 64.81% | ⚠️ Acceptable |

### Running Specific Tests

```bash
# Run a specific test file
npx jest tests/auth.test.js

# Run tests matching a pattern
npx jest --testNamePattern="should create post"

# Run tests in watch mode
npx jest --watch

# Run tests without coverage
npx jest --no-coverage
```

### Test Configuration

Tests are configured in `jest.config.js`:
- **Test Environment:** Node.js
- **Coverage Collection:** `features/**/*.js` (excluding config files)
- **Test Timeout:** 10 seconds
- **Setup File:** `tests/setup.js` (initializes in-memory database)

### Continuous Integration

All tests run automatically on every commit to ensure:
- No regressions are introduced
- Code coverage remains above 70%
- All critical paths are tested

---

## 🧪 Testing Guide

### Test Data Setup

**Pre-configured Test Users:**
- **Admin User:** admin@smms.local / admin123
- **Test User:** Create via registration form

### Manual Testing Test Cases

#### Authentication Tests

**TC-Auth-01: User Registration**
```
Steps:
1. Navigate to http://localhost:3000/auth/register
2. Enter email: testuser@example.com
3. Enter password: Test123
4. Confirm password: Test123
5. Click "Register"

Expected: Registration success, redirect to login
Pass Criteria: User created in database, password hashed
```

**TC-Auth-02: User Login**
```
Steps:
1. Navigate to http://localhost:3000/auth/login
2. Enter email: admin@smms.local
3. Enter password: admin123
4. Click "Login"

Expected: Login success, redirect to dashboard
Pass Criteria: Session created, user authenticated
```

**TC-Sec-01: Password Hashing**
```
Steps:
1. Register new user
2. Check database: SELECT password_hash FROM users WHERE email='testuser@example.com'

Expected: Password is hashed (bcrypt format starting with $2b$)
Pass Criteria: No plain-text password in database
```

**TC-Sec-02: Session Timeout**
```
Steps:
1. Login as any user
2. Wait 15 minutes without activity
3. Try to navigate to /dashboard

Expected: Redirect to login with session expired message
Pass Criteria: Session invalidated after 15 minutes
```

#### Post Management Tests

**TC-Post-01: Create Post**
```
Steps:
1. Login as user
2. Navigate to "Create Post"
3. Enter title: "Test Post"
4. Enter content: "This is test content"
5. Select status: "Draft"
6. Click "Create Post"

Expected: Post created successfully
Pass Criteria: Post appears in drafts list
```

**TC-Post-02: Image Upload**
```
Steps:
1. Create post with image (< 5MB, valid format)
2. Submit post

Expected: Image uploaded successfully
Pass Criteria: Image stored in public/uploads/, path saved in database
```

**TC-Post-03: Save as Draft**
```
Steps:
1. Create post with status "Draft"
2. Navigate to "View Drafts"

Expected: Post visible in drafts
Pass Criteria: Post has status='draft' in database
```

**TC-Post-04: Edit/Delete Post**
```
Steps:
1. Create draft post
2. Click "Edit" button
3. Modify content
4. Save changes
5. Click "Delete" button

Expected: Edit saves changes, delete removes post
Pass Criteria: Changes persisted, post removed from database
```

#### Scheduling Tests

**TC-Sched-01: Schedule Post**
```
Steps:
1. Create post
2. Select status: "Scheduled"
3. Choose future date/time
4. Submit

Expected: Post scheduled successfully
Pass Criteria: Post has scheduled_time in future, status='scheduled'
```

**TC-Sched-02: Auto-Publish**
```
Steps:
1. Schedule post for 1 minute in future
2. Wait for auto-publish scheduler (runs every 10 seconds)
3. Check post status

Expected: Post auto-published when time reached
Pass Criteria: Status changed to 'published', published_at timestamp set
```

#### View Tests

**TC-View-01: View Scheduled Posts**
```
Steps:
1. Navigate to "Scheduled Posts"

Expected: All scheduled and published posts displayed
Pass Criteria: Posts shown with correct status badges
```

**TC-View-02: View Published Posts**
```
Steps:
1. Publish a post
2. Navigate to "Scheduled Posts" (shows both scheduled and published)

Expected: Published post visible with green badge
Pass Criteria: Published posts have published_at timestamp
```

#### Analytics Tests

**TC-Analy-01: Analytics Counts**
```
Steps:
1. Create posts with different statuses
2. Navigate to Analytics

Expected: Accurate counts displayed
Pass Criteria: Total, published, scheduled, draft counts match database
```

#### Admin Tests

**TC-Admin-01: Admin Manage Users**
```
Steps:
1. Login as admin
2. Navigate to Admin Panel
3. View users list

Expected: All users displayed
Pass Criteria: User details visible (email, role, status)
```

**TC-Admin-02: Deactivate User**
```
Steps:
1. Login as admin
2. Click "Deactivate" on a user
3. User tries to login

Expected: User cannot login (account deactivated)
Pass Criteria: is_active=0 in database, login fails
```

#### Security Tests

**TC-Sec-03: SQL Injection Prevention**
```
Steps:
1. Try login with email: admin' OR '1'='1
2. Check if login succeeds

Expected: Login fails, no SQL injection
Pass Criteria: Parameterized query prevents injection
```

**TC-Sec-04: XSS Prevention**
```
Steps:
1. Create post with content: <script>alert('XSS')</script>
2. View post on dashboard

Expected: Script tags escaped/sanitized
Pass Criteria: No script execution, content displayed as text
```

**TC-Sec-05: Access Control**
```
Steps:
1. Login as regular user
2. Try to access /admin directly

Expected: Access denied (403 Forbidden)
Pass Criteria: Non-admin cannot access admin routes
```

### Automated Testing

To run automated tests (if implemented):
```bash
npm test
```

---

## 📁 File Structure

```
Software-Engineering-Project/
│
├── Core Application Files
│   ├── server.js                          # Main Express server & entry point
│   ├── database.js                        # SQLite database initialization
│   ├── package.json                       # Dependencies & scripts
│   ├── debug-scheduler.js                 # Debugging tool for scheduled posts
│   ├── .env                              # Environment variables (not in git)
│   ├── .env.example                      # Environment template
│   └── .gitignore                        # Git ignore rules
│
├── routes/                                # API Route Handlers (5 modules)
│   ├── auth.js                           # Authentication (register, login, logout)
│   ├── posts.js                          # Post management (CRUD operations)
│   ├── admin.js                          # Admin features (user mgmt, backups)
│   ├── dashboard.js                      # Dashboard (user stats)
│   └── analytics.js                      # Analytics (counts & breakdown)
│
├── views/                                 # EJS HTML Templates (9 views)
│   ├── login.ejs                         # Login page
│   ├── register.ejs                      # Registration page
│   ├── dashboard.ejs                     # Main dashboard
│   ├── create-post.ejs                   # Post creation form
│   ├── edit-post.ejs                     # Post editing form
│   ├── draft-posts.ejs                   # Draft posts list
│   ├── scheduled-posts.ejs               # Scheduled/published posts list
│   ├── analytics.ejs                     # Analytics dashboard
│   ├── admin-dashboard.ejs               # Admin control panel
│   └── error.ejs                         # Error page
│
├── public/                                # Static Assets
│   ├── style.css                         # Main responsive stylesheet
│   ├── modal.js                          # Modal dialog functionality
│   └── uploads/                          # User-uploaded images directory
│       └── [user-images-stored-here]
│
├── utils/                                 # Utility Modules (5 utilities)
│   ├── logger.js                         # Centralized logging system
│   ├── backup.js                         # Database backup management
│   ├── rateLimiter.js                    # Login rate limiting/brute-force protection
│   ├── sanitizer.js                      # Input sanitization (XSS/SQLi prevention)
│   └── envCheck.js                       # Environment validation
│
├── logs/                                  # Application Logs (auto-created)
│   ├── smms.log                          # General application logs
│   ├── error.log                         # Error logs
│   └── auth.log                          # Authentication logs
│
├── backups/                               # Database Backups (auto-created)
│   └── smms-backup-[timestamp].sql
│
├── db/                                    # Database Files
│   └── (Reserved for future use)
│
└── smms.db                                # SQLite Database (auto-created)
```

### File Count by Category

| Category | Count | Files |
|----------|-------|-------|
| **Core Application** | 7 | server.js, database.js, package.json, debug-scheduler.js, .env, .env.example, .gitignore |
| **Route Handlers** | 5 | auth, posts, admin, dashboard, analytics |
| **HTML Templates** | 10 | login, register, dashboard, create/edit-post, drafts, scheduled, analytics, admin, error |
| **Static Assets** | 2 | style.css, modal.js |
| **Utilities** | 5 | logger, backup, rateLimiter, sanitizer, envCheck |
| **TOTAL** | **29** | **Source Files** |

---

## 🛠️ Developer Reference

### Quick Commands

```bash
# Install & Setup
npm install                  # Install dependencies
mkdir public/uploads         # Create uploads directory
npm start                    # Start production server
npm run dev                  # Start development server (if configured)

# Stop Server
Ctrl+C                       # Stop running server

# Database Operations
# Delete smms.db and restart to reset database

# Clear Dependencies
Remove-Item node_modules -Recurse -Force  # Windows
rm -rf node_modules          # Linux/Mac
npm install                  # Reinstall
```

### Common Development Tasks

**Add a New Route**
```javascript
// In routes/example.js
const express = require('express');
const router = express.Router();

router.get('/path', async (req, res) => {
  // Your logic here
  res.render('view-name', { data });
});

module.exports = router;

// In server.js, add:
const exampleRoutes = require('./routes/example');
app.use('/example', isAuthenticated, exampleRoutes);
```

**Add a New Database Table**
```javascript
// In database.js, add to initializeDatabase():
await db.run(`
  CREATE TABLE IF NOT EXISTS table_name (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    column_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

**Check Session Data**
```javascript
// In any route handler:
console.log('User ID:', req.session.userId);
console.log('User Email:', req.session.userEmail);
console.log('User Role:', req.session.userRole);
```

**Database Query Examples**
```javascript
// Get single row
const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

// Get multiple rows
const posts = await db.all('SELECT * FROM posts WHERE user_id = ?', [userId]);

// Insert
await db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);

// Update
await db.run('UPDATE posts SET status = ? WHERE id = ?', ['published', postId]);

// Delete
await db.run('DELETE FROM posts WHERE id = ?', [postId]);
```

### Middleware Functions

**isAuthenticated** - Checks if user is logged in
```javascript
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/auth/login');
}
```

**isAdmin** - Checks if user has admin role
```javascript
function isAdmin(req, res, next) {
  if (req.session && req.session.userRole === 'admin') {
    return next();
  }
  res.status(403).send('Access denied');
}
```

### Common URLs

```
http://localhost:3000/                    # Home (redirects to dashboard)
http://localhost:3000/auth/login          # Login page
http://localhost:3000/auth/register       # Registration
http://localhost:3000/dashboard           # User dashboard
http://localhost:3000/posts/create        # Create post
http://localhost:3000/posts/drafts        # View drafts
http://localhost:3000/posts/scheduled     # Scheduled/published posts
http://localhost:3000/analytics           # Analytics
http://localhost:3000/admin               # Admin panel (admin only)
http://localhost:3000/auth/logout         # Logout
```

### Debugging Tips

**View Server Logs**
```bash
# View general logs
Get-Content logs/smms.log -Tail 50

# View error logs
Get-Content logs/error.log -Tail 50

# View auth logs
Get-Content logs/auth.log -Tail 50
```

**Test Scheduled Posts**
```bash
# Use the debug scheduler
node debug-scheduler.js
```

**Check Database Content**
```bash
sqlite3 smms.db
sqlite> SELECT * FROM users;
sqlite> SELECT * FROM posts;
sqlite> .exit
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

#### 2. Database Locked

**Error:** `SQLITE_BUSY: database is locked`

**Solution:**
- Close any SQLite browser/viewer applications
- Restart the server
- If persists, delete `smms.db` (will lose data) and restart

#### 3. Session Secret Warning

**Error:** `Warning: connect.session() MemoryStore is not designed for production`

**Solution:**
- Add SESSION_SECRET to .env file (64 characters minimum)
- For production, use session store like connect-sqlite3

#### 4. Uploads Directory Not Found

**Error:** `ENOENT: no such file or directory, open 'public/uploads/...'`

**Solution:**
```bash
mkdir public/uploads
# Or Windows:
New-Item -ItemType Directory -Path "public\uploads" -Force
```

#### 5. Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
rm -rf node_modules package-lock.json  # Remove existing
npm install  # Reinstall dependencies
```

#### 6. Permission Denied

**Error:** `EACCES: permission denied`

**Solution:**
- Run terminal as Administrator (Windows)
- Use sudo on Linux/Mac: `sudo npm install`
- Check file/folder permissions

#### 7. Auto-Publish Not Working

**Issue:** Scheduled posts not publishing automatically

**Solution:**
- Check scheduler is running in server.js console output
- Verify scheduled_time format: `YYYY-MM-DDTHH:MM:SS`
- Use debug-scheduler.js to verify post status
- Ensure scheduled_time is in the past for immediate publishing

#### 8. Login Rate Limit

**Issue:** Cannot login after multiple failed attempts

**Solution:**
- Wait 15 minutes for lockout to expire
- Or manually clear rate limit in code (development only)

### Getting Help

If you encounter issues not covered here:
1. Check console output for error messages
2. Review log files in `/logs` directory
3. Verify all dependencies are installed: `npm list`
4. Ensure Node.js version is v14+: `node --version`
5. Check database exists and is not corrupted

---

## 🚀 Deployment

### Production Checklist

- [ ] Change `SESSION_SECRET` to secure random string (64+ chars)
- [ ] Set `NODE_ENV=production` in .env
- [ ] Remove default admin credentials (or change password)
- [ ] Configure proper session store (not MemoryStore)
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure reverse proxy (nginx, Apache)
- [ ] Set up process manager (PM2, systemd)
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Enable log rotation
- [ ] Configure monitoring/alerting

### Production Environment Variables

```bash
NODE_ENV=production
PORT=3000
SESSION_SECRET=<64-char-random-string>
DB_PATH=/var/lib/smms/smms.db
UPLOAD_PATH=/var/lib/smms/uploads
MAX_FILE_SIZE=5242880
```

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name smms

# Monitor
pm2 monit

# View logs
pm2 logs smms

# Restart
pm2 restart smms

# Stop
pm2 stop smms
```

---

## 📄 License

This project is part of an academic software engineering course.

---

## 📞 Support

For questions or issues:
- Review this documentation
- Check the troubleshooting section
- Contact the development team

---

## 📊 Requirements Coverage Matrix

| Requirement ID | Feature | Status | Test Case |
|---------------|---------|--------|-----------|
| SMMS-F-001 | User Registration | ✅ | TC-Auth-01 |
| SMMS-F-002 | User Login | ✅ | TC-Auth-02 |
| SMMS-F-003 | Password Hashing | ✅ | TC-Sec-01 |
| SMMS-F-004 | RBAC | ✅ | TC-RBAC-01 |
| SMMS-F-005 | Create Post | ✅ | TC-Post-01 |
| SMMS-F-006 | Image Upload | ✅ | TC-Post-02 |
| SMMS-F-007 | Save Draft | ✅ | TC-Post-03 |
| SMMS-F-008 | Schedule Post | ✅ | TC-Sched-01 |
| SMMS-F-009 | Auto-Publish | ✅ | TC-Sched-02 |
| SMMS-F-010 | View Scheduled | ✅ | TC-View-01 |
| SMMS-F-011 | View Published | ✅ | TC-View-02 |
| SMMS-F-012 | Edit/Delete Posts | ✅ | TC-Post-04 |
| SMMS-F-013 | Analytics | ✅ | TC-Analy-01 |
| SMMS-F-014 | Admin Users | ✅ | TC-Admin-01 |
| SMMS-F-015 | Notifications | ✅ | Manual Test |
| SMMS-NF-005 | Database Backup | ✅ | Manual Test |
| SMMS-SR-001 | Password Hashing | ✅ | TC-Sec-01 |
| SMMS-SR-002 | Session Timeout | ✅ | TC-Sec-02 |
| SMMS-SR-003 | Input Validation | ✅ | TC-Sec-04 |
| SMMS-SR-004 | Authorization | ✅ | TC-Sec-05 |
| SMMS-SR-005 | SQL Injection Prevention | ✅ | TC-Sec-03 |

**Total Coverage: 21/21 Requirements (100%)**

---

**Last Updated:** November 2025  
**Documentation Version:** 1.0.0
