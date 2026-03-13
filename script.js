/* ================================================================
   ASK SIGNATURE HOMES — script.js
   ================================================================
   SECTIONS:
   1.  Config            — update your settings here
   2.  Scroll Reveal     — fade sections in on scroll
   3.  Topbar            — scroll shadow + active nav link
   4.  Mobile Nav        — hamburger menu
   5.  Smooth Scroll     — anchor link offset for fixed topbar
   6.  Stats Counter     — count-up animation on hero stats
   7.  Floating WA btn   — pulse effect + hide near hero
   ================================================================ */


/* ── 1. CONFIG ─────────────────────────────────────────────────────
   All personalised values live here.
   Update these and the whole site stays consistent.
   ================================================================ */
const CONFIG = {

  /* WhatsApp — Sammad's number (no + or spaces) */
  whatsappNumber:  '971502903288',
  whatsappMessage: "Hi Sammad, I'd like to find my Dubai property",

  /* Tally quiz URL — the main CTA destination */
  tallyQuizUrl:    'https://tally.so/r/A7Jg0o',

};


/* ── 2. SCROLL REVEAL ─────────────────────────────────────────────
   Elements with class="reveal" fade up into view on scroll.
   CSS handles the transition (see .reveal / .reveal.in in style.css)
   ================================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold:  0.10,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


/* ── 3. TOPBAR ────────────────────────────────────────────────────
   • Adds shadow when user scrolls down
   • Highlights the correct nav link as sections enter view
   ================================================================ */
function initTopbar() {
  const bar = document.querySelector('.bar');
  if (!bar) return;

  /* Shadow on scroll */
  window.addEventListener('scroll', () => {
    bar.style.boxShadow = window.scrollY > 40
      ? '0 2px 30px rgba(0,0,0,0.4)'
      : 'none';
  }, { passive: true });

  /* Active nav link */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.bar-link');
  if (!navLinks.length) return;

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));
}


/* ── 4. MOBILE NAV ────────────────────────────────────────────────
   Wires up a hamburger toggle button if one exists in index.html.

   TO ADD the hamburger button: inside <header class="bar">, add:
   <button id="menu-toggle" class="menu-toggle" aria-label="Menu">
     <span></span><span></span><span></span>
   </button>
   ================================================================ */
function initMobileNav() {
  const toggle = document.getElementById('menu-toggle');
  const barNav = document.querySelector('.bar-nav');
  if (!toggle || !barNav) return;

  toggle.addEventListener('click', () => {
    const isOpen = barNav.classList.toggle('mobile-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  barNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      barNav.classList.remove('mobile-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ── 5. SMOOTH SCROLL ─────────────────────────────────────────────
   Intercepts internal anchor clicks and scrolls smoothly,
   offsetting for the 58px fixed topbar.
   ================================================================ */
function initSmoothScroll() {
  const BAR_HEIGHT = 58;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id     = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - BAR_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


/* ── 6. STATS COUNTER ─────────────────────────────────────────────
   Animates the numbers in .stat-val elements counting up from 0
   when they scroll into view.
   Handles "0%", "8–12%", "10yr", "#3" formats gracefully.
   ================================================================ */
function initStatsCounter() {
  const statVals = document.querySelectorAll('.stat-val');
  if (!statVals.length) return;

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const original = el.textContent.trim();

      /* Extract first number in the string */
      const match = original.match(/^(\d+)/);
      if (!match) return; /* skip non-numeric like "#3" */

      const endVal   = parseInt(match[1], 10);
      const suffix   = original.slice(match[0].length); /* e.g. "%" "yr" */
      const duration = 1200;
      const steps    = 40;
      let   current  = 0;

      const timer = setInterval(() => {
        current += endVal / steps;
        if (current >= endVal) { current = endVal; clearInterval(timer); }
        el.textContent = Math.floor(current) + suffix;
      }, duration / steps);

      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });

  statVals.forEach(el => counterObserver.observe(el));
}


/* ── 7. FLOATING WHATSAPP ─────────────────────────────────────────
   • Adds a subtle pulse animation after 8 seconds on page
   • On mobile, collapses the label text (CSS handles display)
   ================================================================ */
function initFloatingWA() {
  const waFloat = document.querySelector('.wa-float');
  if (!waFloat) return;

  /* Attention pulse after 8 seconds */
  setTimeout(() => {
    waFloat.style.animation = 'waPulse 1s ease 3';
  }, 8000);

  /* Track clicks to console (connect to GA if needed) */
  waFloat.addEventListener('click', () => {
    console.log('[ASK] WhatsApp float clicked');
    /* Uncomment for Google Analytics:
    if (typeof gtag !== 'undefined') {
      gtag('event', 'whatsapp_click', { event_label: 'floating_button' });
    } */
  });
}


/* ── INIT — runs on DOMContentLoaded ─────────────────────────────
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initTopbar();
  initMobileNav();
  initSmoothScroll();
  initStatsCounter();
  initFloatingWA();
});
