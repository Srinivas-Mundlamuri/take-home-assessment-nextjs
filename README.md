# Take Home Assessment | Full Stack Project Manager

A collaborative project management application with integrated whiteboarding functionality built with Next.js and PostgreSQL.

## 🌐 Live Demo

**[🚀 View Live Application](https://take-home-assessment-nextjs-mdvhtxy6f.vercel.app)**

Try the demo with these test credentials:

- Username: `srinivas`
- Username: `srinivas12`

## 🚀 Project Overview

This application allows users to:
- **👤 Login with username only (no password required)**
- **📁 Create and manage projects with CRUD operations**
- **🎨 Add multiple TLDraw whiteboard files per project**
- **🤝 Share projects with other users by username**
- **💾 Save and load TLDraw canvas state to database**

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.5.4 with TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Whiteboarding**: TLDraw 4.0.3
- **Styling**: Tailwind CSS
- **Authentication**: JWT with HTTP-only cookies

## 📊 Database Schema

The application uses the following database tables:

### Users Table (`users`)
```sql
- id: String (Primary Key, CUID)
- username: String (Unique, case-insensitive)
- createdAt: DateTime
- updatedAt: DateTime
```

### Projects Table (`projects`)
```sql
- id: String (Primary Key, CUID)
- name: String
- description: String (Optional)
- ownerId: String (Foreign Key to users.id)
- createdAt: DateTime
- updatedAt: DateTime
```

### Project Shares Table (`project_shares`)
```sql
- id: String (Primary Key, CUID)
- projectId: String (Foreign Key to projects.id)
- userId: String (Foreign Key to users.id)
- createdAt: DateTime
- Unique constraint on (projectId, userId)
```

### Whiteboards Table (`whiteboards`)
```sql
- id: String (Primary Key, CUID)
- name: String
- projectId: String (Foreign Key to projects.id)
- canvasData: JSON (TLDraw canvas state)
- createdAt: DateTime
- updatedAt: DateTime
```

### Key Relationships
- Users can own multiple projects (One-to-Many)
- Projects can be shared with multiple users (Many-to-Many via project_shares)
- Projects can have multiple whiteboards (One-to-Many)
- All related records are cascaded on delete

## 🏗️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm/yarn/pnpm package manager

### 1. Clone the Repository
```bash
git clone https://github.com/Srinivas-Mundlamuri/take-home-assessment-nextjs.git
cd take-home-assessment-nextjs
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Setup
Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/take_home_assessment?schema=public"

# NextAuth Configuration (Optional - we use custom JWT auth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# JWT Secret
JWT_SECRET="your-jwt-secret-key-here"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🎯 User Flow

1. **Login Page** → Enter username (auto-creates user if doesn't exist)
2. **Projects Dashboard** → View owned and shared projects
3. **Create New Project** → Add project with name and description
4. **Project Detail** → View project whiteboards and manage sharing
5. **Share Project** → Enter username to grant access
6. **Whiteboard Editor** → Create, edit, and save TLDraw drawings

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Check current session

### Projects
- `GET /api/projects` - Get all accessible projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get specific project
- `DELETE /api/projects/[id]` - Delete project (owner only)
- `POST /api/projects/[id]/share` - Share project with user

### Whiteboards
- `GET /api/projects/[id]/whiteboards` - Get project whiteboards
- `POST /api/projects/[id]/whiteboards` - Create new whiteboard
- `GET /api/whiteboards/[id]` - Get specific whiteboard
- `PUT /api/whiteboards/[id]` - Update whiteboard canvas data
- `DELETE /api/whiteboards/[id]` - Delete whiteboard

## 🧪 Testing Guide

### Manual Testing Steps

1. **User Authentication**
   - Visit `/login` and enter a username
   - Verify auto-user creation for new usernames
   - Test session persistence across page navigation

2. **Project Management**
   - Create projects with name and description
   - Verify ownership display on dashboard
   - Test project deletion (owner only)

3. **Project Sharing**
   - Share project with existing username
   - Verify shared projects appear in recipient's dashboard
   - Test error handling for non-existent users

4. **Whiteboard Functionality**
   - Create multiple whiteboards per project
   - Draw on TLDraw canvas and verify auto-save
   - Test whiteboard deletion
   - Verify canvas state persistence on reload

5. **Access Control**
   - Verify shared users can access project whiteboards
   - Test that non-shared users cannot access restricted projects
   - Confirm only owners can delete projects and manage sharing

## 🔐 Security Features

- **JWT Authentication** with HTTP-only cookies
- **Input Validation** on both client and server
- **SQL Injection Protection** via Prisma ORM
- **Access Control** for projects and whiteboards
- **CSRF Protection** via SameSite cookie settings

## 📁 Project Structure

```
src/
├── app/
│   ├── api/            # Next.js API routes
│   ├── dashboard/      # Projects dashboard
│   ├── login/          # Authentication page
│   ├── projects/[id]/  # Project detail pages
│   ├── whiteboards/[id]/ # TLDraw editor pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── lib/
│   ├── auth.ts         # Authentication utilities
│   └── prisma.ts       # Database client
└── components/         # Reusable React components

prisma/
└── schema.prisma       # Database schema

```

## 🚀 Deployment

The application is designed to be deployed on platforms like:
- Vercel (recommended for Next.js)
- Railway
- Netlify
- Heroku

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your deployed app URL
- `NEXTAUTH_SECRET` - Secure random string
- `JWT_SECRET` - Secure random string for JWT signing

### Build Commands
```bash
npm run build
npm start
```

## 🎨 Features Implemented

- ✅ Simplified username-only authentication
- ✅ Project CRUD operations with ownership
- ✅ Project sharing system by username
- ✅ Multiple TLDraw whiteboards per project
- ✅ Canvas state persistence to database
- ✅ Auto-save functionality for whiteboards
- ✅ Responsive UI with Tailwind CSS
- ✅ Complete API with error handling
- ✅ Database relationships with cascading deletes
- ✅ Session management across navigation

## 📝 Development Notes

This application focuses on core functionality and clean code architecture. The simplified authentication system (username-only) makes it easy to test and demonstrate the collaborative features without the complexity of full user management.

The TLDraw integration provides a powerful whiteboarding experience with automatic saving of canvas state, making it suitable for real collaborative work sessions.

## 🤝 Contributing

This is a technical assessment project. The code demonstrates:
- Clean, readable code structure
- Proper error handling
- RESTful API design
- Modern React patterns with hooks
- TypeScript usage throughout
- Database design with proper relationships
