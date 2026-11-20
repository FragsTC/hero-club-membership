# Hero Club membership agreement and billing: design

Date: 2026-11-20

## Intent

A Hero Club request from the signup page is only a lead. Nothing today binds
the customer to the year or collects money. The plans front-load expensive
work (a house wash early in the year), so a member could take that work and
stop paying. Window Hero needs a signed agreement and automatic billing so a
confirmed request becomes a committed, paying member.

This is separate from the signup page. The signup page stays a no-commitment
request. The agreement and billing happen afterwards, once Window Hero has
confirmed the price with the customer.

## Goals

- The customer opens one link, reads the agreement, signs, pays the deposit,
  and the 12 monthly charges then run without anyone doing anything.
- The agreement protects Window Hero when a member leaves after receiving
  more service than they have paid for.
- The office does not re-type what the customer already entered on the
  signup page.
- Renewal keeps members and follows North Carolina's automatic renewal rules.

## Non-goals

- No change to how the signup page looks or flows.
- No new payment company. Billing, saved cards, scheduling and signatures
  stay in ServiceMinder.
- Not a replacement for legal review. The agreement is a draft for a North
  Carolina lawyer to read before customers sign it.

## Anti-goals

- Card numbers must never pass through this project's page, its Netlify
  function, Netlify Forms or monday.com.
- A proposal must never reach a customer without a person at Window Hero
  looking at it first. Anything created automatically is a draft.
- A term in the agreement that the office cannot actually carry out (for
  example a renewal notice nobody sends) is worse than no term.

## Constraints

- Window Hero operates in North Carolina.
- Confirmed by the owner: ServiceMinder captures the signature on proposal
  acceptance, and its payment plan can run a deposit plus monthly charges
  for the year.
- From ServiceMinder's help pages (not checked in the account): a proposal
  can require a deposit before it can be accepted; a payment plan's deposit
  is a flat amount or a percentage; a proposal with installments always
  saves the card; a failed installment emails the customer a link to update
  the card and appears in the Failed Payments list; proposals can be created
  through the API at `/proposal/create` with a contact id, a service id and
  an org-scoped API key; finding or creating the contact needs a
  brand-scoped key.
- The builder has no access to the ServiceMinder account. Setup steps are
  written from the help pages and must be proven by the owner with a test
  proposal sent to themselves.
- N.C. Gen. Stat. 75-41: an automatic renewal clause must be disclosed
  clearly and conspicuously with how to cancel, and for a renewal longer
  than 60 days the customer must get written notice (email counts) at least
  15 and no more than 45 days before renewal. If this is not done the
  renewal clause is void. A 2025 bill (HB 188) would change the window; its
  status was not confirmed.

## Approaches

1. **Everything inside ServiceMinder (chosen).** The agreement is the terms
   on a ServiceMinder proposal with a Hero Club payment plan. One link for
   the customer, one system for the office. Trade-off: it looks like a
   ServiceMinder proposal, not a custom Hero Club page.
2. **A separate branded signing page, billing in ServiceMinder.** Looks
   better, but the customer does two steps, the signed copy lives outside
   ServiceMinder, and the office matches the two by hand. Kept as the
   fallback had ServiceMinder not handled signatures.
3. **A custom page with its own payment company.** Ruled out: billing would
   be split from scheduling.

The owner picked 1 after confirming ServiceMinder handles the signature and
the deposit plus monthly schedule.

## What the owner decided

- Separate from the signup page.
- Everything inside ServiceMinder.
- North Carolina.
- The year is the deposit plus 12 monthly charges.
- The proposed terms below were shown to the owner, who did not change them.

## Money

The deposit is charged at signing. Twelve monthly charges follow, the first
one month after signing. Prices come from `TIERS` in `public/index.html`,
which matches the door hanger.

| Plan | Home | Deposit | Monthly | Year total |
|---|---|---|---|---|
| Bronze | up to 2,500 sq ft | $70 | $54 | $718 |
| Bronze | 2,501 to 3,500 sq ft | $96 | $71 | $948 |
| Silver | up to 2,500 sq ft | $108 | $80 | $1,068 |
| Silver | 2,501 to 3,500 sq ft | $144 | $107 | $1,428 |
| Gold | up to 2,500 sq ft | $168 | $125 | $1,668 |
| Gold | 2,501 to 3,500 sq ft | $228 | $170 | $2,268 |

Homes over 3,500 sq ft get a custom price: the office enters the deposit and
monthly charge on the proposal.

Add-ons and any other extra service are not part of the monthly charge
(builder's call). They are invoiced on their own when performed, at the
member discount, and charged to the card on file. This keeps the payment
plans fixed. The cancellation settlement counts plan services only; extras
are already paid for separately.

Renewal years (builder's call): the twelfth charge of the first year falls on
the anniversary. The renewal year is 12 more monthly charges at the
then-current price with no deposit, the first one month after the
anniversary, so nothing is charged twice on the same day.

## The agreement's terms

- **Term:** 12 months from signing.
- **What's included:** the services of the chosen plan, exactly as listed on
  the signup page, plus the member discount on any additional service
  (10% Bronze, 15% Silver, 20% Gold).
- **Price lock:** the monthly price and discount hold for the term.
- **Scheduling:** Window Hero schedules each visit within a seasonal window
  and confirms the date ahead. Weather or access problems move a visit; they
  do not forfeit it. Services not used within the term do not carry over.
- **Guarantee:** a problem reported within 7 days of a visit is fixed free.
- **Three-day cancellation (builder's call):** the customer may cancel
  within 3 business days of signing for a full refund. Memberships sold by a
  technician at the customer's home are covered by home-solicitation rules
  that require this; giving it to everyone keeps one agreement.
- **Cancellation after that:** either side may cancel with 30 days' notice.
  If the services already performed, valued at Window Hero's regular
  one-time prices (Schedule A), are worth more than what the member has
  paid, the member pays the difference, never more than the payments left
  in the year. The card on file is charged for it.
- **Failed payment:** the member has 10 days to update the card; visits
  pause meanwhile. After 30 days the membership ends under the cancellation
  rule.
- **Moving:** the membership transfers to the buyer of the home if the buyer
  agrees, otherwise it ends under the cancellation rule.
- **Renewal:** renews for another 12 months at the then-current price.
  Window Hero emails a notice 30 days before with the new price and how to
  opt out. Stated conspicuously near the signature, per 75-41. Renewal years
  have no deposit unless the lawyer or owner says otherwise (builder's call).
- **Governing law:** North Carolina.

Schedule A is a table of regular one-time prices for each service by home
size. The owner has to supply these; the draft ships with the table marked
as needing them.

## What gets built

In two phases. Phase 2 does not start until phase 1 has been proven with a
real test proposal.

### Phase 1: agreement and setup

1. **The agreement**, in this repository under `docs/agreement/`: plain
   language, one page where possible, in a form that pastes cleanly into
   ServiceMinder's terms. A short cover note lists every point the lawyer
   should check.
2. **A ServiceMinder setup guide**: the services to create for the plans,
   the payment plan or plans for the deposit plus 12 monthly charges,
   requiring the deposit to accept, where the agreement text goes, and a
   test script: send a proposal to yourself, sign, pay, confirm the card is
   saved and the 12 charges are scheduled, then void it.
3. **Renewal and office routine**: the renewal notice email, the
   failed-payment follow-up message, the cancellation settlement worked
   example, and how the renewal date is tracked so the 30-day notice is
   never missed. Builder's call: when a proposal is accepted, whoever owns
   the Hero Club Requests board sets the item to Active and enters the
   signing date in a new date column; a monday.com reminder fires 35 days
   before the anniversary and that person sends the notice. If ServiceMinder
   can send a dated email on its own, the guide uses that instead.

### Phase 2: signup page to ServiceMinder

The existing Netlify function `submission-created.js` already sends each
request to monday.com. It gains a second step: find or create the contact
in ServiceMinder and create a draft proposal for the chosen plan and home
size, with add-ons and notes carried over. The office reviews, adjusts and
sends it. If ServiceMinder is unreachable or rejects it, the request is
still in Netlify Forms and monday.com, as today, and the failure is logged.

The first task of phase 2 is a test against the real account: does a
proposal created through the API stay unsent, and can it carry the payment
plan and the required deposit? If it sends on creation, phase 2 creates the
contact only and the office builds the proposal from a saved template. If it
cannot attach the plan, the office adds the plan before sending.

Needs from the owner: ServiceMinder API keys (stored as Netlify environment
variables, never in the repository) and the ids of the services created in
phase 1.

## Open with the owner

- Whether this ServiceMinder account sits under a franchise brand that
  controls proposal terms, services, payment plans or API keys.
- Whether there are Hero Club members today who need moving onto the
  agreement.

## Left to the builder

- Agreement wording and layout.
- Whether six payment plans (one per plan and home size) or a single plan
  with the deposit set per proposal is the simpler setup; the guide
  recommends one and the test script proves it.
- File names and formats within `docs/`.
- How the Netlify function is structured and tested for phase 2.
