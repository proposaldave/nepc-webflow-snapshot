
(function(){
  var N = 34, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var shotEl = document.getElementById('shot'), ball = document.getElementById('ballr');
  var root = document.documentElement;

  // deterministic landing spots: some deep, many in the kitchen (blocks and drops)
  function rnd(i){ var x = Math.sin(i*127.1+11.7)*43758.5453; return x - Math.floor(x); }
  function spot(i){
    var far = i % 2 === 1;                    // which side of the net the ball lands on
    var kitchen = rnd(i) > 0.38;              // most shots land soft
    var d = kitchen ? 6 + rnd(i+50)*8 : 30 + rnd(i+90)*10;   // distance from the net, in % of court length
    return { t: far ? 50 + d : 50 - d, x: 22 + rnd(i+7)*56 };
  }
  var spots = []; for (var i=0;i<=N+1;i++) spots.push(spot(i));
  spots[0] = { t: 6, x: 64 };

  // skills: ball along path
  var skills = [].map.call(document.querySelectorAll('.skill'), function(el){
    var tr = el.querySelector('.trail'), len = tr.getTotalLength();
    tr.style.strokeDasharray = len;
    return { el: el, tr: tr, len: len, b: el.querySelector('.b') };
  });

  // together diagrams
  var NS = 'http://www.w3.org/2000/svg';
  function add(svg, tag, a){ var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; }
  (function(){
    var hub = document.getElementById('hub'), web = document.getElementById('web'), pts = [], i, j;
    pts = [[38,30],[112,16],[178,44],[164,118],[84,134],[22,96]];
    pts.forEach(function(p){ add(hub,'line',{x1:96,y1:70,x2:p[0],y2:p[1],pathLength:1}); });
    pts.forEach(function(p){ add(hub,'circle',{cx:p[0],cy:p[1],r:6}); });
    add(hub,'circle',{cx:96,cy:70,r:9,'class':'staff'});
    var all = pts.concat([[96,70]]);
    for (i=0;i<all.length;i++) for (j=i+1;j<all.length;j++) add(web,'line',{x1:all[i][0],y1:all[i][1],x2:all[j][0],y2:all[j][1],pathLength:1});
    all.forEach(function(p){ add(web,'circle',{cx:p[0],cy:p[1],r:6}); });
  })();

  var marks = document.querySelectorAll('[data-p]');
  function clamp(v){ return v<0?0:v>1?1:v; }
  function ease(t){ return t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2; }

  function frame(){
    var vh = innerHeight, max = Math.max(1, root.scrollHeight - vh);
    var p = clamp(scrollY / max), f = p*N, i = Math.min(N-1, Math.floor(f)), t = f - i;
    if (p >= 1){ i = N-1; t = 1; }
    var a = spots[i], b = spots[i+1], e = reduce ? (t>0?1:0) : ease(t);
    ball.style.setProperty('--bt', a.t + (b.t-a.t)*e);
    ball.style.setProperty('--bx', a.x + (b.x-a.x)*e);
    ball.style.setProperty('--bs', 1 + 0.7*Math.sin(Math.PI*e));
    shotEl.textContent = Math.round(p >= 1 ? N : Math.floor(f));

    for (var k=0;k<marks.length;k++){
      var r = marks[k].getBoundingClientRect();
      var q = reduce ? 1 : clamp((vh*0.86 - r.top) / (vh*0.5));
      marks[k].style.setProperty('--p', q);
    }
    var prevRaw = null;   // each skill waits for the one before it to finish
    skills.forEach(function(s){
      var r = s.el.getBoundingClientRect();
      var raw = (vh*0.8 - r.top) / (vh*0.62);
      var q = reduce ? 1 : clamp(prevRaw === null ? raw : Math.min(raw, (prevRaw - 1) * 1.24));
      prevRaw = raw;
      var pt = s.tr.getPointAtLength(s.len*q);
      s.tr.style.strokeDashoffset = s.len*(1-q);
      s.b.setAttribute('cx', pt.x); s.b.setAttribute('cy', pt.y);
    });
    ticking = false;
  }
  var ticking = false;
  function req(){ if(!ticking){ ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', req, {passive:true});
  addEventListener('resize', req);
  frame();
})();

// The exported Webflow bundle is unnecessary on this static letter.
// Keep the existing navigation, with an accessible mobile disclosure.
(function(){
 var button=document.querySelector('.navbar14_menu-button'), menu=document.querySelector('.navbar14_menu');
 function setOpen(open){menu.classList.toggle('is-story-open',open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close navigation':'Open navigation');}
 button.addEventListener('click',function(){setOpen(button.getAttribute('aria-expanded')!=='true');});
 button.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();button.click();}});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){setOpen(false);button.focus();}});
 menu.addEventListener('click',function(e){if(e.target.closest('a'))setOpen(false);});
 matchMedia('(min-width:992px)').addEventListener('change',function(){setOpen(false);});
})();
