/* Caspian Coast — MOW CMS Standard loader.
   Reads content/home.json (+ content/navigation.json, content/settings.json)
   and injects copy, images and SEO meta into the live page through
   data-cms="<lang.field>" and data-cms-img="images.<key>" attributes.

   This is the MOW-Standard layer; it runs ALONGSIDE cc-content.js (which still
   drives the bespoke content.json). It is intentionally additive and fails
   silently — if content/ is missing or an attribute has no match, the static
   HTML is left untouched.

   Language: the site switches EN/FA via the `lang-fa` body class (and separate
   /fa/ URLs). We read `en`/`fa` blocks accordingly and set dir=rtl in Farsi. */
(function () {
  var HOME = null, NAV = null, SET = null;
  // Base URL = directory containing this script (works from /, /menu/, /fa/, ...)
  var BASE = (function () {
    var s = document.currentScript;
    if (!s) {
      var ss = document.getElementsByTagName('script');
      for (var i = 0; i < ss.length; i++) { if (/cms-standard\.js/.test(ss[i].src)) { s = ss[i]; break; } }
    }
    var src = s ? s.src : 'cms-standard.js';
    return src.replace(/cms-standard\.js(\?.*)?$/, '');
  })();

  function isFa() { return document.body.classList.contains('lang-fa') || /\/fa(\/|$)/.test(location.pathname); }
  function lang() { return isFa() ? 'fa' : 'en'; }

  function resolveSrc(src) {
    if (!src) return src;
    if (/^(https?:)?\/\//.test(src) || src.charAt(0) === '/') return src;
    return BASE + src.replace(/^\.?\//, '');
  }

  // Resolve a dotted path against a root object.
  function dig(root, path) {
    if (!root || !path) return null;
    return path.split('.').reduce(function (o, k) { return (o && o[k] != null) ? o[k] : null; }, root);
  }

  // For data-cms="field" we look first under the active language block of
  // home.json, then at the top level of home.json (so e.g. "en.hero_title" and
  // "hero_title" both work). Lets editors author per-language fields.
  function cmsValue(path) {
    if (!HOME) return null;
    var l = lang();
    // explicit "en."/"fa." prefix -> respect it
    if (/^(en|fa)\./.test(path)) return dig(HOME, path);
    var v = HOME[l] ? dig(HOME[l], path) : null;
    if (v == null) v = dig(HOME, path);
    return v;
  }

  function apply() {
    var fa = isFa();

    // Images: data-cms-img="images.hero"
    document.querySelectorAll('[data-cms-img]').forEach(function (el) {
      var v = dig(HOME, el.getAttribute('data-cms-img'));
      if (v != null) el.setAttribute('src', resolveSrc(v));
    });

    // Text: data-cms="hero_title" (per-language)
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var v = cmsValue(el.getAttribute('data-cms'));
      if (v == null) return;
      el.textContent = v;
      if (fa) el.setAttribute('dir', 'rtl'); else el.removeAttribute('dir');
    });

    // HTML: data-cms-html="bakery_body" (innerHTML, allows <br>/<em>)
    document.querySelectorAll('[data-cms-html]').forEach(function (el) {
      var v = cmsValue(el.getAttribute('data-cms-html'));
      if (v != null) el.innerHTML = v;
    });

    applyMeta();
  }

  var metaDone = false;
  function applyMeta() {
    if (!HOME || metaDone) return;
    metaDone = true;
    // The live page has a single (English) <title>; keep it stable across the
    // EN/FA soft-toggle by always using the en block and applying only once.
    // Future portal edits to en.seo_title/description still show on next load.
    var block = HOME.en || {};
    if (block.seo_title) document.title = block.seo_title;
    if (block.seo_description) {
      var m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', block.seo_description);
      var od = document.querySelector('meta[property="og:description"]');
      if (od) od.setAttribute('content', block.seo_description);
    }
    if (block.seo_title) {
      var ot = document.querySelector('meta[property="og:title"]');
      if (ot) ot.setAttribute('content', block.seo_title);
    }
    if (HOME.images && HOME.images.og_image) {
      var oi = document.querySelector('meta[property="og:image"]');
      if (oi) oi.setAttribute('content', resolveSrc(HOME.images.og_image));
    }
  }

  window.ccmsApply = apply;

  function load(file, cb) {
    fetch(BASE + file, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { cb(j); })
      .catch(function () { cb(null); });
  }

  load('content/home.json', function (j) { if (j) { HOME = j; apply(); } });
  load('content/navigation.json', function (j) { NAV = j; });
  load('content/settings.json', function (j) { SET = j; });

  // Re-apply on language toggle (mirrors cc-content.js behaviour).
  document.querySelectorAll('#langToggle button').forEach(function (b) {
    b.addEventListener('click', function () { setTimeout(apply, 0); });
  });
})();
