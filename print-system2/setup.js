require('dotenv').config();
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function setup() {
  console.log('\n🔄 Setting up PrintDesk...\n');
  
  // Step 1: Initialize database
  console.log('1️⃣  Creating database files...');
  db.init();
  
  // Step 2: Verify database files
  const dbDir = path.join(__dirname, 'database');
  const files = ['shops.json', 'uploads.json', 'payments.json', 'queue.json', 'sessions.json'];
  
  for (const file of files) {
    const filePath = path.join(dbDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} — creating...`);
      fs.writeFileSync(filePath, '[]', 'utf8');
    }
  }
  
  // Step 3: Create uploads directory
  const uploadsDir = process.env.UPLOAD_DIR || './uploads';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`   ✅ Created uploads directory: ${uploadsDir}`);
  }
  
  console.log('\n✅ Setup complete!\n');
  console.log('📋 Next steps:\n');
  console.log('   Start server:');
  console.log('   $ npm start\n');
  console.log('   Then open:\n');
  console.log('   🌐 http://localhost:3000\n');
  console.log('   Create your shop account and start printing!\n');
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
