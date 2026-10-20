# Course Management Platform - Exam Submission

A full-stack web application for managing courses, featuring role-based access control (RBAC) for Teachers and Students, secure JWT authentication, and dynamic course enrollment logic.

## Student Information

- **Student Name:** Maytus Arintra
- **Student ID:** 6710590

## Test Credentials

Use the following pre-seeded accounts to test the application's role-based features.

**Teacher Accounts (Role: Teacher)**

- **Emails:** `t1@exam.com`, `t2@exam.com`, `t3@exam.com`
- **Password:** `password123`

**Student Accounts (Role: Student)**

- **Emails:** `s1@exam.com`, `s2@exam.com`, `s3@exam.com`
- **Password:** `password123`

---

## Prerequisites

- Node.js installed (v18+ recommended)
- A running MongoDB instance (MongoDB Atlas or local)

---

## How to Run & Test

### 1. Backend Setup (`next-backend/`)

The backend is built with Next.js App Router (API only), Mongoose, and JWT cookies.

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd next-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of `next-backend` and add your environment variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=super_secret_exam_key_2026
   ```
4. Start the backend development server:

   ```bash
   npm run dev
   ```

   _The backend will run on `http://localhost:3000`._

5. **Seed the Database:** Open your browser and navigate to `http://localhost:3000/api/seed` to initialize the database with the test users.

### 2. Frontend Setup (`react-frontend/`)

The frontend is built with React, Vite, React Router, and Tailwind CSS.

1. Open a **new** terminal and navigate to the frontend folder:
   ```bash
   cd react-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. _(Optional)_ Create a `.env` file in the root of `react-frontend` if your backend is running on a different port:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   _The frontend will typically run on `http://localhost:5173`._

---

## Testing the Business Logic

To fully verify the exam requirements, follow this testing flow:

1. **Teacher Capabilities:**
   - Log in as a Teacher (e.g., `t1@exam.com`).
   - Create a new course via the Teacher Dashboard.
   - Verify the course appears in your list.
   - _Note: The delete button will be active for courses with 0 enrolled students._
2. **Student Capabilities & Enrollment:**
   - Log out and log in as a Student (e.g., `s1@exam.com`).
   - Search for the course you just created.
   - Click **Enroll**. The UI should update to "Enrolled", and the capacity bar should increase.
   - Verify that you cannot enroll in courses marked as "Closed" or "Cancel", nor can you exceed the "Max Capacity".
3. **Validation & Guards:**
   - Log back in as the Teacher.
   - Locate the course the student just enrolled in.
   - Verify that the **Delete** button is now disabled (greyed out) and locked because the course has active students.

---

## Tech Stack Highlights

- **Frontend:** React, Vite, Tailwind CSS, React Router DOM
- **Backend:** Next.js 16 (API Routes), Node.js
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** HttpOnly Cookies, JSON Web Tokens (JWT)
