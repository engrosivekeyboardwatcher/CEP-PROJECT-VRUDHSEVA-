const { db } = require('./db');

const getBotToken = () => process.env.TELEGRAM_BOT_TOKEN;
const getBotUsername = () => process.env.TELEGRAM_BOT_USERNAME || 'VRUSHSEVABOT';
const getEnvChatId = () => process.env.TELEGRAM_CHAT_ID;

let lastUpdateId = 0;
let pollerInterval = null;

/**
 * Get all active chat IDs: from DB subscribers table + optional env TELEGRAM_CHAT_ID
 */
function getTargetChatIds() {
  const ids = new Set();
  
  const envId = getEnvChatId();
  if (envId && envId.trim()) {
    ids.add(envId.trim());
  }

  try {
    const rows = db.prepare('SELECT chat_id FROM telegram_subscribers').all();
    rows.forEach(r => ids.add(String(r.chat_id)));
  } catch (err) {
    console.error('[TELEGRAM] Error fetching subscribers from DB:', err.message);
  }

  return Array.from(ids);
}

/**
 * Register a chat subscriber in the SQLite database
 */
function registerSubscriber(chatId, firstName = '', username = '') {
  try {
    const stmt = db.prepare(`
      INSERT INTO telegram_subscribers (chat_id, first_name, username)
      VALUES (?, ?, ?)
      ON CONFLICT(chat_id) DO UPDATE SET
        first_name = excluded.first_name,
        username = excluded.username
    `);
    stmt.run(String(chatId), firstName || '', username || '');
    console.log(`[TELEGRAM] Registered subscriber: ${chatId} (@${username || firstName || 'User'})`);
  } catch (err) {
    console.error('[TELEGRAM] Failed to register subscriber:', err.message);
  }
}

/**
 * Send a message via Telegram Bot HTTP API to a specific chat
 */
async function sendRawMessage(chatId, text, parseMode = 'HTML') {
  const token = getBotToken();
  if (!token) return { success: false, error: 'TELEGRAM_BOT_TOKEN not configured' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: true
      })
    });

    const data = await res.json();
    if (!data.ok) {
      console.warn(`[TELEGRAM] Send error to ${chatId}:`, data.description);
    }
    return data;
  } catch (err) {
    console.error(`[TELEGRAM] Network error sending to ${chatId}:`, err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Broadcast a notification to all subscribed Telegram users/caregivers
 */
async function broadcastTelegramNotification(htmlMessage) {
  const token = getBotToken();
  if (!token) {
    console.log('[TELEGRAM] No TELEGRAM_BOT_TOKEN set. Skipping Telegram notification.');
    return { success: false, reason: 'No token' };
  }

  const targets = getTargetChatIds();
  if (targets.length === 0) {
    console.log(`[TELEGRAM] Notification ready, but no subscribers yet. Have caregivers send /start to @${getBotUsername()}`);
    return { success: true, delivered: 0, pendingRegistration: true };
  }

  const results = await Promise.allSettled(
    targets.map(chatId => sendRawMessage(chatId, htmlMessage))
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value?.ok).length;
  console.log(`[TELEGRAM] Broadcast dispatched to ${successful}/${targets.length} subscriber(s).`);
  return { success: true, delivered: successful, total: targets.length };
}

/**
 * 1. Notification: Low-Interaction Emergency Alert (Pain, Water, Medical, etc.)
 */
async function notifyAlert(alert) {
  const iconMap = {
    pain: '⚡ PAIN ALERT',
    water: '💧 WATER REQUEST',
    food: '🍲 FOOD NEEDED',
    bathroom: '🚻 BATHROOM ASSISTANCE',
    fear: '💜 ANXIETY / COMFORT NEED',
    medical: '🚨 CRITICAL MEDICAL HELP'
  };

  const title = iconMap[alert.need_type] || `⚠️ ${String(alert.need_type).toUpperCase()} CALL`;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const msg = [
    `<b>${title}</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📍 <b>Location:</b> ${alert.location_room || 'Ward B (Bed 4)'}`,
    `👤 <b>Resident:</b> ${alert.resident_name || 'Resident / Bedside Switch'}`,
    `⏰ <b>Triggered:</b> ${timeStr}`,
    `🔔 <b>Status:</b> Immediate caregiver attention requested`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `<i>VRUDHSEVA Caregiver Emergency Dispatch</i>`
  ].join('\n');

  return broadcastTelegramNotification(msg);
}

/**
 * 2. Notification: Medication Scheduled (Resident Name, Drug, Dosage, Shift)
 */
async function notifyMedication(med) {
  const timeStr = med.scheduled_time || 'Immediate';
  const shift = med.shift || 'General';

  const msg = [
    `💊 <b>NEW MEDICATION SCHEDULED</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 <b>Resident:</b> ${med.resident_name}`,
    `💉 <b>Medicine:</b> <code>${med.drug_name}</code> (${med.dosage})`,
    `⏰ <b>Schedule Time:</b> ${timeStr}`,
    `🌅 <b>Shift:</b> ${shift}`,
    med.notes ? `📝 <b>Notes:</b> ${med.notes}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `<i>VRUDHSEVA Medication Administration System</i>`
  ].filter(Boolean).join('\n');

  return broadcastTelegramNotification(msg);
}

/**
 * 3. Notification: Volunteer Sign-Up
 */
async function notifyVolunteer(vol) {
  const msg = [
    `🤝 <b>NEW VOLUNTEER APPLICATION</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 <b>Name:</b> ${vol.name}`,
    `📞 <b>Phone:</b> ${vol.phone}`,
    `📧 <b>Email:</b> ${vol.email}`,
    `🎯 <b>Interest Area:</b> ${vol.interest_area}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `<i>VRUDHSEVA Volunteer Coordination Cell</i>`
  ].join('\n');

  return broadcastTelegramNotification(msg);
}

/**
 * 4. Notification: Shift Handover
 */
async function notifyHandover(handover) {
  const msg = [
    `📋 <b>SHIFT HANDOVER NOTE RECORDED</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌅 <b>Shift:</b> ${handover.shift}`,
    `👩‍⚕️ <b>Caregiver:</b> ${handover.caregiver_name}`,
    handover.incidents ? `⚠️ <b>Incidents:</b> ${handover.incidents}` : null,
    handover.pending_tasks ? `📌 <b>Pending:</b> ${handover.pending_tasks}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `<i>VRUDHSEVA Continuous Care Log</i>`
  ].filter(Boolean).join('\n');

  return broadcastTelegramNotification(msg);
}

/**
 * 5. Notification: Unidentified Resident Registry
 */
async function notifyRegistryCase(record) {
  const msg = [
    `🔍 <b>NEW UNIDENTIFIED RESIDENT REGISTERED</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🆔 <b>Case #:</b> <code>${record.case_number}</code>`,
    `👤 <b>Age/Gender:</b> Approx ${record.approx_age}, ${record.gender}`,
    `📍 <b>Found At:</b> ${record.discovery_location || 'Nagpur'}`,
    record.clothing_desc ? `👕 <b>Clothing:</b> ${record.clothing_desc}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `<i>VRUDHSEVA Dignity & Family Reunification Cell</i>`
  ].filter(Boolean).join('\n');

  return broadcastTelegramNotification(msg);
}

/**
 * Process incoming bot messages from caregivers (/start, /status, /test, /help)
 */
async function handleTelegramUpdate(update) {
  if (!update.message || !update.message.text) return;

  const msg = update.message;
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const fromName = msg.from?.first_name || 'Caregiver';
  const username = msg.from?.username || '';

  // Auto-subscribe the sender
  registerSubscriber(chatId, fromName, username);

  if (text.startsWith('/start')) {
    const welcomeText = [
      `🌿 <b>VRUDHSEVA (वृद्धसेवा) Caregiver Notification Bot</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Namaste <b>${fromName}</b>! You are successfully subscribed to real-time caregiver alerts for <b>Madhurangan Old Age Home</b>.`,
      ``,
      `🔔 <b>Active Alerts You Will Receive:</b>`,
      `• 🚨 Emergency Need Pad Calls (Pain, Water, Bathroom, Medical)`,
      `• 💊 Scheduled Resident Medications`,
      `• 🤝 Volunteer Sign-ups`,
      `• 📋 Staff Shift Handovers`,
      ``,
      `<b>Available Commands:</b>`,
      `/status - Check connected alerts & facility status`,
      `/test - Send a sample test notification`,
      `/help - View command help`
    ].join('\n');

    await sendRawMessage(chatId, welcomeText);
  } else if (text.startsWith('/status')) {
    try {
      const pendingAlerts = db.prepare("SELECT COUNT(*) as c FROM emergency_alerts WHERE status = 'pending'").get().c;
      const totalMeds = db.prepare("SELECT COUNT(*) as c FROM medications").get().c;
      const subCount = db.prepare("SELECT COUNT(*) as c FROM telegram_subscribers").get().c;

      const statusText = [
        `📊 <b>VRUDHSEVA Care Facility Status</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `🚨 <b>Pending Emergency Alerts:</b> ${pendingAlerts}`,
        `💊 <b>Total Medications on Roster:</b> ${totalMeds}`,
        `📱 <b>Subscribed Caregivers:</b> ${subCount}`,
        `🟢 <b>System Status:</b> Fully Online`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `Web App: http://localhost:3000`
      ].join('\n');

      await sendRawMessage(chatId, statusText);
    } catch (err) {
      await sendRawMessage(chatId, `⚠️ Status check error: ${err.message}`);
    }
  } else if (text.startsWith('/test')) {
    const testMsg = [
      `🔔 <b>TEST NOTIFICATION</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `This is a verified test notification from VRUDHSEVA.`,
      `Your Telegram connection is working perfectly!`,
      `Time: ${new Date().toLocaleTimeString()}`
    ].join('\n');

    await sendRawMessage(chatId, testMsg);
  } else if (text.startsWith('/help')) {
    const helpText = [
      `ℹ️ <b>VRUDHSEVA Bot Commands:</b>`,
      `/start - Subscribe / Refresh subscription`,
      `/status - Check live facility & alert counts`,
      `/test - Test alert delivery on your device`,
      `/help - Show this guide`
    ].join('\n');

    await sendRawMessage(chatId, helpText);
  } else {
    await sendRawMessage(
      chatId,
      `🌿 <i>Message received. Use /status for live alerts or /help for commands.</i>`
    );
  }
}

/**
 * Long-polling worker for Telegram updates
 */
async function pollTelegramUpdates() {
  const token = getBotToken();
  if (!token) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`, {
      method: 'GET'
    });

    if (!res.ok) return;

    const data = await res.json();
    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id);
        await handleTelegramUpdate(update);
      }
    }
  } catch (err) {
    // Avoid noisy logs on transient network blips
  }
}

/**
 * Start the background polling loop
 */
function startTelegramPoller() {
  const token = getBotToken();
  if (!token) {
    console.log('[TELEGRAM] No TELEGRAM_BOT_TOKEN provided. Telegram notification service inactive.');
    return;
  }

  console.log(`[TELEGRAM] Starting Telegram Caregiver Notification Service (@${getBotUsername()})...`);
  
  // Initial check
  pollTelegramUpdates();

  // Poll every 3.5 seconds
  if (pollerInterval) clearInterval(pollerInterval);
  pollerInterval = setInterval(pollTelegramUpdates, 3500);
}

function getTelegramStatus() {
  const token = getBotToken();
  const subscribersCount = db.prepare('SELECT COUNT(*) as c FROM telegram_subscribers').get()?.c || 0;
  return {
    enabled: Boolean(token),
    username: getBotUsername(),
    botUrl: `https://t.me/${getBotUsername()}`,
    subscribersCount
  };
}

module.exports = {
  notifyAlert,
  notifyMedication,
  notifyVolunteer,
  notifyHandover,
  notifyRegistryCase,
  broadcastTelegramNotification,
  startTelegramPoller,
  getTelegramStatus
};
