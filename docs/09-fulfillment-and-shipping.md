# 09-fulfillment-and-shipping.md

## Provider: Royal Mail Click & Drop API
Base URL: https://api.parcel.royalmail.com/api/v1
Auth: API key in Authorization header. Free to use — you only pay postage.
Default service: Tracked 24. Alternative: Tracked 48.

## API-First (not CSV)
1. ROOTS pushes packed orders to Click & Drop API (POST /Orders)
2. API returns tracking number + label PDF
3. Print label on 6x4 thermal printer
4. Affix to parcel. Royal Mail collects or drop at Post Office.
The label IS the postage. No stamps needed.

## Adapter Layer
All shipping in lib/shipping/click-drop.ts: pushOrderToClickDrop(), getLabelsForOrders(), getTrackingForOrder(). Swappable later.

## Collection Model
Start: Post Office drop-off or one-off collections. Scale: regular daily collection at 20+ parcels/week.

## Fulfillment Queue (/admin/fulfillment)
Columns: checkbox, order#, date, customer, items, dose, service, postcode, payment, fulfillment, tracking, actions.
Filters: ready_to_pack, packed, labels_created, shipped, Mounjaro, supplements.
Bulk: mark packed, push to Click & Drop, mark shipped. Server-side paginated.

## Workflow
1. Order enters queue (paid or approved+captured)
2. Pick + pack → mark packed
3. Push to Click & Drop → labels returned
4. Print + affix labels
5. Collection or drop-off
6. Tracking stored → mark shipped → customer emailed

## Rules
- Mounjaro: only after approval + capture
- Supplements: once paid
- Address edits allowed before label creation only
