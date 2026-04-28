/* ═══════════════════════════════════════════════════════════════
   HEXAGON PARTICLE ANIMATION BACKGROUND — TrustPay
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  let canvas, ctx, particles = [], animId;
  const HEX_COUNT = 28;

  function hexPath(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 180 * (60 * i - 30);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function getThemeColor() {
    const bw = document.body.classList.contains('theme-bw');
    return bw
      ? { stroke: 'rgba(255,255,255,', fill: 'rgba(255,255,255,' }
      : { stroke: 'rgba(0,212,255,',   fill: 'rgba(0,212,255,' };
  }

  function createParticle(w, h) {
    const size = Math.random() * 22 + 10;
    return {
      x:     Math.random() * w,
      y:     Math.random() * h,
      size,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.18 + 0.04,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.015 + 0.005,
      rotate: Math.random() * Math.PI * 2,
      rotateSpeed: (Math.random() - 0.5) * 0.004,
      filled: Math.random() > 0.65,
    };
  }

  function initCanvas() {
    canvas = document.getElementById('hex-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    particles = [];
    for (let i = 0; i < HEX_COUNT; i++) {
      particles.push(createParticle(canvas.width, canvas.height));
    }
    animate();
  }

  function resize() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function animate() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const col = getThemeColor();
    const W = canvas.width, H = canvas.height;

    particles.forEach(p => {
      // Move
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;
      p.rotate += p.rotateSpeed;

      // Wrap around edges
      if (p.x < -p.size * 2) p.x = W + p.size;
      if (p.x > W + p.size * 2) p.x = -p.size;
      if (p.y < -p.size * 2) p.y = H + p.size;
      if (p.y > H + p.size * 2) p.y = -p.size;

      // Pulsing alpha
      const a = p.alpha + Math.sin(p.pulse) * 0.06;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotate);

      if (p.filled) {
        hexPath(0, 0, p.size);
        ctx.fillStyle = col.fill + (a * 0.4).toFixed(3) + ')';
        ctx.fill();
      }

      hexPath(0, 0, p.size);
      ctx.strokeStyle = col.stroke + a.toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner smaller hex
      hexPath(0, 0, p.size * 0.55);
      ctx.strokeStyle = col.stroke + (a * 0.5).toFixed(3) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    });

    // Draw connecting lines between nearby hexagons
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const lineAlpha = (1 - dist / 160) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = col.stroke + lineAlpha.toFixed(3) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (animId) cancelAnimationFrame(animId);
  }

  // Public API
  window.HexParticles = { init: initCanvas, stop: stopAnimation, resize };

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanvas);
  } else {
    setTimeout(initCanvas, 100);
  }

  window.addEventListener('resize', () => {
    resize();
    if (particles.length === 0 && canvas) {
      for (let i = 0; i < HEX_COUNT; i++) {
        particles.push(createParticle(canvas.width, canvas.height));
      }
    }
  });
})();
