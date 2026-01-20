# 🎓 Campus Vault

**Campus Vault** is an intelligent academic credential verification system that combines AI-powered certificate analysis with secure role-based access to streamline activity point management for students and teachers at KTU (Kerala Technological University).

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Core Modules](#core-modules)
- [Usage Guide](#usage-guide)
- [Security & Fraud Detection](#security--fraud-detection)
- [Contributing](#contributing)

---

## 🎯 Overview

Campus Vault automates the verification and management of student activity certificates for the KTU B.Tech curriculum. Students upload certificates for various activities (sports, workshops, internships, etc.), and the system uses **Google Gemini AI** to analyze the images, extract relevant data, predict activity points, and detect potential fraud. Teachers then review and approve/reject submissions through a secure dashboard.

**Key Problem Solved**: Traditional manual certificate verification is time-consuming and prone to errors. Campus Vault eliminates this with intelligent AI analysis while maintaining academic integrity through fraud detection.

---

## ✨ Features

### For Students
- 🔐 **Secure Login**: JWT-based authentication with session persistence
- 📤 **Certificate Upload**: Support for JPEG, PNG, and PDF documents (up to 5MB)
- 🤖 **AI-Powered Analysis**: Google Gemini analyzes certificates to extract:
  - Event name and date
  - Activity level (college/zonal/national)
  - Predicted activity points
  - Fraud risk assessment
- 📝 **Multi-Category Support**: Different analysis paths for:
  - Standard certificates
  - Duty leave documents
  - Internship reports
  - MOOC certificates
  - Sports achievements
- 🔔 **Real-Time Notifications**: Get alerts when submissions are approved/rejected
- 📊 **Submission History**: Track all uploaded certificates and their status (PENDING/APPROVED/REJECTED)

### For Teachers
- 👨‍🏫 **Submission Review Console**: View all pending student submissions
- ✅ **Approval Workflow**: Approve submissions with automatic student notifications
- ❌ **Rejection Management**: Reject fraudulent or invalid submissions
- 🚨 **Fraud Indicators**: Visual cues for high-risk submissions requiring manual verification
- 📧 **Email Notifications**: Receive alerts when new submissions arrive
- 🔔 **Real-Time Notifications**: Interactive notification center

### System-Wide
- 🛡️ **Fraud Detection**: KTU rulebook-based validation with suspicious activity flagging
- 📧 **Email Integration**: Automated confirmation emails via Resend API
- 🎨 **Modern UI**: Glassmorphic design with neon accents using Tailwind CSS
- 🔄 **Real-Time Updates**: WebSocket-ready notification architecture
- 🗄️ **Persistent Storage**: MongoDB for all submissions and notifications

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 7** - Lightning-fast build tool
- **React Router 6** - Client-side routing
- **Tailwind CSS 3** - Utility-first styling
- **Axios** - HTTP client with interceptors
- **Heroicons** - Icon library
- **Google Generative AI SDK** - Gemini integration

### Backend
- **Express.js 4** - Node.js web framework
- **MongoDB & Mongoose** - Database & ODM
- **JWT (jsonwebtoken)** - Authentication
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing
- **Resend** - Email service provider
- **Google Generative AI** - Gemini API for analysis
- **Nodemon** - Development auto-reload

### Infrastructure
- **Node.js** - Runtime environment
- **npm** - Package management

---

## 📂 Project Structure

```
campus-vault/
├── index.html                          # HTML entry point
├── package.json                        # Root dependencies (React app)
├── vite.config.js                      # Vite configuration with API proxy
├── tailwind.config.js                  # Tailwind CSS theme customization
├── postcss.config.js                   # PostCSS configuration
│
├── src/                                # Frontend React application
│   ├── main.jsx                        # React entry point
│   ├── App.jsx                         # Main router component
│   ├── index.css                       # Global styles
│   │
│   ├── api/
│   │   ├── axiosClient.js              # Axios instance with JWT interceptor
│   │   └── endpoints.js                # Centralized API endpoint definitions
│   │
│   ├── context/
│   │   └── AuthContext.jsx             # Global auth state (login/logout/user)
│   │
│   ├── hooks/
│   │   └── useFileUpload.js            # File selection, validation, upload hook
│   │
│   ├── components/
│   │   └── common/
│   │       └── NotificationBell.jsx    # Real-time notification UI component
│   │
│   ├── pages/
│   │   ├── Login.jsx                   # Authentication page (demo + real)
│   │   ├── StudentDashboard.jsx        # Student file upload & analysis view
│   │   └── TeacherDashboard.jsx        # Teacher submission review console
│   │
│   └── assets/                         # Images, icons, static files
│
└── server/                             # Node.js/Express backend
    ├── package.json                    # Backend dependencies
    ├── server.js                       # Express app initialization & routes
    ├── test-key.js                     # Development/testing utilities
    │
    ├── middleware/
    │   └── uploadMiddleware.js         # Multer config for file uploads
    │
    ├── controllers/
    │   └── uploadController.js         # Gemini AI analysis & fraud detection logic
    │
    ├── models/
    │   ├── Submission.js               # MongoDB schema for certificate submissions
    │   └── Notification.js             # MongoDB schema for notifications
    │
    ├── routes/
    │   ├── studentRoutes.js            # POST /upload, /submit, GET /dashboard
    │   ├── teacherRoutes.js            # GET /submissions, POST /approve/:id, /reject/:id
    │   └── notificationRoutes.js       # GET /notifications/:userId
    │
    ├── services/
    │   └── emailService.js             # Resend email templates & sending logic
    │
    └── utils/
        └── imageParser.js              # Image preprocessing utilities
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** 16+ and **npm** installed
- **MongoDB** instance (local or cloud)
- **Google Gemini API Key** ([Get it free](https://aistudio.google.com/app/apikey))
- **Resend Email API Key** ([Get it here](https://resend.com))

### Step 1: Clone Repository
```bash
git clone https://github.com/Muhsin-603/campus-vault.git
cd campus-vault
```

### Step 2: Frontend Setup
```bash
# Install dependencies
npm install

# Create .env file in root
echo "VITE_SERVER_URL=http://localhost:5000" > .env
```

### Step 3: Backend Setup
```bash
cd server
npm install

# Create .env file in server directory
echo "MONGODB_URI=mongodb://localhost:27017/campus-vault" > .env
echo "GEMINI_API_KEY=your_gemini_api_key_here" >> .env
echo "RESEND_API_KEY=your_resend_api_key_here" >> .env
echo "PORT=5000" >> .env
```

### Step 4: MongoDB Setup (if using local)
```bash
# Windows
mongod

# macOS/Linux
brew services start mongodb-community
```

---

## ▶️ Running the Application

### Development Mode

**Terminal 1: Start Frontend**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

**Terminal 2: Start Backend**
```bash
cd server
npm run dev
# Backend runs on http://localhost:5000
```

### Demo Mode
- Use **"Student Demo"** or **"Teacher Demo"** buttons on login page
- No authentication required, uses mock data
- Fully functional UI for testing

### Production Build
```bash
# Frontend
npm run build
npm run preview

# Backend
cd server
npm start
```

---

## 🔐 Environment Variables

### Root Directory (`.env`)
```env
VITE_SERVER_URL=http://localhost:5000
```

### Server Directory (`server/.env`)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/campus-vault

# AI Analysis
GEMINI_API_KEY=sk-...your_key_here...

# Email Service
RESEND_API_KEY=re_...your_key_here...

# Server
PORT=5000
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Login user (returns user + JWT token) |
| POST | `/auth/register` | Register new user |
| POST | `/auth/refresh` | Refresh JWT token |

### Student Routes
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/student/upload` | Upload certificate image (Gemini analysis) |
| POST | `/student/submit` | Submit analyzed certificate to database |
| GET | `/student/dashboard` | Get student dashboard data |
| GET | `/student/files` | Get student's submission history |

### Teacher Routes
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/teacher/dashboard` | Get teacher dashboard data |
| GET | `/teacher/submissions` | Get all pending submissions |
| POST | `/teacher/submissions/:id/approve` | Approve a submission |
| POST | `/teacher/submissions/:id/reject` | Reject a submission |
| GET | `/teacher/fraud-alerts` | Get suspicious submissions |

### Notifications
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/notifications/:userId` | Get all notifications for user |

---

## 🧩 Core Modules

### 1. **Authentication Context** (`src/context/AuthContext.jsx`)
Manages global authentication state including:
- User data (name, email, role, ID)
- JWT token storage in localStorage
- Login/logout functions
- Authentication status checking

### 2. **AI Analysis Engine** (`server/controllers/uploadController.js`)
**Powered by Google Gemini Flash**

Analyzes certificate images against KTU rulebook:
- Identifies activity type (sports, workshop, internship, etc.)
- Determines level (college/zonal/national)
- Calculates points based on rules
- Detects fraud (edited documents, mismatched fonts, suspicious images)
- Returns structured JSON analysis

**KTU Rulebook Rules (Hardcoded):**
- NSS/NCC (2 years): 60 points max
- Sports: 8-60 points based on level
- Workshops: 10-40 points
- MOOC: 50 points
- Internships: 20 points (min 5 days)
- Startups: 60 points
- Patents: 30-50 points

### 3. **File Upload Hook** (`src/hooks/useFileUpload.js`)
Handles file operations:
- File validation (JPEG/PNG/PDF only)
- Size checking (5MB limit)
- Multipart form submission
- Error/success state management

### 4. **Email Service** (`server/services/emailService.js`)
Sends HTML-formatted emails via Resend:
- Submission confirmation emails to students
- Teacher alerts for new submissions
- Templated content with analysis results

### 5. **Notification System** (`src/components/common/NotificationBell.jsx`)
Real-time notification badge:
- Polls every 30 seconds for new notifications
- Shows unread count indicator
- Displays notification list in dropdown
- Marks notifications as read

---

## 💡 Usage Guide

### For Students: Uploading a Certificate

1. **Login**
   - Click "Student Demo" or log in with real credentials
   - Redirected to Student Dashboard

2. **Upload Certificate**
   - Click "Choose File" button
   - Select JPEG, PNG, or PDF (max 5MB)
   - Select category (Certificate, Internship, Duty Leave, MOOC, Sports)

3. **Analyze**
   - Click "ANALYZE CERTIFICATE"
   - Wait for Gemini AI analysis (usually 3-5 seconds)
   - Review analysis results

4. **Submit**
   - If analysis looks good, click "CONFIRM & SUBMIT"
   - Certificate saved to database
   - Confirmation email sent
   - Teacher notification created

### For Teachers: Reviewing Submissions

1. **Login**
   - Click "Teacher Demo" or log in with credentials
   - Redirected to Teacher Console

2. **Review Submissions**
   - All pending submissions displayed with:
     - Student name and email
     - Event details
     - Predicted points
     - Fraud risk indicator

3. **Take Action**
   - Click ✅ (Approve) to accept submission
     - Points become official
     - Student notification sent
   - Click ❌ (Reject) to deny
     - Student receives rejection notification

4. **Monitor Notifications**
   - Click bell icon for real-time alerts

---

## 🛡️ Security & Fraud Detection

### Multi-Layer Security

1. **JWT Authentication**
   - Tokens stored in localStorage
   - Automatic inclusion in request headers via Axios interceptor
   - 401 errors redirect to login

2. **Role-Based Access Control**
   - Protected routes check user role
   - Students can only see their submissions
   - Teachers see all submissions

3. **File Upload Validation**
   - Type checking: JPEG, PNG, PDF only
   - Size limit: 5MB maximum
   - Server-side multer validation

### Fraud Detection System

**Gemini AI analyzes for:**
- ✅ Valid certificate format and content
- ✅ Legitimate event details and dates
- ❌ Fake/edited documents (mismatched fonts, altered text)
- ❌ Non-certificate images (selfies, food, random screenshots)
- ❌ Blurry or illegible documents
- ❌ Suspicious patterns (too many submissions, unrealistic points)

**Fraud Flags:**
- **LOW RISK**: Standard certificate, passes all checks
- **HIGH RISK**: Suspicious elements detected, manual review required
- **INVALID**: Not a certificate at all, 0 points assigned

**Teacher Override:**
- Teachers can approve/reject regardless of AI score
- Final authority rests with academic staff

---

## 📝 Database Schemas

### Submission Document
```javascript
{
  _id: ObjectId,
  studentId: String,
  studentName: String,
  eventName: String,
  eventDate: String,
  category: String, // "certificate", "duty_leave", "internship", "mooc", "sports"
  predictedPoints: Number,
  fraudAnalysis: {
    riskLevel: String, // "LOW" or "HIGH"
    reason: String,
    isSuspicious: Boolean
  },
  status: String, // "PENDING", "APPROVED", "REJECTED"
  submittedAt: Date
}
```

### Notification Document
```javascript
{
  _id: ObjectId,
  userId: String,
  message: String,
  type: String, // "info", "success", "warning", "error"
  isRead: Boolean,
  createdAt: Date
}
```

---

## 🎨 Design System

### Color Scheme
- **Primary**: Indigo-600 (`#4f46e5`)
- **Accent**: Purple-600 (`#9333ea`)
- **Success**: Green (`#10b981`)
- **Danger**: Red (`#ef4444`)
- **Background**: Dark Blue-Gray (`#0a0a0f`)
- **Cards**: Slightly lighter (`#13131f`)

### UI Components
- Glassmorphic cards with blur backdrop
- Smooth fade-in animations
- Responsive grid layouts
- Icon-based action buttons
- Real-time status indicators

---

## 🚧 Known Issues & Limitations

1. **Free Tier Limitations**
   - Resend free tier only allows verified email addresses
   - Gemini free tier has rate limits (60 requests/minute)

2. **Authentication**
   - Demo mode stores everything in localStorage (not secure for production)
   - Real authentication requires backend JWT validation

3. **File Handling**
   - PDF analysis requires Gemini Vision API (extra configuration)
   - Large images may timeout on slower connections

4. **Notifications**
   - Polling-based (30s interval) rather than true WebSockets
   - Not suitable for real-time production use at scale

---

## 🔄 Future Enhancements

- [ ] Implement true WebSocket notifications
- [ ] Add user profile management
- [ ] Create admin dashboard with analytics
- [ ] Support batch uploads and processing
- [ ] Add OCR text extraction for better fraud detection
- [ ] Implement certificate verification with issuing institutions
- [ ] Create mobile app version
- [ ] Add 2FA authentication
- [ ] Implement activity point transaction history

---

## 📄 License

This project is part of the Campus Vault initiative for KTU students.

---

## 👤 Author

**Muhsin-603**  
[GitHub](https://github.com/Muhsin-603) | [Repository](https://github.com/Muhsin-603/campus-vault)

---

## 💬 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

## 🎓 Academic Integrity

Campus Vault is designed to enhance academic integrity by:
- Automating honest verification processes
- Detecting fraudulent documents
- Maintaining transparent audit trails
- Ensuring fair evaluation for all students

**Remember:** Integrity is the foundation of education. Submit only genuine certificates.

---

**Last Updated:** January 20, 2026  
**Version:** 1.0.0
