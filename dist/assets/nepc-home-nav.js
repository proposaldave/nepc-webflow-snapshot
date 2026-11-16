(function(){
var button=document.querySelector('.navbar14_menu-button'),menu=document.querySelector('.navbar14_menu');
button.setAttribute('role','button');button.setAttribute('tabindex','0');menu.id='nepc-home-menu';button.setAttribute('aria-controls',menu.id);
function setOpen(open){menu.classList.toggle('nepc-home-open',open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close navigation':'Open navigation');}
setOpen(false);button.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();setOpen(button.getAttribute('aria-expanded')!=='true');},true);
button.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();button.click();}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){setOpen(false);}});menu.addEventListener('click',function(e){if(e.target.closest('a'))setOpen(false);});matchMedia('(min-width:992px)').addEventListener('change',function(){setOpen(false);});
})();