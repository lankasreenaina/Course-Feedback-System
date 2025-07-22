# Course Feedback System

A full-stack web application for managing and collecting feedback on courses, with role-based access for students, professors, and admins.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Features
- User authentication (JWT-based)
- Role-based dashboards (Admin, Professor, Student)
- Course listing, detail, and feedback submission
- Professors can reply to feedback
- Admins can manage users and courses

---

## Project Structure

```
feedback-system/
  client/           # React frontend
    src/
      components/
        auth/           # Login, Register
        courses/        # CourseList, CourseDetail
        dashboard/      # AdminDashboard, ProfessorDashboard
        Navbar.js
      contexts/         # AuthContext.js
      utils/            # axios.js
      App.js
      index.js
      theme.js
    public/
    package.json
  server/           # Node.js/Express backend
    config/             # passport.js
    middleware/         # auth.js
    models/             # User.js, Course.js
    routes/             # users.js, outlets.js
    server.js
    package.json
  README.md
```

---

## Tech Stack
- **Frontend:** React, Material-UI, Axios, React Router
- **Backend:** Node.js, Express, MongoDB, Mongoose, Passport.js, JWT

---

## Setup & Installation

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB (local or Atlas)

### 1. Clone the repository
```sh
git clone https://github.com/lankasreenaina/Course-Feedback-System.git
cd Course-Feedback-System
```

### 2. Install dependencies
#### Client
```sh
cd client
npm install
```
#### Server
```sh
cd ../server
npm install
```

### 3. Configure Environment Variables
- Create a `.env` file in `server/` with:
  ```env
  MONGODB_URI=mongodb://localhost:27017/feedback-system
  JWT_SECRET=your-secret-key
  ```

### 4. Run the Application
#### Start Backend
```sh
cd server
npm run dev
```
#### Start Frontend
```sh
cd ../client
npm start
```

---

## Usage
- Visit `http://localhost:3000` for the frontend.
- Backend runs on `http://localhost:5000` by default.
- Register as a student, professor, or admin.
- Students can view courses and submit feedback.
- Professors can view their courses and reply to feedback.
- Admins can manage users and courses.

---

## API Endpoints (Summary)

### Auth/User
- `POST /user/register` — Register a new user (student, professor, admin)
- `POST /user/login` — Login and receive JWT

### Courses/Feedback
- `GET /outlet` — Get all courses (sorted by rating)
- `GET /outlet/:userId` — Get courses by professor
- `GET /outlet/outletId/:outletId` — Get course by ID
- `GET /outlet/to_reply/:outletId` — Get reviews pending reply (professor only)
- `GET /outlet/regex/:pattern` — Search courses by pattern

---

## License

This project is licensed under the MIT License. 