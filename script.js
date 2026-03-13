/* ================================================================
   ASK SIGNATURE HOMES — script.js
   ================================================================
   SECTIONS:
   1.  Config            — your settings in one place
   2.  Scroll Reveal     — animate sections as they enter viewport
   3.  Topbar            — scroll shadow + active nav link
   4.  Mobile Nav        — hamburger menu toggle (mobile)
   5.  Smooth Scroll     — anchor link behaviour
   6.  Form Validation   — real-time field validation
   7.  Form Submission   — send data to Zapier / show success state
   8.  WhatsApp Tracking — log which WA button was clicked
   9.  Stats Counter     — animated number count-up on scroll
   10. Floating WA btn   — hide/show based on scroll position
   ================================================================ */


/* ── 1. CONFIG ─────────────────────────────────────────────────────
   Update these values before going live.
   Everything in the site that's personalised reads from here.
   ================================================================ */
const CONFIG = {

  /* Your WhatsApp number — include country code, no + or spaces
     Example: '971501234567' for UAE +971 50 123 4567            */
  whatsappNumber: '[YOUR_NUMBER]',

  /* Default WhatsApp message when someone clicks a WA button    */
  whatsappMessage: "Hi Abdul, I'd like to book a free Dubai property consultation",

  /* Zapier Catch Hook URL — paste your webhook here to auto-send
     form submissions to your Airtable CRM via Zapier.
     Get this from: zapier.com → New Zap → Trigger: Webhooks
     Leave empty ('') to skip Zapier and just show success state  */
  zapierWebhook: '',

  /* Calendly URL — if you want a Calendly booking link instead
     of the built-in form. Leave empty ('') to use the form.
     Example: 'https://calendly.com/abdulsammad/consultation'     */
  calendlyUrl: '',

  /* How many milliseconds to wait before auto-scrolling to form
     after a successful submission (0 = no auto scroll)          */
  successScrollDelay: 0,

};


/* ── 2. SCROLL REVEAL ─────────────────────────────────────────────
   Elements with class="reveal" start invisible (opacity:0) and
   fade up into view when they scroll into the viewport.
   The CSS transition lives in style.css under .reveal / .reveal.in
   ================================================================ */
function initScrollReveal() {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target); // only trigger once
      }
    });
  }, {
    threshold: 0.10,     // trigger when 10% of element is visible
    rootMargin: '0px 0px -40px 0px'  // slight bottom offset
  });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}


/* ── 3. TOPBAR ────────────────────────────────────────────────────
   Adds a stronger shadow to the topbar when the user scrolls down.
   Also highlights the correct nav link based on which section is
   currently in view (active state).
   ================================================================ */
function initTopbar() {
  const bar = document.querySelector('.bar');
  if (!bar) return;

  /* Scroll shadow */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      bar.style.boxShadow = '0 2px 30px rgba(0,0,0,0.35)';
    } else {
      bar.style.boxShadow = 'none';
    }
  }, { passive: true });

  /* Active nav link highlighting */
  const sections  = document.querySelectorAll('section[id], div[id]');
  const navLinks  = document.querySelectorAll('.bar-link');
  if (!navLinks.length) return;

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === '#' + id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));
}


/* ── 4. MOBILE NAV ────────────────────────────────────────────────
   On mobile (< 640px) the nav links are hidden.
   If you want to add a hamburger menu button to index.html, give
   it id="menu-toggle" and this function will wire it up.

   TO ADD HAMBURGER BUTTON in index.html:
   Inside .bar, before </header>, add:
   <button id="menu-toggle" class="menu-toggle" aria-label="Menu">
     <span></span><span></span><span></span>
   </button>
   ================================================================ */
function initMobileNav() {
  const toggle  = document.getElementById('menu-toggle');
  const barNav  = document.querySelector('.bar-nav');
  if (!toggle || !barNav) return;

  toggle.addEventListener('click', () => {
    const isOpen = barNav.classList.toggle('mobile-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  /* Close nav when a link is clicked */
  barNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      barNav.classList.remove('mobile-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ── 5. SMOOTH SCROLL ─────────────────────────────────────────────
   Intercepts all internal anchor clicks (#section-id) and smoothly
   scrolls to the target, accounting for the fixed topbar height.
   ================================================================ */
function initSmoothScroll() {
  const BAR_HEIGHT = 58; // must match .bar height in style.css

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


/* ── 6. FORM VALIDATION ───────────────────────────────────────────
   Adds real-time validation feedback as users fill out the form.
   Shows inline error messages and highlights invalid fields.
   ================================================================ */
function initFormValidation() {
  const form = document.querySelector('form');
  if (!form) return;

  /* Add error message element after each required field */
  form.querySelectorAll('input[required], select[required]').forEach(field => {
    const msg = document.createElement('span');
    msg.className = 'field-error';
    msg.style.cssText = 'display:none;font-size:.65rem;color:#fc8181;margin-top:.25rem;display:block;height:0;overflow:hidden;transition:height .2s';
    field.parentNode.appendChild(msg);

    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) validateField(field);
    });
  });
}

function validateField(field) {
  const msg = field.parentNode.querySelector('.field-error');
  let error = '';

  if (!field.value.trim()) {
    error = 'This field is required.';
  } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
    error = 'Please enter a valid email address.';
  } else if (field.type === 'tel' && field.value.replace(/\D/g, '').length < 7) {
    error = 'Please enter a valid phone number.';
  }

  if (error) {
    field.classList.add('invalid');
    field.style.borderColor = '#fc8181';
    if (msg) { msg.textContent = error; msg.style.height = '1.2rem'; }
  } else {
    field.classList.remove('invalid');
    field.style.borderColor = '';
    if (msg) { msg.style.height = '0'; }
  }

  return !error;
}


/* ── 7. FORM SUBMISSION ───────────────────────────────────────────
   Handles the booking form submission.
   Priority order:
   1. If CONFIG.calendlyUrl is set → redirect to Calendly
   2. If CONFIG.zapierWebhook is set → POST to Zapier → show success
   3. Otherwise → show success state only (demo mode)
   ================================================================ */
function initFormSubmission() {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Validate all required fields first */
    let allValid = true;
    form.querySelectorAll('input[required], select[required]').forEach(field => {
      if (!validateField(field)) allValid = false;
    });
    if (!allValid) return;

    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Booking...';
    btn.disabled = true;

    /* Collect form data */
    const data = {};
    new FormData(form).forEach((val, key) => { data[key] = val; });

    /* Also collect by field label since inputs may lack name attrs */
    form.querySelectorAll('.form-field').forEach(field => {
      const label = field.querySelector('label');
      const input = field.querySelector('input, select');
      if (label && input && input.value) {
        const key = label.textContent.trim().toLowerCase().replace(/\s+/g, '_');
        data[key] = input.value;
      }
    });

    /* ── Option 1: Redirect to Calendly ── */
    if (CONFIG.calendlyUrl) {
      window.open(CONFIG.calendlyUrl, '_blank');
      showSuccessState(btn);
      return;
    }

    /* ── Option 2: Send to Zapier webhook ── */
    if (CONFIG.zapierWebhook) {
      try {
        await fetch(CONFIG.zapierWebhook, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(data),
          mode:    'no-cors'  // Zapier webhooks don't return CORS headers
        });
        sendWhatsAppNotification(data); // also ping Abdul on WA
        showSuccessState(btn);
      } catch (err) {
        console.error('Zapier submission failed:', err);
        btn.textContent   = 'Something went wrong — please WhatsApp us directly';
        btn.style.background = '#c53030';
        btn.style.color   = '#fff';
        btn.disabled      = false;
      }
      return;
    }

    /* ── Option 3: Demo / no integration ── */
    showSuccessState(btn);
  });
}

/* Shows the green success state on the submit button */
function showSuccessState(btn) {
  btn.textContent      = '✓ Booked — Expect a WhatsApp confirmation within 2 hours';
  btn.style.background = '#1a7a4a';
  btn.style.color      = '#fff';
  btn.disabled         = true;

  /* Scroll to confirmation if configured */
  if (CONFIG.successScrollDelay > 0) {
    setTimeout(() => {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, CONFIG.successScrollDelay);
  }
}

/* Opens a pre-filled WhatsApp message to Abdul with the lead's name */
function sendWhatsAppNotification(data) {
  if (!CONFIG.whatsappNumber) return;
  const name    = data.first_name || data['first_name'] || 'A new lead';
  const goal    = data['i_am_primarily_looking_to'] || '';
  const budget  = data['budget_range_(aed)'] || '';
  const message = encodeURIComponent(
    `New booking from ${name}. Goal: ${goal}. Budget: ${budget}.`
  );
  /* Opens quietly in background — comment out if not wanted */
  // window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${message}`, '_blank');
}


/* ── 8. WHATSAPP BUTTON TRACKING ──────────────────────────────────
   Updates all WhatsApp links dynamically from CONFIG.whatsappNumber
   so you only need to change the number in one place (CONFIG above).
   Also logs which button was clicked for analytics purposes.
   ================================================================ */
function initWhatsAppButtons() {
  if (!CONFIG.whatsappNumber || CONFIG.whatsappNumber === '[YOUR_NUMBER]') return;

  const encodedMsg = encodeURIComponent(CONFIG.whatsappMessage);
  const baseUrl    = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMsg}`;

  /* Update all WA links */
  document.querySelectorAll('a[href*="wa.me"]').forEach((link, i) => {
    link.href = baseUrl;

    /* Track clicks (logs to console — connect to analytics if needed) */
    link.addEventListener('click', () => {
      const label = link.classList.contains('wa-float')
        ? 'floating_button'
        : link.classList.contains('wa-btn')
        ? 'form_panel_button'
        : `cta_link_${i}`;
      console.log(`[ASK] WhatsApp click: ${label}`);
      /* Google Analytics example (uncomment if you have GA installed):
      gtag('event', 'whatsapp_click', { event_label: label }); */
    });
  });
}


/* ── 9. STATS COUNTER ANIMATION ───────────────────────────────────
   Animates the numbers in .stat-val cells (0%, 8–12%, 10yr)
   counting up from 0 when they scroll into view.
   Numbers with non-numeric characters (%, yr, #) are handled.
   ================================================================ */
function initStatsCounter() {
  const statVals = document.querySelectorAll('.stat-val');
  if (!statVals.length) return;

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const original = el.textContent.trim();

      /* Extract the leading number (handles "8–12", "0", "10") */
      const match = original.match(/^(\d+)/);
      if (!match) return;

      const endVal  = parseInt(match[1], 10);
      const suffix  = original.slice(match[0].length); // e.g. "%" or "yr"
      const duration = 1200; // ms
      const steps    = 40;
      const step     = duration / steps;
      let   current  = 0;

      const timer = setInterval(() => {
        current += endVal / steps;
        if (current >= endVal) {
          current = endVal;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current) + suffix;
      }, step);

      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statVals.forEach(el => counterObserver.observe(el));
}


/* ── 10. FLOATING WHATSAPP BUTTON ─────────────────────────────────
   Hides the floating WA button when the booking form is visible
   (no need to show WA button when form is already in view).
   Also adds a subtle pulse animation after 8 seconds to draw
   attention to it.
   ================================================================ */
function initFloatingWA() {
  const waFloat = document.querySelector('.wa-float');
  const bookPanel = document.getElementById('book');
  if (!waFloat || !bookPanel) return;

  /* Hide when booking form is visible */
  const panelObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      waFloat.style.opacity    = entry.isIntersecting ? '0' : '1';
      waFloat.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
      waFloat.style.transform  = entry.isIntersecting ? 'translateY(20px)' : '';
    });
  }, { threshold: 0.3 });

  panelObserver.observe(bookPanel);

  /* Attention pulse after 8 seconds on page */
  setTimeout(() => {
    waFloat.style.animation = 'waPulse 1s ease 3';
  }, 8000);
}


/* ── INIT — run everything when DOM is ready ─────────────────────
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initTopbar();
  initMobileNav();
  initSmoothScroll();
  initFormValidation();
  initFormSubmission();
  initWhatsAppButtons();
  initStatsCounter();
  initFloatingWA();
});
