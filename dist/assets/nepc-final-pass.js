// Progressive enhancement only: destination links, galleries and club choices work without JS.
document.querySelectorAll('.fv-coaches').forEach(grid=>{
  const section=grid.closest('.fv-section');
  const cards=[...grid.querySelectorAll('[data-coach-clubs]')];
  const buttons=[...section.querySelectorAll('[data-coach-filter]')];
  section.querySelector('[data-coach-controls]').hidden=false;
  function select(club){
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.coachFilter===club)));
    cards.forEach(card=>{card.hidden=club!=='all'&&!card.dataset.coachClubs.split(' ').includes(club);});
    section.querySelector('[data-coach-status]').textContent=`${cards.filter(card=>!card.hidden).length} coaches · ${club==='all'?'All clubs':club==='rye'?'Rye':'Middleton'}`;
  }
  buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.coachFilter)));
  const club=new URLSearchParams(location.search).get('club');select(['rye','middleton'].includes(club)?club:'all');
});
document.querySelectorAll('[data-coaching-tips]').forEach(root=>{
  const tabs=[...root.querySelectorAll('[role="tab"]')];
  const panels=[...root.querySelectorAll('[role="tabpanel"]')];
  function select(index){
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    panels.forEach((panel,i)=>{
      if(i!==index&&!panel.hidden){const frame=panel.querySelector('iframe');frame.src=frame.getAttribute('src');}
      panel.hidden=i!==index;
    });
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(index));
    tab.addEventListener('keydown',event=>{
      let next=index;
      if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%tabs.length;
      else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else return;
      event.preventDefault();select(next);tabs[next].focus();
    });
  });
});
document.querySelectorAll('[data-photo-carousel]').forEach(root=>{
  const track=root.querySelector('[data-photo-track]');
  const previous=root.querySelector('[data-photo-previous]');
  const next=root.querySelector('[data-photo-next]');
  const status=root.querySelector('[data-photo-status]');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function update(){previous.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-3;const index=Math.round(track.scrollLeft/(track.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap)));status.textContent=`Photo ${index+1} of ${track.children.length}`;}
  function move(direction){track.scrollBy({left:direction*(track.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap)),behavior:reduced.matches?'instant':'smooth'});}
  previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  track.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
  track.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
});
// Accept resize messages only from the existing CourtReserve frame and origin.
const frames=[...document.querySelectorAll('.nepc-services iframe[src*="courtreserve.com"]')];
if(frames.length)window.addEventListener('message',event=>{
  if(!['https://widgets.courtreserve.com','https://app.courtreserve.com'].includes(event.origin))return;
  const frame=frames.find(node=>node.contentWindow===event.source);
  const height=Number(event.data?.height);
  if(frame&&event.data?.action==='setHeight'&&Number.isFinite(height)&&height>=200&&height<=20000)frame.style.height=`${Math.ceil(height)}px`;
});
