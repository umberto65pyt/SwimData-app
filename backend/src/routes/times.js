const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all times for an athlete
router.get('/athlete/:athleteId', (req, res) => {
  try {
    const { athleteId } = req.params;
    db.all(
      `SELECT * FROM swim_times 
       WHERE athlete_id = ? 
       ORDER BY recorded_date DESC`,
      [athleteId],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch times' });
        }
        res.json(rows);
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch times' });
  }
});

// Get specific time record
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.get('SELECT * FROM swim_times WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch time record' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Time record not found' });
      }
      res.json(row);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch time record' });
  }
});

// Create new time record
router.post('/', (req, res) => {
  try {
    const { athlete_id, distance, stroke, time_seconds, recorded_date, competition_name } = req.body;

    if (!athlete_id || !distance || !stroke || !time_seconds || !recorded_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if this is a personal best
    db.get(
      `SELECT MIN(time_seconds) as best_time FROM swim_times 
       WHERE athlete_id = ? AND distance = ? AND stroke = ?`,
      [athlete_id, distance, stroke],
      (err, pbResult) => {
        const is_pb = !pbResult || !pbResult.best_time || time_seconds < pbResult.best_time;

        db.run(
          `INSERT INTO swim_times (athlete_id, distance, stroke, time_seconds, recorded_date, competition_name, is_personal_best)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [athlete_id, distance, stroke, time_seconds, recorded_date, competition_name, is_pb ? 1 : 0],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Failed to create time record' });
            }
            db.get('SELECT * FROM swim_times WHERE id = ?', [this.lastID], (err, row) => {
              res.status(201).json(row);
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create time record' });
  }
});

// Update time record
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { distance, stroke, time_seconds, recorded_date, competition_name } = req.body;

    db.run(
      `UPDATE swim_times 
       SET distance = ?, stroke = ?, time_seconds = ?, recorded_date = ?, competition_name = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [distance, stroke, time_seconds, recorded_date, competition_name, id],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update time record' });
        }
        db.get('SELECT * FROM swim_times WHERE id = ?', [id], (err, row) => {
          if (!row) {
            return res.status(404).json({ error: 'Time record not found' });
          }
          res.json(row);
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update time record' });
  }
});

// Delete time record
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('DELETE FROM swim_times WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete time record' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Time record not found' });
      }
      res.json({ message: 'Time record deleted successfully' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete time record' });
  }
});

module.exports = router;
