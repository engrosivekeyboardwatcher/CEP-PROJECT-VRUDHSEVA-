const path = require('node:path');

// Auto-load .env file if present
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch {
  // .env may not exist in production or CI/CD
}

const express = require('express');
const cors = require('cors');

// Import database (auto-initializes tables and seeds)
const { db } = require('./db');

// Import API routes
const registryRouter = require('./routes/registry');
const alertsRouter = require('./routes/alerts');
const medicationsRouter = require('./routes/medications');
const handoversRouter = require('./routes/handovers');
const volunteersRouter = require('./routes/volunteers');
const donationsRouter = require('./routes/donations');
const memoryRouter = require('./routes/memory');
const statsRouter = require('./routes/stats');
const contactsRouter = require('./routes/contacts');
const chatbotRouter = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/registry', registryRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/medications', medicationsRouter);
app.use('/api/handovers', handoversRouter);
app.use('/api/volunteers', volunteersRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/stats', statsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/chat', chatbotRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Vrudhseva API Server',
    facility: 'Madhurangan Old Age Home (Nagpur)',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static assets from project root
const staticPath = path.resolve(__dirname, '..');
app.use(express.static(staticPath));

// Fallback for single-page routing
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start Server
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  VRUDHSEVA (वृद्धसेवा) Server Running`);
    console.log(`  Local URL:    http://localhost:${PORT}`);
    console.log(`  API Health:   http://localhost:${PORT}/api/health`);
    console.log(`  Static Root:  ${staticPath}`);
    console.log(`====================================================`);
  });

  const shutdown = () => {
    console.log('\nShutting down Vrudhseva server...');
    server.close(() => {
      console.log('Server closed gracefully.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = app;
