const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/volunteers - Fetch registered volunteers
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM volunteers ORDER BY id DESC');
    const list = stmt.all();
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/volunteers - Sign up as a volunteer
router.post('/', (req, res) => {
  try {
    const { name, phone, email, interest_area } = req.body;

    if (!name || !phone || !email || !interest_area) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, email, and interest area are all required'
      });
    }

    const cleanPhone = String(phone).replace(/\s+/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit Indian mobile number'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO volunteers (name, phone, email, interest_area, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);

    stmt.run(name.trim(), cleanPhone, email.trim(), interest_area);
    const newVol = db.prepare('SELECT * FROM volunteers ORDER BY id DESC LIMIT 1').get();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your volunteer application has been submitted to the home coordinator.',
      data: newVol
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

