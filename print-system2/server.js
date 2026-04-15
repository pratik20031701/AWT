require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./config/db');
const fileService = require('./services/fileService');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────────
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// ── Page routes ──────────────────────────────────────────────────
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'landing.html'))
);
app.get('/shop/:shopId', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'shop.html'))
);
app.get('/dashboard', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'))
);

// ── API routes ───────────────────────────────────────────────────
app.use('/api', require('./routes/index'));

// ── Health check ─────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'OK', db: 'JSON' }));

// ── Error handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// ── Start ────────────────────────────────────────────────────────
db.init();
fileService.ensureUploadDir();

app.listen(PORT, () => {
  console.log(`\n🚀  PrintDesk Server Running\n`);
  console.log(`   🌐 Open: http://localhost:${PORT}`);
  console.log(`   📝 Register your shop and start printing!\n`);
});

module.exports = app;
