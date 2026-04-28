
/* ═══════════════════════════════════════════════════════════
   CHANGE PIN FLOW
═══════════════════════════════════════════════════════════ */
let cpStep = 1;
let cpOldPin = '';
let cpNewPin = '';
let cpBuffer = '';

function openChangePinModal() {
  cpStep = 1; cpOldPin = ''; cpNewPin = ''; cpBuffer = '';
  document.querySelectorAll('.pin-step').forEach(s => s.classList.remove('active'));
  document.getElementById('cp-step1').classList.add('active');
  document.getElementById('cp-title').textContent = 'Step 1 of 3';
  updateCpDots();
  document.getElementById('change-pin-modal').classList.remove('hidden');
}

function closeChangePinModal() {
  document.getElementById('change-pin-modal').classList.add('hidden');
  cpStep = 1; cpOldPin = ''; cpNewPin = ''; cpBuffer = '';
}

function cpKey(k) {
  const maxLen = cpStep === 1 ? 6 : 6;
  if (k === 'back') { cpBuffer = cpBuffer.slice(0, -1); updateCpDots(); return; }
  if (k === 'ok')   { cpConfirm(); return; }
  if (cpBuffer.length >= maxLen) return;
  cpBuffer += k;
  updateCpDots();
  if (cpStep === 1 && cpBuffer.length === 4) setTimeout(cpConfirm, 200);
}

function updateCpDots() {
  const dotsEl = document.getElementById('cp-dots' + cpStep);
  if (!dotsEl) return;
  const dots = dotsEl.querySelectorAll('span');
  dots.forEach((d, i) => { d.className = i < cpBuffer.length ? 'filled' : ''; });
}

async function cpConfirm() {
  if (cpBuffer.length < 4) { showToast('Enter at least 4 digits', 'error'); return; }

  if (cpStep === 1) {
    cpOldPin = cpBuffer; cpBuffer = '';
    cpStep = 2;
    document.getElementById('cp-step1').classList.remove('active');
    document.getElementById('cp-step2').classList.add('active');
    document.getElementById('cp-title').textContent = 'Step 2 of 3';
    updateCpDots();

  } else if (cpStep === 2) {
    cpNewPin = cpBuffer; cpBuffer = '';
    cpStep = 3;
    document.getElementById('cp-step2').classList.remove('active');
    document.getElementById('cp-step3').classList.add('active');
    document.getElementById('cp-title').textContent = 'Step 3 of 3';
    updateCpDots();

  } else if (cpStep === 3) {
    if (cpBuffer !== cpNewPin) {
      showToast('PINs do not match. Try again.', 'error');
      cpBuffer = ''; updateCpDots(); return;
    }
    try {
      const r = await fetch(API + '/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, old_pin: cpOldPin, new_pin: cpNewPin })
      });
      const d = await r.json();
      if (d.status === 'ok') {
        currentUser.pin = cpNewPin;
        closeChangePinModal();
        showToast('✅ PIN changed successfully!', 'success');
      } else {
        showToast(d.message || 'Failed to change PIN', 'error');
        // Go back to step 1 if old PIN was wrong
        if (d.message && d.message.includes('incorrect')) {
          cpStep = 1; cpOldPin = ''; cpNewPin = ''; cpBuffer = '';
          document.querySelectorAll('.pin-step').forEach(s => s.classList.remove('active'));
          document.getElementById('cp-step1').classList.add('active');
          document.getElementById('cp-title').textContent = 'Step 1 of 3';
          updateCpDots();
        }
      }
    } catch (e) { showToast('Server error', 'error'); }
  }
}
