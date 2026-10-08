# Student Feedback System

A minimal, full-stack workshop application for student course feedback built with **React** (Vite) and **Node.js** (Express + SQLite), featuring phone OTP authentication powered by **Minimoth API**.

---

## 🌟 Key Features

- **OTP Authentication via Minimoth API**: Send and verify OTPs for student login and registration (`POST /v1/otp/send` & `POST /v1/otp/verify`).
- **Course Feedback Submission**: Select enrolled courses, provide star ratings (1–5), and leave comments.
- **Feedback & Ratings Summary**: View real-time feedback submissions and calculated average system ratings.
- **Minimal & Responsive Design**: Clean Indigo/Emerald UI designed for mobile and desktop views.

---

## 🏗 System Architecture

### 1. Database Models (3 Entities)
- **User**: `id`, `phone`, `name`, `created_at`
- **Course**: `id`, `code`, `title`, `instructor`
- **Feedback**: `id`, `user_id`, `course_id`, `rating`, `comment`, `created_at`

### 2. Backend API Endpoints (5 Endpoints)
- `POST /api/auth/send-otp` - Initiates OTP delivery via Minimoth API.
- `POST /api/auth/verify-otp` - Validates OTP code and registers/authenticates student.
- `GET /api/courses` - Retrieves the list of available courses.
- `POST /api/feedback` - Submits course feedback with input validation.
- `GET /api/feedback` - Retrieves feedback history and system summary statistics.

### 3. Frontend Views (3 Pages)
- **Login / OTP Page**: Phone number OTP verification flow.
- **Course Feedback Page**: Interactive rating and feedback submission form.
- **Feedback List Page**: Real-time listing of all submitted student feedback and average rating.

---

## 🚀 Quick Setup & Running Guide

### Step 1: Backend Setup

```bash
cd backend
npm install
```

Copy environment variables and configure your Minimoth API key:

```bash
cp .env.example .env
```

*Note: If `MINIMOTH_API_KEY` is left blank, the application automatically operates in **Demo Mode** (using `123456` as the default test OTP).*

Start the backend server:

```bash
node server.js
# Backend runs on http://localhost:5000
```

---

### Step 2: Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
```

Copy environment configuration:

```bash
cp .env.example .env
```

Start the frontend development server:

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 Minimoth API Integration

To use live WhatsApp/SMS OTP delivery with Minimoth:
1. Sign up at [minimoth.dev](https://minimoth.dev) to obtain your API key.
2. Add your key to `backend/.env`:
   ```env
   MINIMOTH_API_KEY=mm_live_xxxxxxxxxxxxxxxxxxxx
   ```
3. Restart the backend server.

