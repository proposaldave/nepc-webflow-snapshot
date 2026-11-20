/* Dave's original storytelling, enhanced without an animation library. */
(function () {
  'use strict';
  var story = document.querySelector('.nepc-founder');
  if (!story) return;
  var media = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = media.matches;
  var main = story.querySelector('.story-letter-body');
  var rail = story.querySelector('.rail');
  var shot = story.querySelector('#shot');
  var rallyBall = story.querySelector('#ballr');
  var marks = Array.from(story.querySelectorAll('.mark[data-p]'));
  var visibleMarks = new Set();
  var scenes = [];
  var frameId = 0;
  var lastTime = null;
  var lastShot = -1;
  var N = 34;
  var NS = 'http://www.w3.org/2000/svg';

  function clamp(n) { return Math.max(0, Math.min(1, n)); }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function randomSpot(i) { var n = Math.sin(i * 127.1 + 11.7) * 43758.5453; return n - Math.floor(n); }
  var spots = Array.from({ length: N + 1 }, function (_, i) {
    var distance = randomSpot(i) > .38 ? 6 + randomSpot(i + 50) * 8 : 30 + randomSpot(i + 90) * 10;
    return { t: i % 2 ? 50 + distance : 50 - distance, x: 22 + randomSpot(i + 7) * 56 };
  });
  spots[0] = { t: 6, x: 64 };

  function requestTick() {
    if (frameId || document.hidden) return;
    lastTime = null;
    frameId = requestAnimationFrame(tick);
  }
  function measure() { requestTick(); }
  function updateTarget() { requestTick(); }
  function renderRally(p) {
    var count = p >= 1 ? N : Math.floor(p * N);
    if (count !== lastShot) {
      shot.textContent = String(count);
      rail.setAttribute('aria-valuenow', String(count));
      rail.setAttribute('aria-valuetext', 'Shot ' + count + ' of 34');
      lastShot = count;
    }
    if (reduced || !rallyBall) return;
    var index = Math.min(N - 1, Math.floor(p * N));
    var t = ease(p >= 1 ? 1 : p * N - index);
    var a = spots[index], b = spots[index + 1];
    rallyBall.style.setProperty('--bt', a.t + (b.t - a.t) * t);
    rallyBall.style.setProperty('--bx', a.x + (b.x - a.x) * t);
    rallyBall.style.setProperty('--bs', 1 + .16 * Math.sin(Math.PI * t));
  }
  function updateButton(scene) {
    scene.button.hidden = false;
    var label = scene.playing ? 'Pause' : scene.completed && scene.started ? 'Replay' : scene.started ? 'Continue' : 'Play';
    scene.button.textContent = label;
    scene.button.setAttribute('aria-label', label + ' ' + scene.name);
  }
  function startScene(scene) {
    if (scene.completed) scene.elapsed = 0;
    scene.completed = false;
    scene.started = true;
    scene.playing = true;
    updateButton(scene);
    requestTick();
  }
  function registerScene(element, name, duration, render) {
    var button = element.querySelector('[data-story-play]');
    var scene = { element: element, name: name, duration: duration, render: render, button: button,
      elapsed: 0, playing: false, visible: false, started: false, completed: false };
    scenes.push(scene);
    button.addEventListener('click', function () {
      if (scene.playing) {
        scene.playing = false;
        updateButton(scene);
      } else startScene(scene);
    });
    render(reduced ? 1 : 0, reduced);
    updateButton(scene);
    return scene;
  }

  story.querySelectorAll('[data-story-skill]').forEach(function (card) {
    var element = card.querySelector('[data-story-scene]');
    var path = card.querySelector('.trail');
    var incoming = card.querySelector('.incoming');
    var ball = card.querySelector('.b');
    var phase = card.querySelector('[data-shot-phase]');
    if (!element || !path || !incoming || !ball) return;
    var length = path.getTotalLength();
    var contact = incoming.getTotalLength() / length;
    var block = card.dataset.storySkill === 'block';
    path.style.strokeDasharray = String(length);
    var previousPhase = '';
    registerScene(element, 'the ' + (block ? 'Baby Block' : 'Boring Drop') + ' demonstration', 3400, function (p, still) {
      // Fast incoming ball, a brief contact, then the slower, soft return.
      var q = p < .22 ? contact * (p / .22) : p < .3 ? contact : contact + (1 - contact) * ease((p - .3) / .7);
      if (still) q = 1;
      var point = path.getPointAtLength(length * clamp(q));
      path.style.strokeDashoffset = String(length * (1 - clamp(q)));
      ball.setAttribute('cx', point.x.toFixed(2));
      ball.setAttribute('cy', point.y.toFixed(2));
      var text = p < .22 ? (block ? 'Hard ball in' : 'Low ball in') : p < .3 ? 'Paddle contact' : p < 1 ? (block ? 'Soft block' : 'Soft drop') : 'Soft landing';
      if (still) text = block ? 'Hard ball → soft block' : 'Low ball → soft drop';
      if (phase && text !== previousPhase) { phase.textContent = text; previousPhase = text; }
    });
  });

  function add(svg, tag, attrs) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    svg.appendChild(node);
    return node;
  }
  var community = story.querySelector('[data-story-scene="community"]');
  if (community) {
    var hub = community.querySelector('#hub'), web = community.querySelector('#web');
    var center = [96, 70];
    var points = [[38,30],[112,16],[178,44],[164,118],[84,134],[22,96]];
    var all = points.concat([center]);
    points.forEach(function (p) { add(hub, 'line', { x1:96, y1:70, x2:p[0], y2:p[1], pathLength:1 }); });
    points.forEach(function (p) { add(hub, 'circle', { cx:p[0], cy:p[1], r:6 }); });
    add(hub, 'circle', { cx:96, cy:70, r:9, 'class':'staff' });
    for (var i = 0; i < all.length; i++) {
      for (var j = i + 1; j < all.length; j++) add(web, 'line', { x1:all[i][0], y1:all[i][1], x2:all[j][0], y2:all[j][1], pathLength:1 });
    }
    all.forEach(function (p) { add(web, 'circle', { cx:p[0], cy:p[1], r:6 }); });
    var hubValue = add(hub, 'circle', { r:4, 'class':'val' });
    var webValues = [0,1,2].map(function () { return add(web, 'circle', { r:4, 'class':'val' }); });
    function place(node, from, to, p) {
      var q = ease(p);
      node.setAttribute('cx', (from[0] + (to[0] - from[0]) * q).toFixed(2));
      node.setAttribute('cy', (from[1] + (to[1] - from[1]) * q).toFixed(2));
    }
    registerScene(community, 'the hospitality and community comparison', 8000, function (p, still) {
      var moving = !still && p < 1;
      hubValue.setAttribute('visibility', moving ? 'visible' : 'hidden');
      webValues.forEach(function (node) { node.setAttribute('visibility', moving ? 'visible' : 'hidden'); });
      // One staff/customer exchange versus simultaneous member-to-member exchanges.
      var leg = Math.min(11.9999, p * 12), index = Math.floor(leg), t = leg - index;
      var customer = points[Math.floor(index / 2) % points.length];
      place(hubValue, index % 2 ? customer : center, index % 2 ? center : customer, t);
      webValues.forEach(function (node, k) {
        var phase = p * 4 + k * .67, step = Math.floor(phase);
        var from = (step * 2 + k) % all.length, to = (from + 3 + k) % all.length;
        place(node, all[from], all[to], phase - step);
      });
      community.querySelector('.versus').style.setProperty('--p', still ? 1 : clamp(p * 2.5));
    });
  }

  var rally = story.querySelector('[data-story-scene="rally"]');
  if (rally) registerScene(rally, 'the 34-shot rally', 17000, function (p, still) { renderRally(still ? 1 : p); });

  function tick(now) {
    frameId = 0;
    var dt = lastTime === null ? 0 : Math.max(0, now - lastTime);
    lastTime = now;
    var moving = false;
    visibleMarks.forEach(function (mark) {
      var top = mark.getBoundingClientRect().top;
      var value = reduced ? 1 : clamp((window.innerHeight * .8 - top) / (window.innerHeight * .28));
      mark.style.setProperty('--p', value.toFixed(3));
    });
    scenes.forEach(function (scene) {
      if (!scene.visible || !scene.playing) return;
      scene.elapsed = Math.min(scene.duration, scene.elapsed + dt);
      scene.render(scene.elapsed / scene.duration, false);
      if (scene.elapsed >= scene.duration) {
        scene.completed = true; scene.playing = false; updateButton(scene);
      } else moving = true;
    });
    if (moving && !document.hidden) frameId = requestAnimationFrame(tick);
    else lastTime = null;
  }
  if ('IntersectionObserver' in window) {
    var markObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visibleMarks.add(entry.target);
        else visibleMarks.delete(entry.target);
      });
      requestTick();
    }, { rootMargin:'0px 0px 12% 0px' });
    marks.forEach(function (mark) { markObserver.observe(mark); });
    var sceneObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var scene = scenes.find(function (item) { return item.element === entry.target; });
        scene.visible = entry.isIntersecting;
      });
      requestTick();
    }, { threshold:.25 });
    scenes.forEach(function (scene) { sceneObserver.observe(scene.element); });
  } else {
    marks.forEach(function (mark) { mark.style.setProperty('--p', 1); });
    scenes.forEach(function (scene) { scene.visible = true; scene.completed = true; scene.render(1, true); updateButton(scene); });
  }
  function applyMotionPreference() {
    reduced = media.matches;
    story.classList.toggle('is-reduced-motion', reduced);
    if (reduced) {
      marks.forEach(function (mark) { mark.style.setProperty('--p', 1); });
      scenes.forEach(function (scene) {
        scene.playing = false; scene.completed = true; scene.started = false;
        scene.elapsed = scene.duration; scene.render(1, true); updateButton(scene);
      });
    } else scenes.forEach(updateButton);
    requestTick();
  }
  media.addEventListener('change', applyMotionPreference);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(frameId); frameId = 0; lastTime = null;
    } else { measure(); }
  });
  window.addEventListener('scroll', updateTarget, { passive:true });
  window.addEventListener('resize', measure, { passive:true });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(main);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  applyMotionPreference();
  measure();
})();

/* Keep the original navigation links; share the homepage's accessible disclosure styling. */
(function () {
  var button = document.querySelector('.navbar14_menu-button');
  var menu = document.querySelector('.navbar14_menu');
  if (!button || !menu) return;
  if (!menu.id) menu.id = 'nepc-story-navigation';
  button.setAttribute('role', 'button');
  button.setAttribute('tabindex', '0');
  button.setAttribute('aria-controls', menu.id);
  function setOpen(open) {
    menu.classList.toggle('nepc-home-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  button.addEventListener('click', function () { setOpen(button.getAttribute('aria-expanded') !== 'true'); });
  button.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); button.click(); }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { setOpen(false); button.focus(); }
  });
  menu.addEventListener('click', function (event) { if (event.target.closest('a')) setOpen(false); });
  window.matchMedia('(min-width:1200px)').addEventListener('change', function () { setOpen(false); });
  setOpen(false);
})();
