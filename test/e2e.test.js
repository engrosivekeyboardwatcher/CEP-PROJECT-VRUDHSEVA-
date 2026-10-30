const assert = require('node:assert');
const app = require('../server/server');

const PORT = 3998;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function runE2e() {
  console.log('=== Running Frontend-to-Backend End-to-End Asset & Integration Check ===\n');

  const server = await new Promise((resolve) => {
    const s = app.listen(PORT, '127.0.0.1', () => resolve(s));
  });

  try {
    // 1. Fetch Root Page (index.html)
    const pageRes = await fetch(`${BASE_URL}/`);
    assert.strictEqual(pageRes.status, 200);
    const html = await pageRes.text();

    assert(html.includes('id="registry"'), 'Missing #registry section in HTML');
    assert(html.includes('id="handovers"'), 'Missing #handovers section in HTML');
    assert(html.includes('id="api-status"'), 'Missing #api-status pill in HTML');
    assert(html.includes('src="app.js"'), 'Missing app.js script link in HTML');
    assert(html.includes('id="registry-modal"'), 'Missing #registry-modal in HTML');
    assert(html.includes('id="handover-modal"'), 'Missing #handover-modal in HTML');
    assert(html.includes('id="med-modal"'), 'Missing #med-modal in HTML');
    assert(html.includes('id="chatbot"'), 'Missing #chatbot section in HTML');
    assert(html.includes('id="sevabot-fab"'), 'Missing #sevabot-fab launcher button in HTML');
    assert(html.includes('id="sevabot-drawer"'), 'Missing #sevabot-drawer in HTML');
    console.log('  ✓ Root HTML serves and contains all required dynamic modules, modals, and SevaBot chatbot widgets');

    // 2. Fetch app.js JavaScript Bundle
    const scriptRes = await fetch(`${BASE_URL}/app.js`);
    assert.strictEqual(scriptRes.status, 200);
    const js = await scriptRes.text();
    assert(js.includes('API_BASE'), 'Missing API_BASE in app.js');
    assert(js.includes('loadMedications'), 'Missing loadMedications in app.js');
    assert(js.includes('loadRegistry'), 'Missing loadRegistry in app.js');
    assert(js.includes('loadHandovers'), 'Missing loadHandovers in app.js');
    assert(js.includes('notifyNeed'), 'Missing notifyNeed in app.js');
    assert(js.includes('initChatbot'), 'Missing initChatbot in app.js');
    assert(js.includes('sendChatMessage'), 'Missing sendChatMessage in app.js');
    console.log('  ✓ app.js script serves with full controller logic including Groq AI Chatbot');

    // 3. Verify API Health and Data Endpoints reachable from same origin
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    const health = await healthRes.json();
    assert.strictEqual(health.status, 'online');
    console.log('  ✓ Same-origin API /api/health responding cleanly');

    const chatStatusRes = await fetch(`${BASE_URL}/api/chat/status`);
    assert.strictEqual(chatStatusRes.status, 200);
    const chatStatus = await chatStatusRes.json();
    assert.strictEqual(chatStatus.status, 'online');
    console.log(`  ✓ Chatbot API online with model: ${chatStatus.model}`);

    const regRes = await fetch(`${BASE_URL}/api/registry`);
    assert.strictEqual(regRes.status, 200);
    const reg = await regRes.json();
    assert(reg.count > 0, 'Registry should have initial seeded cases');
    console.log(`  ✓ Unidentified registry API loaded ${reg.count} cases`);

    console.log('\n=== All E2E Integration Checks Passed! ===');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

runE2e().catch((err) => {
  console.error('E2E verification failed:', err);
  process.exit(1);
});

