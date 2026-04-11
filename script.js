// ══════════════════════════════════════════
//  StadiumIQ — script.js
// ══════════════════════════════════════════

// ── HERO CANVAS ──────────────────────────
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
resize(); window.addEventListener('resize', resize);

const PCOLS = ['rgba(79,142,247,','rgba(168,85,247,','rgba(34,211,238,','rgba(34,197,94,'];
const pts = [];
class P {
  constructor() { this.reset(true); }
  reset(init) {
    this.x = Math.random() * canvas.width;
    this.y = init ? Math.random() * canvas.height : canvas.height + 10;
    this.vx = (Math.random() - .5) * .5; this.vy = -(Math.random() * .9 + .3);
    this.r = Math.random() * 1.8 + .4; this.a = Math.random() * .5 + .1;
    this.col = PCOLS[~~(Math.random() * PCOLS.length)];
    this.life = 0; this.max = Math.random() * 260 + 180;
  }
  tick() { this.x += this.vx; this.y += this.vy; this.life++; this.vx += Math.sin(this.life*.02)*.008; if (this.life > this.max || this.y < -10) this.reset(); }
  draw() {
    const f = this.life < 40 ? this.life/40 : this.life > this.max-40 ? (this.max-this.life)/40 : 1;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fillStyle = this.col + this.a*f + ')'; ctx.fill();
  }
}
for (let i = 0; i < 110; i++) pts.push(new P());
function links() {
  for (let i = 0; i < pts.length; i++) for (let j = i+1; j < pts.length; j++) {
    const dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y, d = Math.sqrt(dx*dx+dy*dy);
    if (d < 85) { ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.strokeStyle = `rgba(79,142,247,${(1-d/85)*.06})`; ctx.lineWidth=.5; ctx.stroke(); }
  }
}
function anim() { ctx.clearRect(0,0,canvas.width,canvas.height); links(); pts.forEach(p=>{p.tick();p.draw();}); requestAnimationFrame(anim); }
anim();

// ── MINI HEATMAP (hero widget) ────────────
const hmGrid = document.getElementById('heroHeatmap');
if (hmGrid) {
  for (let i = 0; i < 35; i++) {
    const c = document.createElement('div'); c.className = 'hmc'; hmGrid.appendChild(c);
  }
  const HMCOLS = ['rgba(34,197,94,.35)','rgba(245,158,11,.4)','rgba(239,68,68,.5)'];
  function updateMiniHM() {
    const cells = hmGrid.querySelectorAll('.hmc');
    cells.forEach(c => { c.style.background = HMCOLS[~~(Math.random()*3)]; });
  }
  updateMiniHM(); setInterval(updateMiniHM, 2500);
}

// ── NAVBAR ────────────────────────────────
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 50));
const ham = document.getElementById('hamburger');
ham.addEventListener('click', () => nav.classList.toggle('menu-open'));
document.addEventListener('click', e => { if (!nav.contains(e.target)) nav.classList.remove('menu-open'); });
document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click', () => nav.classList.remove('menu-open')));
document.addEventListener('keydown', e => { if (e.key==='Escape') nav.classList.remove('menu-open'); });

// ── SCROLL REVEAL ─────────────────────────
const reveals = document.querySelectorAll('.fcard,.mct,.pc,.hlc,.arch-step,.phone-wrap');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const d = parseInt(e.target.dataset.delay||0);
      setTimeout(() => e.target.classList.add('visible'), d);
      obs.unobserve(e.target);
    }
  });
}, { threshold: .1 });
reveals.forEach(el => obs.observe(el));

// ── PARALLAX ──────────────────────────────
const hc = document.querySelector('.hero-content');
window.addEventListener('scroll', () => {
  const s = scrollY;
  if (s < innerHeight && hc) { hc.style.transform = `translateY(${s*.1}px)`; hc.style.opacity = 1-s/(innerHeight*.75); }
});

// ── LIVE WAIT TIMES SIMULATION ────────────
const WR_DATA = [
  [{ gate:'Gate 3', w:Math.random()*15+2 },{ gate:'Gate 5', w:Math.random()*8+1 },{ gate:'Food Court A', w:Math.random()*12+3 }]
];
function randomWait() { return (Math.random()*14+1).toFixed(0)+'m'; }
const wtEls = document.querySelectorAll('.wt');
setInterval(() => {
  wtEls.forEach(el => {
    const v = parseInt(el.textContent);
    const newV = Math.max(1, v + (Math.random()>.5?1:-1) * ~~(Math.random()*2+1));
    el.textContent = newV+' min';
    el.className = 'wt ' + (newV < 5 ? 'green' : newV < 9 ? 'yellow' : 'red');
  });
}, 3000);

// ── HEATMAP ZONE ANIMATION ────────────────
const hmZones = document.querySelectorAll('.hm-zone');
const ZC = ['hz-red','hz-yellow','hz-green'];
setInterval(() => {
  hmZones.forEach(z => {
    if (Math.random() < .25) {
      z.className = z.className.replace(/hz-\w+/, ZC[~~(Math.random()*ZC.length)]);
    }
  });
}, 2800);

// ── INCIDENT REPORTING — Fetch API ───────────────
const API = 'http://localhost:3001';

// Map each .sopt button's text → backend type value
const TYPE_MAP = {
  'fight / aggression': 'fight',
  'seat dispute':       'seat_dispute',
  'harassment':         'harassment',
  'medical emergency':  'medical',
};

// Track state per report panel (supports multiple panels on page)
let selectedType     = null;   // current incident type key
let isAnonymous      = false;  // toggled by anon-pill
let isSubmitting     = false;  // prevent double-submit

// ── 1. Type selection (highlight chosen .sopt) ────
document.querySelectorAll('.sopt').forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.textContent.trim().toLowerCase().replace(/^[^\w]+/, '');
    // Find match in TYPE_MAP
    selectedType = null;
    for (const [key, val] of Object.entries(TYPE_MAP)) {
      if (label.includes(key)) { selectedType = val; break; }
    }

    // Visual: mark selected, dim others in same panel
    const siblings = btn.closest('.spvp-opts, .report-options')?.querySelectorAll('.sopt');
    siblings?.forEach(s => {
      s.style.opacity = '0.45';
      s.style.transform = '';
      s.style.boxShadow = '';
    });
    btn.style.opacity = '1';
    btn.style.transform = 'scale(1.03)';
    btn.style.boxShadow = '0 0 12px rgba(79,142,247,0.35)';

    toast(`📋 Selected: ${btn.textContent.trim()}`);
  });
});

// ── 2. Anonymous pill toggle ──────────────────────
document.querySelectorAll('.anon-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    isAnonymous = !isAnonymous;
    pill.textContent   = isAnonymous ? '✓ Anon' : 'Anon';
    pill.style.background   = isAnonymous ? 'rgba(34,197,94,0.2)' : 'rgba(79,142,247,0.2)';
    pill.style.borderColor  = isAnonymous ? 'rgba(34,197,94,0.4)' : 'rgba(79,142,247,0.3)';
    pill.style.color        = isAnonymous ? '#22c55e' : '#4f8ef7';
    toast(isAnonymous ? '🎭 Anonymous mode ON' : '👤 Anonymous mode OFF');
  });
});

// ── 3. Submit button → POST /api/incidents ────────
document.querySelectorAll('.spvp-submit, .report-submit').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (isSubmitting) return;

    // Validate: must select a type first
    if (!selectedType) {
      shakeBtn(btn);
      toast('⚠️ Please select an incident type first', 'warn');
      return;
    }

    isSubmitting = true;
    const original = btn.textContent;
    btn.textContent = '⏳ Sending…';
    btn.style.opacity = '0.7';

    // Build payload
    const payload = {
      type:        selectedType,
      zone:        detectZone(),
      seat:        detectSeat(),
      description: `Fan reported: ${selectedType.replace(/_/g, ' ')} — submitted via StadiumIQ app`,
      severity:    getSeverity(selectedType),
      anonymous:   isAnonymous,
      reportedBy:  isAnonymous ? 'Anonymous' : 'Fan App',
      location:    getLocation(),
      media:       [],
    };

    try {
      const res  = await fetch(`${API}/api/incidents`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Success UI
        btn.textContent = '✅ Reported!';
        btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
        btn.style.opacity = '1';
        toast(`✅ Incident reported! ID: ${data.data.id.slice(0,8)}… — Staff notified`);

        // Auto-update live incident widget in hero
        pushToLiveFeed(data.data);

        // Reset after 3s
        setTimeout(() => {
          btn.textContent  = original;
          btn.style.background = '';
          // Clear selection
          selectedType = null;
          document.querySelectorAll('.sopt').forEach(s => {
            s.style.opacity = ''; s.style.transform = ''; s.style.boxShadow = '';
          });
        }, 3000);

      } else {
        throw new Error(data.message || 'Server error');
      }

    } catch (err) {
      btn.textContent = '❌ Failed — retry';
      btn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
      btn.style.opacity = '1';
      toast(`❌ Could not submit: ${err.message}`, 'error');
      setTimeout(() => {
        btn.textContent = original; btn.style.background = ''; btn.style.opacity = '1';
      }, 3000);
    } finally {
      isSubmitting = false;
    }
  });
});

// ── Helpers ───────────────────────────────────────

/** Try to read zone from the live location display, fallback to mock */
function detectZone() {
  const loc = document.querySelector('.spvp-loc, .report-loc')?.textContent || '';
  const match = loc.match(/Zone\s+\w+/i);
  return match ? match[0] : 'Zone E4';
}

/** Try to read seat from location display */
function detectSeat() {
  const loc = document.querySelector('.spvp-loc, .report-loc')?.textContent || '';
  const match = loc.match(/Seat\s+[\w\d]+/i);
  return match ? match[0] : null;
}

/** Map incident type to a default severity */
function getSeverity(type) {
  const map = { fight: 'high', harassment: 'high', medical: 'critical', seat_dispute: 'low', crowd_clustering: 'critical', other: 'medium' };
  return map[type] || 'medium';
}

/** Return mock GPS coords (in production, use navigator.geolocation) */
function getLocation() {
  return { lat: 28.6139 + (Math.random() - 0.5) * 0.001, lng: 77.2090 + (Math.random() - 0.5) * 0.001 };
}

/** Shake animation for validation error */
function shakeBtn(el) {
  el.style.animation = 'none';
  el.style.transition = 'transform 0.1s ease';
  let s = 0;
  const shake = setInterval(() => {
    el.style.transform = s % 2 === 0 ? 'translateX(6px)' : 'translateX(-6px)';
    if (++s > 6) { clearInterval(shake); el.style.transform = ''; }
  }, 60);
}

/** Push new incident to the live hero feed widget */
function pushToLiveFeed(incident) {
  const rows = document.querySelectorAll('.inc-row');
  if (!rows.length) return;
  const colors = { fight: 'red', harassment: 'red', medical: 'yellow', seat_dispute: 'yellow', crowd_clustering: 'red', other: 'green' };
  const col = colors[incident.type] || 'yellow';
  const label = incident.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  rows[0].innerHTML = rows[1].innerHTML;  rows[0].className = rows[1].className;
  rows[1].innerHTML = rows[2].innerHTML;  rows[1].className = rows[2].className;
  rows[2].innerHTML = `<span class="inc-dot ${col}"></span><span>${label} · ${incident.zone}</span><span class="inc-time">now</span>`;
  rows[2].className = `inc-row ${col}`;
}

// ── FOOD ORDER INTERACTION ────────────────
document.querySelectorAll('.fab:not(.done)').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.textContent = '✓'; btn.classList.add('done');
    btn.closest('.fi').classList.add('fi-done');
    const info = btn.closest('.fi').querySelector('small');
    if (info) info.textContent = '✓ Added to order';
    toast('🍔 Item added! Pickup slot reserved.');
  });
});
document.querySelector('.checkout')?.addEventListener('click', () => toast('✅ Order placed! Collecting your items at Stall 4 — 18:45'));

// ── TOAST ─────────────────────────────────
function toast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:rgba(13,21,38,.97);border:1px solid rgba(79,142,247,.35);backdrop-filter:blur(12px);padding:12px 24px;border-radius:50px;font-size:.88rem;font-family:Outfit,sans-serif;color:#f1f5f9;z-index:9999;opacity:0;transition:all .4s ease;white-space:nowrap;max-width:90vw;box-shadow:0 8px 30px rgba(0,0,0,.4)';
  t.textContent = msg; document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(20px)'; setTimeout(()=>t.remove(),500); }, 3500);
}

// ── SMART NOTIFICATIONS ───────────────────
const NOTIFS = [
  '📍 Gate 2 is less crowded — switch now for 3 min entry',
  '🍟 Stall 6 near you has zero queue right now!',
  '⚽ Match starts in 10 min — head to your seat via Route C',
  '🚽 Washroom on Level 2 is free — Level 3 has 9 min wait',
  '🌡️ North Stand is congested — Route D suggested',
  '🎟️ Gate 4 freshly opened — fastest entry right now',
  '⏱️ Food Court queue dropped to 2 min — grab a bite!',
];
let ni = 0;
setTimeout(()=>{ toast(NOTIFS[ni++%NOTIFS.length]); setInterval(()=>toast(NOTIFS[ni++%NOTIFS.length]),8000); }, 3500);

// ── MEDICAL DOTS ──────────────────────────
setInterval(() => {
  document.querySelectorAll('.mcs').forEach(d => {
    if (Math.random() < .05) { const b=d.classList.contains('busy'); d.classList.toggle('avail',b); d.classList.toggle('busy',!b); }
  });
}, 5000);

// ── WAIT BAR ANIMATION ON REVEAL ─────────
const wbObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.querySelectorAll('.wbfill').forEach(f => { f.style.animationPlayState='running'; }); } });
}, { threshold:.2 });
document.querySelectorAll('.fcard').forEach(c => wbObs.observe(c));

console.log('%c⚡ StadiumIQ — Smart Stadium Experience System','color:#4f8ef7;font-size:1rem;font-weight:bold;background:#050810;padding:8px 16px;border-radius:8px;');

// ── SECURITY SECTION TABS ─────────────────
const tabs = document.querySelectorAll('.sec-tab');
const panels = document.querySelectorAll('.sec-panel');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const idx = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`.sec-panel[data-panel="${idx}"]`).classList.add('active');
    // Re-trigger path animation on safe zone tab
    if (idx === '5') {
      const path = document.querySelector('.sve-path');
      if (path) { path.style.animation = 'none'; requestAnimationFrame(() => { path.style.animation = ''; }); }
    }
  });
});
