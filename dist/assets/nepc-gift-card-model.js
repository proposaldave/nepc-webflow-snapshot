// Public gift-card variants verified against the NEPC Shopify catalog. No API keys are needed.
export const giftCardCatalog = {
  "source": "https://shop.newenglandpickleball.com/products/nepc-gift-card",
  "verifiedDate": "2026-11-17",
  "currency": "USD",
  "productId": "gid://shopify/Product/8053256782074",
  "productUrl": "https://shop.newenglandpickleball.com/products/nepc-gift-card?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web",
  "checkoutEndpoint": "https://shop.newenglandpickleball.com/buy",
  "variants": [
    {
      "id": "46887012729082",
      "label": "$20",
      "amount": 2000,
      "available": true
    },
    {
      "id": "44694513352954",
      "label": "$24",
      "amount": 2400,
      "available": true
    },
    {
      "id": "46892496978170",
      "label": "$25",
      "amount": 2500,
      "available": true
    },
    {
      "id": "46887014269178",
      "label": "$28",
      "amount": 2800,
      "available": true
    },
    {
      "id": "46887015317754",
      "label": "$40",
      "amount": 4000,
      "available": true
    },
    {
      "id": "44694513385722",
      "label": "$48",
      "amount": 4800,
      "available": true
    },
    {
      "id": "44879741387002",
      "label": "$50",
      "amount": 5000,
      "available": true
    },
    {
      "id": "44694513418490",
      "label": "$65",
      "amount": 6500,
      "available": true
    },
    {
      "id": "46892497699066",
      "label": "$75",
      "amount": 7500,
      "available": true
    },
    {
      "id": "44694513549562",
      "label": "$80",
      "amount": 8000,
      "available": true
    },
    {
      "id": "44916725219578",
      "label": "$90",
      "amount": 9000,
      "available": true
    },
    {
      "id": "44694513582330",
      "label": "$100",
      "amount": 10000,
      "available": true
    },
    {
      "id": "44879741419770",
      "label": "$120",
      "amount": 12000,
      "available": true
    },
    {
      "id": "44694513615098",
      "label": "$125",
      "amount": 12500,
      "available": true
    },
    {
      "id": "46457751011578",
      "label": "$135",
      "amount": 13500,
      "available": true
    },
    {
      "id": "44694513647866",
      "label": "$150",
      "amount": 15000,
      "available": true
    },
    {
      "id": "45725582754042",
      "label": "$180",
      "amount": 18000,
      "available": true
    },
    {
      "id": "44694513680634",
      "label": "$200",
      "amount": 20000,
      "available": true
    },
    {
      "id": "44694513713402",
      "label": "$250",
      "amount": 25000,
      "available": true
    },
    {
      "id": "44694513746170",
      "label": "$275",
      "amount": 27500,
      "available": true
    },
    {
      "id": "44694513778938",
      "label": "$300",
      "amount": 30000,
      "available": true
    },
    {
      "id": "44843672764666",
      "label": "$350",
      "amount": 35000,
      "available": true
    },
    {
      "id": "44843672797434",
      "label": "$400",
      "amount": 40000,
      "available": true
    },
    {
      "id": "44843676729594",
      "label": "$500",
      "amount": 50000,
      "available": true
    }
  ]
};
export function buildGiftCheckout(variantId,quantity){
  const variant=giftCardCatalog.variants.find(item=>item.id===variantId&&item.available);
  if(!variant)throw new RangeError('Choose an available gift-card amount.');
  const totalAmount=variant.amount*quantity;
  if(typeof quantity!=='number'||!Number.isSafeInteger(quantity)||quantity<1||!Number.isSafeInteger(totalAmount))throw new RangeError('Enter a valid quantity.');
  return {url:`${giftCardCatalog.checkoutEndpoint}/${variant.id}:${quantity}`,unitAmount:variant.amount,totalAmount,currency:giftCardCatalog.currency};
}
