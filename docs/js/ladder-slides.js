/* Slide deck: arrows/space/swipe to move, reveals ".frag" items one by one, O = overview, N = notes, F = full screen. */
(function () {
  var slides = [].slice.call(document.querySelectorAll('.slide')), cur = 0, ov = $('overview'), g = ov.querySelector('.g');
  function frags(i) { return [].slice.call(slides[i].querySelectorAll('.frag')); }
  function title(i) { var h = slides[i].querySelector('h1,h2'); return h ? h.textContent : 'Slide ' + (i + 1); }
  function show(i, dir, all) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, k) { s.classList.toggle('on', k === i); s.classList.toggle('back', k === i && dir < 0); });
    frags(i).forEach(function (f) { f.classList.toggle('hide', !all); });
    cur = i; slides[i].scrollTop = 0; LW.mountAll(slides[i]); initQuiz(slides[i]);
    $('count').textContent = (i + 1) + ' / ' + slides.length; $('sec').textContent = slides[i].getAttribute('data-sec') || '';
    $('prog').style.width = (100 * (i + 1) / slides.length) + '%';
    if (history.replaceState) history.replaceState(null, '', '#' + (i + 1));
    [].forEach.call(g.querySelectorAll('button'), function (b, k) { b.classList.toggle('cur', k === i); });
  }
  function next() { var h = frags(cur).filter(function (f) { return f.classList.contains('hide'); }); if (h.length) { h[0].classList.remove('hide'); var r = h[0].getBoundingClientRect(); if (r.bottom > innerHeight) h[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); LW.mountAll(h[0]); } else if (cur < slides.length - 1) show(cur + 1, 1, false); }
  function prev() { if (cur > 0) show(cur - 1, -1, true); }
  // overview
  var last = '';
  slides.forEach(function (s, k) { var sec = s.getAttribute('data-sec') || ''; if (sec !== last) { var h = document.createElement('h3'); h.textContent = sec; g.appendChild(h); h.style.gridColumn = '1 / -1'; last = sec; }
    var b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<b>' + (k + 1) + '</b>' + title(k); b.onclick = function () { toggleOv(false); show(k, 1, true); }; g.appendChild(b); });
  function toggleOv(v) { ov.classList.toggle('on', v); $('bOv').setAttribute('aria-pressed', v); }
  function toggleNotes() { var on = document.body.classList.toggle('shownotes'); $('bNotes').setAttribute('aria-pressed', on); }
  $('bPrev').onclick = prev; $('bNext').onclick = next; $('fPrev').onclick = prev; $('fNext').onclick = next;
  $('bOv').onclick = function () { toggleOv(!ov.classList.contains('on')); };
  $('bNotes').onclick = toggleNotes;
  $('bFull').onclick = function () { if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); else document.exitFullscreen(); };
  document.addEventListener('keydown', function (e) {
    var t = e.target.tagName; if (t === 'INPUT' || t === 'SELECT' || t === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && t !== 'BUTTON')) { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') show(0, -1, false); else if (e.key === 'End') show(slides.length - 1, 1, true);
    else if (e.key === 'o' || e.key === 'O' || e.key === 'Escape') toggleOv(e.key === 'Escape' ? false : !ov.classList.contains('on'));
    else if (e.key === 'n' || e.key === 'N') toggleNotes();
  });
  var x0 = null; document.getElementById('deck').addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  document.getElementById('deck').addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 70 && !(e.target.type === 'range')) { if (dx < 0) next(); else prev(); } x0 = null; });
  // quizzes: <div class="q" data-ans="1"><p>..</p><div class="opts"><button>..</button>..</div><p class="fb" data-why="..."></p></div>
  function initQuiz(root) { [].forEach.call(root.querySelectorAll('.q[data-ans]'), function (q) { if (q.dataset.ready) return; q.dataset.ready = 1; var ans = +q.dataset.ans, fb = q.querySelector('.fb');
    [].forEach.call(q.querySelectorAll('.opts button'), function (b, k) { b.type = 'button'; b.onclick = function () { b.classList.add(k === ans ? 'ok' : 'no'); fb.innerHTML = (k === ans ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + fb.getAttribute('data-why'); }; }); }); }
  var h = parseInt((location.hash || '#1').slice(1), 10); show(isNaN(h) ? 0 : h - 1, 1, h > 1);
})();
