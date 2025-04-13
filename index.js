const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

app.use(express.json());

// Connect to SQLite DB (stored locally)
const db = new sqlite3.Database('./todos.db');

// Create table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0
)`);

// 📌 1. Create a Todo (POST)
app.post('/todos', (req, res) => {
  const { task } = req.body;
  db.run(`INSERT INTO todos (task) VALUES (?)`, [task], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, task, completed: false });
  });
});

// 📌 2. Read All Todos (GET)
app.get('/todos', (req, res) => {
  db.all(`SELECT * FROM todos`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 📌 3. Update a Todo (PUT)
app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;
  db.run(`UPDATE todos SET task = ?, completed = ? WHERE id = ?`,
    [task, completed, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// 📌 4. Delete a Todo (DELETE)
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM todos WHERE id = ?`, id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
