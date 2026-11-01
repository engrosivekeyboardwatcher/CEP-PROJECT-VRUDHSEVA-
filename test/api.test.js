const assert = require('node:assert');
const app = require('../server/server');

let server;
const PORT = 3999;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await response.json();
  return { status: response.status, data };
}

async function runTests() {
  console.log('=== Starting VRUDHSEVA Backend API & Data Tests ===\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // Start temporary server for testing
  await new Promise((resolve) => {
    server = app.listen(PORT, '127.0.0.1', () => resolve());
  });

  try {
    // 1. Health check
    await test('GET /api/health returns online status', async () => {
      const { status, data } = await request('/api/health');
      assert.strictEqual(status, 200);
      assert.strictEqual(data.status, 'online');
      assert.strictEqual(data.system, 'Vrudhseva API Server');
    });

    // 2. Stats
    await test('GET /api/stats returns accurate facility metrics', async () => {
      const { status, data } = await request('/api/stats');
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.residents, 20);
      assert.strictEqual(data.data.staff, 5);
      assert(data.data.medication.total > 0);
    });

    // 3. Emergency Alert Trigger & Acknowledgment
    let createdAlertId;
    await test('POST /api/alerts records low-interaction emergency trigger', async () => {
      const payload = {
        need_type: 'pain',
        resident_name: 'Resident Devendra Ji',
        location_room: 'Ward A (Bed 2)'
      };
      const { status, data } = await request('/api/alerts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      assert.strictEqual(status, 201);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.need_type, 'pain');
      assert.strictEqual(data.data.status, 'pending');
      createdAlertId = data.data.id;
    });

    await test('PATCH /api/alerts/:id/acknowledge marks alert as acknowledged', async () => {
      assert(createdAlertId, 'Missing createdAlertId');
      const { status, data } = await request(`/api/alerts/${createdAlertId}/acknowledge`, {
        method: 'PATCH',
        body: JSON.stringify({ caregiver_name: 'Staff Sister Sunita' })
      });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.status, 'acknowledged');
      assert.strictEqual(data.data.acknowledged_by, 'Staff Sister Sunita');
    });

    // 4. Medication Tracker & Dynamic Adherence
    let medId;
    await test('GET /api/medications returns medications list with adherence %', async () => {
      const { status, data } = await request('/api/medications');
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert(Array.isArray(data.data));
      assert(typeof data.adherenceRate === 'number');
      medId = data.data[0].id;
    });

    await test('PATCH /api/medications/:id/status updates administration status', async () => {
      assert(medId, 'Missing medId');
      const { status, data } = await request(`/api/medications/${medId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'delayed', notes: 'Resident was sleeping' })
      });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.status, 'delayed');
    });

    // 5. Unidentified Person Registry & Search
    let caseId;
    await test('POST /api/registry adds a new unidentified resident record', async () => {
      const payload = {
        approx_age: '70 years',
        gender: 'Male',
        clothing_desc: 'Brown Kurta and white Dhoti',
        physical_marks: 'Mole on forehead',
        language_dialect: 'Marathi',
        discovery_location: 'Nagpur Central Railway Station',
        police_station_ref: 'GRP Nagpur Station Diary 54/2026',
        medical_observations: 'Mild dehydration'
      };
      const { status, data } = await request('/api/registry', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      assert.strictEqual(status, 201);
      assert.strictEqual(data.success, true);
      assert(data.data.case_number.startsWith('VRU-NGP-'));
      assert.strictEqual(data.data.status, 'Searching');
      caseId = data.data.id;
    });

    await test('GET /api/registry filters by search keyword', async () => {
      const { status, data } = await request('/api/registry?search=Station');
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert(data.data.some(c => c.discovery_location.includes('Station')));
    });

    await test('PATCH /api/registry/:id/status updates case tracking status', async () => {
      assert(caseId, 'Missing caseId');
      const { status, data } = await request(`/api/registry/${caseId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Under Verification' })
      });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.status, 'Under Verification');
    });

    // 6. Staff Handover Log
    await test('POST /api/handovers creates shift handover note', async () => {
      const payload = {
        shift: 'Morning (8 AM - 4 PM)',
        caregiver_name: 'Caregiver Meena',
        mood_behavior: 'Residents engaged in courtyard morning walk',
        diet_meals: 'Upma and milk for breakfast, dal rice lunch',
        incidents: 'None',
        sleep_pattern: 'Well rested',
        pending_tasks: 'Evening vitals monitoring'
      };
      const { status, data } = await request('/api/handovers', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      assert.strictEqual(status, 201);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.caregiver_name, 'Caregiver Meena');
    });

    // 7. Volunteer Sign-up Validation & Creation
    await test('POST /api/volunteers validates Indian mobile format and email', async () => {
      const invalid = {
        name: 'Test',
        phone: '123',
        email: 'invalid-email',
        interest_area: 'reading'
      };
      const { status, data } = await request('/api/volunteers', {
        method: 'POST',
        body: JSON.stringify(invalid)
      });
      assert.strictEqual(status, 400);
      assert.strictEqual(data.success, false);
    });

    await test('POST /api/volunteers successfully registers valid volunteer', async () => {
      const valid = {
        name: 'Anjali Sharma',
        phone: '9876543210',
        email: 'anjali@example.com',
        interest_area: 'reading'
      };
      const { status, data } = await request('/api/volunteers', {
        method: 'POST',
        body: JSON.stringify(valid)
      });
      assert.strictEqual(status, 201);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.name, 'Anjali Sharma');
    });

    // 8. Donations & Fulfillment Updates
    await test('POST /api/donations/:category/contribute increases fulfillment %', async () => {
      const { status, data } = await request('/api/donations/hygiene/contribute', {
        method: 'POST',
        body: JSON.stringify({ amount: 10 })
      });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert(data.data.percentage >= 50);
    });

    // 9. Contact Inquiries
    await test('POST /api/contacts saves contact form message', async () => {
      const payload = {
        name: 'Dr. Deshmukh',
        email: 'deshmukh@nagpurhospital.org',
        message: 'Interested in partnering for weekly geriatric medical visits.'
      };
      const { status, data } = await request('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      assert.strictEqual(status, 201);
      assert.strictEqual(data.success, true);
    });

    // 10. Groq Chatbot Health & Model Status
    await test('GET /api/chat/status returns online Groq status & active model', async () => {
      const { status, data } = await request('/api/chat/status');
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.status, 'online');
      assert.strictEqual(data.model, 'qwen/qwen3.8-27b');
    });

    // 11. Groq Chatbot Validation
    await test('POST /api/chat rejects empty message payload', async () => {
      const { status, data } = await request('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: '   ' })
      });
      assert.strictEqual(status, 400);
      assert.strictEqual(data.success, false);
      assert(data.error.includes('required'));
    });

    // 12. Groq Chatbot Dementia Care Query
    await test('POST /api/chat queries Groq Qwen model and receives caregiving response', async () => {
      const { status, data } = await request('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'How should I comfort an elderly person with dementia who is feeling anxious in the evening?'
        })
      });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert(typeof data.reply === 'string' && data.reply.length > 20);
      assert(data.model.includes('qwen') || data.model.includes('gpt'));
    });

    // 13. Telegram Caregiver Bot Status
    await test('GET /api/telegram/status returns active bot info', async () => {
      const { status, data } = await request('/api/telegram/status');
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.enabled, true);
      assert.strictEqual(data.username, 'VRUSHSEVABOT');
      assert(data.botUrl.includes('VRUSHSEVABOT'));
    });

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`\n=== Test Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

