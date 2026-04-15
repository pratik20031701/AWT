const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const queueService = require('../services/queueService');

// Customer requests to pay
exports.createPayment = (req, res) => {
  try {
    const upload = db.findOne('uploads', { upload_id: req.params.uploadId });
    if (!upload) return res.status(404).json({ error: 'Upload not found' });
    if (upload.status !== 'uploaded') {
      return res.status(400).json({ error: 'Upload already processed' });
    }

    const paymentEnabled = process.env.PAYMENT_ENABLED === 'true';
    const shop = db.findOne('shops', { shop_id: upload.shop_id });

    if (!paymentEnabled) {
      // Free mode - skip payment, go straight to the dashboard queue
      const payment = db.insert('payments', {
        payment_id: uuidv4(),
        upload_id: upload.upload_id,
        shop_id: upload.shop_id,
        amount: 0,
        method: 'free',
        status: 'approved'
      });
      db.update('uploads', { upload_id: upload.upload_id }, { status: 'queued' });

      const job = queueService.addJob(
        upload.shop_id, upload.upload_id, payment.payment_id,
        upload.file_path, upload.pages, upload.mode,
        upload.copies, upload.double_sided
      );

      return res.json({
        success: true,
        free: true,
        data: {
          requestId: job.request_id,
          queuePosition: queueService.getPosition(job.request_id)
        }
      });
    }

    // Manual payment mode - create pending payment record
    const payment = db.insert('payments', {
      payment_id: uuidv4(),
      upload_id: upload.upload_id,
      shop_id: upload.shop_id,
      amount: upload.amount,
      method: 'manual',
      upi_id: shop.upi_id || '',
      status: 'pending'
    });

    db.update('uploads', { upload_id: upload.upload_id }, { status: 'awaiting_payment' });

    res.json({
      success: true,
      data: {
        paymentId: payment.payment_id,
        amount: payment.amount,
        upiId: shop.upi_id,
        shopName: shop.shop_name,
        code: payment.payment_id.split('-')[0].toUpperCase()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payment config (free or manual)
exports.getConfig = (req, res) => {
  res.json({
    success: true,
    data: { paymentEnabled: process.env.PAYMENT_ENABLED === 'true' }
  });
};

// Get payment status (customer polls this)
exports.getStatus = (req, res) => {
  const payment = db.findOne('payments', { payment_id: req.params.paymentId });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  let queuePosition = null;
  let requestId = null;

  if (payment.status === 'approved') {
    const job = db.findOne('queue', { payment_id: payment.payment_id });
    if (job) {
      requestId = job.request_id;
      queuePosition = queueService.getPosition(job.request_id);
    }
  }

  res.json({
    success: true,
    data: { ...payment, requestId, queuePosition }
  });
};

// ---- SHOP OWNER DASHBOARD ENDPOINTS ----

// Get all pending payments for shop
exports.getPending = (req, res) => {
  const payments = db.findAll('payments', {
    shop_id: req.params.shopId,
    status: 'pending'
  });

  // Attach upload details
  const enriched = payments.map(p => ({
    ...p,
    upload: db.findOne('uploads', { upload_id: p.upload_id })
  }));

  res.json({ success: true, data: enriched });
};

// Shop owner approves or rejects payment
exports.verify = (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const payment = db.findOne('payments', { payment_id: req.params.paymentId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    if (action === 'approve') {
      db.update('payments', { payment_id: payment.payment_id }, { status: 'approved' });

      const upload = db.findOne('uploads', { upload_id: payment.upload_id });
      db.update('uploads', { upload_id: upload.upload_id }, { status: 'queued' });

      const job = queueService.addJob(
        upload.shop_id, upload.upload_id, payment.payment_id,
        upload.file_path, upload.pages, upload.mode,
        upload.copies, upload.double_sided
      );

      return res.json({
        success: true,
        message: 'Payment approved — job added to dashboard queue',
        data: {
          requestId: job.request_id,
          queuePosition: queueService.getPosition(job.request_id)
        }
      });
    }

    if (action === 'reject') {
      db.update('payments', { payment_id: payment.payment_id }, { status: 'rejected' });
      db.update('uploads', { upload_id: payment.upload_id }, { status: 'payment_rejected' });
      return res.json({ success: true, message: 'Payment rejected' });
    }

    res.status(400).json({ error: 'action must be "approve" or "reject"' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
