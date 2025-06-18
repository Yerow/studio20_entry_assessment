# Blog 20 - Modern Blog Application

A full-stack blog application built with Next.js 15, PayloadCMS, and MongoDB for Studio 20's entry assessment.

![Blog 20 Screenshot](https://media.licdn.com/dms/image/v2/D560BAQGoPO4wEsQYPg/company-logo_200_200/B56ZaGXu34GkAI-/0/1746011090818/studio20my_logo?e=1755734400&v=beta&t=FsGLOAbho7V2M1SSEEO5RYzCK-rpzWDCAk_dPfGiELk)

## 🚀 Live Demo

- **Application**: [Blog 20](https://studio20-entry-assessment.vercel.app)
- **Admin Panel**: [Blog 20 - admin](https://studio20-entry-assessment.vercel.app/admin)

## ✨ Features

### 🔐 Authentication System
- **Secure user registration and login** with PayloadCMS auth
- **Role-based access control** (Admin, Author, User)
- **Session management** with HTTP-only cookies
- **Protected routes** for authenticated users only

### 📝 Blog Management
- **Rich text editor** with Markdown support and live preview
- **Post creation** restricted to authenticated users
- **Author attribution** on all blog posts
- **Draft/Published workflow** with status management

### 🎨 Modern UI/UX
- **Responsive design** optimized for all devices
- **Tailwind CSS** for beautiful, consistent styling
- **Interactive components** with smooth animations
- **User avatars** and role indicators
- **Mobile-working** navigation with hamburger menu

### ⚡ Performance
- **Next.js 15** with App Router for optimal performance    
- **Efficient API queries** with PayloadCMS

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS |
| **Backend** | PayloadCMS v3, Node.js |
| **Database** | MongoDB |
| **Authentication** | PayloadCMS built-in auth |
| **Deployment** | Vercel |
| **Content** | Lexical Editor, ReactMarkdown |

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/Yerow/studio20_entry_assessment.git
cd studio20_entry_assessment
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
# Database Configuration
MONGODB_URI=X

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=X

#Payload Configuration
PAYLOAD_SECRET=X
PAYLOAD_CONFIG_PATH=./payload.config.ts
```

### 3. Start Development
```bash
npm run dev
```

Visit:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### 4. Create First Admin User
1. Go to http://localhost:3000/admin
2. Create your admin account
3. Start creating content!

## 📖 Usage Guide

### For Users
1. **Sign up** for an account at `/auth/signup`
2. **Sign in** to access writing features
3. **Create posts** using the Markdown editor
4. **View posts** on the homepage

### For Admins
1. **Access admin panel** at `/admin`
2. **Manage users** and assign roles
3. **Moderate content** and manage posts
4. **Configure site settings** globally

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub** and connect to Vercel
2. **Set environment variables** in Vercel dashboard:
   ```env
   PAYLOAD_SECRET=X
   MONGODB_URI=X
   ```
3. **Deploy** - Vercel handles the rest!

### Post-Deployment
1. Visit your deployed admin panel
2. Create the first admin user
3. Start publishing content

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── (payload)/          # PayloadCMS admin routes
│   ├── api/auth/logout/    # Custom auth endpoints
│   ├── auth/               # Authentication pages
│   ├── posts/              # Blog pages
│   └── page.tsx            # Homepage
├── components/
│   └── Navbar.tsx          # Navigation component
└── lib/
    └── auth.ts             # Auth utilities
```

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### API Endpoints
```
Authentication:
POST /api/users/login     # Sign in
POST /api/users           # Sign up
GET  /api/users/me        # Current user
POST /api/auth/logout     # Sign out

Blog Posts:
GET  /api/posts           # List posts
GET  /api/posts/:id       # Get single post
POST /api/posts           # Create post (auth required)
```

## 📋 Assessment Requirements ✅

### ✅ Authentication
- [x] User sign up, login, logout functionality
- [x] Only authenticated users can create posts
- [x] Author name displayed on posts
- [x] Secure authentication flow implementation

### ✅ Frontend
- [x] Login/logout buttons based on auth status
- [x] "Create post" button only for authenticated users
- [x] UI updates reflecting authentication status
- [x] Clear author indication on posts

### ✅ PayloadCMS Integration (Bonus)
- [x] PayloadCMS setup and configuration
- [x] Content management through CMS
- [x] API integration with Next.js
- [x] Rich content editing capabilities

### ✅ Documentation
- [x] Complete setup and configuration guide
- [x] Authentication flow explanation
- [x] Frontend changes documentation
- [x] API documentation and usage examples

### ✅ Deployment
- [x] Vercel deployment configuration
- [x] Environment variables setup
- [x] Production-ready authentication

## 🎯 Key Features Demonstrated

### Technical Proficiency
- **Modern React patterns** with hooks and functional components
- **TypeScript implementation** for type safety
- **API integration** with proper error handling
- **Responsive design** principles
- **Performance optimization** techniques

### Authentication & Security
- **Cookie-based sessions** with secure configuration
- **Role-based access control** implementation
- **Input validation** and sanitization
- **CSRF protection** via PayloadCMS
- **Environment variable management**

### Full-Stack Development
- **Frontend-backend integration** with PayloadCMS
- **Database design** with MongoDB collections
- **RESTful API** design and implementation
- **File structure organization** for scalability
- **Development workflow** setup

