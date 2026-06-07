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
  window.ccApply = apply;
  fetch('content.json').then(function (r) { return r.json(); }).then(function (data) {
    CONTENT = data; apply();
  }).catch(function () {});
  // re-apply on language toggle
  document.querySelectorAll('#langToggle button').forEach(function (b) {
    b.addEventListener('click', function () { setTimeout(apply, 0); });
  });
})();
