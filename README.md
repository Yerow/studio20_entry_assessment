# Blog 20 - Modern Blog Application

A full-stack blog application built with Next.js 15, PayloadCMS v3, and MongoDB for Studio 20's entry assessment.
![Studio20](https://media.licdn.com/dms/image/v2/D560BAQGoPO4wEsQYPg/company-logo_200_200/B56ZaGXu34GkAI-/0/1746011090818/studio20my_logo?e=1755734400&v=beta&t=FsGLOAbho7V2M1SSEEO5RYzCK-rpzWDCAk_dPfGiELk)

![Blog 20](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js) ![PayloadCMS](https://img.shields.io/badge/PayloadCMS-v3-blue?style=for-the-badge) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)

## 🚀 Live Demo

- **Application**: [Blog 20](https://studio20-entry-assessment.vercel.app/)
- **Admin Panel**: [Blog 20 Admin](https://studio20-entry-assessment.vercel.app/admin)

## ✨ Features

### 🔐 Authentication & Authorization

- **Secure user registration and login** with PayloadCMS built-in auth
- **Role-based access control** (Admin, Author, Member)
- **JWT authentication** with HTTP-only cookies
- **Protected routes** and granular permissions
- **Secure signup flow** with role validation

### 📝 Content Management

- **Rich text editor** with Lexical (PayloadCMS v3)
- **Markdown support** with live preview in creation interface
- **Post creation** restricted to authenticated authors
- **Draft/Published workflow** with status management
- **Auto-generated slugs** and metadata
- **Author attribution** on all posts

### 🎨 Modern UI/UX

- **Responsive design** optimized for all devices
- **Tailwind CSS** for beautiful, consistent styling
- **Interactive components** with smooth animations
- **User avatars** and role indicators
- **Mobile-first** navigation with hamburger menu
- **Loading states** and error handling

### ⚡ Performance & Technology

- **Next.js 15** with App Router for optimal performance
- **TypeScript** for type safety throughout the stack
- **Server-side rendering** for better SEO
- **Efficient API queries** with PayloadCMS REST endpoints
- **Automatic optimization** with Vercel deployment

## 🛠️ Tech Stack

|Category|Technology|Version|
|---|---|---|
|**Frontend**|Next.js|15.3.3|
|**Language**|TypeScript|5+|
|**Styling**|Tailwind CSS|4+|
|**Backend/CMS**|PayloadCMS|v3.43.0|
|**Database**|MongoDB Atlas|Latest|
|**Authentication**|PayloadCMS Auth|Built-in|
|**Deployment**|Vercel|Latest|
|**Content Editor**|Lexical|PayloadCMS v3|

## 🏃‍♂️ Quick Start

### Prerequisites

- **Node.js** 20+ (required for latest features)
- **MongoDB** (local installation or Atlas cloud)
- **npm** or **yarn**

### 1. Clone & Install

```bash
git clone https://github.com/Yerow/studio20_entry_assessment.git
cd studio20_entry_assessment
npm install
```

### 2. Environment Setup

Create `.env.local` in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blog20
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog20

# PayloadCMS Configuration
PAYLOAD_SECRET=your-super-secret-key-minimum-32-characters
PAYLOAD_CONFIG_PATH=./payload.config.ts

# Development
NODE_ENV=development
```

⚠️ **Important**: `PAYLOAD_SECRET` must be at least 32 characters long.

### 3. Generate Types & Start Development

```bash
# Generate TypeScript types for PayloadCMS
npm run generate:types

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### 5. Create First Admin User

1. Navigate to http://localhost:3000/admin
2. Create your admin account (first user is automatically admin)
3. Start creating content!

## 📖 Usage Guide

### 👤 For Users (Public/Members)

1. **Browse content** on the homepage
2. **Sign up** at `/auth/signup` to join the community
3. **Choose your role**: Member (reader) or Author (writer)

### ✍️ For Authors

1. **Sign up** with "Author" role or get promoted by an admin
2. **Create posts** using the rich text editor at `/posts/create`
3. **Manage your content** through your profile
4. **Use Markdown** for advanced formatting

### 👑 For Admins

1. **Access admin panel** at `/admin`
2. **Manage users** and assign roles
3. **Moderate content** and manage all posts
4. **Configure collections** and system settings

## 🔧 Development

### Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (payload)/         # PayloadCMS admin routes
│   │   │   └── admin/[[...segments]]/
│   │   ├── auth/              # Authentication pages
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── posts/             # Blog functionality
│   │   │   ├── [id]/          # Dynamic post pages
│   │   │   └── create/        # Post creation
│   │   ├── api/               # Custom API routes
│   │   │   └── auth/logout/   # Custom logout endpoint
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable components
│   │   └── Navbar.tsx         # Navigation component
│   └── lib/                   # Utility functions
│       └── auth.ts            # Authentication helpers
├── public/                    # Static assets
├── payload.config.ts          # PayloadCMS configuration
├── next.config.ts            # Next.js configuration
└── tailwind.config.ts        # Tailwind CSS configuration
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run generate:types  # Generate PayloadCMS TypeScript types
npm run payload      # Access PayloadCMS CLI
```

### Key Configuration Files

#### PayloadCMS (`payload.config.ts`)

- Collections definition (Users, Posts)
- Authentication setup
- Access control and permissions
- Hooks for business logic

#### Next.js (`next.config.ts`)

- PayloadCMS integration with `withPayload`
- Build optimizations
- Environment-specific configurations

## 🌐 API Endpoints

PayloadCMS automatically generates RESTful endpoints:

### Authentication

```
POST /api/users/login      # User sign in
POST /api/users/logout     # User sign out (PayloadCMS)
POST /api/auth/logout      # Custom logout with cleanup
GET  /api/users/me         # Get current user
POST /api/users            # User registration
```

### Content Management

```
GET    /api/posts          # List posts (filtered by permissions)
GET    /api/posts/:id      # Get single post
POST   /api/posts          # Create post (auth required)
PATCH  /api/posts/:id      # Update post (owner/admin only)
DELETE /api/posts/:id      # Delete post (owner/admin only)
```

### Users Management

```
GET    /api/users          # List users (authenticated only)
GET    /api/users/:id      # Get user profile
PATCH  /api/users/:id      # Update user (self/admin only)
DELETE /api/users/:id      # Delete user (admin only)
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect Repository**
    
    - Push code to GitHub
    - Connect repository to Vercel
2. **Configure Environment Variables** In Vercel Dashboard → Settings → Environment Variables:
    
    ```env
    MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blog20
    PAYLOAD_SECRET=your-production-secret-32-chars-minimum
    PAYLOAD_CONFIG_PATH=./payload.config.ts
    NODE_VERSION=20
    ```
    
3. **Deploy**
    
    - Vercel automatically builds and deploys
    - Visit your deployed admin panel to create first admin user

### Post-Deployment Checklist

- [ ] Admin panel accessible at `your-domain.com/admin`
- [ ] Environment variables configured correctly
- [ ] Database connection working
- [ ] First admin user created
- [ ] Authentication flow tested
- [ ] Post creation and publishing working

## 🔐 Role-Based Access Control

### Role Hierarchy

|Role|Permissions|Description|
|---|---|---|
|**👑 Admin**|Full access|Complete platform management|
|**✍️ Author**|Content creation|Create and manage own posts|
|**👤 Member**|Read-only|Browse and read published content|

### Permission Matrix

|Action|Admin|Author|Member|Public|
|---|---|---|---|---|
|View published posts|✅|✅|✅|✅|
|View all posts|✅|Own + Published|❌|❌|
|Create posts|✅|✅|❌|❌|
|Edit own posts|✅|✅|❌|❌|
|Edit any post|✅|❌|❌|❌|
|Delete own posts|✅|✅|❌|❌|
|Delete any post|✅|❌|❌|❌|
|Create users|✅|❌|❌|Signup only|
|Manage user roles|✅|❌|❌|❌|
|Access admin panel|✅|Limited|❌|❌|

## 📋 Assessment Requirements ✅

### ✅ Authentication Implementation

- [x] User registration, login, and logout functionality
- [x] Only authenticated users can create posts
- [x] Author attribution displayed on posts
- [x] Secure authentication flow with JWT + HTTP-only cookies

### ✅ Frontend Features

- [x] Login/logout buttons based on authentication status
- [x] "Create post" button only visible to authenticated users
- [x] UI updates reflecting user authentication state
- [x] Clear author indication on all blog posts

### ✅ PayloadCMS Integration (Bonus)

- [x] Complete PayloadCMS setup and configuration
- [x] Content management through admin interface
- [x] API integration with Next.js frontend
- [x] Rich content editing with Lexical editor

### ✅ Documentation

- [x] Comprehensive setup and configuration guide
- [x] Authentication flow explanation
- [x] Frontend architecture documentation
- [x] API documentation with usage examples

### ✅ Deployment

- [x] Production deployment on Vercel
- [x] Environment variables properly configured
- [x] Database connection to MongoDB Atlas
- [x] Production-ready authentication system

## 🎯 Technical Highlights

### Architecture Decisions

- **PayloadCMS as Headless CMS**: Provides powerful admin interface while maintaining frontend flexibility
- **Next.js App Router**: Modern routing with server components for optimal performance
- **TypeScript Throughout**: Type safety from database to UI components
- **JWT with HTTP-only Cookies**: Secure authentication resistant to XSS attacks

### Security Features

- **Role-based access control** with granular permissions
- **Input validation** on both client and server sides
- **CSRF protection** with configurable origins
- **Secure signup flow** preventing privilege escalation
- **Environment-based configuration** for development and production

### Performance Optimizations

- **Server-side rendering** for better SEO and initial load times
- **Automatic code splitting** with Next.js
- **Optimized database queries** with field selection and depth control
- **Static asset optimization** with Vercel's edge network

## 🛠️ Development Best Practices

### Code Quality

- **TypeScript strict mode** for type safety
- **ESLint configuration** for code consistency
- **Component-based architecture** for reusability
- **Separation of concerns** between UI and business logic

### Database Design

- **Normalized collections** with proper relationships
- **Indexed fields** for query performance
- **Data validation** through PayloadCMS schemas
- **Audit trail** with creation and update timestamps

### Security Practices

- **Environment variable management** for sensitive data
- **Input sanitization** and validation
- **Authentication state management** with proper cleanup
- **CORS configuration** for cross-origin security

## 🔮 Future Enhancements

### Phase 1 - Core Features

- [ ] Comment system with moderation
- [ ] Email notifications for new posts
- [ ] Advanced search and filtering
- [ ] Tag/category system

### Phase 2 - Community Features

- [ ] User profiles with bio and activity
- [ ] Following/follower system
- [ ] Post likes and reactions
- [ ] Content sharing features

### Phase 3 - Advanced Features

- [ ] Analytics dashboard for authors
- [ ] SEO optimization with meta tags
- [ ] Image upload and management
- [ ] Multi-language support

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error**

```bash
# Check MongoDB service status
brew services status mongodb-community

# Start MongoDB if not running
brew services start mongodb-community
```

**PayloadCMS Secret Error**

- Ensure `PAYLOAD_SECRET` is at least 32 characters long
- Generate secure secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Build Errors**

```bash
# Clean and reinstall dependencies
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Authentication Issues**

- Clear browser cookies for the domain
- Check environment variables are properly set
- Verify database connectivity

## 📞 Support

For technical questions or issues:

1. Check the troubleshooting section above
2. Review PayloadCMS documentation
3. Examine browser dev tools for detailed error messages

## 📄 License

This project is created for Studio 20's technical assessment.

---

**Built with ❤️ using modern web technologies**