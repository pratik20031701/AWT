const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const queueService = require('../services/queueService');

function getDownloadName(job, upload) {
  const ext = path.extname(job.file_path) || '.pdf';
  const baseName = upload?.file_name
    ? path.parse(upload.file_name).name
    : job.request_id;
  return `${baseName}${ext}`;
}

exports.getQueue = (req, res) => {
  const jobs = queueService.getQueue(req.params.shopId).map(job => {
    const upload = db.findOne('uploads', { upload_id: job.upload_id });
    return {
      ...job,
      file_name: upload?.file_name || path.basename(job.file_path)
    };
  });
  res.json({ success: true, data: jobs });
};

exports.getPosition = (req, res) => {
  const pos = queueService.getPosition(req.params.requestId);
  if (pos === null) return res.status(404).json({ error: 'Job not found' });
  res.json({ success: true, data: { requestId: req.params.requestId, position: pos } });
};

exports.downloadJob = (req, res) => {
  try {
    const job = queueService.getJob(req.params.requestId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!fs.existsSync(job.file_path)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const upload = db.findOne('uploads', { upload_id: job.upload_id });
    res.download(job.file_path, getDownloadName(job, upload));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeJob = (req, res) => {
  const existing = queueService.getJob(req.params.requestId);
  if (!existing) return res.status(404).json({ error: 'Job not found' });

  if (existing.status === 'completed') {
    return res.json({
      success: true,
      message: 'Job already completed',
      data: existing
    });
  }

  const job = queueService.updateStatus(req.params.requestId, 'completed');
  res.json({ success: true, message: 'Job marked completed', data: job });
};
