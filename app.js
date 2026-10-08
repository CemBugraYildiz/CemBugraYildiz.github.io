
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

  // Gameplay clips: a thumbnail at rest, a muted loop on hover (desktop) or tap.
  var YT = 'autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1';
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.querySelectorAll('.proj-media[data-yt]').forEach(function (box) {
    var id = box.getAttribute('data-yt');
    var thumb = box.querySelector('.thumb');
    var btn = box.querySelector('.media-btn');
    var timer = null, pinned = false;

    if (thumb) {
      var failed = function () { thumb.classList.add('is-failed'); };
      thumb.addEventListener('error', failed);
      if (thumb.complete && thumb.naturalWidth === 0) failed();
    }
    function play() {
      if (box.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?' + YT + '&playlist=' + id;
      f.title = 'Gameplay clip';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.setAttribute('allowfullscreen', '');
      box.appendChild(f); box.classList.add('is-live');
    }
    function stop() {
      var f = box.querySelector('iframe');
      if (f) f.remove();
      box.classList.remove('is-live');
    }
    if (btn) btn.addEventListener('click', function () { pinned = true; play(); });
    if (canHover) {
      box.addEventListener('mouseenter', function () { timer = setTimeout(play, 350); });
      box.addEventListener('mouseleave', function () { clearTimeout(timer); if (!pinned) stop(); });
    }
  });
})();
