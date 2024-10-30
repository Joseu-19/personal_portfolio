import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import cors from 'cors';  // Add this line

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());  // Add this line to enable CORS
app.use(express.json());

// SQLite Connection
let db;
(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Create the projects table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      image TEXT,
      content TEXT
    )
  `);

  // Insert sample data if the table is empty
  const projectsCount = await db.get('SELECT COUNT(*) as count FROM projects');
  if (projectsCount.count === 0) {
    await db.exec(`
      INSERT INTO projects (title, description, image, content) VALUES
      ('Project One', 'Description of Project One', 'https://via.placeholder.com/150', 'Detailed content for Project One'),
      ('Project Two', 'Description of Project Two', 'https://via.placeholder.com/150', 'Detailed content for Project Two'),
      ('Project Three', 'Description of Project Three', 'https://via.placeholder.com/150', 'Detailed content for Project Three')
    `);
  }
})();

// Routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.all('SELECT * FROM projects');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));