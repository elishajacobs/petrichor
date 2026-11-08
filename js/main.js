/* Petrichor · landingspagina · versie 2 · beeld voorop */
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Navigatie ---------- */
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav__toggle');
const navMenu = document.getElementById('nav-menu');

function setMenu(open) {
  navToggle.setAttribute('aria-expanded', String(open));
  navMenu.classList.toggle('is-open', open);
}
navToggle.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
navMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Startpagina: de foto zoomt uit, het woord verschijnt letter per letter ---------- */
const hero = document.querySelector('.hero');
const heroWord = document.querySelector('[data-letters]');
heroWord.setAttribute('aria-label', heroWord.textContent);
// op smalle schermen breekt het woord in twee: Petri / chor
heroWord.innerHTML = [...heroWord.textContent.trim()]
  .map((ch, i) => `<span class="l" aria-hidden="true" style="--i:${i}">${ch}</span>` + (i === 4 ? '<br class="hero__br">' : '')).join('');
requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-in')));

/* ---------- Foto's schuiven trager of sneller mee bij scrollen (data-drift) ---------- */
const drifters = [...document.querySelectorAll('[data-drift]')];
if (!reduceMotion && drifters.length) {
  let driftFrame = 0;
  const drift = () => {
    driftFrame = 0;
    const mid = window.innerHeight / 2;
    drifters.forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.bottom < -200 || b.top > window.innerHeight + 200) return;
      const offset = (b.top + b.height / 2 - mid) * Number(el.dataset.drift);
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    });
  };
  window.addEventListener('scroll', () => { if (!driftFrame) driftFrame = requestAnimationFrame(drift); }, { passive: true });
  drift();
}

/* ---------- Werelden: de geurfilm speelt stil zodra de wereld in beeld is ---------- */
const worldVideos = [...document.querySelectorAll('.world__video video')];
if (reduceMotion) {
  worldVideos.forEach((v) => { v.controls = true; });
} else if ('IntersectionObserver' in window) {
  const videoIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.play().catch(() => {});
      else entry.target.pause();
    });
  }, { threshold: 0.35 });
  worldVideos.forEach((v) => videoIo.observe(v));
}

/* ---------- Storyfilm: speelt in een lus, telkens één zin van de storyline naast de film ---------- */
const story = document.querySelector('.story__video');
const storySound = document.querySelector('[data-story-sound]');
const cues = [...document.querySelectorAll('[data-cue]')];
let currentCue = -1;
// elke zin wordt in woorden geknipt, zodat hij woord per woord kan opkomen
cues.forEach((cue) => {
  const words = cue.textContent.trim().split(/\s+/);
  cue.setAttribute('aria-label', cue.textContent.trim());
  cue.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true" style="--w:${i}">${w}</span>`).join(' ');
});

function setStorySound(on) {
  story.muted = !on;
  storySound.textContent = on ? '🔊 Geluid uit' : '🔇 Geluid aan';
  storySound.setAttribute('aria-pressed', String(on));
}
function showCue() {
  let i = 0;
  cues.forEach((cue, j) => { if (story.currentTime >= Number(cue.dataset.cue)) i = j; });
  if (i === currentCue) return;
  currentCue = i;
  cues.forEach((cue, j) => {
    cue.classList.toggle('is-current', j === i);
    cue.setAttribute('aria-hidden', String(j !== i));
  });
}
storySound.addEventListener('click', () => { setStorySound(story.muted); story.play().catch(() => {}); });
// elke frame nakijken, zodat de zin precies op de beeldwissel komt
function followStory() { showCue(); if (!story.paused) requestAnimationFrame(followStory); }
story.addEventListener('play', () => requestAnimationFrame(followStory));
story.addEventListener('seeked', showCue);
story.addEventListener('timeupdate', showCue); // reserve als de frames stilvallen (tab op de achtergrond)
showCue();

if (reduceMotion) {
  story.removeAttribute('autoplay');
  story.pause();
  story.controls = true;
} else if ('IntersectionObserver' in window) {
  // in beeld speelt de film, uit beeld pauzeert hij en daarna loopt hij verder
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) story.play().catch(() => {}); else story.pause();
  }, { threshold: 0.35 }).observe(story);
}

/* ---------- Menu: het deel waar je bent licht op ---------- */
if ('IntersectionObserver' in window) {
  const navIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = document.querySelector(`[data-nav="${entry.target.id}"]`);
      if (link) link.classList.toggle('is-active', entry.isIntersecting);
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  ['betekenis', 'werelden', 'storyfilm', 'geurtest'].forEach((id) => navIo.observe(document.getElementById(id)));
}

/* ---------- Geurtest ---------- */
const SCENTS = {
  amber: { name: 'Amber', img: 'assets/img/geur_amber.jpg', text: 'Bosrand bij zonsopgang. Warm licht op natte steen, met mandarijn, oranjebloesem en vanille.' },
  iris:  { name: 'Iris',  img: 'assets/img/geur_iris.jpg',  text: 'Varens in de motregen. Groen en zacht, dicht bij je huid, met peer, iris en witte musk.' },
  sage:  { name: 'Sage',  img: 'assets/img/geur_sage.jpg',  text: 'Bergbeek in de nevel. Fris als de lucht na een bui, met citroen, munt en muskaatsalie.' },
  noir:  { name: 'Noir',  img: 'assets/img/geur_noir.jpg',  text: 'Kiezels in de mist. Koel en houtig, met jeneverbes, cipres en guaiakhout.' },
};

const QUESTIONS = [
  { q: 'Wanneer draag je je geur het liefst?', a: [
    ['Vroeg in de ochtend, met koffie', 'amber'],
    ['Tijdens een wandeling in het groen', 'iris'],
    ['Na het sporten of een frisse douche', 'sage'],
    ['Op een rustige avond', 'noir'],
  ] },
  { q: 'Welk weer vind je het mooist?', a: [
    ['Zon die doorbreekt na een bui', 'amber'],
    ['Zachte motregen in het bos', 'iris'],
    ['Nevel boven helder water', 'sage'],
    ['Een koele, grijze dag', 'noir'],
  ] },
  { q: 'Hoe wil je dat je geur voelt?', a: [
    ['Warm', 'amber'],
    ['Zacht', 'iris'],
    ['Fris', 'sage'],
    ['Diep', 'noir'],
  ] },
];

const quiz = document.querySelector('[data-quiz]');
const qForm = quiz.querySelector('[data-quiz-form]');
const qStep = quiz.querySelector('[data-quiz-step]');
const qPct = quiz.querySelector('[data-quiz-pct]');
const qBar = quiz.querySelector('[data-quiz-bar]');
const qQuestion = quiz.querySelector('[data-quiz-question]');
const qOptions = quiz.querySelector('[data-quiz-options]');
const qPrev = quiz.querySelector('[data-quiz-prev]');
const qNext = quiz.querySelector('[data-quiz-next]');
const result = quiz.querySelector('[data-quiz-result]');

let step = 0;
let answers = [];

function renderQuestion() {
  const { q, a } = QUESTIONS[step];
  const pct = Math.round(((step + 1) / QUESTIONS.length) * 100);
  qStep.textContent = `Vraag ${step + 1} van ${QUESTIONS.length}`;
  qPct.textContent = `${pct} %`;
  qBar.style.width = pct + '%';
  qQuestion.textContent = q;
  qOptions.innerHTML = a.map(([label, scent]) => `
    <label class="option">
      <input type="radio" name="q${step}" value="${scent}" ${answers[step] === scent ? 'checked' : ''}>
      <span class="option__dot" aria-hidden="true"></span>
      <span>${label}</span>
    </label>`).join('');
  qPrev.hidden = step === 0;
  qNext.disabled = !answers[step];
  qNext.firstChild.textContent = step === QUESTIONS.length - 1 ? 'Toon mijn wereld ' : 'Volgende ';
}

qOptions.addEventListener('change', (e) => {
  answers[step] = e.target.value;
  qNext.disabled = false;
});

qPrev.addEventListener('click', () => {
  if (step > 0) { step -= 1; renderQuestion(); }
});

qForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!answers[step]) return;
  if (step < QUESTIONS.length - 1) {
    step += 1;
    renderQuestion();
    qOptions.querySelector('input').focus({ preventScroll: true });
  } else {
    showResult();
  }
});

function pickScent() {
  const score = {};
  answers.forEach((s) => { score[s] = (score[s] || 0) + 1; });
  const best = Math.max(...Object.values(score));
  // Bij gelijke stand telt het laatste antwoord (het gevoel) het zwaarst
  return [...answers].reverse().find((s) => score[s] === best);
}

function showResult() {
  const s = SCENTS[pickScent()];
  const img = result.querySelector('[data-result-img]');
  img.src = s.img;
  img.alt = `Petrichor ${s.name}`;
  img.hidden = false;
  result.querySelector('[data-result-name]').textContent = s.name;
  result.querySelector('[data-result-text]').textContent = s.text;
  result.querySelector('[data-result-cta-name]').textContent = s.name;
  const cta = result.querySelector('[data-result-cta]');
  cta.hidden = false;
  cta.dataset.scent = s.name;
  result.querySelector('[data-quiz-restart]').hidden = false;
  result.querySelector('[data-quiz-preview]').hidden = true;
  result.classList.add('is-done');
  qNext.disabled = true;
  if (window.matchMedia('(max-width: 960px)').matches) {
    result.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
}

result.querySelector('[data-quiz-restart]').addEventListener('click', () => {
  step = 0;
  answers = [];
  result.classList.remove('is-done');
  result.querySelector('[data-result-name]').textContent = 'Welke van de vier ben jij?';
  result.querySelector('[data-quiz-preview]').hidden = false;
  result.querySelector('[data-result-img]').hidden = true;
  result.querySelector('[data-result-text]').textContent = 'Beantwoord de drie vragen. Hier verschijnt de wereld die het best bij je past.';
  result.querySelector('[data-result-cta]').hidden = true;
  result.querySelector('[data-quiz-restart]').hidden = true;
  renderQuestion();
  qForm.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
});

// "Staaltje van Sage" vult de favoriete geur in het formulier al in
document.querySelectorAll('[data-scent], [data-result-cta]').forEach((link) => {
  link.addEventListener('click', () => preselectScent(link.dataset.scent));
});

function preselectScent(name) {
  if (!name) return;
  // De MailerLite-keuzelijst (favoriete_geur) heeft dezelfde opties: Amber, Iris, Sage, Noir
  document.querySelectorAll('#mailerlite select').forEach((select) => {
    const opt = [...select.options].find((o) => o.text.trim().toLowerCase() === name.toLowerCase());
    if (opt) {
      select.value = opt.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

renderQuestion();

/* ---------- Titels bouwen woord per woord op ---------- */
document.querySelectorAll('[data-split]').forEach((el) => {
  el.setAttribute('aria-label', el.textContent);
  el.innerHTML = el.textContent.trim().split(/\s+/)
    .map((word, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${word}</span></span>`)
    .join(' ');
});

/* ---------- Rustige verschijning bij scrollen ---------- */
const reveals = document.querySelectorAll('.reveal, [data-split]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-visible'));
}

/* ==========================================================
   Uit versie 1
   ========================================================== */
/* ---------- Feiten: de cijfers tellen op wanneer ze in beeld komen ---------- */
const counters = document.querySelectorAll('[data-count]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const countIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countIo.unobserve(entry.target);
      const el = entry.target;
      const end = Number(el.dataset.count);
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / 1200);
        el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  counters.forEach((el) => countIo.observe(el));
}

/* ---------- Terug naar boven: verschijnt na één scherm scrollen ---------- */
const toTop = document.querySelector('[data-to-top]');
if (toTop) {
  const showToTop = () => toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight);
  window.addEventListener('scroll', showToTop, { passive: true });
  showToTop();
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    document.querySelector('.wordmark')?.focus({ preventScroll: true });
  });
}
