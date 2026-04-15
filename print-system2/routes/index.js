const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const shopCtrl = require('../controllers/shopController');
const uploadCtrl = require('../controllers/uploadController');
const paymentCtrl = require('../controllers/paymentController');
const queueCtrl = require('../controllers/queueController');
const authCtrl = require('../controllers/authController');

// ── Multer setup ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_DIR || './uploads';
    const fs = require('fs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed'));
    }
  }
});

// ── Auth routes ─────────────────────────────────────────────────
router.post('/auth/register',          authCtrl.register);
router.post('/auth/login',             authCtrl.login);
router.post('/auth/logout',            authCtrl.logout);
router.get('/auth/verify',             authCtrl.verifySession);

// ── Shop routes ─────────────────────────────────────────────────
router.get('/shops',               shopCtrl.getAllShops);
router.post('/shops',              shopCtrl.createShop);
router.get('/shops/:shopId',       shopCtrl.getShop);
router.put('/shops/:shopId',       shopCtrl.updateShop);
router.get('/shops/:shopId/qr',    shopCtrl.downloadQR);

// ── Upload routes ───────────────────────────────────────────────
router.post('/upload/:shopId',     upload.single('file'), uploadCtrl.uploadFile);
router.get('/upload/:uploadId',    uploadCtrl.getUpload);

// ── Payment routes ──────────────────────────────────────────────
router.get('/payment/config',                         paymentCtrl.getConfig);
router.post('/payment/:uploadId',                     paymentCtrl.createPayment);
router.get('/payment/:paymentId/status',              paymentCtrl.getStatus);
router.get('/payment/shop/:shopId/pending',           paymentCtrl.getPending);
router.post('/payment/:paymentId/verify',             paymentCtrl.verify);

// ── Queue routes ─────────────────────────────────────────────────
router.get('/queue/position/:requestId',  queueCtrl.getPosition);
router.get('/queue/:requestId/file',      queueCtrl.downloadJob);
router.post('/queue/:requestId/complete', queueCtrl.completeJob);
router.get('/queue/:shopId',              queueCtrl.getQueue);

module.exports = router;
