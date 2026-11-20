# Hero Club referrals: design

Date: 2026-11-20

## Intent

Members are the cheapest way to find more members, and a referred neighbor is
usually on a street Window Hero already drives. Today a referral arrives
looking like any other request: the signup page reads nothing from the link
and asks nothing about who sent the customer. This adds "give a month, get a
month" so members have a reason to refer, the office can see who referred
whom, and both get their month once the new member is paying.

## Goals

- A member can hand a neighbor a link or a card, and the neighbor's request
  arrives on the monday.com board with the member's name on it.
- The offer is easy to say: you each get a month free.
- The reward never costs more than 15% of the new member's first year.
- Nothing is given away until the new member has paid.

## Non-goals

- No automatic crediting. The office applies credits in ServiceMinder.
- No member accounts, logins or referral dashboards.
- No rewards for non-members at launch.

## Anti-goals

- The page must not promise a reward the rules do not give. The banner and
  the terms say the same thing.
- A referral must never be credited twice, or credited for a household that
  was already a member.
- Nothing here may slow down or break an ordinary signup.

## The reward (decided by the owner)

Give a month, get a month, sized to the new member's plan. No add-ons.

- **The new member** gets one month of their own plan free, taken off their
  twelfth monthly charge.
- **The referrer** gets a bill credit equal to the new member's monthly
  charge, capped at one month of the referrer's own plan.

Cost against the owner's figures (direct costs 40%, net 20% at plan prices):

| New member's plan | First year | Profit at 20% | Both rewards | Left in year one |
|---|---|---|---|---|
| Bronze, up to 2,500 sq ft | $718 | $144 | $108 | $36 |
| Bronze, 2,501 to 3,500 sq ft | $948 | $190 | $142 | $48 |
| Silver, up to 2,500 sq ft | $1,068 | $214 | $160 | $54 |
| Silver, 2,501 to 3,500 sq ft | $1,428 | $286 | $214 | $72 |
| Gold, up to 2,500 sq ft | $1,668 | $334 | $250 | $84 |
| Gold, 2,501 to 3,500 sq ft | $2,268 | $454 | $340 | $114 |

## Rules (builder's proposal, shown to the owner)

- Only an active Hero Club member can refer.
- The new member is a household that has never had a Hero Club membership.
  Past one-time customers count as new. The referrer's own address does not.
- A referral counts once the new member has signed the agreement and paid the
  deposit and the first monthly charge. Before that, nothing is owed.
- The referrer must still be an active member on that day.
- The referrer's credit comes off their next monthly charge. A credit that
  cannot be used in the current year carries into a renewal year. It is lost
  if the membership ends.
- Up to 12 referral credits per member per membership year.
- If two members claim the same neighbor, the name on the signup request
  decides it.
- Credits have no cash value and cannot be transferred.
- Window Hero can change or end the offer. Credits already earned are
  honored.

## Approaches

1. **The code is the member's name, carried in the link (chosen).** The link
   is the signup address with `?ref=sarah-m`. The page turns the code into
   "Sarah M." for the banner with no lookup. The office checks the name
   against the board when applying the credit. Simple, no database, works
   offline. Trade-off: anyone can type a name, so the office check is what
   stops a false claim.
2. **Random codes looked up in a list.** Harder to guess, but the page would
   need a list of members published with it, which exposes member names, or a
   server lookup, which this project does not have.
3. **A third-party referral service.** A second system and a monthly fee for
   something a link and a board column can do at this size.

## What gets built

1. **Signup page.** Reads `ref` from the link. When present, shows a banner
   on the landing and details screens: "Sarah M. sent you. You each get a
   month free." When absent, the details screen has an optional field: "Did a
   Hero Club member refer you?" Either way the name is sent with the request
   and included in the email fallback. A bad or empty code shows no banner
   and breaks nothing.
2. **Link maker.** A page at `/refer.html` for the office: type a member's
   name, get their link, a QR code to save, and the text to send them. Not
   linked from the signup page.
3. **monday.com.** Three new columns on Hero Club Requests: `Referred by`,
   `Referral code` (the member's own) and `Referral credit` (a note of what
   is owed or applied). The Netlify function fills `Referred by`.
4. **Documents**, in `docs/referrals/` with Word copies: the referral terms
   customers can read, the messages (the ask, "you earned a month", the card
   wording), and the office steps for issuing a link, checking a referral and
   applying both credits.
5. **Referral terms on the site** at `/referral-terms.html`, linked from the
   banner.

## Left to the builder

- Banner design, within the existing Window Hero design language.
- How the QR code is drawn on the link maker page.
- File names, tests and the order of work.

## Not confirmed

- How one installment is skipped or credited on a ServiceMinder payment
  plan. The office steps will say what to do and mark the clicks as
  unverified until the owner has tried it.
