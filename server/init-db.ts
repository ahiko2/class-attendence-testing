import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'class_attendance'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'class_attendance'}' created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'class_attendance'}`);

    // Create classes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "classes" created or already exists');

    // Create students table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(50) PRIMARY KEY,
        class_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        INDEX idx_class_id (class_id)
      )
    `);
    console.log('✅ Table "students" created or already exists');

    // Create attendance_records table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id VARCHAR(50) NOT NULL,
        student_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        status ENUM('Present', 'Absent', 'Late', 'Unmarked') DEFAULT 'Unmarked',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attendance (class_id, student_id, date),
        INDEX idx_class_date (class_id, date),
        INDEX idx_student_date (student_id, date)
      )
    `);
    console.log('✅ Table "attendance_records" created or already exists');

    // Create daily_notes table for storing notes per class per day
    await connection.query(`
      CREATE TABLE IF NOT EXISTS daily_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_daily_note (class_id, date)
      )
    `);
    console.log('✅ Table "daily_notes" created or already exists');

    console.log('\n🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run initialization
initializeDatabase().catch(console.error);
