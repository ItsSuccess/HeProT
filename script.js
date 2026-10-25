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

  const membershipDialog = document.querySelector('#membership-dialog');
  const membershipForm = document.querySelector('#membership-form');
  const formView = document.querySelector('#application-form-view');
  const successView = document.querySelector('#application-success');
  const submitButton = document.querySelector('#application-submit');
  const applicationStatus = document.querySelector('#application-status');
  const profileError = document.querySelector('#social-profile-error');
  const profileInputs = [...document.querySelectorAll('.social-profiles input[type="url"]')];
  const profileHosts = {
    x_profile: ['x.com', 'twitter.com'],
    linkedin_profile: ['linkedin.com'],
    instagram_profile: ['instagram.com'],
    tiktok_profile: ['tiktok.com']
  };

  document.querySelectorAll('[data-open-membership-form]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      if (!membershipDialog?.showModal) return;
      membershipDialog.showModal();
      if (formView && !formView.hidden) {
        requestAnimationFrame(() => membershipForm?.elements.full_name?.focus());
      }
    });
  });

  document.querySelectorAll('[data-close-membership]').forEach(button => {
    button.addEventListener('click', () => membershipDialog?.close());
  });
  membershipDialog?.addEventListener('click', event => {
    if (event.target === membershipDialog) membershipDialog.close();
  });

  function profileHostIsValid(input) {
    if (!input.value.trim()) return true;
    try {
      const url = new URL(input.value.trim());
      const allowed = profileHosts[input.name] || [];
      return url.protocol === 'https:' && allowed.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
    } catch (_) {
      return false;
    }
  }

  function validateProfiles() {
    profileError.textContent = '';
    profileInputs.forEach(input => input.removeAttribute('aria-invalid'));
    const entered = profileInputs.filter(input => input.value.trim());
    if (entered.length === 0) {
      profileError.textContent = 'Add at least one social profile URL to continue.';
      profileInputs[0]?.focus();
      return false;
    }
    const invalid = entered.filter(input => !profileHostIsValid(input));
    if (invalid.length) {
      invalid.forEach(input => input.setAttribute('aria-invalid', 'true'));
      profileError.textContent = 'Use a valid https profile link for each social profile you entered.';
      invalid[0].focus();
      return false;
    }
    return true;
  }

  membershipForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitButton.disabled) return;
    if (!membershipForm.reportValidity() || !validateProfiles()) return;

    const values = new FormData(membershipForm);
    const value = name => String(values.get(name) || '').trim();
    const payload = {
      full_name: value('full_name'),
      email: value('email').toLowerCase(),
      profession: value('profession'),
      current_status: value('current_status'),
      tech_interest: value('tech_interest'),
      reason_for_joining: value('reason_for_joining'),
      goals: value('goals'),
      x_profile: value('x_profile') || null,
      linkedin_profile: value('linkedin_profile') || null,
      instagram_profile: value('instagram_profile') || null,
      tiktok_profile: value('tiktok_profile') || null
    };

    let inviteUrl;
    try {
      inviteUrl = new URL(String((window.HEPROT_CONFIG || {}).whatsappInviteLink || '').trim());
      if (inviteUrl.protocol !== 'https:' || inviteUrl.hostname !== 'chat.whatsapp.com') throw new Error('Invalid WhatsApp invite URL.');
    } catch (_) {
      applicationStatus.dataset.state = 'error';
      applicationStatus.textContent = 'The WhatsApp Community link is temporarily unavailable. Please try again later.';
      return;
    }

    submitButton.disabled = true;
    membershipForm.setAttribute('aria-busy', 'true');
    applicationStatus.dataset.state = 'loading';
    applicationStatus.textContent = 'Submitting your application…';
    try {
      const client = await window.heprotSupabaseReady;
      if (!client) throw window.heprotSupabaseInitError || new Error('Supabase is not available.');

      // Do not request returned rows; the public form needs insert permission only.
      const { error } = await client.from('membership_applications').insert(payload);
      if (error) throw error;

      const inviteLink = document.querySelector('#application-whatsapp-link');
      inviteLink.href = inviteUrl.href;
      inviteLink.target = '_blank';
      inviteLink.rel = 'noopener noreferrer';
      formView.hidden = true;
      successView.hidden = false;
      successView.querySelector('h2')?.focus();
    } catch (error) {
      console.error('HeProT application submission failed:', error);
      applicationStatus.dataset.state = 'error';
      applicationStatus.textContent = 'We couldn’t save your application. Please try again later.';
    } finally {
      membershipForm.removeAttribute('aria-busy');
      submitButton.disabled = false;
    }
  });

  profileInputs.forEach(input => input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    profileError.textContent = '';
  }));

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
