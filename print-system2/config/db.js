const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../database');

const FILES = {
  shops:      path.join(DB_DIR, 'shops.json'),
  uploads:    path.join(DB_DIR, 'uploads.json'),
  payments:   path.join(DB_DIR, 'payments.json'),
  queue:      path.join(DB_DIR, 'queue.json'),
  sessions:   path.join(DB_DIR, 'sessions.json')
};

// Initialize database files if they don't exist
function init() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  for (const file of Object.values(FILES)) {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '[]', 'utf8');
    } else {
      // Verify existing files have valid JSON
      try {
        const content = fs.readFileSync(file, 'utf8').trim();
        if (!content) {
          fs.writeFileSync(file, '[]', 'utf8');
        } else {
          JSON.parse(content); // test parse
        }
      } catch (e) {
        console.warn(`⚠️  Corrupted ${path.basename(file)} — resetting to []`);
        fs.writeFileSync(file, '[]', 'utf8');
      }
    }
  }
}

function read(collection) {
  try {
    const content = fs.readFileSync(FILES[collection], 'utf8').trim();
    if (!content) return [];
    return JSON.parse(content);
  } catch (e) {
    console.error(`Error reading ${collection}:`, e.message);
    return [];
  }
}

function write(collection, data) {
  try {
    fs.writeFileSync(FILES[collection], JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing ${collection}:`, e.message);
  }
}

function findOne(collection, query) {
  const data = read(collection);
  return data.find(item =>
    Object.keys(query).every(k => item[k] === query[k])
  ) || null;
}

function findAll(collection, query = {}) {
  const data = read(collection);
  if (!Object.keys(query).length) return data;
  return data.filter(item =>
    Object.keys(query).every(k => item[k] === query[k])
  );
}

function insert(collection, item) {
  const data = read(collection);
  const record = { ...item, createdAt: new Date().toISOString() };
  data.push(record);
  write(collection, data);
  return record;
}

function update(collection, query, changes) {
  const data = read(collection);
  let updated = null;
  const newData = data.map(item => {
    if (Object.keys(query).every(k => item[k] === query[k])) {
      updated = { ...item, ...changes, updatedAt: new Date().toISOString() };
      return updated;
    }
    return item;
  });
  write(collection, newData);
  return updated;
}

function remove(collection, query) {
  const data = read(collection);
  const newData = data.filter(item =>
    !Object.keys(query).every(k => item[k] === query[k])
  );
  write(collection, newData);
}

module.exports = { init, read, write, findOne, findAll, insert, update, remove };
