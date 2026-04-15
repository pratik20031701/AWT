const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

function getNextPosition(shopId) {
  const active = db.findAll('queue', { shop_id: shopId }).filter(j =>
    ['pending', 'printing'].includes(j.status)
  );
  if (!active.length) return 1;
  return Math.max(...active.map(j => j.position)) + 1;
}

function addJob(shopId, uploadId, paymentId, filePath, pages, mode, copies, doubleSided) {
  const position = getNextPosition(shopId);
  return db.insert('queue', {
    request_id: uuidv4(),
    shop_id: shopId,
    upload_id: uploadId,
    payment_id: paymentId,
    file_path: filePath,
    pages,
    mode,
    copies,
    double_sided: doubleSided,
    position,
    status: 'pending'
  });
}

function getQueue(shopId) {
  return db.findAll('queue', { shop_id: shopId })
    .sort((a, b) => a.position - b.position);
}

function getJob(requestId) {
  return db.findOne('queue', { request_id: requestId });
}

function getPosition(requestId) {
  const job = db.findOne('queue', { request_id: requestId });
  if (!job) return null;
  const ahead = db.findAll('queue', { shop_id: job.shop_id }).filter(j =>
    ['pending', 'printing'].includes(j.status) && j.position < job.position
  );
  return ahead.length + 1;
}

function updateStatus(requestId, status, errorMsg = null) {
  const changes = { status };
  if (status === 'printing') changes.started_at = new Date().toISOString();
  if (status === 'completed') changes.completed_at = new Date().toISOString();
  if (errorMsg) changes.error = errorMsg;

  const job = db.update('queue', { request_id: requestId }, changes);

  // Delete file after completion
  if (status === 'completed' && job) {
    try { fs.unlinkSync(job.file_path); } catch {}
  }
  return job;
}

module.exports = { addJob, getQueue, getJob, getPosition, updateStatus };
