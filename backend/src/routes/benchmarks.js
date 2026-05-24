const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all benchmarks
router.get('/', (req, res) => {
  try {
    db.all(
      `SELECT * FROM benchmarks 
       ORDER BY age_group, gender, distance, stroke`,
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch benchmarks' });
        }
        res.json(rows);
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks' });
  }
});

// Get benchmark by age group, distance, and stroke
router.get('/:ageGroup/:distance/:stroke', (req, res) => {
  try {
    const { ageGroup, distance, stroke } = req.params;
    db.all(
      `SELECT * FROM benchmarks 
       WHERE age_group = ? AND distance = ? AND stroke = ?`,
      [ageGroup, parseInt(distance), stroke],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch benchmark' });
        }
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Benchmark not found' });
        }
        res.json(rows);
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch benchmark' });
  }
});

// Get benchmarks by age group and gender
router.get('/filter', (req, res) => {
  try {
    const { ageGroup, gender } = req.query;
    
    let query = 'SELECT * FROM benchmarks WHERE 1=1';
    const params = [];

    if (ageGroup) {
      query += ` AND age_group = ?`;
      params.push(ageGroup);
    }

    if (gender) {
      query += ` AND gender = ?`;
      params.push(gender);
    }

    query += ' ORDER BY distance, stroke';

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch benchmarks' });
      }
      res.json(rows);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks' });
  }
});

// Create new benchmark
router.post('/', (req, res) => {
  try {
    const { age_group, gender, distance, stroke, bronze_time_seconds, silver_time_seconds, gold_time_seconds, elite_time_seconds, source } = req.body;

    if (!age_group || !gender || !distance || !stroke) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
      `INSERT INTO benchmarks (age_group, gender, distance, stroke, bronze_time_seconds, silver_time_seconds, gold_time_seconds, elite_time_seconds, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [age_group, gender, distance, stroke, bronze_time_seconds, silver_time_seconds, gold_time_seconds, elite_time_seconds, source],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create benchmark' });
        }
        db.get('SELECT * FROM benchmarks WHERE id = ?', [this.lastID], (err, row) => {
          res.status(201).json(row);
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create benchmark' });
  }
});

// Update benchmark
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { bronze_time_seconds, silver_time_seconds, gold_time_seconds, elite_time_seconds, source } = req.body;

    db.run(
      `UPDATE benchmarks 
       SET bronze_time_seconds = ?, silver_time_seconds = ?, gold_time_seconds = ?, elite_time_seconds = ?, source = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [bronze_time_seconds, silver_time_seconds, gold_time_seconds, elite_time_seconds, source, id],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update benchmark' });
        }
        db.get('SELECT * FROM benchmarks WHERE id = ?', [id], (err, row) => {
          if (!row) {
            return res.status(404).json({ error: 'Benchmark not found' });
          }
          res.json(row);
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update benchmark' });
  }
});

module.exports = router;
