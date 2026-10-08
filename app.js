
(function () {
  // Theme toggle. Follows the system until the visitor picks a side.
  var root = document.documentElement;
  function current() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.querySelectorAll('.themer').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('cby-theme', next); } catch (e) {}
    });
  });

  // Copy email / phone, with a select-the-text fallback.
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.getElementById(btn.getAttribute('data-copy'));
      if (!el) return;
      var done = function () {
        btn.textContent = 'Copied'; btn.classList.add('ok');
        setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 1600);
      };
      var fallback = function () {
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        btn.textContent = 'Selected';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
      };
      try { navigator.clipboard.writeText(el.textContent.trim()).then(done, fallback); }
      catch (e) { fallback(); }
    });
  });

  // Gameplay clips: self-hosted, muted and looping, with no player chrome.
  // They run while on screen, stop when scrolled away, and a click holds them.
  document.querySelectorAll('.proj-media[data-clip]').forEach(function (box) {
    var v = box.querySelector('video');
    var btn = box.querySelector('.clip-ui');
    if (!v) return;
    var held = false; // the visitor paused it deliberately

    v.addEventListener('error', function () { box.classList.add('no-clip'); });
    v.addEventListener('play', function () { box.classList.remove('is-paused'); });
    v.addEventListener('pause', function () { box.classList.add('is-paused'); });

    // Fit the frame to the footage itself, so no letterbox bars show around it.
    v.addEventListener('loadedmetadata', function () {
      if (!v.videoWidth || !v.videoHeight) return;
      box.style.aspectRatio = v.videoWidth + ' / ' + v.videoHeight;
      box.classList.toggle('portrait', v.videoWidth / v.videoHeight < 0.95);
    });

    function start() {
      if (held) return;
      var r = v.play();
      if (r && r.catch) r.catch(function () {});
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) start(); else v.pause();
        });
      }, { threshold: 0.25 }).observe(box);
    } else {
      start();
    }

    if (btn) {
      btn.addEventListener('click', function () {
        if (v.paused) { held = false; start(); }
        else { held = true; v.pause(); }
      });
    }
  });
})();
