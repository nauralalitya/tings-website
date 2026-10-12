(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- menu ---------- */
  var overlay = $('overlay'), openBtn = $('menuOpen'), closeBtn = $('menuClose');
  function setMenu(open) {
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    closeBtn.classList.toggle('x', open);
    if (open) { setTimeout(function () { closeBtn.focus(); }, 50); } else { openBtn.focus(); }
  }
  openBtn.addEventListener('click', function () { setMenu(true); });
  closeBtn.addEventListener('click', function () { setMenu(false); });
  overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) { setMenu(false); } });

  /* ---------- tagline ---------- */
  var WORDS = ['cafés', 'villas', 'houses', 'bakeshops', 'clinics', 'boarding houses', '@logo'];
  var wordStack = $('wordStack'), verbStack = $('verbStack'), measure = $('measure');
  var logoHTML = '<img class="logo-word" src="/assets/img/logo.png" alt="">';
  wordStack.innerHTML = WORDS.map(function (w, k) { return '<span class="w ' + (k === 0 ? 'now' : 'next') + '">' + (w === '@logo' ? logoHTML : w) + '</span>'; }).join('');
  measure.innerHTML = '<span data-v>design</span><span data-v>are</span>' + WORDS.map(function (w) { return w === '@logo' ? '<img data-m class="logo-word" src="/assets/img/logo.png" alt="">' : '<span data-m>' + w + '</span>'; }).join('');
  var wordEls = wordStack.children, verbEls = verbStack.children;
  var widths = [], vwidths = [], wi = 0, timer = null;
  function measureAll() {
    widths = [].map.call(measure.querySelectorAll('[data-m]'), function (n) { return Math.ceil(n.getBoundingClientRect().width) + 2; });
    vwidths = [].map.call(measure.querySelectorAll('[data-v]'), function (n) { return Math.ceil(n.getBoundingClientRect().width) + 2; });
    paintWord();
  }
  function paintWord() {
    var last = WORDS.length - 1;
    for (var k = 0; k < wordEls.length; k++) { wordEls[k].className = 'w ' + (k === wi ? 'now' : (k < wi ? 'past' : 'next')); }
    verbEls[0].className = 'w ' + (wi === last ? 'past' : 'now');
    verbEls[1].className = 'w ' + (wi === last ? 'now' : 'next');
    if (widths[wi]) { wordStack.style.width = widths[wi] + 'px'; }
    if (vwidths.length === 2) { verbStack.style.width = vwidths[wi === last ? 1 : 0] + 'px'; }
  }
  function startTagline() {
    clearInterval(timer);
    timer = setInterval(function () {
      wi = Math.min(wi + 1, WORDS.length - 1); paintWord();
      if (wi >= WORDS.length - 1) { clearInterval(timer); }
    }, 1300);
  }
  $('replay').addEventListener('click', function () { wi = 0; paintWord(); if (!reduce) { startTagline(); } });
  if (reduce) { wi = WORDS.length - 1; }
  measureAll();
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(measureAll); }
  window.addEventListener('load', measureAll);
  if (!reduce) { startTagline(); }

  /* ---------- works gallery ---------- */
  var WORKS = window.TINGS_WORKS || [];
  var vp = $('vp'), track = $('track');
  var filter = 'all', view = 'bottom';
  var VIEWS = ['small', 'bottom', 'large', 'even'];
  var LABELS = { all: 'all works', residential: 'residential', commercial: 'commercial' };
  var SIZES = ['h-m', 'h-s', 'h-l', 'h-s', 'h-m', 'h-l', 'h-s', 'h-m', 'h-s', 'h-l', 'h-m', 'h-s', 'h-l', 'h-m'];
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function buildTrack() {
    var list = WORKS.filter(function (p) { return filter === 'all' || p.cat === filter; });
    var items = list.map(function (p, k) {
      var sz = SIZES[k % SIZES.length], tall = p.w / p.h < 0.9;
      if (tall && sz === 'h-s') { sz = 'h-m'; }
      if (tall && sz === 'h-m' && k % 2 === 0) { sz = 'h-l'; }
      return { p: p, sz: sz };
    });
    var html = '';
    for (var c = 0; c < 3; c++) {
      items.forEach(function (it) {
        var p = it.p, dup = c > 0;
        var open = p.slug ? '<a class="pf-a" href="/project/#' + esc(p.slug) + '"' + (dup ? ' tabindex="-1"' : '') + '>' : '<div class="pf-a" style="cursor: default">';
        var close = p.slug ? '</a>' : '</div>';
        html += '<figure class="pf"' + (dup ? ' aria-hidden="true"' : '') + '>' + open +
          '<img class="' + it.sz + '" src="' + esc(p.img) + '" alt="' + (dup ? '' : esc(p.name + ', ' + p.loc)) + '" width="' + p.w + '" height="' + p.h + '" loading="' + (c === 0 ? 'eager' : 'lazy') + '" decoding="async" draggable="false">' +
          '<figcaption><span style="font-weight: 500">' + esc(p.name) + '</span><span class="loc">' + esc(p.loc) + '</span></figcaption>' + close + '</figure>';
      });
    }
    track.innerHTML = html;
    $('count').textContent = list.length;
    pos = 0; vp.scrollLeft = 0;
  }
  // dropdown
  var dd = $('dd'), ttl = $('ttl');
  function buildDd() {
    dd.innerHTML = ['all', 'residential', 'commercial'].map(function (f) {
      return '<button class="ddi" type="button" data-f="' + f + '" style="color: ' + (f === filter ? '#A3A3A0' : '#1A1A1A') + '">' + LABELS[f] + '</button>';
    }).join('');
  }
  ttl.addEventListener('click', function () {
    var open = dd.hidden; buildDd(); dd.hidden = !open; ttl.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  dd.addEventListener('click', function (e) {
    var b = e.target.closest('[data-f]'); if (!b) { return; }
    filter = b.getAttribute('data-f'); $('filterLabel').textContent = LABELS[filter];
    dd.hidden = true; ttl.setAttribute('aria-expanded', 'false'); buildTrack();
  });
  // views
  $('viewBtn').addEventListener('click', function () {
    if (vp.scrollWidth) { anchor = { ratio: (vp.scrollLeft + vp.clientWidth / 2) / vp.scrollWidth, until: performance.now() + 1250 }; }
    view = VIEWS[(VIEWS.indexOf(view) + 1) % VIEWS.length];
    track.className = 'strack v-' + view;
  });
  // auto scroll + drag
  var pos = 0, lastUser = 0, dragging = false, dragMoved = false, dragX = 0, dragStart = 0, anchor = null;
  function setW() { return (vp.scrollWidth + 16) / 3; }
  vp.addEventListener('scroll', function () {
    if (Math.abs(vp.scrollLeft - pos) > 3) {
      lastUser = performance.now();
      var w = setW();
      if (w > 0 && vp.scrollLeft < 2) { vp.scrollLeft += w; } else if (w > 0 && vp.scrollLeft >= w * 2) { vp.scrollLeft -= w; }
      pos = vp.scrollLeft;
    }
  }, { passive: true });
  vp.addEventListener('mousedown', function (e) { if (e.button !== 0) { return; } dragging = true; dragMoved = false; dragX = e.clientX; dragStart = vp.scrollLeft; e.preventDefault(); });
  window.addEventListener('mousemove', function (e) {
    if (!dragging) { return; }
    vp.scrollLeft = dragStart - (e.clientX - dragX); lastUser = performance.now();
    if (!dragMoved && Math.abs(e.clientX - dragX) > 4) { dragMoved = true; vp.classList.add('dragging'); }
  });
  window.addEventListener('mouseup', function () { if (dragging) { dragging = false; lastUser = performance.now(); vp.classList.remove('dragging'); } });
  vp.addEventListener('click', function (e) { if (dragMoved) { e.preventDefault(); e.stopPropagation(); dragMoved = false; } }, true);
  buildTrack();

  /* ---------- zoom transition + who we help ---------- */
  var AUDS = window.TINGS_AUDS || [];
  var zoom = $('help'), zmask = $('zmask'), ztext = $('ztext'), zimg = $('zimg'), zdark = $('zdark'), hcontent = $('hcontent');
  var hrow = $('hrow'), zpan = $('zpan'), help = 0;
  var hBtns = hrow.querySelectorAll('.hh'), hDescs = document.querySelectorAll('.hdesc .hd');
  function helpGo(n) {
    help = Math.max(0, Math.min(hBtns.length - 1, n));
    hBtns.forEach(function (b, k) { b.classList.toggle('on', k === help); b.setAttribute('aria-current', k === help ? 'true' : 'false'); });
    hDescs.forEach(function (d, k) { d.classList.toggle('on', k === help); });
    hrow.style.transform = 'translateX(' + (-hBtns[help].offsetLeft) + 'px)';
    zpan.style.transform = 'translateX(' + (-(help / (hBtns.length - 1)) * 23.08).toFixed(2) + '%)';
    $('hnum').textContent = '0' + (help + 1);
  }
  hBtns.forEach(function (b, k) { b.addEventListener('click', function () { helpGo(k); }); });
  $('helpPrev').addEventListener('click', function () { helpGo(help - 1); });
  $('helpNext').addEventListener('click', function () { helpGo(help + 1); });
  var sticky = $('zsticky'), hx = null, hy = 0, wheelAcc = 0, wheelCool = 0;
  sticky.addEventListener('pointerdown', function (e) { hx = e.clientX; hy = e.clientY; });
  sticky.addEventListener('pointerup', function (e) {
    if (hx === null) { return; }
    var dx = e.clientX - hx, dy = e.clientY - hy; hx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { helpGo(help + (dx < 0 ? 1 : -1)); }
  });
  sticky.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) { return; }
    e.preventDefault();
    var now = performance.now(); if (now - wheelCool < 900) { return; }
    wheelAcc += e.deltaX;
    if (Math.abs(wheelAcc) > 40) { helpGo(help + (wheelAcc > 0 ? 1 : -1)); wheelAcc = 0; wheelCool = now; }
  }, { passive: false });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { helpGo(help); }); }

  /* ---------- how we work timeline ---------- */
  var tlBtns = document.querySelectorAll('.tlb'), tlDets = document.querySelectorAll('.tld'), step = 0;
  function stepGo(n) {
    step = Math.max(0, Math.min(tlBtns.length - 1, n));
    tlBtns.forEach(function (b, k) { b.className = 'tlb' + (k === step ? ' on' : (k < step ? ' past' : '')); b.setAttribute('aria-pressed', k === step ? 'true' : 'false'); });
    tlDets.forEach(function (d, k) { d.classList.toggle('on', k === step); });
    $('tlfill').style.width = (step / (tlBtns.length - 1) * 100) + '%';
    $('stepPrev').disabled = step === 0; $('stepNext').disabled = step === tlBtns.length - 1;
  }
  tlBtns.forEach(function (b, k) {
    b.addEventListener('click', function () { stepGo(k); });
    b.addEventListener('mouseenter', function () { stepGo(k); });
    b.addEventListener('focus', function () { stepGo(k); });
  });
  $('stepPrev').addEventListener('click', function () { stepGo(step - 1); });
  $('stepNext').addEventListener('click', function () { stepGo(step + 1); });

  /* ---------- frame loop: gallery drift, zoom scene, footer colour ---------- */
  var pg = $('pg'), ft = document.querySelector('footer.ft'), ftBlue = false;
  function ramp(p, a, b) { var t = Math.max(0, Math.min(1, (p - a) / (b - a))); return t * t * (3 - 2 * t); }
  function tick() {
    var now = performance.now();
    if (anchor && now < anchor.until) {
      vp.scrollLeft = anchor.ratio * vp.scrollWidth - vp.clientWidth / 2; pos = vp.scrollLeft; lastUser = now - 600;
    } else if (!reduce && !dragging && now - lastUser > 1800) {
      var w = setW();
      if (w > 0) { pos += 0.5; if (pos >= w * 2) { pos -= w; } vp.scrollLeft = pos; if (Math.abs(vp.scrollLeft - pos) >= 1.5) { pos = vp.scrollLeft; } }
    }
    if (!reduce) {
      var zr = zoom.getBoundingClientRect(), span = zr.height - window.innerHeight;
      if (span > 0 && zr.bottom > 0 && zr.top < window.innerHeight) {
        var pr = Math.max(0, Math.min(1, -zr.top / span));
        zmask.style.transformOrigin = '50% ' + (ztext.offsetTop + ztext.offsetHeight / 2) + 'px';
        zmask.style.transform = 'scale(' + (1 + Math.pow(ramp(pr, 0.04, 0.55), 2.4) * 22).toFixed(3) + ')';
        zmask.style.opacity = (1 - ramp(pr, 0.36, 0.56)).toFixed(3);
        zimg.style.transform = 'scale(' + (1.15 - 0.15 * ramp(pr, 0.04, 0.7)).toFixed(3) + ')';
        zdark.style.opacity = ramp(pr, 0.4, 0.62).toFixed(3);
        var c = ramp(pr, 0.52, 0.72);
        hcontent.style.opacity = c.toFixed(3);
        hcontent.style.transform = 'translateY(' + ((1 - c) * 40).toFixed(1) + 'px)';
        hcontent.style.pointerEvents = c > 0.5 ? 'auto' : 'none';
      }
    }
    var fr = ft.getBoundingClientRect();
    var fb = window.scrollY > 0 && fr.top < window.innerHeight * 0.6 && fr.bottom > window.innerHeight * 0.4;
    if (fb !== ftBlue) { ftBlue = fb; ft.classList.toggle('blue', fb); pg.classList.toggle('blue', fb); }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  window.addEventListener('resize', function () { measureAll(); helpGo(help); });
})();
