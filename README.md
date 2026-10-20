# How to Test the App

## Student Information

- **Student Name:** Maytus Arintra
- **Student ID:** 6710590

## Test Credentials

**Teacher Accounts (Role: Teacher)**

- **Emails:** `t1@exam.com`, `t2@exam.com`, `t3@exam.com`
- **Password:** `password123`

**Student Accounts (Role: Student)**

- **Emails:** `s1@exam.com`, `s2@exam.com`, `s3@exam.com`
- **Password:** `password123`

## Prerequisites

- Node.js installed
- A running MongoDB instance (MongoDB Atlas)

## How to Run & Test

### 1. Backend Setup (`next-backend/`)

- Open a terminal and navigate to the backend folder: `cd next-backend`
- Install dependencies: `npm install`
- Create a `.env` file in the root of `next-backend` and add:
  ```env
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=super_secret_exam_key_2026
  ```
