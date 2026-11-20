# Hero Club email templates

Fourteen ServiceMinder email templates for the Hero Club, in the same design
as the other Window Hero emails. The files are in `emails/` and all start
with `hero-club-`.

**None of these has been pasted into ServiceMinder or test-sent.** They
render correctly in a browser at desktop and phone width, and every
shortcode in them is on ServiceMinder's published list (`SHORTCODES.md`).
Send each one to yourself before a customer sees it.

## How to add one to ServiceMinder

1. Open the `.html` file in a text editor and copy everything.
2. In ServiceMinder, create the template of the type shown below, switch its
   editor to the HTML or source view, and paste.
3. Type in the subject line from the table.
4. Save, reopen, and send yourself a test.

## The templates

| # | File | Send it when | ServiceMinder template type | Subject line |
|---|---|---|---|---|
| 1 | `hero-club-welcome-bronze.html`, `-silver.html`, `-gold.html` | A member signs and pays the down payment. Pick the one for their plan | Ad hoc | Welcome to the Hero Club |
| 2 | `hero-club-proposal-follow-up.html` | A Hero Club proposal has sat unsigned for 3 days | Ad hoc, proposal type | Your Hero Club membership is waiting |
| 3 | `hero-club-visit-reminder.html` | The day before a member's visit | Ad hoc | Reminder: your Hero Club visit is coming up |
| 4 | `hero-club-visit-complete.html` | The day after a member's visit | Ad hoc, appointment type | Your Hero Club visit is complete |
| 5 | `hero-club-payment-failed.html` | Automatically, when a monthly charge fails | Installment Payment Failure | Action needed: your Hero Club payment didn't go through |
| 6 | `hero-club-payment-reminder.html` | Day 7, if the payment is still unpaid | Ad hoc | Reminder: your Hero Club payment is still outstanding |
| 7 | `hero-club-renewal-notice.html` | 35 days before the renewal date | Ad hoc | Your Hero Club membership renews on [RENEWAL DATE] |
| 8 | `hero-club-cancellation.html` | A membership is ending | Ad hoc | Your Hero Club cancellation is confirmed |
| 9 | `hero-club-referral-invite.html` | A member becomes Active, and again after their first visit | Ad hoc | Give a month, get a month |
| 10 | `hero-club-referral-named.html` | A new customer names this member as their referrer | Ad hoc | Thank you for the referral |
| 11 | `hero-club-referral-credit.html` | The referral counts and the credit is applied | Ad hoc | Your Hero Club referral credit |
| 12 | `hero-club-referral-welcome.html` | The referral counts, to the new member | Ad hoc | Your twelfth Hero Club month is on us |

The welcome email comes in three versions because ServiceMinder has no
shortcode for a member's plan. Each lists exactly what that plan includes.

## What to type in by hand

ServiceMinder cannot fill in membership details, so some emails have blanks
written as **[CAPITALS IN BRACKETS]**. Type over every one before sending,
including the brackets. Before you press send, search the email for `[`.

| Email | Blanks |
|---|---|
| 6. Payment still unpaid | `[AMOUNT]`, `[DATE DUE]`, `[END DATE]` (30 days after the date due) |
| 7. Renewal notice | `[PLAN]`, `[RENEWAL DATE]` (three places, plus the subject), `[NEW DOWN PAYMENT]`, `[NEW MONTHLY CHARGE]`, `[CURRENT MONTHLY CHARGE]` |
| 8. Cancellation | `[END DATE]`, `[SERVICES RECEIVED AMOUNT]`, `[AMOUNT PAID]`, `[BALANCE DUE OR $0]` |
| 10. Neighbor named you | `[NEIGHBOR FIRST NAME]` |
| 11. Credit applied | `[NEIGHBOR FIRST NAME]` (two places), `[CREDIT AMOUNT]` (two places) |
| 12. New member's free month | `[REFERRER FIRST NAME]` |

The other emails need nothing typed in.

## Things to know before using them

- **The renewal notice is the one North Carolina requires.** Send it on its
  own, 15 to 45 days before the renewal date, and record the date in
  **Renewal notice sent** on the board. It has no marketing in it on
  purpose. It tells the member they can reply to the email to opt out, so
  check that replies to ServiceMinder emails reach an inbox someone reads.
- **A member who has unsubscribed may not receive ServiceMinder emails.**
  If a member due a renewal notice has unsubscribed, send the notice another
  way, such as by post, and keep a copy.
- **The payment-failed email replaces ServiceMinder's failure email for
  every installment plan in your account,** not only Hero Club. It says
  "Hero Club payment". If you use installments for anything else, tell us
  and we will make the wording general.
- **The proposal follow-up is for sending by hand.** ServiceMinder's
  automatic Proposal Reminder goes to every open proposal, so the general
  `proposal-follow-up.html` stays in that slot.
- **The visit-complete email is for members.** ServiceMinder's automatic
  Appointment Complete email goes to everyone, so `service-complete.html`
  stays in that slot. A member will get both unless you turn the automatic
  one off for member visits.
- **The cancellation email is for a membership ending after the first 3
  business days.** For a cancellation inside the 3-day window, do not use
  it: the customer gets a full refund and there is nothing to settle.
- **The referral emails say "a month free".** Email 9 carries the main
  rules. Have the referral terms document ready for anyone who asks.

## Changes to the earlier templates

- `hero-club-welcome.html` is replaced by the three plan versions. The old
  one listed benefits that are not in the plans, such as priority
  scheduling.
- `service-complete.html` said "Plans starting at just $59/month". It now
  says $54, which matches the signup page. If the copy in ServiceMinder is
  the old one, paste the new file over it.
- Nothing else was changed.

## Testing the shortcodes

Five files in `emails/` starting with `test-shortcodes-` are for you, not for
customers. Each lists shortcodes by name beside what ServiceMinder fills in.

| File | Paste it into | Send it from |
|---|---|---|
| `test-shortcodes-contact.html` | A new ad hoc template | Any contact |
| `test-shortcodes-proposal.html` | A new ad hoc proposal template | A Hero Club test proposal |
| `test-shortcodes-appointment.html` | A new ad hoc appointment template | A finished test appointment |
| `test-shortcodes-invoice.html` | A copy of the Contact Invoice template | A test invoice |
| `test-shortcodes-installment-failure.html` | The Installment Payment Failure template | A failed test installment |

Send each to yourself. Any row whose right-hand side is blank or still shows
the shortcode in braces does not work in that template type. Send us the
results and we will correct the templates. The contact test includes both
spellings of the unsubscribe link, which settles which one to use. The
proposal test shows what `{proposal.deposit_amount}` gives on an unsigned
proposal.

## If a plan changes

The welcome emails read what each plan includes from the signup page
(`public/index.html`). After changing a plan there, run
`python3 email-templates/build_emails.py` and paste the new welcome emails
into ServiceMinder.
