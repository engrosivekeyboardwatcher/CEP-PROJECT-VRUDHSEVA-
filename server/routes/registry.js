const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/registry - Fetch all unidentified cases with optional search/filter
router.get('/', (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM unidentified_registry WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ` AND (case_number LIKE ? OR clothing_desc LIKE ? OR physical_marks LIKE ? OR discovery_location LIKE ? OR language_dialect LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY id DESC';
    const stmt = db.prepare(query);
    const cases = stmt.all(...params);

    res.json({ success: true, count: cases.length, data: cases });
  } catch (err) {
    console.error('Error fetching registry:', err);
    res.status(500).json({ success: false, error: 'Database error fetching registry records' });
  }
});

// GET /api/registry/:id - Get single record
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM unidentified_registry WHERE id = ?');
    const record = stmt.get(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/registry - Register new unidentified senior
router.post('/', (req, res) => {
  try {
    const {
      approx_age,
      gender,
      clothing_desc,
      physical_marks,
      language_dialect,
      discovery_location,
      police_station_ref,
      medical_observations,
      photo_url
    } = req.body;

    if (!approx_age || !gender || !clothing_desc) {
      return res.status(400).json({
        success: false,
        error: 'Approximate age, gender, and clothing description are required'
      });
    }

    // Auto-generate case number
    const countStmt = db.prepare('SELECT COUNT(*) as total FROM unidentified_registry');
    const total = (countStmt.get().total || 0) + 1;
    const case_number = `VRU-NGP-${new Date().getFullYear()}-${String(total).padStart(3, '0')}`;
    const arrival_date = new Date().toISOString().split('T')[0];

    const insertStmt = db.prepare(`
      INSERT INTO unidentified_registry (
        case_number, approx_age, gender, clothing_desc, physical_marks,
        language_dialect, discovery_location, police_station_ref,
        medical_observations, status, photo_url, arrival_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Searching', ?, ?)
    `);

    insertStmt.run(
      case_number,
      approx_age,
      gender,
      clothing_desc,
      physical_marks || 'None observed',
      language_dialect || 'Marathi / Hindi',
      discovery_location || 'Nagpur area',
      police_station_ref || 'Local Police Diary Ref Pending',
      medical_observations || 'Routine vitals stable; memory assessment scheduled',
      photo_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80',
      arrival_date
    );

    const newRecord = db.prepare('SELECT * FROM unidentified_registry WHERE case_number = ?').get(case_number);
    res.status(201).json({ success: true, message: 'Unidentified resident registered successfully', data: newRecord });
  } catch (err) {
    console.error('Error registering case:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/registry/:id/status - Update tracing status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Searching', 'Under Verification', 'Reunified'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const stmt = db.prepare('UPDATE unidentified_registry SET status = ? WHERE id = ?');
    stmt.run(status, req.params.id);

    const updated = db.prepare('SELECT * FROM unidentified_registry WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: `Status updated to ${status}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

