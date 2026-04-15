const API = '';
const shopId = location.pathname.split('/shop/')[1];
let shop = null, uploadId = null, paymentId = null, pollTimer = null;

// ── Init ────────────────────────────────────────────────────────
async function init() {
  try {
    const r = await fetch(`${API}/api/shops/${shopId}`);
    const { data } = await r.json();
    shop = data;
    document.getElementById('shopName').textContent = data.shop_name;
    document.getElementById('bwRate').textContent    = `₹${data.bw_rate}/page`;
    document.getElementById('colorRate').textContent = `₹${data.color_rate}/page`;
  } catch {
    showError('Could not load shop. Please check the URL.');
  }
}

// ── File drop zone ──────────────────────────────────────────────
const dropZone  = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.onclick = () => fileInput.click();
fileInput.onchange = e => selectFile(e.target.files[0]);

dropZone.addEventListener('dragover', e => {
  e.preventDefault(); dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('drag-over');
  selectFile(e.dataTransfer.files[0]);
});

function selectFile(file) {
  if (!file) return;
  document.getElementById('selectedFile').style.display = 'flex';
  document.getElementById('selectedFileName').textContent = file.name;
  fileInput.files = createFileList(file);
  document.getElementById('uploadBtn').disabled = false;
}

function clearFile() {
  fileInput.value = '';
  document.getElementById('selectedFile').style.display = 'none';
  document.getElementById('uploadBtn').disabled = true;
}

// Trick to set FileList on input
function createFileList(file) {
  const dt = new DataTransfer();
  dt.items.add(file);
  return dt.files;
}

// ── Upload ──────────────────────────────────────────────────────
async function uploadFile() {
  if (!fileInput.files[0]) return;
  showLoader(true);
  hideError();
  try {
    const fd = new FormData();
    fd.append('file', fileInput.files[0]);
    const r = await fetch(`${API}/api/upload/${shopId}`, { method: 'POST', body: fd });
    const { success, data, error } = await r.json();
    if (!success) throw new Error(error);
    uploadId = data.uploadId;
    // Populate step 2
    document.getElementById('fileNameDisplay').textContent = data.fileName;
    document.getElementById('pagesDisplay').textContent    = data.pages;
    document.getElementById('totalAmount').textContent     = data.amount.toFixed(2);
    // Store data for recalc
    window._upload = data;
    goStep(2);
  } catch (e) { showError(e.message); }
  showLoader(false);
}

// ── Recalc ──────────────────────────────────────────────────────
function recalc() {
  if (!window._upload || !shop) return;
  const mode      = document.querySelector('input[name="mode"]:checked').value;
  const copies    = parseInt(document.getElementById('copies').value) || 1;
  const dbl       = document.getElementById('doubleSided').checked;
  const rate      = mode === 'color' ? shop.color_rate : shop.bw_rate;
  let pages       = window._upload.pages * copies;
  if (dbl) pages  = Math.ceil(pages / 2);
  const total     = pages * rate;
  document.getElementById('totalAmount').textContent = total.toFixed(2);

  // Highlight selected radio card
  document.getElementById('lwBW').classList.toggle('selected', mode === 'bw');
  document.getElementById('lwColor').classList.toggle('selected', mode === 'color');
}

// ── Payment ─────────────────────────────────────────────────────
async function proceedToPayment() {
  showLoader(true);
  hideError();
  try {
    const r = await fetch(`${API}/api/payment/${uploadId}`, { method: 'POST' });
    const { success, data, free, error } = await r.json();
    if (!success) throw new Error(error);

    if (free) {
      // No payment needed — jump straight to done
      document.getElementById('freeMode').style.display = 'block';
      document.getElementById('manualMode').style.display = 'none';
      goStep(3);
      setTimeout(() => {
        showDone(data.requestId, data.queuePosition);
      }, 1200);
    } else {
      // Manual payment
      paymentId = data.paymentId;
      document.getElementById('paymentCode').textContent = data.code;
      document.getElementById('payAmount').textContent   = data.amount.toFixed(2);

      if (data.upiId) {
        document.getElementById('upiLine').style.display = 'block';
        document.getElementById('upiId').textContent     = data.upiId;
      }

      document.getElementById('freeMode').style.display  = 'none';
      document.getElementById('manualMode').style.display = 'block';
      goStep(3);
    }
  } catch (e) { showError(e.message); }
  showLoader(false);
}

// Customer taps "I Have Paid"
async function markPaid() {
  document.getElementById('paidBtn').disabled = true;
  document.getElementById('waitingMsg').style.display = 'block';
  // Start polling for approval
  pollTimer = setInterval(pollPayment, 3000);
}

async function pollPayment() {
  try {
    const r = await fetch(`${API}/api/payment/${paymentId}/status`);
    const { data } = await r.json();
    if (data.status === 'approved') {
      clearInterval(pollTimer);
      showDone(data.requestId, data.queuePosition);
    } else if (data.status === 'rejected') {
      clearInterval(pollTimer);
      document.getElementById('waitingMsg').textContent = '❌ Payment was rejected. Please speak to the shop owner.';
      document.getElementById('paidBtn').disabled = false;
    }
  } catch {}
}

function showDone(requestId, pos) {
  document.getElementById('queuePos').textContent = pos || '—';
  document.getElementById('jobId').textContent    = requestId || '—';
  goStep(4);
}

// ── Navigation ──────────────────────────────────────────────────
function goStep(n) {
  [1, 2, 3, 4].forEach(i => {
    document.getElementById(`step${i}`).classList.toggle('hidden', i !== n);
    document.getElementById(`prog${i}`).classList.toggle('active', i === n);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetAll() {
  clearFile();
  uploadId = null; paymentId = null;
  window._upload = null;
  if (pollTimer) clearInterval(pollTimer);
  document.getElementById('waitingMsg').style.display = 'none';
  document.getElementById('paidBtn').disabled = false;
  goStep(1);
}

// ── Helpers ─────────────────────────────────────────────────────
function showLoader(v) { document.getElementById('loader').style.display = v ? 'flex' : 'none'; }
function showError(msg) {
  const b = document.getElementById('errorBox');
  document.getElementById('errorMsg').textContent = msg;
  b.style.display = 'block';
  setTimeout(() => b.style.display = 'none', 5000);
}
function hideError() { document.getElementById('errorBox').style.display = 'none'; }

init();
