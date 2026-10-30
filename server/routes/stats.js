const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/stats - Dynamic system dashboard analytics
router.get('/', (req, res) => {
  try {
    const residentsTotal = 20; // Madhurangan current capacity
    const staffCount = 5;      // Full-time caregivers & head

    const unidentifiedTotal = db.prepare('SELECT COUNT(*) as count FROM unidentified_registry').get().count;
    const searchingCases = db.prepare("SELECT COUNT(*) as count FROM unidentified_registry WHERE status = 'Searching'").get().count;
    const reunifiedCases = db.prepare("SELECT COUNT(*) as count FROM unidentified_registry WHERE status = 'Reunified'").get().count;

    const pendingAlerts = db.prepare("SELECT COUNT(*) as count FROM emergency_alerts WHERE status = 'pending'").get().count;
    const totalAlerts = db.prepare('SELECT COUNT(*) as count FROM emergency_alerts').get().count;

    const allMeds = db.prepare('SELECT status FROM medications').all();
    const medTotal = allMeds.length;
    const givenCount = allMeds.filter(m => m.status === 'given').length;
    const adherence = medTotal > 0 ? Math.round((givenCount / medTotal) * 100) : 0;

    const volunteerCount = db.prepare('SELECT COUNT(*) as count FROM volunteers').get().count;
    const handoverCount = db.prepare('SELECT COUNT(*) as count FROM staff_handovers').get().count;

    res.json({
      success: true,
      data: {
        residents: residentsTotal,
        staff: staffCount,
        features: 14,
        languages: 3,
        unidentified: {
          total: unidentifiedTotal,
          searching: searchingCases,
          reunified: reunifiedCases
        },
        alerts: {
          pending: pendingAlerts,
          total: totalAlerts
        },
        medication: {
          total: medTotal,
          given: givenCount,
          adherenceRate: adherence
        },
        volunteers: volunteerCount,
        handovers: handoverCount,
        serverTime: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

