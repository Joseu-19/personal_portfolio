import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
})();

// Routes

// Get latest 5 projects
app.get('/api/projects/latest', async (req, res) => {
  try {
    const projects = await db.all('SELECT * FROM projects ORDER BY id DESC LIMIT 5');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

// Add new project
app.post('/api/projects', async (req, res) => {
  const { title, description, image, content } = req.body;
  try {
    const result = await db.run(`
      INSERT INTO projects (title, description, image, content)
      VALUES (?, ?, ?, ?)
    `, [title, description, image, content]);
    res.status(201).json({ id: result.lastID, title, description, image, content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  const { title, description, image, content } = req.body;
  try {
    const result = await db.run(`
      UPDATE projects
      SET title = ?, description = ?, image = ?, content = ?
      WHERE id = ?
    `, [title, description, image, content, req.params.id]);
    if (result.changes === 0) return res.status(404).json({ message: 'Project not found' });
    res.json({ id: req.params.id, title, description, image, content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const result = await db.run(`
      DELETE FROM projects WHERE id = ?
    `, [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));