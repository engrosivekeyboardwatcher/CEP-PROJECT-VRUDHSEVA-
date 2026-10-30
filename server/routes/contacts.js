const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/contacts
router.get('/', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM contacts ORDER BY id DESC').all();
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/contacts - Send a message / inquiry
router.post('/', (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }

    db.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)')
      .run(name.trim(), email.trim(), message.trim());

    const saved = db.prepare('SELECT * FROM contacts ORDER BY id DESC LIMIT 1').get();
    res.status(201).json({
      success: true,
      message: 'Your inquiry has been received. Our team will get back to you shortly.',
      data: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

