const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const crypto = require('crypto');

// Simple password hashing (in production, use bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Register new shop
exports.register = async (req, res) => {
  try {
    const { shop_name, email, password, upi_id, phone } = req.body;

    // Validation
    if (!shop_name || !email || !password) {
      return res.status(400).json({ error: 'Shop name, email, and password are required' });
    }

    // Check if email already exists
    const existing = db.findOne('shops', { email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Generate unique shop ID
    const shop_id = 'S' + Date.now().toString().slice(-6);

    // Create shop account
    const shop = db.insert('shops', {
      shop_id,
      shop_name,
      email,
      password: hashPassword(password),
      upi_id: upi_id || '',
      phone: phone || '',
      bw_rate: parseFloat(process.env.BW_RATE_PER_PAGE) || 5,
      color_rate: parseFloat(process.env.COLOR_RATE_PER_PAGE) || 10,
      is_active: true
    });

    // Generate QR code URL (will be generated on first access)
    const QRCode = require('qrcode');
    const qr_code = await QRCode.toDataURL(
      `${process.env.APP_URL}/shop/${shop_id}`
    );
    
    db.update('shops', { shop_id }, { qr_code });

    // Create session token
    const token = uuidv4();
    db.insert('sessions', {
      session_id: token,
      shop_id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });

    res.json({
      success: true,
      data: {
        token,
        shop_id,
        shop_name,
        email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const shop = db.findOne('shops', { email });
    if (!shop || shop.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create session token
    const token = uuidv4();
    db.insert('sessions', {
      session_id: token,
      shop_id: shop.shop_id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    res.json({
      success: true,
      data: {
        token,
        shop_id: shop.shop_id,
        shop_name: shop.shop_name,
        email: shop.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout
exports.logout = (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      db.remove('sessions', { session_id: token });
    }
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify session
exports.verifySession = (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = db.findOne('sessions', { session_id: token });
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      db.remove('sessions', { session_id: token });
      return res.status(401).json({ error: 'Session expired' });
    }

    const shop = db.findOne('shops', { shop_id: session.shop_id });
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json({
      success: true,
      data: {
        shop_id: shop.shop_id,
        shop_name: shop.shop_name,
        email: shop.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Middleware to check auth
exports.requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const session = db.findOne('sessions', { session_id: token });
    if (!session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.shop_id = session.shop_id;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
