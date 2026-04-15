# 🖨️ PrintDesk - Multi-Shop Print System

A complete self-serve printing platform where **multiple print shops** can create accounts and manage their own printing operations.

**Perfect for:**
- 🏪 Stationery shops
- 📚 Copy centers  
- 🏢 Office buildings
- 🎓 University campuses
- 🏨 Hotels & co-working spaces

---

## ✨ Features

### For Shop Owners:
- 🔐 **Individual accounts** - Each shop has their own login
- 📊 **Private dashboard** - Manage your queue & payments
- 💰 **Manual payment** - Accept cash/UPI at counter
- 📱 **QR code** - Auto-generated for each shop
- 📥 **Dashboard downloads** - Access approved files directly from the dashboard
- ⚙️ **Customizable rates** - Set your own B&W and color prices

### For Customers:
- 📤 Upload PDF, JPG, PNG (max 20 pages)
- ⚫🎨 Choose B&W or Color
- 📑 Multiple copies, double-sided option
- 💳 Pay at shop counter
- 📋 Track print queue position

---

## 🚀 Quick Start

### 1. Install
```bash
npm install
```

### 2. Setup database
```bash
node setup.js
```

### 3. Configure (optional)
Edit `.env`:
```env
PORT=3000
PAYMENT_ENABLED=true    # false = free mode
BW_RATE_PER_PAGE=5      # default rates
COLOR_RATE_PER_PAGE=10
MAX_PAGES=20
APP_URL=http://localhost:3000
```

### 4. Start server
```bash
npm start
```

### 5. Open browser
```
http://localhost:3000
```

### 6. Create your shop account
- Click "Register"
- Fill in shop details
- Get instant shop ID & QR code
- Share QR with customers!

---

## 🏪 How It Works

### Shop Owner (First Time):
1. Open http://localhost:3000
2. Click **"Register"**
3. Enter: Shop name, email, password
4. Get unique Shop ID (e.g., `S847392`)
5. System generates QR code automatically
6. Print QR code → Display in shop

### Customer Journey:
1. Scan QR code or visit your shop URL
2. Upload PDF/image
3. Choose print options (B&W/Color, copies, etc.)
4. See payment amount & code
5. Pay at counter (cash/UPI)
6. Shop approves → Print!

### Shop Owner (Daily):
1. Login to dashboard
2. See pending payments
3. Customer shows payment code
4. Click "Approve Job"
5. Download the file from the dashboard and mark it complete when finished

---

## 🔗 URLs (After Registration)

After you create a shop account, you'll get:

| Page | URL | Purpose |
|------|-----|---------|
| **Landing/Login** | http://localhost:3000 | Register or login |
| **Customer page** | http://localhost:3000/shop/YOUR_SHOP_ID | Customers upload & pay |
| **Dashboard** | http://localhost:3000/dashboard?shop=YOUR_SHOP_ID | Approve payments and manage jobs |

**Example:** If your shop ID is `S847392`:
- Customer URL: `http://localhost:3000/shop/S847392`
- Dashboard: `http://localhost:3000/dashboard?shop=S847392`

---

## 💰 Payment Modes

### Free Mode (`PAYMENT_ENABLED=false`)
Customer uploads → directly added to queue. No payment step.

### Manual Mode (`PAYMENT_ENABLED=true`)
1. Customer uploads file
2. System shows **payment code + amount**
3. Customer pays at counter (cash or UPI)
4. Owner sees it in **dashboard** → clicks **Approve**
5. Job goes to print queue automatically

---

## 🏪 Shop Owner Dashboard

Open: `http://localhost:3000/dashboard?shop=S01`

- See all **pending payments** with customer code + amount
- **Approve** → job added to queue instantly
- **Reject** → cancels the job
- View the **job queue** with status
- **Download PDF** for any approved job
- **Mark complete** after the file has been handled
- Auto-refreshes every 5 seconds

---

## 📥 Handling Approved Jobs

Approved files stay in the dashboard queue until a staff member downloads them and marks them complete.

**Recommended flow:**
1. Approve the payment from the dashboard
2. Open the **Job Queue** tab
3. Click **Download PDF**
4. Print or process the file using your normal workflow
5. Click **Mark Complete**

---

## 📁 Project Structure

```
print-system/
├── server.js              # Express server
├── setup.js               # Initial setup script
├── .env                   # Configuration
│
├── config/
│   └── db.js              # JSON database manager
│
├── controllers/
│   ├── shopController.js
│   ├── uploadController.js
│   ├── paymentController.js
│   └── queueController.js
│
├── services/
│   ├── fileService.js     # PDF/image processing
│   └── queueService.js    # Queue management
│
├── routes/
│   └── index.js           # All API routes
│
├── views/
│   ├── shop.html          # Customer page
│   └── dashboard.html     # Owner dashboard
│
├── public/
│   ├── css/style.css
│   └── js/
│       ├── shop.js
│       └── dashboard.js
│
└── database/              # Auto-created JSON files
    ├── shops.json
    ├── uploads.json
    ├── payments.json
    └── queue.json
```

---

## 🔌 API Reference

### Shop
```
GET  /api/shops              → all shops
POST /api/shops              → create shop
GET  /api/shops/:id          → get shop
PUT  /api/shops/:id          → update shop
GET  /api/shops/:id/qr       → download QR code
```

### Upload
```
POST /api/upload/:shopId     → upload file
GET  /api/upload/:uploadId   → get upload info
```

### Payment
```
GET  /api/payment/config                   → free or manual mode
POST /api/payment/:uploadId                → create payment
GET  /api/payment/:paymentId/status        → check status
GET  /api/payment/shop/:shopId/pending     → pending list (dashboard)
POST /api/payment/:paymentId/verify        → approve/reject (dashboard)
```

### Job Queue
```
GET  /api/queue/:shopId               → queue list
GET  /api/queue/position/:requestId   → queue position
GET  /api/queue/:requestId/file       → download job file
POST /api/queue/:requestId/complete   → mark job complete
```

---

## 🔧 Add More Shops

```bash
curl -X POST http://localhost:3000/api/shops \
  -H "Content-Type: application/json" \
  -d '{
    "shop_id": "S02",
    "shop_name": "Tech Printers",
    "upi_id": "tech@paytm",
    "bw_rate": 4,
    "color_rate": 8
  }'
```

Then visit: `http://localhost:3000/shop/S02`
Dashboard: `http://localhost:3000/dashboard?shop=S02`

---

## 📊 Database (JSON Files)

All data is stored in `database/` as plain JSON files.

View data anytime:
```bash
cat database/shops.json
cat database/payments.json
cat database/queue.json
```

Backup:
```bash
cp -r database/ backup/
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | Change `PORT` in `.env` |
| File too large | Check `MAX_FILE_SIZE` in `.env` |
| PDF page count fails | Ensure the PDF is not corrupted |
| Dashboard not loading | Make sure `?shop=S01` is in the URL |

---

## 📝 License

MIT — free for commercial use.
