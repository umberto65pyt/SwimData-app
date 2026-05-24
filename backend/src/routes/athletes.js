const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all athletes
router.get('/', (req, res) => {
  db.all('SELECT * FROM athletes ORDER BY last_name, first_name', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch athletes' });
    }
    res.json(rows);
  });
});

// Get athlete by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM athletes WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch athlete' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Athlete not found' });
    }
    res.json(row);
  });
});

// Create new athlete
router.post('/', (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, gender, club_name, email } = req.body;

    if (!first_name || !last_name || !date_of_birth || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
      `INSERT INTO athletes (first_name, last_name, date_of_birth, gender, club_name, email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, date_of_birth, gender, club_name, email],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create athlete' });
        }
        db.get('SELECT * FROM athletes WHERE id = ?', [this.lastID], (err, row) => {
          res.status(201).json(row);
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create athlete' });
  }
});

// Update athlete
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, date_of_birth, gender, club_name, email } = req.body;

    db.run(
      `UPDATE athletes 
       SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, club_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [first_name, last_name, date_of_birth, gender, club_name, email, id],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update athlete' });
        }
        db.get('SELECT * FROM athletes WHERE id = ?', [id], (err, row) => {
          if (!row) {
            return res.status(404).json({ error: 'Athlete not found' });
          }
          res.json(row);
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update athlete' });
  }
});

// Delete athlete
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('DELETE FROM athletes WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete athlete' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Athlete not found' });
      }
      res.json({ message: 'Athlete deleted successfully' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete athlete' });
  }
});

module.exports = router;
