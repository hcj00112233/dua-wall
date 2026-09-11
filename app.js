/* ===== جدار الدعاء — app.js =====
   UI, data layer (Supabase أو localStorage), audio, and scene bootstrap. */

'use strict';

/* ---------- Arabic-Indic numerals ---------- */
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const toAr = (n) => String(n).replace(/\d/g, (d) => AR_DIGITS[+d]);

/* ---------- seed prayers (Saudi colloquial) ---------- */
const SEEDS = [
  { name: 'أم عبدالله', msg: 'يارب تكفى اشفها شفاء ما يبقي سقم' },
  { name: null, msg: 'الله يعافيها ويريح قلب اهلها' },
  { name: 'نورة من الرياض', msg: 'شفاها الله، دعواتنا كلها معاها' },
  { name: null, msg: 'يارب ارحم براءتها واشفها يارب العالمين' },
  { name: 'أبو فهد', msg: 'اللهم اشفها وعافها واربط على قلب والدتها' },
  { name: null, msg: 'يا كريم، بنية صغيرة وقلبها طاهر، اشفها يارب' },
  { name: 'سارة', msg: 'الله يشفيها ويقومها بالسلامة لاهلها' },
  { name: null, msg: 'دعواتي لها بالشفاء العاجل يارب' },
  { name: 'عبدالعزيز', msg: 'يارب خفف عنها وجعها واشفها' },
  { name: null, msg: 'اللهم اجعلها من المعافين واكتب لها الصحة والعافية' },
  { name: 'أختكم من جدة', msg: 'يارب تشفيها وتفرح قلب امها فيها' },
  { name: null, msg: 'الله يحفظها ويعافيها ويطول بعمرها' },
  { name: 'أم فيصل', msg: 'أسأل الله العظيم رب العرش العظيم أن يشفيها' },
  { name: null, msg: 'يارب لك الحمد، اشف بنيتنا وعافها' },
  { name: 'رهف', msg: 'اللهم بارك في عمرها واشفها وارحمها برحمتك' },
  { name: null, msg: 'يارب انت الشافي، اشفها شفاءً عاجلًا' },
  { name: 'سلطان', msg: 'قلبي معها ومع اهلها، الله يشفيها' },
  { name: null, msg: 'الله يجعل مرضها رفعة في درجاتها ويشفيها' },
  { name: 'منيرة', msg: 'يارب فرّجها وشافيها وعافيها' },
  { name: null, msg: 'اللهم رب الناس، اذهب الباس واشفها، انت الشافي' },
  { name: 'أبو ريان', msg: 'يارب تكفى يا كريم، بنية صغيرة تحتاج دعواتنا' },
  { name: null, msg: 'الله يشفيها ويعوض اهلها خير' },
  { name: 'الجوهرة', msg: 'يا مقلب القلوب ثبت قلبها واشف بدنها' },
  { name: null, msg: 'اللهم إني أسألك باسمك الشافي أن تشفيها' },
  { name: 'فهد من الدمام', msg: 'شفاها ربي ولبسها ثوب الصحة والعافية' },
  { name: null, msg: 'يارب اشف كل مريض، واشف بنيتنا يارب' },
  { name: 'أم ليان', msg: 'الله يقويها ويقومها بالسلامة' },
  { name: null, msg: 'دعوة من القلب، يارب اشفها' },
  { name: 'مشعل', msg: 'اللهم اجعل ما بها رحمة وشفاء وعافية' },
  { name: null, msg: 'يارب ارحم ضعفها وصغر سنها واشفها' },
  { name: 'بدرية', msg: 'الله يكتب لها العافية ويبعد عنها كل شر' },
  { name: null, msg: 'امين يارب العالمين، شفاء عاجل لها' },
  { name: 'أخوكم من القصيم', msg: 'يارب لا تحرمنا الأجر واشفها وعافها' },
  { name: null, msg: 'اللهم اشفها شفاءً لا يغادر سقمًا' },
  { name: 'دانة', msg: 'يا فتاح يا كريم، افتح لها باب الشفاء' },
  { name: null, msg: 'الله يعين امها وابوها ويشفي بنيتهم' },
  { name: 'تركي', msg: 'يارب بشّرنا بشفاها قريب' },
  { name: null, msg: 'دعواتي لها كل ليلة، الله يشفيها' },
  { name: 'أم جود', msg: 'سبحانك اللهم اشفها وارحمنا برحمتك' },
  { name: null, msg: 'يارب اجعل لياليها القادمة كلها عافية' },
  { name: 'ناصر', msg: 'الله يشفيها ويخليها لاهلها يارب' },
  { name: null, msg: 'ما شاء الله عليها قوية، والله يتمم لها الشفاء' },
].map((p, i) => ({
  id: `seed-${i}`,
  name: p.name,
  message: p.msg,
  created_at: new Date(Date.now() - (SEEDS_AGE(i)) * 60000).toISOString(),
  seed: true,
}));
function SEEDS_AGE(i) { return (i * 53 + 17) % 4320; } // دقائق عشوائية ثابتة

/* ---------- basic filter (length + profanity) ---------- */
const BANNED = [
  'كس', 'طيز', 'شرموط', 'قحب', 'زب', 'خرا', 'خراء', 'يلعن', 'لعنة الله عليك',
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'porn', 'sex',
];
function cleanText(s) {
  return String(s || '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function validate(name, msg) {
  if (msg.length < 2) return 'اكتب دعوتك أول يا طيب';
  if (msg.length > 140) return 'الدعوة طويلة، خلّها ١٤٠ حرف';
  if (name.length > 30) return 'الاسم طويل شوي';
  const low = msg.toLowerCase();
  if (BANNED.some((w) => low.includes(w))) return 'خليها دعوة طيبة من قلبك 🤍';
  if (/(.)\1{9,}/.test(msg)) return 'شكل فيه أحرف مكررة كثير، عدّلها شوي';
  return null;
}

/* ---------- data layer ---------- */
const LS_KEY = 'duaWall.prayers.v1';
const LS_RATE = 'duaWall.lastSubmit.v1';

function lsLoad() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function lsSave(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list.slice(-400))); } catch {}
}

const cfg = (typeof window !== 'undefined' && window.DUA_CONFIG) || {};
const hasSupabase = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

const store = {
  mode: hasSupabase ? 'supabase' : 'local',
  sb: null,

  async init() {
    if (!hasSupabase) return;
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      this.sb = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      this.pingViews();
    } catch (e) {
      console.warn('[dua] supabase unavailable, local mode', e);
      this.mode = 'local';
    }
  },

  async pingViews() {
    if (this.mode === 'supabase' && this.sb) {
      try { await this.sb.rpc('bump_views'); } catch {}
    }
  },

  async fetchAll() {
    if (this.mode === 'supabase' && this.sb) {
      const { data, error } = await this.sb
        .from('prayers')
        .select('id,name,message,created_at')
        .order('created_at', { ascending: true })
        .limit(500);
      if (!error && data) return data.map((d) => ({ ...d, seed: false }));
      console.warn('[dua] fetch failed, using local', error);
      this.mode = 'local';
    }
    return lsLoad().map((d) => ({ ...d, seed: false }));
  },

  async insert(prayer) {
    if (this.mode === 'supabase' && this.sb) {
      const { data, error } = await this.sb
        .from('prayers')
        .insert({ name: prayer.name, message: prayer.message })
        .select()
        .single();
      if (!error && data) return { ...data, seed: false };
      console.warn('[dua] insert failed, saved locally', error);
    }
    const local = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: prayer.name,
      message: prayer.message,
      created_at: new Date().toISOString(),
      seed: false,
    };
    lsSave([...lsLoad(), local]);
    return local;
  },

  subscribe(onInsert) {
    if (this.mode !== 'supabase' || !this.sb) return () => {};
    const ch = this.sb
      .channel('prayers-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prayers' },
        (payload) => onInsert({ ...payload.new, seed: false }))
      .subscribe();
    return () => { try { this.sb.removeChannel(ch); } catch {} };
  },
};

/* ---------- legacy generative ambient (unused — replaced by bgm.mp3, see audio toggle) ----------
   ناي هادئ على مقام البيات + قانون خفيف + بساط دافئ — سكينة وطمأنينة */
const ambient = {
  ctx: null, master: null, playing: false, timer: null, neyTimer: null,
  // مقام بيات على ري (D, E half-flat, F, G, A, Bb, C, D)
  scale: [146.83, 160.0, 174.61, 196.0, 220.0, 233.08, 261.63, 293.66],

  start() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      this.startPad();
    }
    this.ctx.resume();
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 3);
    this.playing = true;
    this.schedulePlucks();
    this.scheduleNey();
  },

  stop() {
    if (!this.ctx) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
    this.playing = false;
    clearTimeout(this.timer);
    clearTimeout(this.neyTimer);
  },

  startPad() {
    const t = this.ctx;
    const padGain = t.createGain();
    padGain.gain.value = 0.4;
    const lp = t.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 380; lp.Q.value = 0.4;
    padGain.connect(lp); lp.connect(this.master);
    // بساط دافئ: ري + لا + ري عالية
    [73.42, 110.0, 146.83].forEach((f, i) => {
      const o = t.createOscillator();
      o.type = i === 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.detune.value = (i - 1) * 3;
      const g = t.createGain();
      g.gain.value = i === 2 ? 0.04 : 0.11;
      o.connect(g); g.connect(padGain);
      o.start();
    });
    // أنفاس الناي: ضوضاء مفلترة تتنفس ببطء
    const len = t.sampleRate * 2;
    const buf = t.createBuffer(1, len, t.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const noise = t.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const bp = t.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 590; bp.Q.value = 10;
    const ng = t.createGain(); ng.gain.value = 0.012;
    const lfo = t.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoG = t.createGain(); lfoG.gain.value = 0.007;
    lfo.connect(lfoG); lfoG.connect(ng.gain);
    noise.connect(bp); bp.connect(ng); ng.connect(this.master);
    noise.start(); lfo.start();
  },

  // قانون: نقرات قصيرة لامعة، بطيئة ومتباعدة
  pluck(freq, when, vol = 0.4) {
    const t = this.ctx;
    const o = t.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq * 1.004, when);
    o.frequency.exponentialRampToValueAtTime(freq, when + 0.03);
    const g = t.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol * 0.22, when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 2.2);
    const lp = t.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3000, when);
    lp.frequency.exponentialRampToValueAtTime(550, when + 1.9);
    o.connect(g); g.connect(lp); lp.connect(this.master);
    o.start(when); o.stop(when + 2.4);
  },

  // ناي: نغمة طويلة باهتزاز خفيف وهجوم بطيء
  ney(freq, when, dur, vol = 0.5) {
    const t = this.ctx;
    const o = t.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, when);
    // فيبراتو
    const vib = t.createOscillator();
    vib.frequency.value = 4.6;
    const vibG = t.createGain();
    vibG.gain.value = freq * 0.006;
    vib.connect(vibG); vibG.connect(o.frequency);
    const g = t.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol * 0.16, when + dur * 0.35);
    g.gain.setValueAtTime(vol * 0.16, when + dur * 0.7);
    g.gain.linearRampToValueAtTime(0, when + dur);
    // شحنة هوائية خفيفة
    const bp = t.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = freq * 2.1; bp.Q.value = 1.2;
    o.connect(g); g.connect(bp); bp.connect(this.master);
    o.start(when); o.stop(when + dur + 0.1);
    vib.start(when); vib.stop(when + dur + 0.1);
  },

  schedulePlucks() {
    if (!this.playing) return;
    const now = this.ctx.currentTime + 0.08;
    // أربيجيو صاعد هادئ أحيانًا، ونغمات مفردة غالبًا
    if (Math.random() < 0.3) {
      const base = (Math.random() * 3) | 0;
      [0, 2, 4, 7].forEach((st, i) => {
        this.pluck(this.scale[(base + st) % this.scale.length] * 2, now + i * 0.24, 0.3);
      });
    } else {
      const f = this.scale[(Math.random() * this.scale.length) | 0];
      this.pluck(f * (Math.random() < 0.3 ? 2 : 1), now, 0.35 + Math.random() * 0.3);
    }
    this.timer = setTimeout(() => this.schedulePlucks(), 2200 + Math.random() * 3400);
  },

  scheduleNey() {
    if (!this.playing) return;
    const now = this.ctx.currentTime + 0.1;
    // عبارة ناي: نغمتان أو ثلاث طويلة تنزل للقرار
    const phrase = [];
    const n = 2 + (Math.random() < 0.4 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      phrase.push(this.scale[(Math.random() * this.scale.length) | 0]);
    }
    phrase.push(this.scale[0]); // حل على ري
    let when = now;
    for (const f of phrase) {
      const dur = 1.8 + Math.random() * 1.6;
      this.ney(f, when, dur, 0.4 + Math.random() * 0.25);
      when += dur * 0.82;
    }
    this.neyTimer = setTimeout(() => this.scheduleNey(), (when - now) * 1000 + 3000 + Math.random() * 5000);
  },
};

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const veil = $('veil');
const counterNum = $('counterNum');
const cta = $('cta');
const modalBackdrop = $('modalBackdrop');
const nameInput = $('nameInput');
const msgInput = $('msgInput');
const charCount = $('charCount');
const formError = $('formError');
const submitBtn = $('submitBtn');
const cancelBtn = $('cancelBtn');
const toast = $('toast');
const audioToggle = $('audioToggle');
const overlay = $('cardOverlay');
const overlayMsg = $('overlayMsg');
const overlayName = $('overlayName');

/* ---------- state ---------- */
let prayers = [];
let scene = null;
let sceneReady = false;
const pendingAnimated = [];
const knownIds = new Set();

/* ---------- counter ---------- */
function renderCounter(bump = false) {
  counterNum.textContent = toAr(prayers.length);
  if (bump) {
    counterNum.classList.add('bump');
    setTimeout(() => counterNum.classList.remove('bump'), 280);
  }
}

/* ---------- overlay (hover/tap on 3D card) ---------- */
let overlayGetter = null;
function showOverlay(prayer, getPos) {
  overlayMsg.textContent = prayer.message;
  overlayName.textContent = prayer.name ? `— ${prayer.name}` : '— مجهول بقلب طيب';
  overlay.hidden = false;
  overlayGetter = getPos;
  positionOverlay();
}
function hideOverlay() {
  overlay.hidden = true;
  overlayGetter = null;
}
function positionOverlay() {
  if (!overlayGetter || overlay.hidden) return;
  const p = overlayGetter();
  if (!p || p.behind) { overlay.style.opacity = '0'; return; }
  overlay.style.opacity = '1';
  const pad = 12;
  const w = overlay.offsetWidth, h = overlay.offsetHeight;
  let x = Math.min(Math.max(p.x, w / 2 + pad), innerWidth - w / 2 - pad);
  let y = Math.max(p.y, h + pad + 6);
  overlay.style.right = `${innerWidth - x}px`;
  overlay.style.left = 'auto';
  overlay.style.top = `${y}px`;
}
(function overlayLoop() {
  positionOverlay();
  requestAnimationFrame(overlayLoop);
})();

/* ---------- modal ---------- */
function openModal() {
  modalBackdrop.hidden = false;
  formError.textContent = '';
  setTimeout(() => msgInput.focus(), 60);
}
function closeModal() {
  modalBackdrop.hidden = true;
  msgInput.value = '';
  nameInput.value = '';
  updateCount();
}
function updateCount() {
  const left = 140 - msgInput.value.length;
  charCount.textContent = toAr(left);
  charCount.style.color = left < 15 ? '#ff9d8a' : '';
}

cta.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalBackdrop.hidden) closeModal();
});
msgInput.addEventListener('input', updateCount);

function showToast(text) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 3400);
}

submitBtn.addEventListener('click', async () => {
  const name = cleanText(nameInput.value);
  const msg = cleanText(msgInput.value);
  const err = validate(name, msg);
  if (err) { formError.textContent = err; return; }

  const last = +(localStorage.getItem(LS_RATE) || 0);
  if (Date.now() - last < 25000) {
    formError.textContent = 'تمام، استلمنا دعوتك — انتظر شوي قبل دعوة ثانية';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'جاري النشر…';
  try {
    const saved = await store.insert({ name: name || null, message: msg });
    localStorage.setItem(LS_RATE, String(Date.now()));
    closeModal();
    addPrayer(saved, { animate: true, mine: true });
    showToast('تقبّل الله دعوتك 🤲');
  } catch (e) {
    console.error(e);
    formError.textContent = 'ما قدرنا ننشرها، جرب مرة ثانية';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'انشر الدعوة';
  }
});

/* ---------- BGM: "Eastminster" — Kevin MacLeod (incompetech.com), CC BY 4.0 ---------- */
const bgm = {
  el: Object.assign(new Audio('bgm.mp3'), { loop: true, preload: 'auto' }),
  fadeTimer: null,
  fade(to, step = 0.03) {
    clearInterval(this.fadeTimer);
    this.fadeTimer = setInterval(() => {
      const v = this.el.volume;
      if (Math.abs(v - to) <= step) {
        this.el.volume = to;
        clearInterval(this.fadeTimer);
        if (to === 0) this.el.pause();
      } else {
        this.el.volume = v + (to > v ? step : -step);
      }
    }, 80);
  },
  start() { this.el.play().catch(() => {}); this.fade(0.35); },
  stop() { this.fade(0); },
};

/* ---------- audio toggle ---------- */
audioToggle.addEventListener('click', () => {
  const on = audioToggle.getAttribute('aria-pressed') === 'true';
  if (on) {
    bgm.stop();
    audioToggle.setAttribute('aria-pressed', 'false');
  } else {
    bgm.start();
    audioToggle.setAttribute('aria-pressed', 'true');
  }
});

/* ---------- BGM autoplay: browsers block sound until a user gesture ----------
   حاول التشغيل فورًا؛ وإن منع المتصفح، شغّل عند أول لمسة في أي مكان */
function syncToggle(on) { audioToggle.setAttribute('aria-pressed', on ? 'true' : 'false'); }
bgm.el.addEventListener('play', () => syncToggle(true));
bgm.el.addEventListener('pause', () => syncToggle(false));
bgm.start(); // يعمل حيث يُسمح بالتشغيل التلقائي، ويُرفض بهدوء في غيرها
const armAutoplay = (e) => {
  if (e && e.target && audioToggle.contains(e.target)) return; // الزر يدير نفسه
  if (!bgm.el.paused) return;
  bgm.start();
};
window.addEventListener('pointerdown', armAutoplay);
window.addEventListener('keydown', armAutoplay);

/* ---------- prayers -> scene ---------- */
function addPrayer(prayer, { animate = false, mine = false } = {}) {
  if (!prayer || knownIds.has(prayer.id)) return;
  knownIds.add(prayer.id);
  prayers.push(prayer);
  renderCounter(true);
  if (sceneReady && scene) {
    if (animate) scene.addPrayerAnimated(prayer, { mine });
    else scene.addPrayer(prayer);
  } else if (animate) {
    pendingAnimated.push(prayer);
  }
}

/* ---------- boot ---------- */
(async function boot() {
  updateCount();

  // 1) data
  await store.init();
  const remote = await store.fetchAll();
  prayers = [...SEEDS, ...remote];
  prayers.forEach((p) => knownIds.add(p.id));
  renderCounter();

  // 2) live subscription
  store.subscribe((p) => addPrayer(p, { animate: true }));

  // 3) lazy-load the 3D scene after first paint / when idle
  const loadScene = () => import('./scene.js')
    .then((m) => m.createScene(document.getElementById('scene'), {
      prayers,
      onCardFocus: showOverlay,
      onCardBlur: hideOverlay,
    }))
    .then((s) => {
      scene = s;
      sceneReady = true;
      pendingAnimated.forEach((p) => scene.addPrayerAnimated(p, { mine: true }));
      pendingAnimated.length = 0;
      veil.classList.add('done');
    })
    .catch((e) => {
      console.error('[dua] scene failed', e);
      veil.querySelector('.veil-sub').textContent = 'تعذر تحميل المشهد ثلاثي الأبعاد';
    });

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadScene, { timeout: 1200 });
  } else {
    setTimeout(loadScene, 120);
  }
})();
