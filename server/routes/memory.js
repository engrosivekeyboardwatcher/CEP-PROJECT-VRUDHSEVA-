const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/memory - Get memory aid profiles
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM memory_profiles ORDER BY id ASC');
    const profiles = stmt.all();
    res.json({ success: true, count: profiles.length, data: profiles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/memory - Add memory profile
router.post('/', (req, res) => {
  try {
    const { resident_name, preferred_name, hometown, favorite_songs, calming_cues, hobbies, routine_anchor } = req.body;
    if (!resident_name) {
      return res.status(400).json({ success: false, error: 'resident_name is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO memory_profiles (
        resident_name, preferred_name, hometown, favorite_songs, calming_cues, hobbies, routine_anchor
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      resident_name,
      preferred_name || resident_name,
      hometown || 'Nagpur region',
      favorite_songs || '',
      calming_cues || '',
      hobbies || '',
      routine_anchor || ''
    );

    const created = db.prepare('SELECT * FROM memory_profiles ORDER BY id DESC LIMIT 1').get();
    res.status(201).json({ success: true, message: 'Memory profile created', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

