/* Caspian Coast — general content loader (CMS-editable copy & images from content.json) */
(function () {
  var CONTENT = null;
  function isFa() { return document.body.classList.contains('lang-fa'); }
  function get(path) {
    return path.split('.').reduce(function (o, k) { return (o && o[k] != null) ? o[k] : null; }, CONTENT);
  }
  function apply() {
    if (!CONTENT) return;
    var fa = isFa();
    // Images: data-cc-img="images.key"  -> sets src + alt (alt_fa when Farsi)
    document.querySelectorAll('[data-cc-img]').forEach(function (el) {
      var o = get(el.getAttribute('data-cc-img'));
      if (!o) return;
      if (o.src) { el.setAttribute('src', o.src); }
      var alt = fa ? (o.alt_fa || o.alt) : o.alt;
      if (alt != null) el.setAttribute('alt', alt);
    });
    // CSS background images: data-cc-bg="images.key"
    document.querySelectorAll('[data-cc-bg]').forEach(function (el) {
      var o = get(el.getAttribute('data-cc-bg'));
      if (o && o.src) el.style.backgroundImage = "url('" + o.src + "')";
    });
    // Text: data-cc-text="contact.hours" (uses <key>_fa when Farsi)
    document.querySelectorAll('[data-cc-text]').forEach(function (el) {
      var base = el.getAttribute('data-cc-text');
      var val = fa ? (get(base + '_fa') != null ? get(base + '_fa') : get(base)) : get(base);
      if (val != null) { el.textContent = val; if (fa) el.setAttribute('dir', 'rtl'); else el.removeAttribute('dir'); }
    });
    // HTML: data-cc-html="hero.titleHtml" (innerHTML, allows <br>/<em>; uses <key>_fa when Farsi)
    document.querySelectorAll('[data-cc-html]').forEach(function (el) {
      var base = el.getAttribute('data-cc-html');
      var val = fa ? (get(base + '_fa') != null ? get(base + '_fa') : get(base)) : get(base);
      if (val != null) el.innerHTML = val;
    });
    // Links: data-cc-href="contact.instagram"
    document.querySelectorAll('[data-cc-href]').forEach(function (el) {
      var val = get(el.getAttribute('data-cc-href'));
      if (val) el.setAttribute('href', val);
    });
    renderCarousel(fa);
  }
  function renderCarousel(fa) {
    var track = document.querySelector('[data-cc-carousel]');
    if (!track || !CONTENT || !Array.isArray(CONTENT.carousel)) return;
    var items = CONTENT.carousel.filter(function (it) { return it && it.show !== false && it.image; });
    if (!items.length) return;
    function card(it, dup) {
      var d = document.createElement('div');
      d.className = 'drink' + (it.secret ? ' secret' : '');
      if (it.secret) d.setAttribute('data-secret', '');
      if (dup) d.setAttribute('aria-hidden', 'true');
      var alt = dup ? '' : (fa ? (it.alt_fa || it.alt || '') : (it.alt || ''));
      var img = document.createElement('img');
      img.setAttribute('src', it.image); img.setAttribute('alt', alt);
      d.appendChild(img);
      if (it.secret) {
        var veil = document.createElement('div'); veil.className = 'secret-veil';
        veil.innerHTML = '<img class="sm-eye" src="img/eye-white.png" alt="" aria-hidden="true" /><span class="sm-label">' +
          (fa ? (it.secretLabel_fa || 'آیتم مخفی منو') : (it.secretLabel || 'Secret Menu Item')) + '</span>';
        d.appendChild(veil);
      }
      return d;
    }
    track.innerHTML = '';
    items.forEach(function (it) { track.appendChild(card(it, false)); });
    items.forEach(function (it) { track.appendChild(card(it, true)); }); // duplicate set for seamless loop
    if (window.ccInitSecret) window.ccInitSecret();
    setTimeout(initMarquees, 50);
  }
  /* Auto-scroll carousels + manual drag, with idle auto-resume (site-wide on .menu-band) */
  function initMarquees() {
    document.querySelectorAll('.menu-band').forEach(function (band) {
      if (band._marq) { band._marq.refresh(); return; }
      var track = band.querySelector('.menu-track');
      if (!track) return;
      var speed = 0.55, paused = false, idle = null, raf = null;
      function half() { return track.scrollWidth / 2; }
      function resumeSoon() { clearTimeout(idle); idle = setTimeout(function () { paused = false; }, 1600); }
      function pause() { paused = true; clearTimeout(idle); }
      function tick() {
        if (!paused) {
          band.scrollLeft += speed;
          var h = half();
          if (h > 0 && band.scrollLeft >= h) band.scrollLeft -= h;
        }
        raf = requestAnimationFrame(tick);
      }
      // wheel / native touch scroll → pause then resume
      band.addEventListener('wheel', function () { pause(); resumeSoon(); }, { passive: true });
      band.addEventListener('touchstart', function () { pause(); }, { passive: true });
      band.addEventListener('touchend', function () { resumeSoon(); }, { passive: true });
      band.addEventListener('scroll', function () {
        var h = half();
        if (h > 0 && band.scrollLeft >= h) band.scrollLeft -= h;
        else if (band.scrollLeft <= 0) band.scrollLeft += h;
      }, { passive: true });
      // mouse drag
      var down = false, sx = 0, sl = 0, moved = false;
      band.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        down = true; moved = false; sx = e.clientX; sl = band.scrollLeft; pause();
        band.classList.add('dragging');
      });
      window.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - sx;
        if (Math.abs(dx) > 3) moved = true;
        band.scrollLeft = sl - dx;
      });
      window.addEventListener('pointerup', function () {
        if (!down) return;
        down = false; band.classList.remove('dragging'); resumeSoon();
      });
      // block click-through after a drag (so secret card etc. don't fire)
      band.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
      band._marq = { refresh: function () {} };
      raf = requestAnimationFrame(tick);
    });
  }
  window.ccInitMarquees = initMarquees;
  function applyTheme() {
    if (!CONTENT || !CONTENT.theme) return;
    var t = CONTENT.theme;
    var map = { fontDisplay: '--font-display', fontSerif: '--font-serif', fontBody: '--font-body', fontEditorial: '--font-edit' };
    var fams = [];
    Object.keys(map).forEach(function (k) {
      if (t[k]) {
        document.documentElement.style.setProperty(map[k], "'" + t[k] + "', sans-serif");
        if (fams.indexOf(t[k]) === -1) fams.push(t[k]);
      }
    });
    // inject a Google Fonts link for any chosen families (weights cover display/body needs)
    if (fams.length) {
      var href = 'https://fonts.googleapis.com/css2?' + fams.map(function (f) {
        return 'family=' + f.replace(/ /g, '+') + ':ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500';
      }).join('&') + '&display=swap';
      var link = document.getElementById('cc-theme-fonts');
      if (!link) { link = document.createElement('link'); link.id = 'cc-theme-fonts'; link.rel = 'stylesheet'; document.head.appendChild(link); }
      link.href = href;
    }
  }
  window.ccApply = apply;
  fetch('content.json').then(function (r) { return r.json(); }).then(function (data) {
    CONTENT = data; applyTheme(); apply();
  }).catch(function () {});
  // re-apply on language toggle
  document.querySelectorAll('#langToggle button').forEach(function (b) {
    b.addEventListener('click', function () { setTimeout(apply, 0); });
  });
})();
