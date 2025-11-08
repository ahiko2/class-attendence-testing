import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ==================== CLASSES ENDPOINTS ====================

// Get all classes
app.get('/api/classes', async (req: Request, res: Response) => {
  try {
    const [classes] = await pool.query('SELECT * FROM classes ORDER BY name');
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Get a single class by ID
app.get('/api/classes/:id', async (req: Request, res: Response) => {
  try {
    const [classes] = await pool.query('SELECT * FROM classes WHERE id = ?', [req.params.id]);
    const classesArray = classes as any[];
    if (classesArray.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(classesArray[0]);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// Create a new class
app.post('/api/classes', async (req: Request, res: Response) => {
  const { id, name } = req.body;
  try {
    await pool.query('INSERT INTO classes (id, name) VALUES (?, ?)', [id, name]);
    res.status(201).json({ id, name });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Delete a class
app.delete('/api/classes/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM classes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// ==================== STUDENTS ENDPOINTS ====================

// Get all students for a class
app.get('/api/classes/:classId/students', async (req: Request, res: Response) => {
  try {
    const [students] = await pool.query(
      'SELECT * FROM students WHERE class_id = ? ORDER BY name',
      [req.params.classId]
    );
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Add a student to a class
app.post('/api/classes/:classId/students', async (req: Request, res: Response) => {
  const { id, name, avatarUrl } = req.body;
  const { classId } = req.params;
  
  try {
    await pool.query(
      'INSERT INTO students (id, class_id, name, avatar_url) VALUES (?, ?, ?, ?)',
      [id, classId, name, avatarUrl]
    );
    res.status(201).json({ id, class_id: classId, name, avatar_url: avatarUrl });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// Delete a student
app.delete('/api/students/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// ==================== ATTENDANCE ENDPOINTS ====================

// Get attendance for a class on a specific date
app.get('/api/attendance/:classId/:date', async (req: Request, res: Response) => {
  try {
    const [records] = await pool.query(
      'SELECT * FROM attendance_records WHERE class_id = ? AND date = ?',
      [req.params.classId, req.params.date]
    );
    
    const [notes] = await pool.query(
      'SELECT notes FROM daily_notes WHERE class_id = ? AND date = ?',
      [req.params.classId, req.params.date]
    );
    
    const notesArray = notes as any[];
    res.json({
      attendance: records,
      notes: notesArray.length > 0 ? notesArray[0].notes : ''
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get all attendance history for a class
app.get('/api/attendance/:classId', async (req: Request, res: Response) => {
  try {
    const [records] = await pool.query(
      'SELECT * FROM attendance_records WHERE class_id = ? ORDER BY date DESC',
      [req.params.classId]
    );
    
    const [notes] = await pool.query(
      'SELECT date, notes FROM daily_notes WHERE class_id = ?',
      [req.params.classId]
    );
    
    res.json({
      attendance: records,
      notes: notes
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
});

// Save attendance for a class on a specific date
app.post('/api/attendance/:classId/:date', async (req: Request, res: Response) => {
  const { classId, date } = req.params;
  const { attendance, notes } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Save attendance records
    for (const [studentId, status] of Object.entries(attendance)) {
      await connection.query(
        `INSERT INTO attendance_records (class_id, student_id, date, status) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE status = ?`,
        [classId, studentId, date, status, status]
      );
    }
    
    // Save or update daily notes
    if (notes !== undefined) {
      await connection.query(
        `INSERT INTO daily_notes (class_id, date, notes) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE notes = ?`,
        [classId, date, notes, notes]
      );
    }
    
    await connection.commit();
    res.json({ message: 'Attendance saved successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error saving attendance:', error);
    res.status(500).json({ error: 'Failed to save attendance' });
  } finally {
    connection.release();
  }
});

// Delete attendance for a class on a specific date
app.delete('/api/attendance/:classId/:date', async (req: Request, res: Response) => {
  const { classId, date } = req.params;
  
  try {
    await pool.query('DELETE FROM attendance_records WHERE class_id = ? AND date = ?', [classId, date]);
    await pool.query('DELETE FROM daily_notes WHERE class_id = ? AND date = ?', [classId, date]);
    res.json({ message: 'Attendance cleared successfully' });
  } catch (error) {
    console.error('Error clearing attendance:', error);
    res.status(500).json({ error: 'Failed to clear attendance' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
