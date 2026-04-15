const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_PAGES = parseInt(process.env.MAX_PAGES) || 20;

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

async function countPages(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.numpages;
}

async function imageToPDF(imagePath) {
  const pdfDoc = await PDFDocument.create();
  const imgBuffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase();

  let img;
  if (ext === '.png') {
    img = await pdfDoc.embedPng(imgBuffer);
  } else {
    img = await pdfDoc.embedJpg(imgBuffer);
  }

  const page = pdfDoc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

  const pdfPath = imagePath.replace(ext, '.pdf');
  fs.writeFileSync(pdfPath, await pdfDoc.save());

  // Delete original image
  fs.unlinkSync(imagePath);
  return pdfPath;
}

async function processFile(file) {
  ensureUploadDir();
  const ext = path.extname(file.originalname).toLowerCase();
  let filePath = file.path;
  let pages = 1;

  // Convert image to PDF
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    filePath = await imageToPDF(file.path);
    pages = 1;
  } else if (ext === '.pdf') {
    pages = await countPages(file.path);
  } else {
    throw new Error('Unsupported file type. Please upload PDF, JPG, or PNG.');
  }

  if (pages > MAX_PAGES) {
    fs.unlinkSync(filePath);
    throw new Error(`File has ${pages} pages. Maximum allowed is ${MAX_PAGES} pages.`);
  }

  return { filePath, pages };
}

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Error deleting file:', err.message);
  }
}

module.exports = { ensureUploadDir, processFile, deleteFile };
