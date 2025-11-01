# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TimeNest is a fullstack time management tracker that allows businesses and teams to log work hours efficiently. The application follows a clear separation between frontend (React + Vite) and backend (Spring Boot), with JWT-based authentication and role-based access control.

**Tech Stack:**
- **Frontend**: React 19, React Router, TailwindCSS 4, Vite 7
- **Backend**: Spring Boot 3.5.4, Spring Security, JPA/Hibernate, PostgreSQL
- **Authentication**: JWT tokens (email-based), email verification with codes
- **Roles**: `EMPLOYEE` (can create time logs) and `EXECUTIVE` (full access to company data)

## Repository Structure

```
Timenest/
├── time-nest-frontend/          # React application
│   ├── src/
│   │   ├── pages/              # Route components organized by role
│   │   │   ├── employee/       # Employee-specific pages
│   │   │   └── executive/      # Executive-specific pages
│   │   ├── components/         # Shared components (navbar, etc.)
│   │   └── App.jsx             # Route definitions
│   └── package.json
└── time-nest-backend/Mind_Forge/  # Spring Boot application
    ├── src/main/java/com/example/Mind_Forge/
    │   ├── model/              # JPA entities (User, Company, TimeLog)
    │   ├── repository/         # Spring Data JPA repositories
    │   ├── service/            # Business logic layer
    │   ├── controller/         # REST endpoints
    │   ├── dto/                # Data transfer objects
    │   ├── response/           # Response objects
    │   └── config/             # Security, JWT, Email config
    └── pom.xml
```

## Development Commands

### Frontend (time-nest-frontend/)
```bash
# Install dependencies
npm install

# Run development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Backend (time-nest-backend/Mind_Forge/)
```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run

# Run tests
mvn test

# Package as JAR
mvn package
```

## Core Architecture

### Authentication Flow

The application uses **email-based JWT authentication** with a critical nuance:
- The `User` entity has both `username` and `email` fields
- JWT tokens use `email` as the subject (via `User.getUsername()` override at line 88-90)
- To retrieve the actual username, use `User.getActualUsername()` method (line 83-85)
- Email verification is required before users can log in

**User Registration Flow:**
1. User registers → verification code sent via email
2. User verifies with code → account enabled
3. User logs in → JWT token issued with email as subject

### Role-Based Access Control

Defined in `SecurityConfiguration.java:36-44`:
- **EMPLOYEE role**: Can create time logs (`POST /timelogs`)
- **EXECUTIVE role**: Full CRUD on time logs, access to company-wide data
- Both roles: Can view their own time logs (`/timelogs/me`)
- Role mapping happens in `User.getAuthorities()` method (line 66-81)

Spring Security expects roles prefixed with `ROLE_` (e.g., `ROLE_EMPLOYEE`), but database stores plain values (`employee`, `executive`).

### Data Model Relationships

**Company → Users → TimeLogs**
- One Company has many Users (via `company_id` foreign key)
- One User has many TimeLogs (via `user_id` foreign key)
- TimeLogs also reference Company directly for efficient querying
- Companies have a unique `joinCode` for employees to join
- `executiveId` field stores the company owner's user ID

**Important Notes:**
- `@JsonIgnore` annotations prevent infinite recursion in JSON serialization
- User's `username` field returns email for JWT compatibility (see model note above)
- TimeLog hours are calculated from `startTime` and `endTime`

### Security Configuration

**CORS Settings** (`SecurityConfiguration.java:55-65`):
- Allowed origins: `http://localhost:5173` (frontend dev), `http://localhost:8080`
- Allowed methods: GET, POST, PUT, DELETE
- Credentials enabled for auth headers

**Public Endpoints:**
- `/auth/**` - Registration, login, verification, password reset

**Protected Endpoints:**
- `/timelogs/*` - Role-based access
- `/users/*` - Authenticated users only
- `/companies/*` - Company management

### JWT Configuration

JWT settings are stored in `application.properties`:
- `security.jwt.secret-key` - Base64-encoded secret key for signing
- `security.jwt.expiration-time` - Token expiration duration in milliseconds

The `JwtService` handles token generation, validation, and claims extraction.

## Important Implementation Details

### Password Reset Flow
The application includes a password reset feature using tokens:
- `PasswordResetToken` entity stores reset tokens with expiration
- `AuthenticationController` endpoints: `/auth/forgot-password` and `/auth/reset-password`
- Tokens are sent via email through `EmailService`

### Email Verification
- Verification codes are 6-digit strings stored in `User.verificationCode`
- Codes expire after a configurable time (`verificationCodeExpiresAt`)
- Unverified users (`enabled=false`) cannot log in

### Time Log Management
- Employees can only create and view their own time logs
- Executives can view all time logs for their company
- Time logs include `location`, `startTime`, `endTime`, and calculated `hours`

### Frontend Routing
Routes are role-based and defined in `App.jsx`:
- `/` and `/login` - Authentication
- `/org` - Organization/company management
- `/employee/*` - Employee dashboard and profile
- `/executive/*` - Executive dashboard and profile

## Configuration Requirements

### Backend Environment Variables
Ensure `application.properties` includes:
- Database connection: `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password`
- JWT settings: `security.jwt.secret-key`, `security.jwt.expiration-time`
- Email settings: SMTP configuration for verification emails

### Frontend Configuration
Update CORS origins in `SecurityConfiguration.java` for production deployment.

## Testing Considerations

When writing tests:
- Mock `JwtService` for authentication tests
- Use `@WithMockUser(roles = {"EMPLOYEE"})` or `@WithMockUser(roles = {"EXECUTIVE"})` for role-based tests
- Remember that usernames are actually emails in the security context
- Test email verification flow separately from authentication
- Mock `EmailService` to avoid sending actual emails in tests
