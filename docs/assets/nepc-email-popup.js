/* NEPC email signup pop-up: adds people to the main Mailchimp list (New England Pickleball Club). */
(function () {
  'use strict';

  var ACTION = 'https://newenglandpickleball.us21.list-manage.com/subscribe/post?u=adb018edc16a2bde62eae0bcc&id=f7591a4b47';
  // Mailchimp's old /post-json address now returns 404; /subscribe/post answers JSONP when a c= callback is given (checked Nov 21, 2026).
  var JSONP = ACTION;
  var BOT_FIELD = 'b_adb018edc16a2bde62eae0bcc_f7591a4b47';
  var LOGO = 'https://mcusercontent.com/adb018edc16a2bde62eae0bcc/images/01dc4a7a-4a03-b386-674f-b0f526f63a9c.png';
  var KEY_SUBSCRIBED = 'nepcEmailSubscribed';
  var KEY_LAST_SHOWN = 'nepcPopupLastShown';
  var THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  var EXCLUDED = [/^\/join\/?$/, /^\/founder-story(\/|$)/, /^\/book-a-court(\/|$)/, /^\/choose-club(\/|$)/, /^\/gift-cards(\/|$)/, /checkout/i];

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { return null; }
    return null;
  }

  function isMailchimpForm(form) {
    var action = form && form.getAttribute && form.getAttribute('action');
    return !!action && action.indexOf('list-manage.com') !== -1 && action.indexOf('f7591a4b47') !== -1;
  }

  // Anyone who signs up through the existing footer form is never shown the pop-up.
  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (form && form.id !== 'nepc-popup-form' && isMailchimpForm(form)) store(KEY_SUBSCRIBED, '1');
  }, true);

  var path = window.location.pathname;
  var forced = /[?&]nepc_popup=1\b/.test(window.location.search);
  if (!forced) {
    for (var i = 0; i < EXCLUDED.length; i++) if (EXCLUDED[i].test(path)) return;
    if (store(KEY_SUBSCRIBED) === '1') return;
    var last = Number(store(KEY_LAST_SHOWN) || 0);
    if (last && Date.now() - last < THIRTY_DAYS) return;
  }

  var css = '' +
    '.nepc-pop-backdrop{position:fixed;inset:0;z-index:2147483000;background:rgba(12,40,70,.45);opacity:0;transition:opacity .25s}' +
    '.nepc-pop-backdrop.is-open{opacity:1}' +
    '.nepc-pop{position:fixed;z-index:2147483001;left:50%;top:50%;width:min(440px,calc(100vw - 32px));transform:translate(-50%,-46%);opacity:0;transition:opacity .25s,transform .25s;' +
    'background:#fff;color:#0C4D85;border-radius:20px;border-top:6px solid #D32D79;box-shadow:0 24px 60px rgba(12,40,70,.35);padding:30px 28px 24px;text-align:center;font-family:inherit;box-sizing:border-box}' +
    '.nepc-pop.is-open{opacity:1;transform:translate(-50%,-50%)}' +
    '.nepc-pop *{box-sizing:border-box}' +
    '.nepc-pop-logo{display:block;width:92px;height:auto;margin:0 auto 14px}' +
    '.nepc-pop h2{margin:0 0 10px;font-size:26px;line-height:1.2;font-weight:800;color:#0C4D85;letter-spacing:-.01em}' +
    '.nepc-pop p{margin:0 0 18px;font-size:17px;line-height:1.5;color:#24496f}' +
    '.nepc-pop label{display:block;text-align:left;font-size:14px;font-weight:700;margin:0 0 6px;color:#0C4D85}' +
    '.nepc-pop input[type=email]{width:100%;min-height:52px;padding:12px 14px;font-size:18px;border:2px solid #c9d6e3;border-radius:12px;color:#0C4D85;background:#fff}' +
    '.nepc-pop input[type=email]:focus{outline:none;border-color:#D32D79;box-shadow:0 0 0 3px rgba(211,45,121,.2)}' +
    '.nepc-pop-btn{display:block;width:100%;min-height:54px;margin-top:12px;border:0;border-radius:12px;background:#D32D79;color:#fff;font-size:18px;font-weight:800;cursor:pointer}' +
    '.nepc-pop-btn:hover{background:#b8246a}' +
    '.nepc-pop-btn:focus-visible,.nepc-pop-close:focus-visible{outline:3px solid #0C4D85;outline-offset:2px}' +
    '.nepc-pop-btn[disabled]{opacity:.7;cursor:wait}' +
    '.nepc-pop-fine{margin:12px 0 0!important;font-size:13px!important;color:#5a7491!important}' +
    '.nepc-pop-msg{margin:12px 0 0;font-size:15px;line-height:1.45;color:#b0124f;min-height:0}' +
    '.nepc-pop-msg:empty{display:none}' +
    '.nepc-pop-done{font-size:21px!important;font-weight:800;color:#0C4D85!important;margin:8px 0 4px!important}' +
    '.nepc-pop-close{position:absolute;top:10px;right:10px;width:40px;height:40px;border:0;border-radius:50%;background:transparent;color:#0C4D85;font-size:26px;line-height:1;cursor:pointer}' +
    '.nepc-pop-close:hover{background:#eef3f8}' +
    '.nepc-pop-hp{position:absolute;left:-5000px;width:1px;height:1px;overflow:hidden}' +
    '.nepc-pop.is-sheet{left:0;right:0;top:auto;bottom:0;width:100%;border-radius:20px 20px 0 0;padding:22px 20px calc(18px + env(safe-area-inset-bottom));transform:translateY(100%);max-height:80vh;overflow:auto}' +
    '.nepc-pop.is-sheet.is-open{transform:translateY(0)}' +
    '.nepc-pop.is-sheet .nepc-pop-logo{width:52px;margin-bottom:6px}' +
    '.nepc-pop.is-sheet label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '.nepc-pop.is-sheet input[type=email]{min-height:50px}' +
    '.nepc-pop.is-sheet .nepc-pop-btn{min-height:50px;margin-top:10px}' +
    '.nepc-pop.is-sheet h2{font-size:22px;padding:0 30px}' +
    '.nepc-pop.is-sheet p{font-size:15px;margin-bottom:12px}' +
    '.nepc-pop.is-sheet .nepc-pop-fine{margin-top:8px!important;font-size:12px!important}' +
    '@media (prefers-reduced-motion:reduce){.nepc-pop,.nepc-pop-backdrop{transition:none}}';

  var isMobile = window.matchMedia ? window.matchMedia('(max-width: 767px), (pointer: coarse)').matches : window.innerWidth < 768;
  var shown = false;
  var root, backdrop, lastFocus, closeTimer;

  function build() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    if (!isMobile) {
      backdrop = document.createElement('div');
      backdrop.className = 'nepc-pop-backdrop';
      backdrop.addEventListener('click', close);
      document.body.appendChild(backdrop);
    }

    root = document.createElement('div');
    root.className = 'nepc-pop' + (isMobile ? ' is-sheet' : '');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', isMobile ? 'false' : 'true');
    root.setAttribute('aria-labelledby', 'nepc-pop-title');
    root.setAttribute('aria-describedby', 'nepc-pop-desc');
    root.innerHTML =
      '<button type="button" class="nepc-pop-close" aria-label="Close">&times;</button>' +
      '<img class="nepc-pop-logo" src="' + LOGO + '" alt="New England Pickleball Club" width="92" onerror="this.style.display=\'none\'">' +
      '<div class="nepc-pop-body">' +
        '<h2 id="nepc-pop-title">Get the Pink Friday announcement.</h2>' +
        '<p id="nepc-pop-desc">Our first-ever monthly open play membership is announced Wednesday, November 25. Be the first to know.</p>' +
        '<form id="nepc-pop-form" method="post" action="' + ACTION + '" target="_blank" novalidate>' +
          '<label for="nepc-pop-email">Email address</label>' +
          '<input id="nepc-pop-email" type="email" name="EMAIL" placeholder="Your email" autocomplete="email" required>' +
          '<div class="nepc-pop-hp" aria-hidden="true"><input type="text" name="' + BOT_FIELD + '" tabindex="-1" autocomplete="off" value=""></div>' +
          '<button type="submit" class="nepc-pop-btn">Count me in</button>' +
          '<div class="nepc-pop-msg" role="status" aria-live="polite"></div>' +
          '<p class="nepc-pop-fine">One or two emails a week at most. Unsubscribe anytime.</p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(root);

    root.querySelector('.nepc-pop-close').addEventListener('click', close);
    root.querySelector('form').addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onKey);
    if (isMobile) document.addEventListener('pointerdown', onOutside, true);
  }

  function focusables() {
    return Array.prototype.filter.call(root.querySelectorAll('button, input:not([tabindex="-1"]), a[href]'), function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
  }

  function onKey(e) {
    if (!root || !root.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab' && !isMobile) {
      var items = focusables();
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function onOutside(e) {
    if (root && root.classList.contains('is-open') && !root.contains(e.target)) close();
  }

  function show() {
    if (shown) return;
    shown = true;
    cleanupTriggers();
    if (!forced) store(KEY_LAST_SHOWN, String(Date.now()));
    lastFocus = document.activeElement;
    build();
    requestAnimationFrame(function () {
      if (backdrop) backdrop.classList.add('is-open');
      root.classList.add('is-open');
      var input = root.querySelector('input[type=email]');
      try { input.focus({ preventScroll: true }); } catch (err) { input.focus(); }
    });
  }

  function close() {
    if (!root) return;
    clearTimeout(closeTimer);
    root.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('pointerdown', onOutside, true);
    var r = root, b = backdrop;
    root = null; backdrop = null;
    setTimeout(function () { r.remove(); if (b) b.remove(); }, 260);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (err) { lastFocus.focus(); } }
  }

  function setMsg(text) {
    var m = root && root.querySelector('.nepc-pop-msg');
    if (m) m.textContent = text;
  }

  function success() {
    store(KEY_SUBSCRIBED, '1');
    var body = root && root.querySelector('.nepc-pop-body');
    if (!body) return;
    body.innerHTML = '<p class="nepc-pop-done" role="status" tabindex="-1">You’re on the list. See you on the court.</p>';
    body.firstChild.focus();
    closeTimer = setTimeout(close, 4000);
  }

  function cleanMailchimpMessage(msg) {
    var div = document.createElement('div');
    div.innerHTML = String(msg || '');
    return (div.textContent || '').replace(/^\s*\d+\s*-\s*/, '').trim() || 'Something went wrong. Please try again.';
  }

  function onSubmit(e) {
    var form = e.target;
    var input = form.querySelector('input[type=email]');
    var email = (input.value || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.preventDefault();
      setMsg('Please check your email address.');
      input.focus();
      return;
    }
    if (form.dataset.fallback === '1') return; // normal POST in a new tab
    e.preventDefault();
    var button = form.querySelector('.nepc-pop-btn');
    button.disabled = true;
    setMsg('');

    var cb = 'nepcPopCb' + Date.now();
    var script = document.createElement('script');
    var done = false;
    function finish() { done = true; delete window[cb]; script.remove(); button.disabled = false; }
    function fallback() {
      if (done) return;
      finish();
      form.dataset.fallback = '1';
      store(KEY_SUBSCRIBED, '1');
      form.submit();
      setMsg('Finishing your signup in a new tab.');
    }
    window[cb] = function (data) {
      if (done) return;
      finish();
      if (data && data.result === 'success') { success(); return; }
      var msg = data && data.msg ? String(data.msg) : '';
      if (/already subscribed/i.test(msg)) {
        store(KEY_SUBSCRIBED, '1');
        setMsg('You’re already on the list. If our emails aren’t reaching you, check your Promotions or Spam folder.');
        return;
      }
      setMsg(cleanMailchimpMessage(msg));
    };
    var bot = form.querySelector('input[name="' + BOT_FIELD + '"]').value || '';
    script.src = JSONP + '&EMAIL=' + encodeURIComponent(email) + '&' + BOT_FIELD + '=' + encodeURIComponent(bot) + '&c=' + cb;
    script.onerror = fallback;
    setTimeout(fallback, 10000);
    document.body.appendChild(script);
  }

  // Triggers
  var timer;
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (max > 0 && window.scrollY / max >= 0.5) show();
  }
  function onMouseOut(e) {
    if (!e.relatedTarget && !e.toElement && e.clientY <= 0) show();
  }
  function cleanupTriggers() {
    clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('mouseout', onMouseOut);
  }

  function arm() {
    if (forced) { setTimeout(show, 600); return; }
    if (isMobile) {
      window.addEventListener('scroll', onScroll, { passive: true });
    } else {
      timer = setTimeout(show, 20000);
      document.addEventListener('mouseout', onMouseOut);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm);
  else arm();
})();
