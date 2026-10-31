(() => {
  'use strict';
  // Configure only verified, authorized contact details. Leave blank for portfolio use.
  const CONFIG = {
    whatsapp: '',              // Country code + area code + number, digits only.
    instagram: '',             // Full https://www.instagram.com/... URL.
    email: '',                 // Real e-mail, without mailto:.
    phone: '',                 // Phone digits, with optional leading +.
    phoneLabel: '',            // Human-readable phone.
    address: '',               // Verified address.
    maps: ''                   // Verified HTTPS route link; does NOT replace the iframe.
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  let revealObserver;
  function startReveal() {
    const items = $$('.reveal');
    if (reduced.matches || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible')); return;
    }
    try {
      revealObserver = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible'); obs.unobserve(entry.target);
      }), { threshold: 0, rootMargin: '0px 0px -15px 0px' });
      document.documentElement.classList.add('motion-ready');
      items.forEach(el => revealObserver.observe(el));
      document.addEventListener('focusin', e => e.target.closest('.reveal')?.classList.add('is-visible'));
    } catch (error) { document.documentElement.classList.remove('motion-ready'); }
  }
  function initLoader() {
    const loader = $('#loader');
    if (!loader) { startReveal(); return; }
    const started = performance.now(), minimum = reduced.matches ? 0 : 1000;
    let done = false;
    if (!reduced.matches) { loader.classList.remove('is-hidden'); document.body.classList.add('is-loading'); }
    function hide() {
      if (done) return; done = true;
      setTimeout(() => {
        loader.classList.add('is-hidden'); document.body.classList.remove('is-loading'); startReveal();
        setTimeout(() => loader.remove(), reduced.matches ? 0 : 900);
      }, Math.max(0, minimum - (performance.now() - started)));
    }
    if (document.readyState === 'complete' || reduced.matches) hide();
    else window.addEventListener('load', hide, { once: true });
    setTimeout(hide, 2500);
    document.addEventListener('keydown', hide, { once: true });
  }
  function initMenu() {
    const button = $('.menu-toggle'), nav = $('#main-nav');
    if (!button || !nav) return;
    function setOpen(open) {
      nav.classList.toggle('open', open); button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }
    button.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    $$('a', nav).forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); button.focus(); }
    });
    document.addEventListener('click', e => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !button.contains(e.target)) setOpen(false);
    });
    window.addEventListener('resize', () => { if (innerWidth > 900) setOpen(false); });
  }
  let toastTimer;
  function toast(message) {
    const box = $('#contact-toast'); if (!box) return;
    clearTimeout(toastTimer); box.hidden = false; box.textContent = message;
    toastTimer = setTimeout(() => { box.hidden = true; }, 6000);
  }
  function validNumber(value) { return /^\d{10,15}$/.test(value); }
  function https(value) { try { return new URL(value).protocol === 'https:'; } catch (_) { return false; } }
  function initContacts() {
    const destinations = {
      whatsapp: validNumber(CONFIG.whatsapp) ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre os atendimentos.')}` : '',
      instagram: https(CONFIG.instagram) ? CONFIG.instagram : '',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONFIG.email) ? `mailto:${CONFIG.email}` : '',
      phone: /^\+?\d{8,15}$/.test(CONFIG.phone) ? `tel:${CONFIG.phone}` : '',
      map: https(CONFIG.maps) ? CONFIG.maps : ''
    };
    $$('[data-contact]').forEach(a => {
      const key = a.dataset.contact, url = destinations[key];
      if (url) {
        a.href = url;
        if (url.startsWith('https:')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      } else {
        a.addEventListener('click', e => { e.preventDefault(); toast('Canal ainda não configurado neste modelo. Nenhum contato foi iniciado.'); });
      }
    });
    const labels = { email: CONFIG.email, phone: CONFIG.phoneLabel || CONFIG.phone, address: CONFIG.address };
    $$('[data-label]').forEach(el => { if (labels[el.dataset.label]) el.textContent = labels[el.dataset.label]; });
  }
  function initAssetImages() {
    $$('img.asset').forEach(img => {
      const fail = () => img.classList.add('missing'); img.addEventListener('error', fail);
      if (img.complete && !img.naturalWidth) fail();
    });
  }
  function initResultsCarousel() {
    const track = $('#results-track'), gallery = track?.closest('.gallery-wrap');
    const prev = gallery?.querySelector('[data-gallery="-1"]'), next = gallery?.querySelector('[data-gallery="1"]');
    if (!track || !prev || !next) return;
    function getStep() { const card = $('.result-card', track); return card ? card.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0) : track.clientWidth; }
    function update() { const max = Math.max(0, track.scrollWidth - track.clientWidth); prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max - 2; }
    function move(direction) { track.scrollBy({ left: direction * getStep(), behavior: reduced.matches ? 'auto' : 'smooth' }); }
    prev.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', e => {
      if (e.target === track && ['ArrowRight','ArrowLeft'].includes(e.key)) { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); }
    });
    track.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track); update();
  }
  function initComparisons() {
    $$('.result-compare').forEach(box => { const control = $('.comparison-control', box); if (!control) return;
      const update = () => box.style.setProperty('--position', control.value + '%'); control.addEventListener('input', update); update();
    });
  }
  function initTestimonials() {
    const track = $('#testimonial-track'); if (!track) return;
    const dots = $$('[data-slide]'), dotsWrap = $('.slider-dots'), mobile = matchMedia('(max-width:620px)');
    function setDot(index) { dots.forEach((dot, i) => { dot.classList.toggle('selected', i === index); dot.setAttribute('aria-pressed', String(i === index)); }); }
    dots.forEach(dot => dot.addEventListener('click', () => {
      if (!mobile.matches) return;
      const index = Number(dot.dataset.slide), card = track.children[index], first = track.children[0]; if (!card || !first) return;
      track.scrollTo({ left: card.getBoundingClientRect().left - first.getBoundingClientRect().left, behavior: reduced.matches ? 'auto' : 'smooth' }); setDot(index);
    }));
    function update() { if (dotsWrap) dotsWrap.hidden = !mobile.matches; }
    update(); window.addEventListener('resize', update);
    track.addEventListener('scroll', () => {
      let best = 0, distance = Infinity; const left = track.getBoundingClientRect().left;
      [...track.children].forEach((card, i) => { const d = Math.abs(card.getBoundingClientRect().left - left); if (d < distance) { best = i; distance = d; } }); setDot(best);
    }, { passive: true });
  }
  function initTopButton() {
    const button = $('#back-to-top'); if (!button) return;
    const update = () => button.classList.toggle('visible', scrollY > 500);
    update(); window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' }));
  }
  function initForm() {
    const form = $('#consultation-form'); if (!form) return;
    const interests = {
      'estetica-facial':'Estética facial', 'contorno-corporal':'Contorno corporal',
      'cuidados-corporais':'Cuidados corporais', injetaveis:'Injetáveis',
      'pele-tecnologia':'Pele & tecnologia', 'nao-cirurgicos':'Não cirúrgicos'
    };
    const selection = interests[new URLSearchParams(location.search).get('interesse')];
    if (selection) form.elements.interesse.value = selection;
    const status = $('#form-status'), say = text => { if (status) status.textContent = text; };
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validNumber(CONFIG.whatsapp)) { say('Demonstração: contato ainda não configurado. Nenhuma informação foi enviada.'); return; }
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const text = [
        'Olá! Gostaria de agendar uma consulta.',
        `Nome: ${data.get('nome') || 'Não informado'}`,
        `Telefone: ${data.get('telefone') || 'Não informado'}`,
        `E-mail: ${data.get('email') || 'Não informado'}`,
        `Data preferida: ${data.get('data') || 'A combinar'}`,
        `Interesse: ${data.get('interesse') || 'Avaliação inicial'}`,
        `Mensagem: ${data.get('mensagem') || 'Não informada'}`
      ].join('\n');
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
      say('Tentativa de abertura do WhatsApp com a mensagem preparada. Revise os dados no aplicativo e escolha se deseja enviar. A consulta ainda não está confirmada.');
    });
  }
  function initPhotoBelt() {
    const section = $('.photo-belt'); if (!section || section.dataset.initialized === 'true') return;
    const viewport = $('.belt-viewport', section), track = $('.belt-track', section), group = $('.belt-group', section), toggle = $('.belt-toggle', section);
    if (!viewport || !track || !group || !toggle || !group.children.length) return;
    section.dataset.initialized = 'true';
    const SPEED = 16;
    let direction = 1, playing = !reduced.matches, visible = true, dragging = false;
    let cycleWidth = 0, position = 0, previousTime = null;
    let pointerId = null, startX = 0, startY = 0, lastX = 0, moved = false, vertical = false, lastDelta = 0, resizeFrame = 0;
    function wrapPosition() { if (cycleWidth > 0) position = cycleWidth + ((position - cycleWidth) % cycleWidth + cycleWidth) % cycleWidth; }
    function draw() { viewport.scrollLeft = position; }
    function updateButton() { toggle.textContent = playing ? 'Pausar' : 'Reproduzir'; toggle.setAttribute('aria-label', playing ? 'Pausar movimento das fotos' : 'Reproduzir movimento das fotos'); toggle.setAttribute('aria-pressed', String(playing)); }
    function pause() { playing = false; updateButton(); }
    function play(value = direction) { direction = value < 0 ? -1 : 1; playing = true; previousTime = null; updateButton(); }
    function cleanClone(element) {
      element.setAttribute('aria-hidden', 'true'); element.setAttribute('inert', ''); element.removeAttribute('id');
      $$('[id]', element).forEach(el => el.removeAttribute('id')); $$('img', element).forEach(img => { img.alt = ''; }); return element;
    }
    function build() {
      const width = viewport.clientWidth; if (!width) return;
      const originals = [...group.children].filter(el => !el.hasAttribute('data-belt-copy')); if (!originals.length) return;
      const phase = cycleWidth > 0 ? ((position - cycleWidth) % cycleWidth + cycleWidth) % cycleWidth : 0;
      $$('.belt-group', track).forEach(el => { if (el !== group) el.remove(); });
      $$('[data-belt-copy]', group).forEach(el => el.remove());
      let attempts = 0;
      while (group.getBoundingClientRect().width < width && attempts < 30) {
        const before = group.getBoundingClientRect().width;
        originals.forEach(el => { const copy = cleanClone(el.cloneNode(true)); copy.setAttribute('data-belt-copy', ''); group.append(copy); });
        attempts++; if (group.getBoundingClientRect().width <= before) break;
      }
      cycleWidth = group.getBoundingClientRect().width; if (!cycleWidth) return;
      track.prepend(cleanClone(group.cloneNode(true))); track.append(cleanClone(group.cloneNode(true)));
      position = cycleWidth + phase % cycleWidth; previousTime = null; draw();
    }
    function scheduleBuild() { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(build); }
    function animate(time) {
      const seconds = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, .05); previousTime = time;
      if (playing && !dragging && visible && !document.hidden && cycleWidth > 0) { position += direction * SPEED * seconds; wrapPosition(); draw(); }
      requestAnimationFrame(animate);
    }
    toggle.addEventListener('click', () => playing ? pause() : play());
    $$('[data-belt-direction]', section).forEach(button => button.addEventListener('click', () => play(Number(button.dataset.beltDirection))));
    section.addEventListener('focusin', pause);
    viewport.addEventListener('keydown', e => {
      if (e.target !== viewport) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); play(e.key === 'ArrowLeft' ? 1 : -1); }
      else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); pause(); }
    });
    viewport.addEventListener('dragstart', e => e.preventDefault());
    viewport.addEventListener('pointerdown', e => {
      if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
      pause(); dragging = true; moved = false; vertical = false; pointerId = e.pointerId;
      startX = lastX = e.clientX; startY = e.clientY; lastDelta = 0; viewport.classList.add('is-dragging');
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    });
    viewport.addEventListener('pointermove', e => {
      if (!dragging || e.pointerId !== pointerId || vertical) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (!moved) { if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return; if (Math.abs(dy) > Math.abs(dx)) { vertical = true; return; } moved = true; }
      const delta = e.clientX - lastX; lastX = e.clientX; if (Math.abs(delta) > .5) lastDelta = delta;
      position -= delta; wrapPosition(); draw();
    });
    function finish(e) {
      if (!dragging || e.pointerId !== pointerId) return;
      const resume = e.type === 'pointerup' && moved && !vertical;
      dragging = false; pointerId = null; viewport.classList.remove('is-dragging');
      try { if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId); } catch (_) {}
      if (resume) play(lastDelta < 0 ? 1 : -1);
    }
    viewport.addEventListener('pointerup', finish); viewport.addEventListener('pointercancel', finish); viewport.addEventListener('lostpointercapture', finish);
    const motionChanged = () => { if (reduced.matches) pause(); };
    if (reduced.addEventListener) reduced.addEventListener('change', motionChanged); else reduced.addListener(motionChanged);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; previousTime = null; }).observe(viewport);
    if ('ResizeObserver' in window) new ResizeObserver(scheduleBuild).observe(viewport); else window.addEventListener('resize', scheduleBuild);
    if (document.fonts?.ready) document.fonts.ready.then(scheduleBuild);
    updateButton(); build(); requestAnimationFrame(animate);
  }
  function initBlog() {
    const tools = $('.blog-tools'); if (!tools) return;
    const cards = $$('.blog-card'), buttons = $$('[data-filter]', tools), input = $('#blog-search');
    let category = 'todos';
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    function update() {
      const query = normalize(input.value.trim()); let count = 0;
      cards.forEach(card => {
        const show = (category === 'todos' || card.dataset.category === category) && normalize(card.textContent).includes(query);
        card.hidden = !show; if (show) { count++; card.classList.add('is-visible'); }
      });
      $('.blog-empty').hidden = count > 0;
      $('.blog-results').textContent = `${count} ${count === 1 ? 'artigo encontrado' : 'artigos encontrados'}`;
    }
    buttons.forEach(button => button.addEventListener('click', () => {
      category = button.dataset.filter; buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button))); update();
    }));
    input.addEventListener('input', update);
  }
  function init() {
    [initLoader,initMenu,initContacts,initAssetImages,initResultsCarousel,initComparisons,initTestimonials,initTopButton,initForm,initPhotoBelt,initBlog].forEach(fn => {
      try { fn(); } catch (error) { console.error(`[${fn.name}]`, error); }
    });
    const year = $('#year'); if (year) year.textContent = new Date().getFullYear();
    if (reduced.addEventListener) reduced.addEventListener('change', e => {
      if (e.matches) { document.documentElement.classList.remove('motion-ready'); revealObserver?.disconnect(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
