import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { giftCardCatalog, buildGiftCheckout } from '../dist/assets/nepc-gift-card-model.js';

assert.equal(giftCardCatalog.variants.length,24,'All existing denominations must be retained');
assert.equal(new Set(giftCardCatalog.variants.map(v=>v.id)).size,24);
assert.equal(giftCardCatalog.currency,'USD');
const page=readFileSync(new URL('../dist/gift-cards/index.html',import.meta.url),'utf8');
for(const variant of giftCardCatalog.variants){
  assert(Number.isSafeInteger(variant.amount)&&variant.amount>0);
  assert.equal(variant.label,`$${variant.amount/100}`);
  assert(page.includes(`value="${variant.id}"`),`Missing verified variant ${variant.label}`);
  const selection=buildGiftCheckout(variant.id,2);
  const url=new URL(selection.url);
  assert.equal(url.origin,'https://shop.newenglandpickleball.com');
  assert.equal(url.pathname,`/buy/${variant.id}:2`);
  assert.equal(url.search,'','Checkout links must not contain personal data');
  assert.equal(selection.totalAmount,variant.amount*2);
}
assert.equal(buildGiftCheckout('46892496978170',1).totalAmount,2500,'The $25 option must charge $25');
assert.equal(buildGiftCheckout('44694513582330',2).totalAmount,20000,'Two $100 cards must total $200');
for(const quantity of [0,-1,1.5,NaN,Infinity,'2',Number.MAX_SAFE_INTEGER])assert.throws(()=>buildGiftCheckout('46892496978170',quantity));
assert.throws(()=>buildGiftCheckout('unknown',1));
assert.throws(()=>buildGiftCheckout('https://example.com',1));
assert(page.includes('data-gift-controls hidden'),'Interactive controls must stay hidden if enhancement fails');
assert(page.includes(giftCardCatalog.productUrl.replaceAll('&','&amp;')),'Original gift/recipient purchase flow must remain available');
console.log('PASS: 24 verified gift denominations, price/variant binding, quantity validation, checkout host and original purchase fallback.');
