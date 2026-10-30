const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/alerts - Fetch recent emergency alerts
router.get('/', (req, res) => {
  try {
    const { limit = 20, status } = req.query;
    let query = 'SELECT * FROM emergency_alerts';
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));

    const stmt = db.prepare(query);
    const alerts = stmt.all(...params);

    const pendingCountStmt = db.prepare("SELECT COUNT(*) as pending FROM emergency_alerts WHERE status = 'pending'");
    const pendingCount = pendingCountStmt.get().pending;

    res.json({
      success: true,
      pendingCount,
      count: alerts.length,
      data: alerts
    });
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/alerts - Trigger a new emergency alert (Low-Interaction Need Pad)
router.post('/', (req, res) => {
  try {
    const { need_type, resident_name, location_room } = req.body;
    const validNeeds = ['pain', 'water', 'food', 'bathroom', 'fear', 'medical'];

    if (!need_type || !validNeeds.includes(need_type)) {
      return res.status(400).json({
        success: false,
        error: `need_type must be one of: ${validNeeds.join(', ')}`
      });
    }

    const stmt = db.prepare(`
      INSERT INTO emergency_alerts (need_type, resident_name, location_room, status)
      VALUES (?, ?, ?, 'pending')
    `);

    stmt.run(
      need_type,
      resident_name || 'Resident / Bedside Switch',
      location_room || 'Ward B (Bed 4)'
    );

    const latest = db.prepare('SELECT * FROM emergency_alerts ORDER BY id DESC LIMIT 1').get();

    res.status(201).json({
      success: true,
      message: 'Emergency trigger recorded; caregiver notified',
      data: latest
    });
  } catch (err) {
    console.error('Error creating alert:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/alerts/:id/acknowledge - Caregiver acknowledges the alert
router.patch('/:id/acknowledge', (req, res) => {
  try {
    const { caregiver_name = 'On-duty Caregiver' } = req.body;
    const stmt = db.prepare(`
      UPDATE emergency_alerts 
      SET status = 'acknowledged', acknowledged_at = CURRENT_TIMESTAMP, acknowledged_by = ?
      WHERE id = ?
    `);
    stmt.run(caregiver_name, req.params.id);

    const updated = db.prepare('SELECT * FROM emergency_alerts WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'Alert acknowledged', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

