const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/donations - Get verified material donation requirements & fill levels
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM donations ORDER BY percentage ASC');
    const donations = stmt.all();
    res.json({ success: true, count: donations.length, data: donations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/donations/:category/contribute - Record a donation or pledge to increase fulfillment
router.post('/:category/contribute', (req, res) => {
  try {
    const { category } = req.params;
    const { amount = 5 } = req.body;

    const current = db.prepare('SELECT * FROM donations WHERE category = ?').get(category);
    if (!current) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const newFulfilled = Math.min(current.target_amount, current.fulfilled_amount + Number(amount));
    const newPercentage = Math.min(100, Math.round((newFulfilled / current.target_amount) * 100));

    db.prepare(`
      UPDATE donations 
      SET fulfilled_amount = ?, percentage = ?
      WHERE category = ?
    `).run(newFulfilled, newPercentage, category);

    const updated = db.prepare('SELECT * FROM donations WHERE category = ?').get(category);
    res.json({
      success: true,
      message: `Thank you for contributing to ${updated.title}!`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

