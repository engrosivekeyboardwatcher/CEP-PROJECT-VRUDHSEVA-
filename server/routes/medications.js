const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/medications - Get shift-wise medication roster and current adherence
router.get('/', (req, res) => {
  try {
    const { shift } = req.query;
    let query = 'SELECT * FROM medications';
    const params = [];

    if (shift && shift !== 'all') {
      query += ' WHERE shift = ?';
      params.push(shift);
    }
    query += ' ORDER BY scheduled_time ASC';

    const stmt = db.prepare(query);
    const meds = stmt.all(...params);

    // Calculate adherence percentage
    const allMeds = db.prepare('SELECT status FROM medications').all();
    const total = allMeds.length;
    const givenCount = allMeds.filter(m => m.status === 'given').length;
    const adherenceRate = total > 0 ? Math.round((givenCount / total) * 100) : 0;

    res.json({
      success: true,
      adherenceRate,
      totalCount: total,
      givenCount,
      data: meds
    });
  } catch (err) {
    console.error('Error fetching medications:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/medications - Add a new medication entry
router.post('/', (req, res) => {
  try {
    const { resident_name, drug_name, dosage, scheduled_time, shift, notes } = req.body;
    if (!resident_name || !drug_name || !dosage || !scheduled_time) {
      return res.status(400).json({
        success: false,
        error: 'resident_name, drug_name, dosage, and scheduled_time are required'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO medications (resident_name, drug_name, dosage, scheduled_time, shift, status, notes)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `);

    stmt.run(resident_name, drug_name, dosage, scheduled_time, shift || 'Morning', notes || '');
    const newMed = db.prepare('SELECT * FROM medications ORDER BY id DESC LIMIT 1').get();

    // Asynchronously dispatch real-time notification to Telegram Caregiver Bot
    try {
      const { notifyMedication } = require('../telegram');
      notifyMedication(newMed).catch(err => console.warn('[TELEGRAM MEDICATION DISPATCH ERROR]', err.message));
    } catch (e) {}

    res.status(201).json({ success: true, message: 'Medication scheduled successfully', data: newMed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/medications/:id/status - Update administration status (given, delayed, missed, pending)
router.patch('/:id/status', (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowed = ['given', 'delayed', 'missed', 'pending'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${allowed.join(', ')}` });
    }

    let query = 'UPDATE medications SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status];

    if (notes !== undefined) {
      query += ', notes = ?';
      params.push(notes);
    }
    query += ' WHERE id = ?';
    params.push(req.params.id);

    const stmt = db.prepare(query);
    stmt.run(...params);

    const updated = db.prepare('SELECT * FROM medications WHERE id = ?').get(req.params.id);

    // Recompute adherence rate
    const allMeds = db.prepare('SELECT status FROM medications').all();
    const total = allMeds.length;
    const givenCount = allMeds.filter(m => m.status === 'given').length;
    const adherenceRate = total > 0 ? Math.round((givenCount / total) * 100) : 0;

    res.json({
      success: true,
      message: `Medication marked as ${status}`,
      adherenceRate,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

