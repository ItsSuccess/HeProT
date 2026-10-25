(() => {
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    }));
  }

  const config = window.HEPROT_CONFIG || {};
  const rawInvite = String(config.whatsappInviteLink || '').trim();
  let invite = '';
  try {
    const url = new URL(rawInvite);
    if (url.protocol === 'https:' && url.hostname === 'chat.whatsapp.com') invite = url.href;
  } catch (_) {}

  document.querySelectorAll('[data-whatsapp-cta]').forEach(link => {
    if (invite) {
      link.href = invite;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      link.removeAttribute('tabindex');
      link.classList.remove('cta-disabled');
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('tabindex', '-1');
      link.classList.add('cta-disabled');
    }
  });

  // Reveal key copy gently as the reader reaches each section.
  const revealItems = document.querySelectorAll(
    '.hero-copy > *, .split-heading > *, .simple-about > div, .build-card, .build-note, .faq-grid > *, .community-cta > *, .footer-top > *'
  );
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    const heroItems = [];
    revealItems.forEach((item, index) => {
      item.setAttribute('data-reveal', '');
      if (item.closest('.hero-copy')) heroItems.push(item);
      else {
        item.style.transitionDelay = `${Math.min(index % 5, 4) * 65}ms`;
        observer.observe(item);
      }
    });
    // Let the hidden start state paint before revealing the opening copy.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      heroItems.forEach(item => item.classList.add('is-visible'));
    }));
  }
})();
