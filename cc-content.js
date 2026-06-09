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
  }
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
