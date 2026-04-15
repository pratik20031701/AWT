const db = require('../config/db');
const QRCode = require('qrcode');

exports.getShop = (req, res) => {
  const shop = db.findOne('shops', { shop_id: req.params.shopId });
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  res.json({ success: true, data: shop });
};

exports.getAllShops = (req, res) => {
  const shops = db.findAll('shops', { is_active: true });
  res.json({ success: true, data: shops });
};

exports.createShop = async (req, res) => {
  try {
    const { shop_id, shop_name, upi_id, bw_rate, color_rate } = req.body;
    if (!shop_id || !shop_name) {
      return res.status(400).json({ error: 'shop_id and shop_name are required' });
    }
    if (db.findOne('shops', { shop_id })) {
      return res.status(409).json({ error: 'Shop already exists' });
    }
    const qr_code = await QRCode.toDataURL(
      `${process.env.APP_URL}/shop/${shop_id}`
    );
    const shop = db.insert('shops', {
      shop_id,
      shop_name,
      upi_id: upi_id || '',
      bw_rate: parseFloat(bw_rate) || parseFloat(process.env.BW_RATE_PER_PAGE) || 5,
      color_rate: parseFloat(color_rate) || parseFloat(process.env.COLOR_RATE_PER_PAGE) || 10,
      qr_code,
      is_active: true
    });
    res.status(201).json({ success: true, data: shop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateShop = (req, res) => {
  const shop = db.update('shops', { shop_id: req.params.shopId }, req.body);
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  res.json({ success: true, data: shop });
};

exports.downloadQR = (req, res) => {
  const shop = db.findOne('shops', { shop_id: req.params.shopId });
  if (!shop) return res.status(404).json({ error: 'Shop not found' });
  const buffer = Buffer.from(shop.qr_code.replace(/^data:image\/png;base64,/, ''), 'base64');
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `attachment; filename="${shop.shop_id}_qr.png"`);
  res.send(buffer);
};
