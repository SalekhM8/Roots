# 04-user-journeys.md

## 1. Mounjaro Journey
1. Land on PDP → Start Consultation → 4-step form (doc 07)
2. Auth gate → sign up/in → restore state → submit
3. Select dose → checkout → payment authorized (full amount)
4. Prescriber reviews: approve (capture + fulfill) | reject (void) | request info (upload)
5. If auth expires (7 days): expired → re-checkout email
6. Packed → Click & Drop API → labels → shipped → delivered

## 2. Supplements Journey
Browse → add to cart → checkout → captured immediately → fulfillment → shipped

## 3. Mixed Orders (POM + supplements)
Same basket, single checkout, authorize full amount. Everything waits for POM approval. On approval: capture all, fulfill all together.

## 4. Prescriber Journey
Queue (sorted oldest first, auth expiry flagged) → review all clinical answers → approve/reject/request info → audit logged → emails sent

## 5. Fulfillment Journey
Ready to pack → pick → pack → push to Click & Drop → print labels → affix → collection/drop-off → mark shipped → tracking email

## 6. Auth Gate Rules
SessionStorage preserves consultation state across redirect. Restore after auth. Never lose data.

## 7. UX Rules
Customer always knows state. Every change in dashboard + email. No forced re-entry. Mounjaro = premium guided. Supplements = simple fast.
