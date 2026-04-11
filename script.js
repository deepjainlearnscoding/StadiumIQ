// ══════════════════════════════════════════
//  StadiumIQ — script.js
// ══════════════════════════════════════════

// ── HERO CANVAS ──────────────────────────
const canvas = document.getElementById('heroCanvas');
if (canvas) {
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
}

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
if (nav) {
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 50));
  const ham = document.getElementById('hamburger');
  if (ham) {
    ham.addEventListener('click', () => nav.classList.toggle('menu-open'));
    document.addEventListener('click', e => { if (!nav.contains(e.target)) nav.classList.remove('menu-open'); });
    document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click', () => nav.classList.remove('menu-open')));
    document.addEventListener('keydown', e => { if (e.key==='Escape') nav.classList.remove('menu-open'); });
  }
}

// ── SCROLL REVEAL ─────────────────────────
const reveals = document.querySelectorAll('.fcard,.mct,.pc,.hlc,.arch-step,.phone-wrap,.ssm-animate');
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
if (hc) {
  window.addEventListener('scroll', () => {
    const s = scrollY;
    if (s < innerHeight) { hc.style.transform = `translateY(${s*.1}px)`; hc.style.opacity = 1-s/(innerHeight*.75); }
  });
}

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
// Meta override: <meta name="stadiumiq-api-base" content="https://your-api.example.com" />
// Empty / omitted: same-origin when the page is served by this app, else localhost:3001 for dev.
function stadiumiqApiBase() {
  const meta = document.querySelector('meta[name="stadiumiq-api-base"]');
  if (meta?.content?.trim()) return meta.content.trim().replace(/\/$/, '');
  if (location.protocol === 'file:') return 'http://localhost:3001';
  const p = location.port;
  const sameAsServer = !p || p === '3001' || p === '443' || p === '80';
  if (sameAsServer) return '';
  return 'http://localhost:3001';
}
const API = stadiumiqApiBase();

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

// ── SMART SAFETY MAP — IPL India venues ─────
(function initSmartSafetyMap() {
  const sel = document.getElementById('ssm-stadium');
  const titleEl = document.getElementById('ssm-venue-title');
  const metaEl = document.getElementById('ssm-venue-meta');
  const occEl = document.getElementById('ssm-occupancy-val');
  const tickEl = document.getElementById('ssm-updated');
  const zoneList = document.getElementById('ssm-zone-list');
  const gateList = document.getElementById('ssm-gate-list');
  const medList = document.getElementById('ssm-med-list');
  const layerPitch = document.getElementById('ssm-layer-pitch');
  const layerZones = document.getElementById('ssm-layer-zones');
  const layerMed = document.getElementById('ssm-layer-medical');
  const layerGates = document.getElementById('ssm-layer-gates');
  if (!sel || !layerZones) return;

  const CX = 220;
  const CY = 198;
  const R_IN = 56;
  const R_OUT = 138;
  const R_GATE = 156;
  const R_MED = 92;

  const SSM_STADIUMS = {
    'narendra-modi': {
      name: 'Narendra Modi Stadium',
      city: 'Ahmedabad, Gujarat',
      cap: 132000,
      note: 'IPL final venue · world’s largest cricket stadium',
      zones: ['North Upper', 'North Lower', 'NE Pavilion', 'East Premium', 'East General', 'South Upper', 'South Lower', 'SW Club', 'West Upper', 'West Lower'],
      gates: [
        { label: 'Gate A — North', a: 4 },
        { label: 'Gate B — NE', a: 52 },
        { label: 'Gate C — East', a: 108 },
        { label: 'Gate D — SE', a: 144 },
        { label: 'Gate E — South', a: 184 },
        { label: 'Gate F — SW', a: 232 },
        { label: 'Gate G — West', a: 288 },
        { label: 'Gate H — NW', a: 328 },
      ],
      medical: [
        { label: 'MCA Medical Centre', a: 18 },
        { label: 'First Aid — East', a: 112 },
        { label: 'Paramedic Post — South', a: 198 },
        { label: 'Ambulance Bay — West', a: 270 },
      ],
      hot: [0, 1, 4],
    },
    wankhede: {
      name: 'Wankhede Stadium',
      city: 'Mumbai, Maharashtra',
      cap: 33000,
      note: 'IPL · MCA home ground',
      zones: ['Garware End', 'North Stand', 'VN Suptd Stand', 'Sachin Stand', 'East Stand', 'Sunil Gavaskar', 'Dilip Vengsarkar', 'West Stand', 'MCA Pavilion', 'South Pavilion'],
      gates: [
        { label: 'Gate 1 — Garware', a: 12 },
        { label: 'Gate 2 — North', a: 58 },
        { label: 'Gate 3 — East', a: 118 },
        { label: 'Gate 4 — South', a: 185 },
        { label: 'Gate 5 — West', a: 242 },
        { label: 'Gate 6 — Pavilion', a: 302 },
      ],
      medical: [
        { label: 'Medical Room — North', a: 40 },
        { label: 'St John Ambulance — East', a: 125 },
        { label: 'First Aid — West', a: 255 },
      ],
      hot: [1, 2, 5],
    },
    eden: {
      name: 'Eden Gardens',
      city: 'Kolkata, West Bengal',
      cap: 66000,
      note: 'IPL · CAB · historic venue',
      zones: ['B.C. Roy Clubhouse', 'Pavilion Terrace', 'Kolkata Knight Riders', 'Long Room', 'B Block Upper', 'D Block', 'H Block', 'Club House', 'River Side', 'Green Roof'],
      gates: [
        { label: 'Gate 1 — Clubhouse', a: 8 },
        { label: 'Gate 2 — A-D', a: 72 },
        { label: 'Gate 3 — E-H', a: 140 },
        { label: 'Gate 4 — River', a: 200 },
        { label: 'Gate 5 — Pavilion', a: 265 },
        { label: 'Gate 6 — KKR', a: 320 },
      ],
      medical: [
        { label: 'CAB Medical Bay', a: 30 },
        { label: 'Red Cross Post', a: 155 },
        { label: 'Ambulance — Gate 4', a: 205 },
      ],
      hot: [0, 4, 5],
    },
    chinnaswamy: {
      name: 'M. Chinnaswamy Stadium',
      city: 'Bengaluru, Karnataka',
      cap: 40000,
      note: 'IPL · KSCA · RCB home',
      zones: ['Pavilion Deck', 'Corporate North', 'North East', 'East Stand', 'South East', 'South West', 'West Upper', 'West Lower', 'RCB Fan Zone', 'Hill Stand'],
      gates: [
        { label: 'Gate A — Pavilion', a: 6 },
        { label: 'Gate B — North', a: 64 },
        { label: 'Gate C — East', a: 124 },
        { label: 'Gate D — South', a: 188 },
        { label: 'Gate E — West', a: 248 },
        { label: 'Gate F — Hill', a: 310 },
      ],
      medical: [
        { label: 'KSCA Medical', a: 20 },
        { label: 'First Aid — East', a: 120 },
        { label: 'Paramedic — South', a: 195 },
      ],
      hot: [8, 9, 3],
    },
    kotla: {
      name: 'Arun Jaitley Stadium',
      city: 'New Delhi',
      cap: 42000,
      note: 'IPL · DDCA · Kotla',
      zones: ['North Pavilion', 'Old Club', 'East Upper', 'East Lower', 'Ambedkar', 'South Pavilion', 'West Upper', 'West Lower', 'Hill Road End', 'Ganga Stand'],
      gates: [
        { label: 'Gate 1 — North', a: 10 },
        { label: 'Gate 2 — East', a: 85 },
        { label: 'Gate 3 — South', a: 175 },
        { label: 'Gate 4 — West', a: 265 },
        { label: 'Gate 5 — Pavilion', a: 330 },
      ],
      medical: [
        { label: 'DDCA Medical Room', a: 45 },
        { label: 'First Aid — South', a: 180 },
      ],
      hot: [2, 3, 6],
    },
    chepauk: {
      name: 'M. A. Chidambaram Stadium',
      city: 'Chennai, Tamil Nadu',
      cap: 50000,
      note: 'IPL · TNCA · Chepauk · CSK home',
      zones: ['Anna Pavilion', 'Wallajah', 'North Stand', 'East Upper', 'East Lower', 'South Pavilion', 'West Upper', 'West Lower', 'I Stand', 'K Stand'],
      gates: [
        { label: 'Gate A — Anna', a: 5 },
        { label: 'Gate B — North', a: 55 },
        { label: 'Gate C — East', a: 115 },
        { label: 'Gate D — South', a: 185 },
        { label: 'Gate E — West', a: 245 },
        { label: 'Gate F — I/K', a: 305 },
      ],
      medical: [
        { label: 'TNCA Medical', a: 25 },
        { label: 'Red Cross — East', a: 118 },
        { label: 'Ambulance — South', a: 192 },
      ],
      hot: [0, 4, 5],
    },
    hyderabad: {
      name: 'Rajiv Gandhi Intl Cricket Stadium',
      city: 'Hyderabad, Telangana',
      cap: 55000,
      note: 'IPL · HCA · SRH home',
      zones: ['North Pavilion', 'East Premium', 'East Upper', 'South Pavilion', 'West Premium', 'North East', 'South East', 'South West', 'North West', 'Grass Banks'],
      gates: [
        { label: 'Gate 1 — North', a: 8 },
        { label: 'Gate 2 — East', a: 88 },
        { label: 'Gate 3 — South', a: 178 },
        { label: 'Gate 4 — West', a: 268 },
        { label: 'Gate 5 — VIP', a: 328 },
      ],
      medical: [
        { label: 'HCA Medical Bay', a: 42 },
        { label: 'First Aid — South', a: 185 },
      ],
      hot: [1, 2, 5],
    },
    lucknow: {
      name: 'BRSABV Ekana Cricket Stadium',
      city: 'Lucknow, Uttar Pradesh',
      cap: 50000,
      note: 'IPL · LSG home',
      zones: ['North Gallery', 'East Gallery', 'South Gallery', 'West Gallery', 'Premium North', 'Premium East', 'Premium South', 'Premium West', 'Terrace North', 'Terrace South'],
      gates: [
        { label: 'Gate 1', a: 15 },
        { label: 'Gate 2', a: 75 },
        { label: 'Gate 3', a: 135 },
        { label: 'Gate 4', a: 195 },
        { label: 'Gate 5', a: 255 },
        { label: 'Gate 6', a: 315 },
      ],
      medical: [
        { label: 'Ekana Medical Post', a: 50 },
        { label: 'First Aid — West', a: 270 },
      ],
      hot: [4, 5, 0],
    },
    dharamshala: {
      name: 'HPCA Stadium',
      city: 'Dharamshala, Himachal Pradesh',
      cap: 23000,
      note: 'IPL scenic venue · HPCA',
      zones: ['Snow View North', 'East Stand', 'South Pavilion', 'West Stand', 'Upper North', 'Upper East', 'Upper South', 'Upper West', 'Hill Side', 'Pavilion Deck'],
      gates: [
        { label: 'Gate A — Main', a: 20 },
        { label: 'Gate B — East', a: 110 },
        { label: 'Gate C — South', a: 200 },
        { label: 'Gate D — West', a: 290 },
      ],
      medical: [
        { label: 'HPCA Medical (altitude)', a: 35 },
        { label: 'First Aid — Pavilion', a: 205 },
      ],
      hot: [0, 8, 1],
    },
    guwahati: {
      name: 'Barsapara Cricket Stadium',
      city: 'Guwahati, Assam',
      cap: 40000,
      note: 'IPL · ACA',
      zones: ['North Stand', 'East Stand', 'South Stand', 'West Stand', 'Upper Ring', 'Corporate East', 'Corporate West', 'North East', 'South West', 'Media'],
      gates: [
        { label: 'Gate 1 — North', a: 12 },
        { label: 'Gate 2 — East', a: 102 },
        { label: 'Gate 3 — South', a: 192 },
        { label: 'Gate 4 — West', a: 282 },
      ],
      medical: [
        { label: 'ACA Medical Room', a: 55 },
        { label: 'Ambulance Bay', a: 195 },
      ],
      hot: [1, 4, 2],
    },
    jaipur: {
      name: 'Sawai Mansingh Stadium',
      city: 'Jaipur, Rajasthan',
      cap: 30000,
      note: 'IPL · RCA · RR home',
      zones: ['North Pavilion', 'East Block', 'South Pavilion', 'West Block', 'Upper North', 'Upper East', 'Upper South', 'Upper West', 'Student Gallery', 'VIP'],
      gates: [
        { label: 'Gate 1 — North', a: 10 },
        { label: 'Gate 2 — East', a: 100 },
        { label: 'Gate 3 — South', a: 190 },
        { label: 'Gate 4 — West', a: 280 },
      ],
      medical: [
        { label: 'RCA Medical', a: 48 },
        { label: 'First Aid — South', a: 198 },
      ],
      hot: [2, 5, 1],
    },
    mohali: {
      name: 'Punjab Cricket Association IS Bindra Stadium',
      city: 'Mohali, Punjab',
      cap: 27000,
      note: 'IPL · PCA',
      zones: ['North Stand', 'East Stand', 'South Pavilion', 'West Stand', 'K Pavilion', 'Upper East', 'Upper West', 'Terrace', 'Media', 'VIP'],
      gates: [
        { label: 'Gate 1', a: 14 },
        { label: 'Gate 2', a: 104 },
        { label: 'Gate 3', a: 194 },
        { label: 'Gate 4', a: 284 },
      ],
      medical: [
        { label: 'PCA Medical Bay', a: 60 },
        { label: 'St John — North', a: 8 },
      ],
      hot: [4, 1, 2],
    },
  };

  function polar(r, deg) {
    const rad = (deg * Math.PI) / 180;
    return [CX + r * Math.sin(rad), CY - r * Math.cos(rad)];
  }

  function wedgePoints(r0, r1, a0, a1) {
    const [x0i, y0i] = polar(r0, a0);
    const [x0o, y0o] = polar(r1, a0);
    const [x1o, y1o] = polar(r1, a1);
    const [x1i, y1i] = polar(r0, a1);
    return `${x0i},${y0i} ${x0o},${y0o} ${x1o},${y1o} ${x1i},${y1i}`;
  }

  function densityClass(v) {
    if (v < 0.85) return 'd-low';
    if (v < 1.65) return 'd-med';
    return 'd-high';
  }

  function densityLabel(v) {
    if (v < 0.85) return { t: 'Low', c: 'low' };
    if (v < 1.65) return { t: 'Moderate', c: 'med' };
    return { t: 'High', c: 'high' };
  }

  let zoneVals = [];
  let zoneEls = [];
  let currentKey = null;
  let timer = null;

  function buildPitch() {
    layerPitch.innerHTML = '';
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    el.setAttribute('cx', String(CX));
    el.setAttribute('cy', String(CY));
    el.setAttribute('rx', '48');
    el.setAttribute('ry', '34');
    el.setAttribute('class', 'ssm-pitch');
    layerPitch.appendChild(el);
  }

  function buildZones(st) {
    layerZones.innerHTML = '';
    zoneEls = [];
    zoneVals = st.zones.map((_, i) => {
      let base = Math.random() * 0.9 + 0.35;
      if (st.hot.includes(i)) base += 0.45;
      return Math.min(2, base);
    });
    for (let i = 0; i < 10; i++) {
      const a0 = i * 36;
      const a1 = (i + 1) * 36;
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', wedgePoints(R_IN, R_OUT, a0, a1));
      poly.setAttribute('class', `ssm-zone ${densityClass(zoneVals[i])}`);
      poly.setAttribute('data-zi', String(i));
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      t.textContent = st.zones[i];
      poly.appendChild(t);
      layerZones.appendChild(poly);
      zoneEls.push(poly);
    }
  }

  function buildGates(st) {
    layerGates.innerHTML = '';
    st.gates.forEach((g) => {
      const [gx, gy] = polar(R_GATE, g.a);
      const gr = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const s = 5;
      gr.setAttribute('points', `${gx},${gy - s} ${gx + s},${gy} ${gx},${gy + s} ${gx - s},${gy}`);
      gr.setAttribute('class', 'ssm-gate');
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      t.textContent = g.label;
      gr.appendChild(t);
      layerGates.appendChild(gr);
      const [tx, ty] = polar(R_GATE + 22, g.a);
      const lab = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lab.setAttribute('x', String(tx));
      lab.setAttribute('y', String(ty));
      lab.setAttribute('text-anchor', 'middle');
      lab.setAttribute('class', 'ssm-gate-label');
      const short = g.label.split('—')[0].trim();
      lab.textContent = short.length > 14 ? short.slice(0, 12) + '…' : short;
      layerGates.appendChild(lab);
    });
  }

  function buildMedical(st) {
    layerMed.innerHTML = '';
    st.medical.forEach((m) => {
      const [mx, my] = polar(R_MED, m.a);
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', String(mx));
      c.setAttribute('cy', String(my));
      c.setAttribute('r', '10');
      c.setAttribute('class', 'ssm-med-bg');
      const t0 = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      t0.textContent = m.label;
      c.appendChild(t0);
      layerMed.appendChild(c);
      const cr = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      cr.setAttribute('d', `M${mx - 4},${my}h8M${mx},${my - 4}v8`);
      cr.setAttribute('class', 'ssm-med-cross');
      layerMed.appendChild(cr);
      const [lx, ly] = polar(R_MED - 20, m.a);
      const lab = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lab.setAttribute('x', String(lx));
      lab.setAttribute('y', String(ly));
      lab.setAttribute('text-anchor', 'middle');
      lab.setAttribute('class', 'ssm-med-label');
      lab.textContent = 'Med';
      layerMed.appendChild(lab);
    });
  }

  function gateWaitMin(g, st) {
    const seg = Math.floor(((g.a % 360) + 18) / 36) % 10;
    const v = zoneVals[seg] ?? 1;
    const base = 2 + v * 5 + Math.random() * 4;
    return Math.round(base);
  }

  function renderLists(st) {
    zoneList.innerHTML = '';
    st.zones.forEach((name, i) => {
      const li = document.createElement('li');
      const L = densityLabel(zoneVals[i]);
      li.innerHTML = `<span class="ssm-z-name">${name}</span><span class="ssm-z-val ${L.c}">${L.t}</span>`;
      zoneList.appendChild(li);
    });
    gateList.innerHTML = '';
    st.gates.forEach((g) => {
      const w = gateWaitMin(g, st);
      const li = document.createElement('li');
      li.innerHTML = `<span class="sss-z-name">${g.label}</span><span class="sss-gate-wait">~${w} min queue</span>`;
      gateList.appendChild(li);
    });
    medList.innerHTML = '';
    st.medical.forEach((m) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="sss-z-name">${m.label}</span><span>Staffed</span>`;
      medList.appendChild(li);
    });
    gateList.querySelectorAll('.sss-z-name').forEach((e) => e.classList.replace('sss-z-name', 'ssm-z-name'));
    gateList.querySelectorAll('.sss-gate-wait').forEach((e) => e.classList.replace('sss-gate-wait', 'ssm-gate-wait'));
    medList.querySelectorAll('.sss-z-name').forEach((e) => e.classList.replace('sss-z-name', 'sss-z-name'.replace('sss', 'ssm')));
  }

  function tick() {
    const st = SSM_STADIUMS[currentKey];
    if (!st) return;
    zoneVals = zoneVals.map((v, i) => {
      let nv = v + (Math.random() - 0.5) * 0.38;
      if (st.hot.includes(i)) nv += 0.05;
      return Math.max(0, Math.min(2, nv));
    });
    zoneEls.forEach((el, i) => {
      el.setAttribute('class', `ssm-zone ${densityClass(zoneVals[i])}`);
    });
    renderLists(st);
    if (tickEl) tickEl.textContent = '↻ ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function loadStadium(key) {
    currentKey = key;
    const st = SSM_STADIUMS[key];
    if (!st) return;
    titleEl.textContent = st.name;
    metaEl.textContent = `${st.city} · ${st.note}`;
    const occ = Math.round(st.cap * (0.58 + Math.random() * 0.32));
    occEl.textContent = occ.toLocaleString('en-IN');
    buildPitch();
    buildZones(st);
    buildGates(st);
    buildMedical(st);
    renderLists(st);
    if (tickEl) tickEl.textContent = '↻ ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  Object.entries(SSM_STADIUMS).forEach(([k, v]) => {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = `${v.name} — ${v.city.split(',')[0]}`;
    sel.appendChild(o);
  });

  sel.addEventListener('change', () => {
    if (timer) clearInterval(timer);
    loadStadium(sel.value);
    timer = setInterval(tick, 2800);
  });

  const firstKey = Object.keys(SSM_STADIUMS)[0];
  sel.value = firstKey;
  loadStadium(firstKey);
  timer = setInterval(tick, 2800);
})();

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

// -- HEATMAP BACKGROUND COLOR CYCLING -------------
(function initHeatmapBg() {
  const blobs = document.querySelectorAll('.hm-bg-blob');
  if (!blobs.length) return;
  
  // Base heatmap colors with variable alpha
  const colors = [
    { r: 239, g: 68, b: 68 },   // Red
    { r: 245, g: 158, b: 11 },  // Yellow
    { r: 34, g: 197, b: 94 },   // Green
    { r: 79, g: 142, b: 247 },  // Blue
    { r: 168, g: 85, b: 247 }   // Purple
  ];
  
  setInterval(() => {
    blobs.forEach(blob => {
      // 30% chance to change color per interval
      if (Math.random() > 0.3) return;
      
      const c = colors[Math.floor(Math.random() * colors.length)];
      // Randomize opacity between 0.15 and 0.45
      const a = (Math.random() * 0.3 + 0.15).toFixed(2);
      
      blob.style.background = "radial-gradient(circle, rgba($($c.r),$($c.g),$($c.b),$a) 0%, transparent 70%)";
    });
  }, 4000);
})();

// -- ORGANIC TECH BACKGROUND INIT -------------
(function initOrganicTechBg() {
  if (document.querySelector('.tech-bg')) return;
  const bg = document.createElement('div');
  bg.className = 'tech-bg';
  bg.innerHTML = 
    <div class="tb-grid"></div>
    <div class="tb-lines"></div>
    <div class="tb-lines left"></div>
    <div class="tb-blob b-cyan"></div>
    <div class="tb-blob b-blue"></div>
    <div class="tb-blob b-purple"></div>
    <div class="tb-blob b-orange"></div>
  ;
  document.body.prepend(bg);
})();
