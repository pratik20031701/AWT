const API = '';
const shopId = new URLSearchParams(location.search).get('shop') || 'S01';
let autoTimer = null;

// ── Auth check ───────────────────────────────────────────────────
async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return false;
  }

  try {
    const r = await fetch(`${API}/api/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!r.ok) {
      localStorage.clear();
      window.location.href = '/';
      return false;
    }
    
    return true;
  } catch {
    window.location.href = '/';
    return false;
  }
}

function logout() {
  const token = localStorage.getItem('token');
  fetch(`${API}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  localStorage.clear();
  window.location.href = '/';
}

// ── Init ────────────────────────────────────────────────────────
async function init() {
  const authed = await checkAuth();
  if (!authed) return;
  
  await loadShop();
  await loadAll();
  // Auto-refresh every 5 seconds
  autoTimer = setInterval(loadAll, 5000);
}

async function loadShop() {
  try {
    const r = await fetch(`${API}/api/shops/${shopId}`);
    const { data } = await r.json();
    document.getElementById('sidebarShopName').textContent = data.shop_name;
    document.getElementById('shopDetails').innerHTML = `
      <div class="detail"><div class="label">Shop ID</div><div class="val">${data.shop_id}</div></div>
      <div class="detail"><div class="label">Email</div><div class="val">${data.email || '—'}</div></div>
      <div class="detail"><div class="label">UPI ID</div><div class="val">${data.upi_id || '—'}</div></div>
      <div class="detail"><div class="label">B&W Rate</div><div class="val">₹${data.bw_rate}/page</div></div>
      <div class="detail"><div class="label">Color Rate</div><div class="val">₹${data.color_rate}/page</div></div>
    `;
  } catch (e) { console.error(e); }
}

async function loadAll() {
  await Promise.all([loadPending(), loadQueue()]);
}

// ── Pending Payments ────────────────────────────────────────────
async function loadPending() {
  try {
    const r = await fetch(`${API}/api/payment/shop/${shopId}/pending`);
    const { data } = await r.json();
    const container = document.getElementById('pendingList');
    document.getElementById('statPending').textContent = data.length;

    if (!data.length) {
      container.innerHTML = '<div class="empty-state">✅ No pending payments</div>';
      return;
    }

    container.innerHTML = data.map(p => `
      <div class="payment-card" id="pc-${p.payment_id}">
        <div class="card-top">
          <div class="code-badge">${p.payment_id.split('-')[0].toUpperCase()}</div>
          <div class="amount-badge">₹${p.amount.toFixed ? p.amount.toFixed(2) : p.amount}</div>
        </div>
        <div class="card-details">
          <div class="detail">
            <div class="label">File</div>
            <div class="val">${p.upload?.file_name || '—'}</div>
          </div>
          <div class="detail">
            <div class="label">Pages</div>
            <div class="val">${p.upload?.pages || '—'}</div>
          </div>
          <div class="detail">
            <div class="label">Mode</div>
            <div class="val">${(p.upload?.mode || 'bw').toUpperCase()}</div>
          </div>
          <div class="detail">
            <div class="label">Copies</div>
            <div class="val">${p.upload?.copies || 1}</div>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn success small" onclick="verify('${p.payment_id}', 'approve')">
            ✅ Approve Job
          </button>
          <button class="btn danger small" onclick="verify('${p.payment_id}', 'reject')">
            ❌ Reject
          </button>
        </div>
      </div>
    `).join('');
  } catch (e) { console.error(e); }
}

async function verify(paymentId, action) {
  try {
    const r = await fetch(`${API}/api/payment/${paymentId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    const { success, message } = await r.json();
    if (success) {
      document.getElementById(`pc-${paymentId}`)?.remove();
      loadAll();
    } else {
      alert('Error: ' + message);
    }
  } catch (e) { alert('Failed. Please try again.'); }
}

// ── Job Queue ───────────────────────────────────────────────────
async function loadQueue() {
  try {
    const r = await fetch(`${API}/api/queue/${shopId}`);
    const { data } = await r.json();
    const active    = data.filter(j => j.status !== 'completed');
    const completed = data.filter(j => j.status === 'completed' && isToday(j.completed_at));
    document.getElementById('statQueue').textContent = active.length;
    document.getElementById('statDone').textContent  = completed.length;

    const container = document.getElementById('queueList');
    if (!data.length) {
      container.innerHTML = '<div class="empty-state">✅ No approved jobs yet</div>';
      return;
    }
    container.innerHTML = data.slice(0, 20).map(j => `
      <div class="queue-card ${j.status}">
        <div class="card-top">
          <div><strong>#${j.position}</strong> — ${j.file_name || j.file_path?.split('/').pop() || '—'}</div>
          <span class="status-tag ${j.status}">${j.status}</span>
        </div>
        <div class="card-details">
          <div class="detail"><div class="label">Pages</div><div class="val">${j.pages}</div></div>
          <div class="detail"><div class="label">Mode</div><div class="val">${(j.mode||'bw').toUpperCase()}</div></div>
          <div class="detail"><div class="label">Copies</div><div class="val">${j.copies}</div></div>
          <div class="detail"><div class="label">Double-sided</div><div class="val">${j.double_sided ? 'Yes' : 'No'}</div></div>
        </div>
        <div class="card-actions">
          ${j.status === 'completed' ? `
            <button class="btn small" disabled>Completed</button>
          ` : `
            <a class="btn primary small" href="${API}/api/queue/${j.request_id}/file" target="_blank" rel="noopener noreferrer">
              ⬇️ Download PDF
            </a>
            <button class="btn success small" onclick="completeJob('${j.request_id}')">
              ✅ Mark Complete
            </button>
          `}
        </div>
      </div>
    `).join('');
  } catch (e) { console.error(e); }
}

function isToday(isoString) {
  if (!isoString) return false;
  const d = new Date(isoString);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

async function completeJob(requestId) {
  try {
    const r = await fetch(`${API}/api/queue/${requestId}/complete`, { method: 'POST' });
    const { success, error } = await r.json();
    if (!success) throw new Error(error || 'Failed to update job');
    loadAll();
  } catch (e) {
    alert(e.message || 'Failed to mark the job complete.');
  }
}

// ── Tab navigation ───────────────────────────────────────────────
function showTab(tab) {
  ['payments', 'queue', 'settings'].forEach(t => {
    document.getElementById(`tab-${t}`).style.display = t === tab ? 'block' : 'none';
  });
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  event.target.classList.add('active');
}

init();
