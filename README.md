# Alumni Club Platform Guide 

A full-stack alumni management platform built with React + TypeScript frontend and Node.js + Express + Prisma backend.

## 🌐 Deployment Status

As of 2.10.2026, this project is fully deployed and operational exclusively on Render.
Local execution is no longer supported due to environment coupling, hosted database constraints, and production-only configuration.

🔗 Live Application:
https://alumni-club.onrender.com

All services, including backend API, database, email workflows, and authentication, are bound to the Render hosting environment.

Automated email workflows are presently inactive due to the expiration of the SendGrid free-tier service. The implementation remains intact and can be reactivated upon renewal of email service credentials.

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Icons** for icons

### Backend
- **Node.js** with Express
- **TypeScript**
- **Prisma** ORM with PostgreSQL
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

# 1. Backend Setup


### Navigate to backend directory
```
cd backend
```
### Install dependencies
```
npm install
```

## Set up environment variables
### Create .env file in backend/ with: 
```
DATABASE_URL="postgresql://username:password@localhost:5432/alumni_club_dev?schema=public"
PORT=4000
NODE_ENV=development
JWT_SECRET="your_jwt_secret"
PRISMA_LOG_LEVEL=info
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=????????????
FROM_EMAIL=fit.alumni.club@gmail.com      
ENROLL_TO=fit.alumni.club@gmail.com
CONTACT_INBOX_EMAIL=fit.alumni.club@gmail.com
```
# 

## Set up environment variables
### Create .env file in frontend/ with: 
```

VITE_TINYMCE_API_KEY=qkcx67femxnaq01itdjrlnliucc2at403pzwt57aici7njws
```
# 

### Set up database
```
npx prisma db pull
npx prisma generate
npx prisma db push
```

### Start the backend server
```
npm run dev
```

### Backend will run on ``` http://localhost:4000 ```

# 2. Frontend Setup

### Navigate to frontend directory (in a new terminal)
```
cd frontend
```

### Install dependencies
```
npm install
```

### Start the development server
```
npm run dev
```
### Frontend will run on ``` http://localhost:5173 ```

# 🔐 Authentication

### The platform uses JWT-based authentication:
    Login: POST /api/auth/login with username and password
    Protected Routes: Admin dashboard requires admin role
    Auto-logout: Token expiration after 1 hours

### Default Admin user
#### To create an admin user, run the admin creation script:
```
# From backend directory
npx ts-node src/scripts/create-admin.ts
```
#### Or use the interactive version:
```
npx ts-node src/scripts/create-admin-interactive.ts
```
# 📊 API Endpoints
#### Authentication

    POST /api/auth/login - User login

#### Alumni Management

    GET /api/alumni - Get all alumni members

    GET /api/alumni/:id - Get specific alumni

#### Health Check

    GET /api/health - Check API status

### Backend Architecture
    backend/
    ├── prisma/            # Prisma schema and migrations
    ├── src/
    │   ├── controllers/  # Request handlers (no business logic)
    │   ├── services/     # Core business logic
    │   ├── routes/       # Express route definitions
    │   ├── middlewares/  # Authentication and authorization
    │   ├── config/       # Configuration files
    │   ├── utils/        # Helper utilities
    │   ├── types/        # Shared TypeScript types
    │   ├── app.ts        # Express app setup
    │   └── server.ts     # Server entry point
    ├── uploads/           # User-uploaded files
    └── testing/           # Jest and Supertest tests

### Backend Rules

    Controllers must remain thin

    Business logic lives exclusively in services

    All database access goes through Prisma

    No raw SQL in application code

    Core Backend Modules

    Authentication and authorization

    User profiles with visibility controls

    Alumni directory with search and filtering

    Blog system with admin approval

    One-to-one inbox messaging

    Event management with RSVP support

    Contact and enrollment email workflows

    Administrative control panel

### Frontend Architecture
    frontend/
    ├── src/
    │   ├── pages/        # Route-level pages
    │   ├── components/   # Reusable UI components
    │   ├── services/     # API communication layer
    │   ├── context/      # Global state management
    │   ├── assets/       # Static assets
    │   └── App.tsx       # Route definitions

### Frontend Rules

    Pages contain presentation logic only

    API calls are isolated in services/

    Shared UI lives in components/

    Role-based routing is enforced

    Data Flow

    User logs in

    Backend issues a JWT token

    Frontend stores the token

    Token is attached to API requests

    Backend validates token and role

    JSON response is returned

    UI updates accordingly

### Testing
### Backend

    Jest and Supertest

    Covers authentication, messages, blog, and profile visibility

    npm test

### Frontend

    Manual QA

    Browser DevTools

    Role-based UI verification

    Environment & Security Notes

    .env files must never be committed

    Prisma migrations should not be edited manually

    Always update schema.prisma first

    Upload directories are ignored by git

    Extension Points

    The architecture supports safe future extensions such as:

    Notifications

    Group messaging

    Advanced admin analytics

    Forum enhancements

    Event reminders

    Extended profile metadata

### Project Status

    The project is feature-complete, stable, and ready for handover.
    All core systems are implemented, documented, and structured for continued development.

## 📬 Project Handover & Administration

For matters concerning project handover, maintenance, deployment access, or administrative oversight, please contact the current project administrator:

Administrator: AdrianAdrovic-sudo
Email: atko.adrovic@gmailc.com

All credentials, hosting configurations, and operational knowledge are held by the administrator. Any future development, service reactivation, or ownership transfer should be coordinated directly through this contact.
