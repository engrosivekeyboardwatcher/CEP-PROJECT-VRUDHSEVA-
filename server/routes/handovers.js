const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/handovers - Get recent handover logs
router.get('/', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const stmt = db.prepare('SELECT * FROM staff_handovers ORDER BY id DESC LIMIT ?');
    const logs = stmt.all(Number(limit));

    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/handovers - Add new shift handover record
router.post('/', (req, res) => {
  try {
    const {
      shift,
      caregiver_name,
      mood_behavior,
      diet_meals,
      incidents,
      sleep_pattern,
      pending_tasks
    } = req.body;

    if (!shift || !caregiver_name) {
      return res.status(400).json({
        success: false,
        error: 'Shift and Caregiver Name are required'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO staff_handovers (
        shift, caregiver_name, mood_behavior, diet_meals, incidents, sleep_pattern, pending_tasks
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      shift,
      caregiver_name,
      mood_behavior || 'Residents calm and settled',
      diet_meals || 'Regular meals consumed satisfactorily',
      incidents || 'None reported',
      sleep_pattern || 'Normal restful sleep observed',
      pending_tasks || 'None pending'
    );

    const latest = db.prepare('SELECT * FROM staff_handovers ORDER BY id DESC LIMIT 1').get();
    res.status(201).json({ success: true, message: 'Handover report filed successfully', data: latest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

