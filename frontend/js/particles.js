
/* ═══════════════════════════════════════════════════════════════
   HEXAGON PARTICLE ANIMATION — TrustPay
   Runs on login screen + app shell
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  function createParticles(W, H, count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * W, y: Math.random() * H,
        size: Math.random() * 20 + 8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.15 + 0.03,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.012 + 0.004,
        rotate: Math.random() * Math.PI * 2,
        rotateSpeed: (Math.random() - 0.5) * 0.003,
        filled: Math.random() > 0.6,
      });
    }
    return arr;
  }

  function hexPath(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 180 * (60 * i - 30);
      i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
              : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath();
  }

  function drawFrame(ctx, particles, W, H) {
    ctx.clearRect(0, 0, W, H);
    const col = 'rgba(255,255,255,';
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.pulse += p.pulseSpeed;
      p.rotate += p.rotateSpeed;
      if (p.x < -p.size*2) p.x = W + p.size;
      if (p.x > W + p.size*2) p.x = -p.size;
      if (p.y < -p.size*2) p.y = H + p.size;
      if (p.y > H + p.size*2) p.y = -p.size;
      const a = p.alpha + Math.sin(p.pulse) * 0.05;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotate);
      if (p.filled) {
        hexPath(ctx, 0, 0, p.size);
        ctx.fillStyle = col + (a * 0.35).toFixed(3) + ')';
        ctx.fill();
      }
      hexPath(ctx, 0, 0, p.size);
      ctx.strokeStyle = col + a.toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
      hexPath(ctx, 0, 0, p.size * 0.5);
      ctx.strokeStyle = col + (a * 0.4).toFixed(3) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = col + ((1 - d/150) * 0.07).toFixed(3) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ── App shell canvas ──────────────────────────────────── */
  let appCanvas, appCtx, appParticles = [], appAnimId;

  function initAppCanvas() {
    appCanvas = document.getElementById('hex-canvas');
    if (!appCanvas) return;
    appCtx = appCanvas.getContext('2d');
    appCanvas.width = window.innerWidth;
    appCanvas.height = window.innerHeight;
    appParticles = createParticles(appCanvas.width, appCanvas.height, 25);
    (function loop() { drawFrame(appCtx, appParticles, appCanvas.width, appCanvas.height); appAnimId = requestAnimationFrame(loop); })();
  }

  /* ── Login canvas ──────────────────────────────────────── */
  let loginCanvas, loginCtx, loginParticles = [], loginAnimId;

  function initLoginCanvas() {
    if (document.getElementById('login-hex-canvas')) return;
    loginCanvas = document.createElement('canvas');
    loginCanvas.id = 'login-hex-canvas';
    loginCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    document.body.insertBefore(loginCanvas, document.body.firstChild);
    loginCtx = loginCanvas.getContext('2d');
    loginCanvas.width = window.innerWidth;
    loginCanvas.height = window.innerHeight;
    loginParticles = createParticles(loginCanvas.width, loginCanvas.height, 40);
    (function loop() { drawFrame(loginCtx, loginParticles, loginCanvas.width, loginCanvas.height); loginAnimId = requestAnimationFrame(loop); })();
  }

  window.HexParticles = {
    initApp:   initAppCanvas,
    initLogin: initLoginCanvas,
    resize: function() {
      if (appCanvas)   { appCanvas.width = window.innerWidth;   appCanvas.height = window.innerHeight; }
      if (loginCanvas) { loginCanvas.width = window.innerWidth; loginCanvas.height = window.innerHeight; }
    }
  };

  function boot() { initLoginCanvas(); initAppCanvas(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('resize', function() { if (window.HexParticles) window.HexParticles.resize(); });
})();
