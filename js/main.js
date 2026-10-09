(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const content = window.siteContent || {};

  /* ---------- Personal details, editable in content.js ---------- */
  const emailLink = document.querySelector('[data-email]');
  const copyBtn = document.querySelector('[data-copy]');
  const copyLabel = copyBtn.querySelector('[data-copy-label]');
  if (content.email) {
    emailLink.href = `mailto:${content.email.trim()}`;
    emailLink.textContent = 'Email me';
    emailLink.removeAttribute('aria-disabled');
    copyBtn.dataset.copy = content.email.trim();
    copyBtn.disabled = false;
    document.querySelector('[data-contact-note]').hidden = true;
  }
  const profileLabels = { github: 'GitHub', linkedin: 'LinkedIn', resume: 'Résumé' };
  document.querySelectorAll('[data-profile]').forEach(link => {
    const url = content[link.dataset.profile];
    if (!url) return;
    const resolved = new URL(url, location.href);
    if (!['https:', 'http:'].includes(resolved.protocol)) return;
    link.href = resolved.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.removeAttribute('aria-disabled');
    link.textContent = `${profileLabels[link.dataset.profile]} ↗`;
  });
  if (content.availability) {
    document.querySelector('.hero-status').lastChild.textContent = content.availability;
  }
  document.querySelectorAll('[data-photo]').forEach(img => {
    const photo = content.photos?.[img.dataset.photo];
    if (!photo) return;
    img.src = photo.src;
    img.alt = photo.alt;
    const figure = img.closest('.shot');
    if (figure) {
      figure.querySelector('figcaption').textContent = photo.caption;
      figure.querySelector('button').setAttribute('aria-label', `Open photo: ${photo.caption}`);
    }
  });
  const personSchema = document.querySelector('script[type="application/ld+json"]');
  const person = JSON.parse(personSchema.textContent);
  if (content.email) person.email = `mailto:${content.email.trim()}`;
  person.sameAs = [content.github, content.linkedin].filter(Boolean);
  if (content.siteUrl) {
    person.url = content.siteUrl;
    document.querySelector('meta[property="og:image"]').content = new URL(content.photos.hero.src, content.siteUrl).href;
  }
  personSchema.textContent = JSON.stringify(person);

  /* ---------- Nav: frosted background once you leave the top ---------- */
  const nav = document.querySelector('[data-nav]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const setMenu = open => {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.querySelector('span').textContent = open ? '−' : '+';
    nav.classList.toggle('menu-open', open);
  };
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuToggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!nav.contains(event.target)) setMenu(false);
  });
  // Two thresholds (on past 64px, off above 8px) so trackpad momentum and the
  // rubber-band bounce at the top can't flip it on and off.
  let navScrolled = false;
  const onNav = () => {
    const y = window.scrollY;
    if (!navScrolled && y > 64) navScrolled = true;
    else if (navScrolled && y < 8) navScrolled = false;
    else return;
    nav.classList.toggle('is-scrolled', navScrolled);
  };
  onNav();
  window.addEventListener('scroll', onNav, { passive: true });

  /* ---------- Nav: highlight the section in view ---------- */
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href')));
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.removeAttribute('aria-current'));
      const link = navLinks[sections.indexOf(entry.target)];
      if (link) link.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => s && sectionObserver.observe(s));
  // Sections without a nav link clear the highlight.
  ['top', 'statement', 'contact'].forEach(id => sectionObserver.observe(document.getElementById(id)));

  /* ---------- In-page links glide (CSS smooth scrolling is off on purpose) ---------- */
  document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      history.pushState(null, '', a.getAttribute('href'));
    });
  });

  /* ---------- Reveals are CSS scroll-driven animations (see style.css) ---------- */

  /* ---------- Card spotlight follows the pointer (mouse and trackpad only) ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.case, .project').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Statement: split into words, light them up on scroll ---------- */
  const statement = document.querySelector('[data-statement]');
  const statementText = statement.querySelector('[data-words]');
  const highlight = new Set(['systems', 'answers']);
  const words = statementText.textContent.trim().split(/\s+/);
  statementText.innerHTML = words
    .map(w => `<span class="w${highlight.has(w.replace(/\W/g, '')) ? ' hl' : ''}">${w}</span>`)
    .join(' ');
  const wordEls = statementText.querySelectorAll('.w');

  /* ---------- Scroll-driven effects, batched into one frame ---------- */
  const heroMedia = document.querySelector('[data-hero-media]');
  const heroInner = document.querySelector('[data-hero-inner]');
  let ticking = false;

  const render = () => {
    ticking = false;
    const vh = window.innerHeight;
    const y = window.scrollY;

    // Hero: image drifts slower than the page, copy fades as you leave.
    if (y < vh * 1.2) {
      const p = Math.min(y / vh, 1);
      heroMedia.style.transform = `translate3d(0, ${y * 0.35}px, 0) scale(${1 + p * 0.06})`;
      heroInner.style.transform = `translate3d(0, ${y * -0.12}px, 0)`;
      heroInner.style.opacity = String(1 - Math.min(p * 1.6, 1));
    }

    // Statement: progress through the tall section maps to lit words.
    const rect = statement.getBoundingClientRect();
    const total = rect.height - vh;
    const progress = Math.min(Math.max(-rect.top / (total * 0.85), 0), 1);
    const litCount = Math.round(progress * wordEls.length);
    wordEls.forEach((w, i) => w.classList.toggle('lit', i < litCount));
    statement.style.setProperty('--p', progress.toFixed(3));
  };

  if (!reduceMotion) {
    render();
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(render); }
    }, { passive: true });
    window.addEventListener('resize', render);
  }

  /* ---------- Lightbox ---------- */
  const dialog = document.querySelector('[data-lightbox-dialog]');
  const dialogImg = dialog.querySelector('img');
  const photoButtons = [...document.querySelectorAll('[data-lightbox]')];
  const caption = dialog.querySelector('[data-lightbox-caption]');
  let photoIndex = 0;
  let opener = null;
  const showPhoto = index => {
    photoIndex = (index + photoButtons.length) % photoButtons.length;
    const button = photoButtons[photoIndex];
    const img = button.querySelector('img');
    dialogImg.src = img.currentSrc || img.src;
    dialogImg.alt = img.alt;
    const title = button.closest('figure').querySelector('figcaption').textContent;
    caption.textContent = `${title} · ${photoIndex + 1} / ${photoButtons.length}`;
  };

  photoButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      showPhoto(index);
      opener = btn;
      dialog.showModal();
      document.body.classList.add('lightbox-open');
    });
  });
  const closeDialog = () => dialog.close();
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', closeDialog);
  dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(); });
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => showPhoto(photoIndex - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => showPhoto(photoIndex + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    opener?.focus({ preventScroll: true });
  });

  /* ---------- Copy email ---------- */
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.copy);
      copyLabel.textContent = 'Copied';
    } catch {
      copyLabel.textContent = copyBtn.dataset.copy;
    }
    setTimeout(() => { copyLabel.textContent = 'Copy address'; }, 2200);
  });

  /* ---------- Footer year ---------- */
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
})();
