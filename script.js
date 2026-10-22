(function () {
  'use strict';
  var stage = document.getElementById('stage');
  var slides = [].slice.call(document.querySelectorAll('.slide'));
  var N = slides.length, cur = 0;
  function $(id) { return document.getElementById(id); }
  function pad(n) { return String(n).padStart(2, '0'); }

  /* palco escalado: o deck é desenhado em 1600 × 900 e encolhe para caber na tela */
  function fit() { stage.style.transform = 'scale(' + Math.min(innerWidth / 1600, innerHeight / 900) + ')'; }
  addEventListener('resize', fit); fit();

  /* ---------------------------------------------------------- navegação */
  function go(n) {
    if (typeof n === 'string') n = slides.findIndex(function (s) { return s.id === n; });
    if (n < 0 || n >= N || n === cur) return;
    var de = slides[cur], para = slides[n];
    slides.forEach(function (s) { s.classList.remove('prev'); });
    de.classList.remove('act'); de.classList.add('prev');
    // reinicia as animações de entrada da tela que vai aparecer
    para.querySelectorAll('.rv').forEach(function (el) { el.style.animation = 'none'; el.offsetHeight; el.style.animation = ''; });
    para.classList.add('act');
    setTimeout(function () { de.classList.remove('prev'); }, 600);
    cur = n;
    pintar();
    try { history.replaceState(null, '', '#' + para.id); } catch (e) {}
  }
  function pintar() {
    var s = slides[cur];
    var escuro = s.classList.contains('t-escuro') || s.classList.contains('t-vermelho');
    document.querySelectorAll('.lg-claro').forEach(function (i) { i.hidden = escuro; });
    document.querySelectorAll('.lg-escuro').forEach(function (i) { i.hidden = !escuro; });
    stage.setAttribute('data-slide', s.id);
    $('prog').style.width = ((cur + 1) / N * 100) + '%';
    $('cnt').innerHTML = pad(cur + 1) + ' <i>/ ' + pad(N) + '</i>';
    $('who').innerHTML = '<b>NEOBAND × 75 LAB</b> · ' + (s.getAttribute('data-chap') || 'Rastreamento de PDV');
    [].forEach.call($('menuList').children, function (b, k) { b.classList.toggle('cur-sl', k === cur); });
  }
  function proxima() { go(Math.min(cur + 1, N - 1)); }
  function anterior() { go(Math.max(cur - 1, 0)); }
  $('btnNext').onclick = proxima;
  $('btnPrev').onclick = anterior;
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go]');
    if (t) go(t.getAttribute('data-go'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); proxima(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); anterior(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(N - 1);
    else if (e.key === 'm' || e.key === 'M') menu(true);
    else if (e.key === 'Escape') menu(false);
  });
  var tx = null, ty = null;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { dx < 0 ? proxima() : anterior(); }
    tx = null;
  });

  /* ---------------------------------------------------------- índice */
  $('menuList').innerHTML = slides.map(function (s, k) {
    return '<button data-k="' + k + '"><span>' + pad(k + 1) + '</span>' + s.getAttribute('data-title') + '</button>';
  }).join('');
  $('menuList').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) { menu(false); go(+b.getAttribute('data-k')); }
  });
  function menu(abre) { $('menu').classList.toggle('open', abre); }
  $('btnMenu').onclick = function () { menu(true); };
  $('menuClose').onclick = function () { menu(false); };

  /* ---------------------------------------------------------- cursor */
  var cursor = $('cursor'), ctxt = $('ctxt'), mx = -100, my = -100, cx = -100, cy = -100;
  if (matchMedia('(pointer:fine)').matches) {
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      var alvo = e.target.closest ? e.target : null;
      var rot = alvo && alvo.closest('[data-cursor]');
      var sobre = alvo && alvo.closest('button,a,[data-go]');
      cursor.classList.toggle('label', !!rot);
      cursor.classList.toggle('big', !rot && !!sobre);
      ctxt.textContent = rot ? rot.getAttribute('data-cursor') : '';
    });
    (function laço() {
      cx += (mx - cx) * .3; cy += (my - cy) * .3;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(laço);
    })();
  }

  /* ---------------------------------------------------------- início */
  var inicial = slides.findIndex(function (s) { return s.id === (location.hash || '').slice(1); });
  if (inicial > 0) { slides[0].classList.remove('act'); slides[inicial].classList.add('act'); cur = inicial; }
  pintar();
})();
