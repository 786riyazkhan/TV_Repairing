/**
 * TV Pro Repair – index.js  |  Modern UI Edition
 */
'use strict';

/* ── AOS Init ── */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration:700, once:true, offset:70, easing:'ease-out-quad', disable: window.innerWidth < 768 });
  }
  document.getElementById('currentYear').textContent = new Date().getFullYear();
});

/* ── Header scroll ── */
const hdr = document.getElementById('siteHeader');
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.dn-link, .mm-link');

const onScroll = () => {
  hdr?.classList.toggle('scrolled', window.scrollY > 60);
  scrollTopBtn?.classList.toggle('visible', window.scrollY > 400);
  // Active nav
  let cur = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - (hdr?.offsetHeight || 0) - 50) cur = '#' + s.id;
  });
  allNavLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === cur));
};
window.addEventListener('scroll', onScroll, { passive:true });

/* ── Mobile menu ── */
const mobileToggle  = document.getElementById('mobileToggle');
const mobileMenu    = document.getElementById('mobileMenu');
const mobileClose   = document.getElementById('mobileClose');
const mobileBackdrop = document.getElementById('mobileBackdrop');

const openMenu = () => {
  mobileMenu.classList.add('active');
  mobileBackdrop.classList.add('active');
  mobileToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
};
const closeMenu = () => {
  mobileMenu.classList.remove('active');
  mobileBackdrop.classList.remove('active');
  mobileToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
};

mobileToggle?.addEventListener('click', openMenu);
mobileClose?.addEventListener('click', closeMenu);
mobileBackdrop?.addEventListener('click', closeMenu);
document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());
document.querySelectorAll('.mm-link').forEach(l => l.addEventListener('click', closeMenu));

let rt;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    if (window.innerWidth > 1100) closeMenu();
    if (typeof AOS !== 'undefined') AOS.refresh();
  }, 250);
}, { passive:true });

/* ── Smooth scroll ── */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (!id || id === '#') return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  closeMenu();
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - (hdr?.offsetHeight || 0) - 16, behavior:'smooth' });
});

/* ── CTA → contact ── */
document.querySelectorAll('.cta-button').forEach(btn => {
  if (btn.tagName === 'A') return;
  btn.addEventListener('click', () => {
    const s = document.getElementById('contact');
    if (!s) return;
    closeMenu();
    window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - (hdr?.offsetHeight || 0) - 16, behavior:'smooth' });
    setTimeout(() => document.querySelector('#contactForm .fi')?.focus(), 600);
  });
});

/* ── Counter animation ── */
const counters = document.querySelectorAll('.sb-num[data-target]');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const target = +el.dataset.target;
    const label = el.closest('.stat-box')?.querySelector('.sb-label')?.textContent || '';
    const suffix = label.includes('%') ? '%' : '+';
    const dur = 2000, start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + (p >= 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObs.unobserve(el);
  });
}, { threshold:.5 });
counters.forEach(el => counterObs.observe(el));

/* ── Brand filter ── */
document.querySelectorAll('.bf-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.bf-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const f = this.dataset.filter;
    document.querySelectorAll('.brand-tile').forEach(tile => {
      const show = f === 'all' || (tile.dataset.category || '').includes(f);
      tile.style.display = show ? '' : 'none';
      if (show) { tile.style.animation='none'; requestAnimationFrame(() => tile.style.animation=''); }
    });
  });
});

/* ── Form validation & submission ── */
const form = document.getElementById('contactForm');
const fields = {
  fname:  { validate: v => v.trim().length >= 2,                          msg:'Please enter your full name.' },
  fphone: { validate: v => /^[\d\s\+\-\(\)]{7,15}$/.test(v.trim()),      msg:'Please enter a valid phone number.' },
  fbrand: { validate: v => v !== '',                                       msg:'Please select your TV brand.' },
  fissue: { validate: v => v !== '',                                       msg:'Please select the issue type.' },
};

Object.entries(fields).forEach(([id, cfg]) => {
  const el = document.getElementById(id);
  const errEl = document.getElementById(`${id}-err`);
  cfg.el = el; cfg.errEl = errEl;
  el?.addEventListener('blur', () => { if (el.value.trim()) setErr(cfg, !cfg.validate(el.value)); });
  el?.addEventListener('input', () => { if (el.classList.contains('error')) setErr(cfg, !cfg.validate(el.value)); });
});

function setErr(cfg, show) {
  cfg.el?.classList.toggle('error', show);
  if (cfg.errEl) cfg.errEl.textContent = show ? cfg.msg : '';
}

form?.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  Object.values(fields).forEach(cfg => {
    const valid = cfg.el && cfg.validate(cfg.el.value);
    setErr(cfg, !valid);
    if (!valid) ok = false;
  });
  if (!ok) {
    showToast('Please fix the errors above.', 'error');
    form.querySelector('.fi.error')?.scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  }
  const btn = document.getElementById('submitBtn');
  const txt = btn.querySelector('.btn-text');
  const ld  = btn.querySelector('.btn-loading');
  btn.disabled = true; txt.style.display='none'; ld.style.display='flex';

  setTimeout(() => {
    btn.disabled=false; txt.style.display='flex'; ld.style.display='none';
    const name = document.getElementById('fname').value.trim();
    const phone = document.getElementById('fphone').value.trim();
    form.reset();
    Object.values(fields).forEach(cfg => setErr(cfg, false));
    showToast(`✅ Thank you ${name}! We'll call you at ${phone} within 30 minutes.`, 'success', 6000);
  }, 1800);
});

/* ── Toast system ── */
function showToast(msg, type='info', dur=5000) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => { t.style.animation='toastIn .35s ease reverse'; setTimeout(()=>t.remove(),350); }, dur);
}

/* ── Scroll to top ── */
const scrollTopBtn = document.getElementById('scrollTop');
scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

/* ── iOS vh fix ── */
const setVH = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * .01}px`);
setVH();
window.addEventListener('resize', setVH, { passive:true });

/* ── Newsletter ── */
document.querySelector('.nl-form button')?.addEventListener('click', () => {
  const inp = document.querySelector('.nl-form input');
  const email = inp?.value?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    inp?.focus(); return;
  }
  showToast('🎉 Subscribed! Expect TV tips and offers soon.', 'success');
  if (inp) inp.value = '';
});
