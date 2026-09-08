/* ===== جدار الدعاء — scene.js =====
   مصلى هادئ: جدار كريمي بخط عربي خشبي، بطاقات دعاء مثبتة،
   قوس أبلق يطل على ليلة، أهلة ذهبية وغصون خضراء معلقة. */

import * as THREE from 'three';

/* ================= canvas texture helpers ================= */

function canvasTex(w, h, draw, { repeat = 1, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat !== 1) t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  return t;
}

function noiseOver(ctx, w, h, n, alpha, light) {
  for (let i = 0; i < n; i++) {
    const x = Math.random() * w, y = Math.random() * h;
    const r = 1 + Math.random() * 2.5;
    ctx.fillStyle = Math.random() < 0.5
      ? `rgba(60,45,30,${alpha * Math.random()})`
      : `rgba(255,${light},225,${alpha * 0.8 * Math.random()})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
}

function eightStar(ctx, cx, cy, r, rot = 0) {
  ctx.beginPath();
  for (let k = 0; k < 16; k++) {
    const rr = k % 2 === 0 ? r : r * 0.42;
    const a = rot + (k / 16) * Math.PI * 2;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeGlow() {
  return canvasTex(128, 128, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,232,190,1)');
    g.addColorStop(0.25, 'rgba(255,205,130,0.55)');
    g.addColorStop(0.6, 'rgba(255,170,80,0.15)');
    g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  }, { srgb: false });
}

/* ---------- wall plaster (warm cream, cove light wash up top) ---------- */
function makePlaster() {
  return canvasTex(1024, 1024, (ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#fdf6e8');   // cove wash
    g.addColorStop(0.18, '#f3ecdc');
    g.addColorStop(0.6, '#ece3d1');
    g.addColorStop(1, '#ddd2bc');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    noiseOver(ctx, s, s, 1500, 0.05, 250);
    // subtle horizontal trim lines like the reference wainscot
    ctx.strokeStyle = 'rgba(120,100,70,0.16)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, s * 0.92); ctx.lineTo(s, s * 0.92); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, s * 0.955); ctx.lineTo(s, s * 0.955); ctx.stroke();
  });
}

/* ---------- carpet with prayer rows ---------- */
function makeCarpet() {
  return canvasTex(1024, 1024, (ctx, s) => {
    ctx.fillStyle = '#c3b49c';
    ctx.fillRect(0, 0, s, s);
    noiseOver(ctx, s, s, 4200, 0.07, 240);
    const rows = 4, rh = s / rows;
    for (let r = 0; r < rows; r++) {
      const y = r * rh;
      // prayer-row band
      ctx.fillStyle = 'rgba(120,95,60,0.14)';
      ctx.fillRect(0, y + rh * 0.12, s, rh * 0.16);
      // double pinstripe
      ctx.strokeStyle = 'rgba(96,72,44,0.55)';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0, y + rh * 0.08); ctx.lineTo(s, y + rh * 0.08); ctx.stroke();
      ctx.strokeStyle = 'rgba(150,120,80,0.5)';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, y + rh * 0.14); ctx.lineTo(s, y + rh * 0.14); ctx.stroke();
      // small arch motifs along the row
      ctx.strokeStyle = 'rgba(96,72,44,0.35)';
      ctx.lineWidth = 2.5;
      const n = 8;
      for (let i = 0; i < n; i++) {
        const cx = (i + 0.5) * (s / n);
        ctx.beginPath();
        ctx.moveTo(cx - 26, y + rh * 0.52);
        ctx.quadraticCurveTo(cx, y + rh * 0.3, cx + 26, y + rh * 0.52);
        ctx.stroke();
      }
    }
  }, { repeat: 1 });
}

/* ---------- large wooden calligraphy decal ---------- */
function makeCalligraphy() {
  return canvasTex(2048, 560, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const wood = ctx.createLinearGradient(0, 0, 0, h);
    wood.addColorStop(0, '#7a5230');
    wood.addColorStop(0.5, '#5a3a1e');
    wood.addColorStop(1, '#3c2410');

    function woodText(txt, y, size, family) {
      ctx.font = `700 ${size}px "${family}"`;
      // shrink to fit
      const tw = ctx.measureText(txt).width;
      if (tw > w * 0.9) {
        size = Math.floor(size * (w * 0.9) / tw);
        ctx.font = `700 ${size}px "${family}"`;
      }
      ctx.save();
      ctx.shadowColor = 'rgba(30,16,6,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 7;
      ctx.fillStyle = wood;
      ctx.fillText(txt, w / 2, y);
      ctx.restore();
      ctx.strokeStyle = 'rgba(40,22,8,0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeText(txt, w / 2, y);
    }

    woodText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', h * 0.16, 74, 'Amiri');
    woodText('وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ', h * 0.52, 168, 'Aref Ruqaa');
    woodText('﴿ صَدَقَ اللَّهُ الْعَظِيمُ ﴾', h * 0.86, 56, 'Amiri');
  });
}

/* ---------- framed verse panel for the side wall ---------- */
function makeVersePanel(line1, line2) {
  return canvasTex(512, 640, (ctx, w, h) => {
    ctx.fillStyle = '#f4eddd';
    ctx.fillRect(0, 0, w, h);
    noiseOver(ctx, w, h, 500, 0.05, 245);
    // wooden frame
    ctx.strokeStyle = '#5a3a1e';
    ctx.lineWidth = 22;
    ctx.strokeRect(11, 11, w - 22, h - 22);
    ctx.strokeStyle = 'rgba(184,147,63,0.8)';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, w - 60, h - 60);
    // star above
    ctx.fillStyle = 'rgba(150,110,50,0.75)';
    eightStar(ctx, w / 2, h * 0.2, 34, Math.PI / 16);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#4a2f16';
    ctx.font = '700 62px "Aref Ruqaa"';
    ctx.fillText(line1, w / 2, h * 0.48);
    if (line2) ctx.fillText(line2, w / 2, h * 0.68);
  });
}

/* ---------- carved wooden door inside the pointed arch ---------- */
function makeDoor() {
  return canvasTex(768, 1408, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const SPR = 705, R = 768; // springing line + arc radius (two-centered pointed arch)
    const path = new Path2D();
    path.moveTo(0, h);
    path.lineTo(0, SPR);
    path.arc(R, SPR, R, Math.PI, Math.PI + Math.PI / 3); // left arc up to apex
    path.arc(0, SPR, R, -Math.PI / 3, 0);                // right arc down
    path.lineTo(R, h);
    path.closePath();
    ctx.save();
    ctx.clip(path);

    // wood base
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#8f5a2c');
    g.addColorStop(0.5, '#7a4a22');
    g.addColorStop(1, '#542f14');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // plank seams
    for (let x = 0; x <= w; x += 96) {
      ctx.strokeStyle = 'rgba(40,20,8,0.18)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    // grain streaks
    for (let i = 0; i < 650; i++) {
      const x = Math.random() * w, y = Math.random() * h, l = 20 + Math.random() * 80;
      ctx.strokeStyle = Math.random() < 0.5
        ? `rgba(30,16,6,${0.04 + Math.random() * 0.05})`
        : `rgba(210,160,100,${0.04 + Math.random() * 0.05})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (Math.random() - 0.5) * 6, y + l); ctx.stroke();
    }
    // warm lantern glow from above (like the reference doors)
    const tg = ctx.createRadialGradient(w / 2, 80, 20, w / 2, 80, 560);
    tg.addColorStop(0, 'rgba(255,214,140,0.5)');
    tg.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = tg;
    ctx.fillRect(0, 0, w, h);

    const DARK = 'rgba(30,16,6,0.85)', LITE = '#a8743c';
    // relief-carved stroke: dark offset pass + lit pass
    function carve(draw, lw = 5) {
      ctx.lineWidth = lw;
      ctx.save(); ctx.translate(2, 3); ctx.strokeStyle = DARK; draw(); ctx.restore();
      ctx.strokeStyle = LITE; draw();
    }
    function rosette(cx, cy, r) {
      carve(() => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.78, 0, 7); ctx.stroke();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r * 0.3, cy + Math.sin(a) * r * 0.3);
          ctx.lineTo(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.3, 0, 7); ctx.stroke();
      });
    }
    function fan(cx, cy, r, a0, a1) {
      carve(() => {
        const n = 12;
        for (let i = 0; i <= n; i++) {
          const a = a0 + ((a1 - a0) * i) / n;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, a0, a1); ctx.stroke();
      });
    }

    // center seam strip
    ctx.fillStyle = 'rgba(40,22,10,0.5)';
    ctx.fillRect(w / 2 - 14, 60, 28, h);
    carve(() => {
      for (let y = 120; y < h - 60; y += 90) {
        ctx.beginPath();
        ctx.moveTo(w / 2, y);
        ctx.lineTo(w / 2 + 9, y + 14);
        ctx.lineTo(w / 2, y + 28);
        ctx.lineTo(w / 2 - 9, y + 14);
        ctx.closePath(); ctx.stroke();
      }
    }, 3);

    // tympanum sunburst filling the pointed top
    fan(w / 2, 420, 300, -Math.PI + 0.5, -0.5);

    // door leaves: framed panels with carvings + stud rows
    for (const lx of [84, 428]) {
      const cx = lx + 128;
      // panel frames
      for (const [py, ph] of [[360, 240], [680, 260], [1020, 280]]) {
        carve(() => {
          ctx.strokeRect(lx, py, 256, ph);
          ctx.strokeRect(lx + 14, py + 14, 228, ph - 28);
        }, 4);
      }
      // top panel: rising fan
      fan(cx, 596, 100, -Math.PI + 0.25, -0.25);
      // mid + bottom panels: rosettes
      rosette(cx, 810, 96);
      rosette(cx, 1160, 105);
    }
    // dark studs
    for (const sy of [330, 660, 990, 1340]) {
      for (const lx of [84, 428]) {
        for (const dx of [40, 128, 216]) {
          ctx.fillStyle = '#160c05';
          ctx.beginPath(); ctx.arc(lx + dx, sy, 11, 0, 7); ctx.fill();
          ctx.fillStyle = 'rgba(255,220,160,0.35)';
          ctx.beginPath(); ctx.arc(lx + dx - 3, sy - 3, 3.5, 0, 7); ctx.fill();
        }
      }
    }
    // brass knocker on the right leaf
    ctx.strokeStyle = '#d9b45c';
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(556, 250, 24, 0, 7); ctx.stroke();
    ctx.fillStyle = '#d9b45c';
    ctx.beginPath(); ctx.arc(556, 218, 10, 0, 7); ctx.fill();

    // inner shadow around the arch edge for depth
    ctx.strokeStyle = 'rgba(20,10,4,0.4)';
    ctx.lineWidth = 30;
    ctx.stroke(path);
    // bottom vignette
    const bv = ctx.createLinearGradient(0, h - 200, 0, h);
    bv.addColorStop(0, 'rgba(20,10,4,0)');
    bv.addColorStop(1, 'rgba(20,10,4,0.4)');
    ctx.fillStyle = bv;
    ctx.fillRect(0, h - 200, w, 200);

    ctx.restore();
  });
}

/* ---------- prayer card (paper note, wooden rim, gold pin) ---------- */
function makeCardTexture(variant) {
  const warm = [0.0, 0.3, 0.6, 0.9, 0.45, 0.15][variant % 6];
  const PHRASES = [
    ['اللهم اشفها', ''], ['آمين', 'يارب العالمين'], ['شفاءً', 'عاجلًا'],
    ['الله يعافيها', ''], ['دعواتنا', 'معها'], ['يارب', 'اشفها'],
  ];
  const [l1, l2] = PHRASES[variant % 6];
  return canvasTex(256, 320, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    // drop shadow lifting the note off the wall
    ctx.save();
    ctx.shadowColor = 'rgba(50,32,12,0.55)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#f4e6c6';
    roundRect(ctx, 5, 5, w - 10, h - 10, 16);
    ctx.fill();
    ctx.restore();
    // paper
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#f6ead0');
    g.addColorStop(1, '#ecd9b4');
    ctx.fillStyle = g;
    roundRect(ctx, 5, 5, w - 10, h - 10, 16);
    ctx.fill();
    ctx.fillStyle = `rgba(255,${190 - warm * 30 | 0},110,${0.05 + warm * 0.05})`;
    roundRect(ctx, 5, 5, w - 10, h - 10, 16);
    ctx.fill();
    noiseOver(ctx, w, h, 260, 0.05, 240);
    // wooden rim
    ctx.strokeStyle = '#5a3818';
    ctx.lineWidth = 8;
    roundRect(ctx, 10, 10, w - 20, h - 20, 13);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(184,147,63,0.9)';
    ctx.lineWidth = 2;
    roundRect(ctx, 22, 22, w - 44, h - 44, 8);
    ctx.stroke();
    // handwritten dua on the note
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(96,62,26,0.8)';
    ctx.font = '700 44px "Amiri"';
    if (l2) {
      ctx.fillText(l1, w / 2, h * 0.42);
      ctx.fillText(l2, w / 2, h * 0.62);
    } else {
      ctx.fillText(l1, w / 2, h * 0.52);
    }
    // gold pin
    const pg = ctx.createRadialGradient(w / 2 - 2, 16, 1, w / 2, 18, 9);
    pg.addColorStop(0, '#fff3cf');
    pg.addColorStop(0.6, '#d9a94f');
    pg.addColorStop(1, '#8a6224');
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.arc(w / 2, 18, 8, 0, 7); ctx.fill();
  });
}

function makeLeafTexture() {
  return canvasTex(128, 128, (ctx, s) => {
    ctx.clearRect(0, 0, s, s);
    const c = s / 2;
    const g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#4d8a42');
    g.addColorStop(1, '#2e5c28');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(c, 6);
    ctx.bezierCurveTo(s * 0.92, s * 0.32, s * 0.86, s * 0.72, c, s - 6);
    ctx.bezierCurveTo(s * 0.14, s * 0.72, s * 0.08, s * 0.32, c, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(220,255,200,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(c, 10); ctx.lineTo(c, s - 10); ctx.stroke();
    ctx.lineWidth = 1.6;
    for (let i = 1; i < 6; i++) {
      const y = 10 + (i * (s - 20)) / 6;
      ctx.beginPath(); ctx.moveTo(c, y); ctx.lineTo(c + s * 0.24, y + s * 0.09); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c, y); ctx.lineTo(c - s * 0.24, y + s * 0.09); ctx.stroke();
    }
  });
}

/* ---------- filigree crescent pendant (gold openwork) ---------- */
function makeFiligreeCrescent() {
  return canvasTex(256, 256, (ctx, s) => {
    ctx.clearRect(0, 0, s, s);
    const GOLD = '#d9b45c', HI = '#ffe9b0';
    const outer = { x: 128, y: 142, r: 88 };
    const bite = { x: 128, y: 108, r: 72 };

    // openwork lattice inside the crescent
    ctx.save();
    ctx.beginPath(); ctx.arc(outer.x, outer.y, outer.r, 0, 7); ctx.clip();
    ctx.strokeStyle = 'rgba(217,180,92,0.85)';
    ctx.lineWidth = 2;
    for (let d = -s; d < s * 2; d += 14) {
      ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d + s * 0.55, s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(d, s); ctx.lineTo(d + s * 0.55, 0); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(bite.x, bite.y, bite.r, 0, 7); ctx.fill();
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    // gold outlines (inner circle clipped to the outer one)
    ctx.lineWidth = 7;
    ctx.strokeStyle = GOLD;
    ctx.beginPath(); ctx.arc(outer.x, outer.y, outer.r, 0, 7); ctx.stroke();
    ctx.save();
    ctx.beginPath(); ctx.arc(outer.x, outer.y, outer.r, 0, 7); ctx.clip();
    ctx.beginPath(); ctx.arc(bite.x, bite.y, bite.r, 0, 7); ctx.stroke();
    ctx.restore();
    // highlights
    ctx.lineWidth = 2;
    ctx.strokeStyle = HI;
    ctx.beginPath(); ctx.arc(outer.x - 2, outer.y - 2, outer.r - 4, 0, 7); ctx.stroke();

    // hanging loop
    ctx.lineWidth = 6;
    ctx.strokeStyle = GOLD;
    ctx.beginPath(); ctx.arc(128, 30, 12, 0, 7); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = HI;
    ctx.beginPath(); ctx.arc(126, 28, 9, 0, 7); ctx.stroke();

    // small eight-point star floating in the opening
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = GOLD;
    eightStar(ctx, 128, 106, 24, Math.PI / 16);
    ctx.stroke();
    ctx.fillStyle = 'rgba(217,180,92,0.35)';
    eightStar(ctx, 128, 106, 24, Math.PI / 16);
    ctx.fill();
  });
}

/* ================= geometry helpers ================= */

function wedgeGeo(ro, ri, a0, a1, depth) {
  const s = new THREE.Shape();
  s.absarc(0, 0, ro, a0, a1, false);
  s.absarc(0, 0, ri, a1, a0, true);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 10 });
  g.translate(0, 0, -depth / 2);
  return g;
}

/* pointed (two-centered) arch ring of voussoirs; springing line is y=0,
   half-width hw, arc radius 2*hw, apex at (0, hw*sqrt3) */
function pointedArchRing(hw, band, depth, segPerHalf, mats) {
  const group = new THREE.Group();
  const R = 2 * hw;
  const halves = [
    { c: hw, a0: Math.PI, a1: (Math.PI * 2) / 3 },   // left arc, centered at right springing
    { c: -hw, a0: Math.PI / 3, a1: 0 },              // right arc, centered at left springing
  ];
  halves.forEach((hlf, hi) => {
    for (let i = 0; i < segPerHalf; i++) {
      const a0 = hlf.a0 + ((hlf.a1 - hlf.a0) * i) / segPerHalf;
      const a1 = hlf.a0 + ((hlf.a1 - hlf.a0) * (i + 1)) / segPerHalf;
      const s = new THREE.Shape();
      s.absarc(hlf.c, 0, R + band, a0, a1, true);
      s.absarc(hlf.c, 0, R, a1, a0, false);
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 });
      g.translate(0, 0, -depth / 2);
      group.add(new THREE.Mesh(g, mats[(i + hi) % 2]));
    }
  });
  return group;
}

/* ================= main ================= */

export async function createScene(canvas, { prayers, onCardFocus, onCardBlur } = {}) {
  // calligraphy needs the webfonts in canvas — wait briefly for them
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('700 100px "Aref Ruqaa"'),
        document.fonts.load('700 80px "Amiri"'),
      ]),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch { /* fall back to serif */ }

  const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth < 720;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x140e08);

  const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 120);
  const camBase = new THREE.Vector3(0, 2.75, 10.8);
  const lookBase = new THREE.Vector3(0, 3.5, -6.2);
  function fitCamera() {
    const a = innerWidth / innerHeight;
    camera.fov = a < 0.75 ? 60 : a < 1.1 ? 53 : 46;
    camBase.z = a < 0.75 ? 13.2 : a < 1.1 ? 11.8 : 10.8;
    lookBase.x = a < 0.75 ? -2.4 : a < 1.1 ? -1.2 : 0;
    camera.aspect = a;
    camera.updateProjectionMatrix();
  }
  fitCamera();
  camera.position.copy(camBase);

  const glowTex = makeGlow();
  const leafTex = makeLeafTexture();

  /* ---------- lights ---------- */
  scene.add(new THREE.AmbientLight(0xffe6c4, 0.62));
  scene.add(new THREE.HemisphereLight(0xfff0dc, 0x6a5638, 0.85));
  // warm spotlights washing the prayer wall (cove spots, like the reference)
  const spotTargets = [];
  for (const sx of [-6.5, 0, 6.5]) {
    const sp = new THREE.SpotLight(0xfff0d8, 68, 26, 0.58, 0.95, 1.5);
    sp.position.set(sx, 8.4, -4.4);
    sp.target.position.set(sx, 4.4, -6.2);
    scene.add(sp, sp.target);
    spotTargets.push(sp);
  }
  // soft fill from the room
  const fill = new THREE.PointLight(0xffe0b0, 13, 24, 1.8);
  fill.position.set(0, 5.5, 4);
  scene.add(fill);
  const lowWarm = new THREE.PointLight(0xffd9a0, 5, 14, 1.8);
  lowWarm.position.set(0, 0.8, 2.5);
  scene.add(lowWarm);

  /* ---------- the room ---------- */
  const plaster = makePlaster();
  const WALL = { w: 22, h: 8.6, front: -6.2 };
  const room = new THREE.Group();
  scene.add(room);

  const wallMat = new THREE.MeshStandardMaterial({ map: plaster, roughness: 0.96 });
  const mainWall = new THREE.Mesh(new THREE.BoxGeometry(WALL.w, WALL.h, 0.5), wallMat);
  mainWall.position.set(0, WALL.h / 2, WALL.front - 0.25);
  room.add(mainWall);

  const sideMat = new THREE.MeshStandardMaterial({ map: plaster.clone(), roughness: 0.96 });
  sideMat.map.repeat.set(2, 1);
  for (const side of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.5, WALL.h, 20), sideMat);
    sw.position.set(side * 10.75, WALL.h / 2, 3.4);
    room.add(sw);
  }
  const rearWall = new THREE.Mesh(new THREE.BoxGeometry(WALL.w + 1, WALL.h, 0.5), wallMat);
  rearWall.position.set(0, WALL.h / 2, 13.6);
  room.add(rearWall);

  // ceiling
  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(WALL.w + 1, 21),
    new THREE.MeshStandardMaterial({
      color: 0xf3ecda, roughness: 1,
      emissive: 0xcfc6b2, emissiveIntensity: 0.4,
    })
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, WALL.h, 3.2);
  room.add(ceil);
  // cove strip above the prayer wall
  const cove = new THREE.Mesh(
    new THREE.BoxGeometry(WALL.w - 0.4, 0.1, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xfff4dc })
  );
  cove.position.set(0, WALL.h - 0.08, WALL.front + 0.4);
  room.add(cove);
  const coveGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xfff0d0, transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  coveGlow.scale.set(WALL.w, 3.4, 1);
  coveGlow.position.set(0, WALL.h - 0.7, WALL.front + 0.7);
  room.add(coveGlow);

  // skirting boards
  const skirtMat = new THREE.MeshStandardMaterial({ color: 0xf2ead8, roughness: 0.7 });
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(WALL.w, 0.28, 0.07), skirtMat);
  skirt.position.set(0, 0.14, WALL.front + 0.02);
  room.add(skirt);
  for (const side of [-1, 1]) {
    const sk = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.28, 20), skirtMat);
    sk.position.set(side * 10.48, 0.14, 3.4);
    room.add(sk);
  }

  // carpet
  const carpetTex = makeCarpet();
  carpetTex.repeat.set(2.4, 2.2);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(WALL.w + 1, 21),
    new THREE.MeshStandardMaterial({ map: carpetTex, roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 3.2);
  room.add(floor);

  /* ---------- calligraphy decal ---------- */
  {
    const t = makeCalligraphy();
    const decal = new THREE.Mesh(
      new THREE.PlaneGeometry(13, 3.55),
      new THREE.MeshStandardMaterial({
        map: t, transparent: true, roughness: 0.6,
      })
    );
    decal.material.emissive = new THREE.Color(0x2a1808);
    decal.material.emissiveMap = t;
    decal.material.emissiveIntensity = 0.25;
    decal.position.set(-2.2, 6.3, WALL.front + 0.045);
    scene.add(decal);
  }

  /* ---------- pointed ablaq arch with a carved wooden door ---------- */
  {
    const ARCH = { x: 7.9, spring: 3.55, hw: 1.45, band: 0.5 };
    const F = WALL.front;
    const doorH = 2.8 + ARCH.hw * Math.sqrt(3); // base below springing + apex above
    // the door itself (canvas clipped to the pointed-arch outline)
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(ARCH.hw * 2, doorH),
      new THREE.MeshStandardMaterial({ map: makeDoor(), transparent: true, roughness: 0.75 })
    );
    door.position.set(ARCH.x, ARCH.spring - 2.8 + doorH / 2, F + 0.05);
    scene.add(door);

    // striped pointed voussoir ring
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xdcc9a3, roughness: 0.85 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x523e33, roughness: 0.8 });
    const ring = pointedArchRing(ARCH.hw, ARCH.band, 0.36, 6, [creamMat, darkMat]);
    ring.position.set(ARCH.x, ARCH.spring, F + 0.16);
    scene.add(ring);

    // pilasters down to the sill
    const pilMat = new THREE.MeshStandardMaterial({ color: 0xdcc9a3, roughness: 0.85 });
    for (const dx of [-ARCH.hw, ARCH.hw]) {
      const pil = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.7, 0.42), pilMat);
      pil.position.set(ARCH.x + dx, ARCH.spring - 1.35, F + 0.15);
      scene.add(pil);
    }
    const sill = new THREE.Mesh(new THREE.BoxGeometry(ARCH.hw * 2 + ARCH.band * 2 + 0.5, 0.3, 0.5), pilMat);
    sill.position.set(ARCH.x, 0.78, F + 0.15);
    scene.add(sill);

    // small lantern hanging in front of the door apex, like the references
    const lanGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xffc27a, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    lanGlow.scale.setScalar(1.6);
    lanGlow.position.set(ARCH.x, ARCH.spring + 1.1, F + 0.7);
    scene.add(lanGlow);
    const lanLight = new THREE.PointLight(0xffb35c, 5, 7, 1.8);
    lanLight.position.set(ARCH.x, ARCH.spring + 1.1, F + 0.9);
    scene.add(lanLight);
  }

  /* ---------- hanging ornaments: filigree crescents + green sprigs ---------- */
  const ornaments = [];
  const stringMat = new THREE.MeshBasicMaterial({ color: 0x4a3a22 });
  const filigreeTex = makeFiligreeCrescent();
  const filigreeMat = new THREE.MeshStandardMaterial({
    map: filigreeTex, transparent: true, alphaTest: 0.08, side: THREE.DoubleSide,
    metalness: 0.55, roughness: 0.35,
    emissive: 0x9a7020, emissiveMap: filigreeTex, emissiveIntensity: 0.4,
  });
  const sprigLeafMat = new THREE.MeshStandardMaterial({
    map: leafTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide,
    roughness: 1, color: 0xa8c890, emissive: 0x2a4a22, emissiveIntensity: 0.35,
  });

  function hangCrescent(x, y, z) {
    const g = new THREE.Group();
    const s = 0.95 + Math.random() * 0.2;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), filigreeMat);
    g.add(m);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xffd98a, transparent: true, opacity: 0.14,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(s * 1.9);
    g.add(glow);
    const hang = WALL.h - y;
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, hang, 3), stringMat);
    str.position.y = hang / 2 + s * 0.45;
    g.add(str);
    g.position.set(x, y, z);
    scene.add(g);
    ornaments.push({ g, phase: Math.random() * 9, amp: 0.04 + Math.random() * 0.05, spin: 0.1 + Math.random() * 0.15 });
    return g;
  }

  function hangSprig(x, y, z) {
    const g = new THREE.Group();
    const twigMat = new THREE.MeshStandardMaterial({ color: 0x4a5a2a, roughness: 1 });
    const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.9, 4), twigMat);
    g.add(twig);
    for (let i = 0; i < 8; i++) {
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.3), sprigLeafMat);
      const t0 = (i / 8) - 0.4;
      leaf.position.set((i % 2 ? 1 : -1) * 0.1, t0 * 0.85, 0);
      leaf.rotation.set(0.4, (i % 2 ? 0.7 : -0.7), (i % 2 ? -0.9 : 0.9));
      g.add(leaf);
    }
    const hang = WALL.h - y;
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, hang, 3), stringMat);
    str.position.y = hang / 2 + 0.45;
    g.add(str);
    g.position.set(x, y, z);
    scene.add(g);
    ornaments.push({ g, phase: Math.random() * 9, amp: 0.05 + Math.random() * 0.05, spin: 0.15 + Math.random() * 0.25 });
    return g;
  }

  {
    // symmetric spread — kept clear of the calligraphy decal (x -8.7..4.3, y 4.5..8.1)
    // and of the arch window (x 6..9.8)
    const layout = [
      [-9.4, 5.7, -5.2, 'c1'],                             // far left flank
      [-5.6, 4.5, -3.6, 's'],  [1.8, 4.45, -3.2, 's'],   // sprigs under the verse
      [-3.6, 4.35, -3.0, 'c0'], [4.3, 4.4, -3.4, 'c0'],  // small crescents below the verse
      [-6.2, 4.6, 0.8, 'c1'],  [6.4, 4.8, 0.6, 's'],     // foreground, floating in the room
    ];
    const use = isMobile ? layout.filter((_, i) => i % 2 === 0) : layout;
    for (const [x, y, z, kind] of use) {
      if (kind === 's') hangSprig(x, y, z);
      else hangCrescent(x, y, z);
    }
  }

  /* ---------- dust motes in the light wash ---------- */
  let dust;
  {
    const N = isMobile ? 120 : 240;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 19;
      pos[i * 3 + 1] = Math.random() * 7.6;
      pos[i * 3 + 2] = -5.5 + Math.random() * 11;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    dust = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xffe4b8, size: 0.045, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(dust);
  }

  /* ---------- prayer cards on the wall ---------- */
  const cardTextures = [0, 1, 2, 3, 4, 5].map(makeCardTexture);
  const cardGeo = new THREE.PlaneGeometry(0.66, 0.8);
  const COLS = 10, ROWS = 5, CAP = COLS * ROWS;
  const slots = [];
  {
    // cards fill the wall left of the arch window
    const x0 = -9.8, x1 = 6.0, bottom = 1.0, top = 4.65;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        slots.push({
          x: x0 + ((c + 0.5) / COLS) * (x1 - x0) + (Math.random() - 0.5) * 0.05,
          y: bottom + ((ROWS - 1 - r + 0.5) / ROWS) * (top - bottom) + (Math.random() - 0.5) * 0.04,
          z: WALL.front + 0.06,
          card: null,
        });
      }
    }
    // fill from the center outward so the wall grows symmetrically
    slots.sort((a, b) => (Math.abs(a.x + 1.9) + Math.abs(a.y - 2.8) * 0.6) - (Math.abs(b.x + 1.9) + Math.abs(b.y - 2.8) * 0.6));
  }

  const cards = [];
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2(-2, -2);
  let pointerDirty = false;
  let hovered = null;

  function makeCard(prayer, slot) {
    const tex = cardTextures[(Math.random() * cardTextures.length) | 0];
    const mat = new THREE.MeshStandardMaterial({
      map: tex, emissive: 0xffd9a0, emissiveMap: tex,
      emissiveIntensity: 0.16, roughness: 0.9, transparent: true,
    });
    const mesh = new THREE.Mesh(cardGeo, mat);
    const s = 0.74 + Math.random() * 0.18;
    mesh.scale.setScalar(s);
    mesh.position.set(slot.x, slot.y, slot.z);
    const card = {
      mesh, mat, prayer, slot,
      phase: Math.random() * 9,
      pulseSpeed: 0.5 + Math.random() * 0.5,
      glowBase: 0.1 + Math.random() * 0.07,
      baseScale: s,
      hoverT: 0,
      born: -1,
      intro: null,
      fadeOut: -1,
    };
    slot.card = card;
    cards.push(card);
    scene.add(mesh);
    return card;
  }

  function removeCard(card) {
    const i = cards.indexOf(card);
    if (i >= 0) cards.splice(i, 1);
    if (card.slot.card === card) card.slot.card = null;
    scene.remove(card.mesh);
    card.mat.dispose();
    if (hovered === card) { hovered = null; onCardBlur?.(); }
  }

  function freeSlot() {
    const empty = slots.find((s) => !s.card);
    if (empty) return empty;
    let oldest = null;
    for (const s of slots) {
      if (s.card && (!oldest || s.card.prayer.created_at < oldest.card.prayer.created_at)) oldest = s;
    }
    if (oldest?.card) {
      oldest.card.fadeOut = clock.elapsedTime;
      const c = oldest.card;
      setTimeout(() => removeCard(c), 450);
    }
    return oldest;
  }

  function addPrayer(prayer) {
    const slot = freeSlot();
    if (!slot) return;
    const card = makeCard(prayer, slot);
    card.intro = { t0: clock.elapsedTime + Math.random() * 1.4, dur: 0.9, kind: 'pop' };
    card.mesh.scale.setScalar(0.001);
  }

  /* ---------- leaf-carried arrival, in through the arch window ---------- */
  const flyLeaf = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.68),
    new THREE.MeshStandardMaterial({
      map: leafTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide,
      color: 0xb8d898, emissive: 0x3a5a2a, emissiveIntensity: 0.6,
    })
  );
  flyLeaf.visible = false;
  scene.add(flyLeaf);
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xffe0b0, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  flash.scale.setScalar(0.1);
  scene.add(flash);
  let flashT = -1;

  function addPrayerAnimated(prayer) {
    const slot = freeSlot();
    if (!slot) return;
    const card = makeCard(prayer, slot);
    const from = new THREE.Vector3(7.9, 3.0 + Math.random() * 1.6, WALL.front + 0.3);
    const ctrl = new THREE.Vector3(4.0, 6.4, -3.6);
    card.intro = {
      t0: clock.elapsedTime + 0.15, dur: 2.6, kind: 'fly',
      from, ctrl, to: new THREE.Vector3(slot.x, slot.y, slot.z),
    };
    card.mesh.position.copy(from);
    card.mesh.scale.setScalar(0.6);
  }

  /* ---------- pointer / raycast ---------- */
  function setPointer(e) {
    pointerNdc.x = (e.clientX / innerWidth) * 2 - 1;
    pointerNdc.y = -(e.clientY / innerHeight) * 2 + 1;
    pointerDirty = true;
  }
  addEventListener('pointermove', setPointer, { passive: true });
  addEventListener('pointerdown', (e) => {
    setPointer(e);
    raycastCards(true);
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().catch(() => {});
    }
  }, { passive: true });

  const projV = new THREE.Vector3();
  function cardScreenPos(card) {
    projV.copy(card.mesh.position).project(camera);
    if (projV.z > 1) return { behind: true };
    return {
      x: (projV.x * 0.5 + 0.5) * innerWidth,
      y: (-projV.y * 0.5 + 0.5) * innerHeight,
    };
  }

  function raycastCards(isTap) {
    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObjects(cards.map((c) => c.mesh), false);
    const card = hits.length ? cards.find((c) => c.mesh === hits[0].object) : null;
    if (card === hovered && !isTap) return;
    if (hovered && hovered !== card) { onCardBlur?.(); hovered = null; }
    if (card && card.intro === null) {
      hovered = card;
      onCardFocus?.(card.prayer, () => cardScreenPos(card));
    } else if (!card) {
      hovered = null;
    }
    pointerDirty = false;
  }

  // parallax targets
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    par.tx = (e.clientX / innerWidth - 0.5) * 2;
    par.ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    par.tx = THREE.MathUtils.clamp(e.gamma / 35, -1, 1);
    par.ty = THREE.MathUtils.clamp((e.beta - 45) / 40, -1, 1);
  }, { passive: true });

  /* ---------- resize / visibility ---------- */
  function onResize() {
    fitCamera();
    renderer.setSize(innerWidth, innerHeight);
  }
  addEventListener('resize', onResize);

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { clock.getDelta(); requestAnimationFrame(tick); }
  });

  /* ---------- loop ---------- */
  const clock = new THREE.Clock();
  const motion = reduced ? 0.25 : 1;

  function updateIntro(card, t) {
    const it = card.intro;
    const k = (t - it.t0) / it.dur;
    if (k < 0) return;
    if (k >= 1) {
      card.intro = null;
      card.born = t;
      card.mesh.position.set(card.slot.x, card.slot.y, card.slot.z);
      card.mesh.rotation.set(0, 0, 0);
      card.mesh.scale.setScalar(card.baseScale);
      if (it.kind === 'fly') {
        flashT = t;
        flash.position.set(card.slot.x, card.slot.y, card.slot.z + 0.35);
        flyLeaf.visible = false;
      }
      return;
    }
    const e = 1 - Math.pow(1 - k, 3); // easeOutCubic
    if (it.kind === 'pop') {
      card.mesh.scale.setScalar(Math.max(0.001, e * card.baseScale));
    } else {
      const { from, ctrl, to } = it;
      const a = (1 - e) * (1 - e), b = 2 * (1 - e) * e, c2 = e * e;
      card.mesh.position.set(
        a * from.x + b * ctrl.x + c2 * to.x,
        a * from.y + b * ctrl.y + c2 * to.y,
        a * from.z + b * ctrl.z + c2 * to.z
      );
      card.mesh.rotation.z = Math.sin(k * 9) * 0.5 * (1 - k);
      card.mesh.rotation.y = Math.sin(k * 7) * 0.7 * (1 - k);
      flyLeaf.visible = true;
      const la = k * 14;
      const lr = 0.8 * (1 - k * 0.6);
      flyLeaf.position.set(
        card.mesh.position.x + Math.cos(la) * lr,
        card.mesh.position.y + Math.sin(la * 1.3) * lr * 0.5 + 0.3,
        card.mesh.position.z + Math.sin(la) * lr * 0.4 + 0.2
      );
      flyLeaf.rotation.z = la * 0.7;
    }
  }

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // camera drift + parallax
    par.x += (par.tx - par.x) * 0.03;
    par.y += (par.ty - par.y) * 0.03;
    camera.position.set(
      camBase.x + Math.sin(t * 0.05) * 0.4 * motion + par.x * 1.25,
      camBase.y + Math.sin(t * 0.037) * 0.2 * motion - par.y * 0.5,
      camBase.z + Math.sin(t * 0.021) * 0.28 * motion
    );
    camera.lookAt(
      lookBase.x + par.x * 0.8,
      lookBase.y - par.y * 0.35,
      lookBase.z
    );

    // ornaments sway gently, faces stay readable
    for (const o of ornaments) {
      o.g.rotation.z = Math.sin(t * 0.55 + o.phase) * o.amp * motion;
      o.g.rotation.y = Math.sin(t * o.spin + o.phase) * 0.22;
    }

    // dust drift
    {
      const p = dust.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        let y = p.getY(i) + dt * 0.05 * motion;
        if (y > 7.6) y = 0.1;
        p.setY(i, y);
        p.setX(i, p.getX(i) + Math.sin(t * 0.35 + i) * dt * 0.04);
      }
      p.needsUpdate = true;
    }

    // cards
    for (let i = cards.length - 1; i >= 0; i--) {
      const c = cards[i];
      if (c.intro) updateIntro(c, t);
      if (c.fadeOut > 0) {
        const k = 1 - (t - c.fadeOut) / 0.45;
        c.mesh.scale.setScalar(Math.max(0.001, k * c.baseScale));
        if (k <= 0) { removeCard(c); continue; }
      }
      if (!c.intro) {
        c.mesh.rotation.z = Math.sin(t * 0.4 + c.phase) * 0.012 * motion;
        c.mesh.rotation.x = Math.sin(t * 0.33 + c.phase * 2) * 0.01 * motion;
      }
      const target = c === hovered ? 1 : 0;
      c.hoverT += (target - c.hoverT) * 0.12;
      const pulse = c.glowBase + Math.sin(t * c.pulseSpeed + c.phase) * 0.045;
      let boost = 0;
      if (c.born > 0 && t - c.born < 2) boost = (1 - (t - c.born) / 2) * 1.1;
      c.mat.emissiveIntensity = pulse + c.hoverT * 0.55 + boost;
      if (!c.intro && c.fadeOut < 0) {
        const z = c.slot.z + c.hoverT * 0.5;
        const sc = (1 + c.hoverT * 0.3);
        c.mesh.position.z += (z - c.mesh.position.z) * 0.15;
        c.mesh.scale.setScalar(c.baseScale * sc);
      }
    }

    // arrival flash
    if (flashT >= 0) {
      const k = (t - flashT) / 0.9;
      if (k >= 1) { flashT = -1; flash.material.opacity = 0; }
      else {
        flash.material.opacity = 0.8 * (1 - k);
        flash.scale.setScalar(0.4 + k * 3.6);
      }
    }

    if (pointerDirty) raycastCards(false);

    renderer.render(scene, camera);
  }

  clock.start();
  tick();

  // populate the wall with everything we already have
  (prayers || []).forEach((p) => addPrayer(p));

  return {
    addPrayer,
    addPrayerAnimated,
    dispose() {
      running = false;
      renderer.dispose();
    },
  };
}
