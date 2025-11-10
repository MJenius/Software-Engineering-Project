# Social Media Management System (SMMS)

## Overview
A compact web application for user registration, login, post creation/scheduling, and basic analytics.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, Express Rate Limit

## Project Structure
```
src/
├── config/
│   ├── database.js          # SQLite connection & initialization
│   └── jwt.js               # JWT token generation/verification
├── controllers/
│   ├── authController.js    # Login logic
│   └── authController.test.js
├── middleware/
│   └── validation.js        # Input validation
├── models/
│   └── User.js              # Database queries
├── routes/
│   ├── authRoutes.js        # POST /api/auth/login
│   └── authRoutes.test.js
├── utils/
│   └── passwordUtils.js     # bcrypt hashing/comparison
├── app.js                   # Express app setup
├── index.js                 # Server entry point
└── setupTests.js            # Jest configuration

db/
└── smms.db                  # SQLite database (auto-created)

tests/
├── authController.test.js   # Unit tests
└── authRoutes.test.js       # Integration tests
```

## Installation

### Prerequisites
- Node.js v14+ installed
- npm v6+ installed

### Setup Steps

1. **Clone or navigate to the project:**
   ```bash
   cd Software-Engineering-Project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Update `.env` file with your settings
   - Change `JWT_SECRET` to a strong, random value in production

4. **Initialize database:**
   - Database is auto-created on first run
   - SQLite database stored at `./db/smms.db`

## Running the Application

### Development Mode
```bash
npm run dev
```
- Starts server with nodemon (auto-restart on file changes)
- Server runs on `http://localhost:5000`

### Production Mode
```bash
npm start
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## API Documentation

### POST /api/auth/login

**Description**: Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

## Security Features

### SMMS-SR-001: Password Hashing
- Uses bcryptjs with 10 salt rounds
- Industry-standard algorithm
- Never stores plain text passwords

### SMMS-SR-002: SQL Injection Prevention
- Parameterized queries for all database operations
- User input not concatenated into SQL strings

### SMMS-SR-003: Input Validation
- Email format validation (regex)
- Password length requirements (min 6 characters)
- XSS payload rejection

### SMMS-SR-004: Response Sanitization
- Password hashes never exposed in responses
- Sensitive data filtered before sending to client

### SMMS-SR-005: Brute Force Protection
- Rate limiting: 5 login attempts per 15 minutes per IP
- Express-rate-limit middleware on `/api/auth/login`

### Additional Security
- CORS configured to whitelist origins
- Helmet.js for security headers
- JWT token expiration (1 hour default)
- Generic error messages (prevents user enumeration)

## Test Coverage

### Unit Tests (authController.test.js)
- TC-Auth-U01: Valid credentials return JWT
- TC-Auth-U02: Invalid password rejected
- TC-Auth-U03: Non-existent user rejected
- TC-Auth-U04: bcrypt.compare() used (not ===)
- TC-Auth-U06: Password hash not exposed
- TC-Auth-U08: Token includes userId, email, role
- TC-Auth-U09: Case-sensitive password comparison
- TC-Auth-U10: SQL injection handled safely

### Integration Tests (authRoutes.test.js)
- TC-Auth-I01: Valid login returns 200 + token
- TC-Auth-I02: Invalid credentials return 401
- TC-Auth-I03: Non-existent user return 401
- TC-Auth-I04: Missing email returns 400
- TC-Auth-I05: Missing password returns 400
- TC-Auth-I06: Response sanitized (no hash)
- TC-Auth-I09: Invalid email format rejected
- TC-Auth-I09b: XSS payload rejected
- TC-Auth-I10: Generic error prevents enumeration
- TC-Auth-I11: User data is complete
- TC-Auth-I12: Empty email rejected
- TC-Auth-I13: Empty password rejected
- TC-Auth-I14: Short password rejected

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active INTEGER DEFAULT 1
);
```

## Commit Strategy

Follow the git workflow for this feature:

```bash
# Commit 1: Input validation
git add src/middleware/validation.js
git commit -m "Feat: Add email and password input validation (SMMS-SR-003)"

# Commit 2: Database query
git add src/models/User.js
git commit -m "Feat: Add secure user lookup with parameterized queries (SMMS-SR-002)"

# Commit 3: Password utility
git add src/utils/passwordUtils.js
git commit -m "Feat: Add bcrypt password comparison utility (SMMS-SR-001)"

# Commit 4: JWT config
git add src/config/jwt.js src/config/database.js
git commit -m "Feat: Implement JWT token generation with session timeout"

# Commit 5: Controller + Routes
git add src/controllers/authController.js src/routes/authRoutes.js
git add src/controllers/authController.test.js src/routes/authRoutes.test.js
git commit -m "Feat: Implement POST /api/auth/login endpoint with rate limiting (SMMS-F-002)"

# Commit 6: Application setup
git add src/app.js src/index.js jest.config.js src/setupTests.js
git add package.json .env
git commit -m "Feat: Setup Express app with security middleware and test configuration"
```

## Next Steps

1. **Testing**: Run `npm test` to verify all tests pass
2. **Manual Testing**: Use Postman/curl to test endpoints
3. **Create Test Data**: Add sample users to database
4. **PR Creation**: Push to feature branch and create PR
5. **Code Review**: Request teammate review
6. **Merge**: After approval, merge to main branch

## Contributing

- Write tests for every feature
- Follow security best practices
- Keep commits small and logical
- Use descriptive commit messages

## License

ISC
