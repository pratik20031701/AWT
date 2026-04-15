const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const fileService = require('../services/fileService');

function calcAmount(pages, mode, copies, doubleSided) {
  const rate = mode === 'color'
    ? parseFloat(process.env.COLOR_RATE_PER_PAGE) || 10
    : parseFloat(process.env.BW_RATE_PER_PAGE) || 5;
  let total = pages * copies;
  if (doubleSided) total = Math.ceil(total / 2);
  return total * rate;
}

exports.uploadFile = async (req, res) => {
  try {
    const shop = db.findOne('shops', { shop_id: req.params.shopId });
    if (!shop) {
      if (req.file) fileService.deleteFile(req.file.path);
      return res.status(404).json({ error: 'Shop not found' });
    }

    const { mode = 'bw', copies = '1', doubleSided = 'false' } = req.body;
    const { filePath, pages } = await fileService.processFile(req.file);

    const amount = calcAmount(pages, mode, parseInt(copies), doubleSided === 'true');

    const upload = db.insert('uploads', {
      upload_id: uuidv4(),
      shop_id: req.params.shopId,
      file_name: req.file.originalname,
      file_path: filePath,
      pages,
      mode,
      copies: parseInt(copies),
      double_sided: doubleSided === 'true',
      amount,
      status: 'uploaded'
    });

    res.json({
      success: true,
      data: {
        uploadId: upload.upload_id,
        fileName: upload.file_name,
        pages: upload.pages,
        mode: upload.mode,
        copies: upload.copies,
        doubleSided: upload.double_sided,
        amount: upload.amount
      }
    });
  } catch (err) {
    if (req.file) fileService.deleteFile(req.file.path);
    res.status(400).json({ error: err.message });
  }
};

exports.getUpload = (req, res) => {
  const upload = db.findOne('uploads', { upload_id: req.params.uploadId });
  if (!upload) return res.status(404).json({ error: 'Upload not found' });
  res.json({ success: true, data: upload });
};
