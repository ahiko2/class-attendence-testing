# Class Attendance Tracker - Backend Setup Guide

## Database Configuration

### MySQL Connection Details
- **Host**: localhost
- **User**: root
- **Password**: admin1234
- **Database**: class_attendance
- **Port**: 3306
- **Server Port**: 3001

## Database Schema

### Tables Created

1. **classes**
   - `id` (VARCHAR 50, PRIMARY KEY)
   - `name` (VARCHAR 255)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **students**
   - `id` (VARCHAR 50, PRIMARY KEY)
   - `class_id` (VARCHAR 50, FOREIGN KEY)
   - `name` (VARCHAR 255)
   - `avatar_url` (VARCHAR 500)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

3. **attendance_records**
   - `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
   - `class_id` (VARCHAR 50, FOREIGN KEY)
   - `student_id` (VARCHAR 50, FOREIGN KEY)
   - `date` (DATE)
   - `status` (ENUM: 'Present', 'Absent', 'Late', 'Unmarked')
   - `notes` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

4. **daily_notes**
   - `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
   - `class_id` (VARCHAR 50, FOREIGN KEY)
   - `date` (DATE)
   - `notes` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

## Setup Instructions

### 1. Initialize Database
```bash
npm run init-db
```
This will create the database and all necessary tables.

### 2. Start Backend Server
```bash
npm run server
```
The server will run on `http://localhost:3001`

### 3. Start Frontend (in a separate terminal)
```bash
npm run dev
```

## API Endpoints

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get a specific class
- `POST /api/classes` - Create a new class
- `DELETE /api/classes/:id` - Delete a class

### Students
- `GET /api/classes/:classId/students` - Get all students in a class
- `POST /api/classes/:classId/students` - Add a student to a class
- `DELETE /api/students/:id` - Delete a student

### Attendance
- `GET /api/attendance/:classId/:date` - Get attendance for a class on a specific date
- `GET /api/attendance/:classId` - Get all attendance history for a class
- `POST /api/attendance/:classId/:date` - Save attendance for a class on a date
- `DELETE /api/attendance/:classId/:date` - Clear attendance for a class on a date

## Environment Variables

The `.env` file contains:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin1234
DB_NAME=class_attendance
DB_PORT=3306
SERVER_PORT=3001
```

## Frontend Integration

Use the `api.ts` file to interact with the backend:

```typescript
import { classesAPI, studentsAPI, attendanceAPI } from './api';

// Example: Get all classes
const classes = await classesAPI.getAll();

// Example: Add a student
await studentsAPI.create(classId, {
  id: 'S001',
  name: 'John Doe',
  avatarUrl: 'https://example.com/avatar.jpg'
});

// Example: Save attendance
await attendanceAPI.save(classId, '2025-11-09', {
  attendance: { 'S001': 'Present', 'S002': 'Absent' },
  notes: 'Class went well today'
});
```

## Tech Stack

- **Backend**: Express.js + TypeScript
- **Database**: MySQL
- **Frontend**: React + TypeScript + Vite
- **ORM**: mysql2 (raw queries)

## Notes

- The backend server must be running before making API calls from the frontend
- CORS is enabled for local development
- All timestamps are automatically managed by MySQL
- Foreign key constraints ensure data integrity
