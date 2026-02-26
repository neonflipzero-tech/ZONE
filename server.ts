import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';

const db = new Database('leaderboard.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    level INTEGER,
    xp INTEGER,
    equippedFrame TEXT,
    equippedTitle TEXT,
    lastActive INTEGER
  )
`);

try {
  db.exec(`ALTER TABLE users ADD COLUMN profilePicture TEXT`);
} catch (e) {
  // Column already exists, ignore
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.post('/api/leaderboard', (req, res) => {
    const { username, level, xp, equippedFrame, equippedTitle, profilePicture } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO users (username, level, xp, equippedFrame, equippedTitle, profilePicture, lastActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(username) DO UPDATE SET
        level = excluded.level,
        xp = excluded.xp,
        equippedFrame = excluded.equippedFrame,
        equippedTitle = excluded.equippedTitle,
        profilePicture = excluded.profilePicture,
        lastActive = excluded.lastActive
    `);
    
    stmt.run(username, level, xp, equippedFrame, equippedTitle, profilePicture, Date.now());
    res.json({ success: true });
  });

  app.get('/api/leaderboard', (req, res) => {
    // Get top 50 users sorted by level DESC, xp DESC
    const stmt = db.prepare(`
      SELECT username, level, xp, equippedFrame, equippedTitle, profilePicture 
      FROM users 
      ORDER BY level DESC, xp DESC 
      LIMIT 50
    `);
    const users = stmt.all();
    res.json(users);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
