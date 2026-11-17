import { giftCardCatalog, buildGiftCheckout } from './nepc-gift-card-model.js?v=20261117-1';

const root=document.querySelector('[data-gift-card]');
if(root){
  const controls=root.querySelector('[data-gift-controls]');
  const amount=root.querySelector('[data-gift-amount]');
  const quantity=root.querySelector('[data-gift-quantity]');
  const checkout=root.querySelector('[data-gift-checkout]');
  const total=root.querySelector('[data-gift-total]');
  const face=root.querySelector('[data-gift-face-value]');
  const recipient=root.querySelector('[data-gift-recipient-link]');
  const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:giftCardCatalog.currency,maximumFractionDigits:0}).format(value/100);
  function update(){
    quantity.setCustomValidity('');
    try{
      const selection=buildGiftCheckout(amount.value,Number(quantity.value));
      face.textContent=money(selection.unitAmount);
      total.textContent=`${money(selection.totalAmount)} ${selection.currency}`;
      checkout.href=selection.url;
      checkout.removeAttribute('aria-disabled');
      checkout.setAttribute('aria-label',`Continue to checkout: ${quantity.value} gift ${Number(quantity.value)===1?'card':'cards'}, ${money(selection.totalAmount)} ${selection.currency}`);
      const recipientUrl=new URL(giftCardCatalog.productUrl);
      recipientUrl.searchParams.set('variant',amount.value);
      recipient.href=recipientUrl.href;
      return true;
    }catch{
      quantity.setCustomValidity('Enter a whole-number quantity of at least 1.');
      total.textContent='Enter a valid quantity';
      checkout.setAttribute('aria-disabled','true');
      checkout.removeAttribute('href');
      return false;
    }
  }
  amount.addEventListener('change',update);
  quantity.addEventListener('input',update);
  checkout.addEventListener('click',event=>{
    if(!update()||!quantity.checkValidity()){event.preventDefault();quantity.reportValidity();}
  });
  if(update()){
    controls.hidden=false;
    root.querySelector('[data-gift-fallback]').hidden=true;
  }
}
