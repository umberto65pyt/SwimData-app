const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get athlete performance analysis
router.get('/athlete/:athleteId', (req, res) => {
  try {
    const { athleteId } = req.params;
    
    db.all(
      `SELECT 
        a.id,
        a.first_name,
        a.last_name,
        st.distance,
        st.stroke,
        st.time_seconds,
        st.recorded_date,
        b.age_group,
        b.elite_time_seconds,
        b.gold_time_seconds,
        b.silver_time_seconds,
        b.bronze_time_seconds,
        CASE 
          WHEN st.time_seconds <= b.elite_time_seconds THEN 'Elite'
          WHEN st.time_seconds <= b.gold_time_seconds THEN 'Gold'
          WHEN st.time_seconds <= b.silver_time_seconds THEN 'Silver'
          WHEN st.time_seconds <= b.bronze_time_seconds THEN 'Bronze'
          ELSE 'Developing'
        END AS rating
      FROM athletes a
      LEFT JOIN swim_times st ON a.id = st.athlete_id
      LEFT JOIN benchmarks b ON st.distance = b.distance 
        AND st.stroke = b.stroke 
        AND a.gender = b.gender
      WHERE a.id = ?
      ORDER BY st.recorded_date DESC`,
      [athleteId],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch performance data' });
        }
        if (rows.length === 0) {
          return res.status(404).json({ error: 'No performance data found' });
        }
        res.json(rows);
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Get performance summary for athlete
router.get('/summary/:athleteId', (req, res) => {
  try {
    const { athleteId } = req.params;

    db.get(
      `SELECT 
        a.id,
        a.first_name,
        a.last_name,
        a.date_of_birth,
        COUNT(DISTINCT st.id) AS total_times,
        SUM(CASE WHEN st.is_personal_best THEN 1 ELSE 0 END) AS personal_bests,
        MAX(st.recorded_date) AS last_recorded
      FROM athletes a
      LEFT JOIN swim_times st ON a.id = st.athlete_id
      WHERE a.id = ?
      GROUP BY a.id`,
      [athleteId],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch performance summary' });
        }
        if (!row) {
          return res.status(404).json({ error: 'Athlete not found' });
        }
        res.json(row);
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch performance summary' });
  }
});

// Compare athlete to benchmark
router.get('/compare/:athleteId/:distance/:stroke', (req, res) => {
  try {
    const { athleteId, distance, stroke } = req.params;

    // Get athlete's best time for this distance/stroke
    db.get(
      `SELECT 
        a.*,
        MIN(st.time_seconds) as best_time,
        MAX(st.recorded_date) as date_of_best
      FROM athletes a
      LEFT JOIN swim_times st ON a.id = st.athlete_id
      WHERE a.id = ? AND st.distance = ? AND st.stroke = ?
      GROUP BY a.id`,
      [athleteId, parseInt(distance), stroke],
      (err, athlete) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!athlete) {
          return res.status(404).json({ error: 'Athlete not found' });
        }

        // Calculate age group
        const birthDate = new Date(athlete.date_of_birth);
        const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

        let ageGroup;
        if (age >= 12 && age <= 13) ageGroup = '12-13';
        else if (age >= 14 && age <= 15) ageGroup = '14-15';
        else if (age >= 16 && age <= 17) ageGroup = '16-17';
        else ageGroup = null;

        // Get benchmark
        if (ageGroup) {
          db.get(
            `SELECT * FROM benchmarks 
             WHERE age_group = ? AND gender = ? AND distance = ? AND stroke = ?`,
            [ageGroup, athlete.gender, parseInt(distance), stroke],
            (err, benchmark) => {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
              }

              // Calculate rating
              let rating = 'No benchmark';
              if (benchmark && athlete.best_time) {
                if (athlete.best_time <= benchmark.elite_time_seconds) rating = 'Elite';
                else if (athlete.best_time <= benchmark.gold_time_seconds) rating = 'Gold';
                else if (athlete.best_time <= benchmark.silver_time_seconds) rating = 'Silver';
                else if (athlete.best_time <= benchmark.bronze_time_seconds) rating = 'Bronze';
                else rating = 'Developing';
              }

              res.json({
                athlete: {
                  id: athlete.id,
                  name: `${athlete.first_name} ${athlete.last_name}`,
                  age,
                  ageGroup: ageGroup || 'N/A',
                  gender: athlete.gender,
                },
                performance: {
                  distance,
                  stroke,
                  bestTime: athlete.best_time,
                  dateOfBest: athlete.date_of_best,
                  rating,
                },
                benchmark: benchmark || null,
              });
            }
          );
        } else {
          res.json({
            athlete: {
              id: athlete.id,
              name: `${athlete.first_name} ${athlete.last_name}`,
              age,
              ageGroup: 'N/A',
              gender: athlete.gender,
            },
            performance: {
              distance,
              stroke,
              bestTime: athlete.best_time,
              dateOfBest: athlete.date_of_best,
              rating: 'No benchmark',
            },
            benchmark: null,
          });
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to compare performance' });
  }
});

module.exports = router;
