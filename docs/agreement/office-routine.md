# Hero Club office routine

What the office does once ServiceMinder is set up
(`serviceminder-setup.md`). One person should own this: the owner of the
**Hero Club Requests** board on monday.com.

## 1. From request to member

1. A request arrives on the board with status **New**.
2. Call the customer the same day. Confirm the plan, home size and price.
   Ask whether a Hero Club member referred them, and if so note the
   member's name and street address in **Referred by**
   (`docs/referrals/office-steps.md`).
   For homes over 3,500 sq ft, quote the price.
3. In ServiceMinder, create a proposal from the matching Hero Club template
   and send it. For a home over 3,500 sq ft, put the Schedule A prices for
   that home on the proposal. Set the board status to **Proposal sent**.
4. When the customer accepts and pays the down payment, on the board item:
   - set the status to **Active**;
   - set **Signed on** to the date they accepted;
   - set **Renewal date** to one year after that.
5. Do not carry out a visit inside the first 3 business days. The agreement
   says we will not, and the customer can cancel for a full refund in that
   window.
6. Schedule the year's visits and tell the customer the seasons to expect
   them.

### One-time board setup

The **Signed on**, **Renewal date** and **Renewal notice sent** date columns
are already on the board. Two things are left to do by hand:

1. **Add four status labels.** Click any Status cell, choose **Edit
   Labels**, and add `Proposal sent`, `Active`, `Not renewing` and
   `Cancelled`. Leave `New` as it is; the signup page uses it.
2. **Add the renewal reminder.** Click **Automate** at the top of the board
   and add an automation that notifies the board owner 35 days before
   **Renewal date** arrives. Add a second one that notifies a different
   person 25 days before, as a backstop.

**Renewal date** is what the reminder runs from. If it is blank, the reminder
cannot fire. **Signed on** is the original signing date and is never changed.

## 2. Renewal

North Carolina law requires a written renewal notice at least 15 and no more
than 45 days before the renewal date. If it is not sent in that window, the
renewal clause cannot be enforced. This is the one job on this page that
must not be missed.

| When | What |
|---|---|
| 35 days before **Renewal date** | The board reminds the owner. Look up the current price for the member's plan and home size and send the notice below by email that day. Set **Renewal notice sent** to the date it went out. |
| 25 days before | The backstop reminder goes to a second person. If **Renewal notice sent** is blank, send the notice now. |
| Up to the renewal date | If the member opts out, set the status to **Not renewing**. Nothing more is charged after the twelfth monthly charge. |
| Renewal date | If they have not opted out, set up the renewal year in ServiceMinder exactly like year one: the down payment charged on the renewal date, then 12 monthly charges at the prices in the notice, the first one month after the renewal date. The member's twelfth charge of the old year also falls on the renewal date, so two charges run that day. Move **Renewal date** forward one year and clear **Renewal notice sent**, so next year's reminder fires. Leave **Signed on** alone. |

**If the notice was missed:** it can still go out as long as the renewal date
is at least 15 days away. If it is closer than that, do not renew
automatically. Call the member and send a new proposal for them to accept.

Setting up the renewal year in ServiceMinder has not been tested. The
likely way is to apply the member's same Hero Club payment plan (down
payment plus 12 monthly installments) to a new invoice for the year's total. Confirm
how with a test before the first renewal comes due.

### The renewal notice

This notice is also a ready-made ServiceMinder template,
`email-templates/emails/hero-club-renewal-notice.html`. The payment and
cancellation emails have templates too; see
`email-templates/HERO-CLUB-EMAILS.md`.

Subject: Your Hero Club membership renews on [RENEWAL DATE]

> Hi [FIRST NAME],
>
> Your Hero Club [PLAN] membership for [ADDRESS] renews automatically on
> **[RENEWAL DATE]** for another 12 months.
>
> **For the new year your down payment will be $[NEW DOWN PAYMENT] and your
> monthly charge will be $[NEW MONTHLY PRICE].** The down payment is charged
> on your renewal date to the card we have on file. The 12 monthly charges
> start one month after that. Your last monthly charge for this year, $[CURRENT
> MONTHLY PRICE], is also due on your renewal date.
>
> Your plan includes the same services as this year: [PLAN SERVICES].
>
> **If you do not want to renew,** reply to this email, or contact us at
> [OFFICE EMAIL] or [OFFICE PHONE], any time before [RENEWAL DATE]. There is
> no charge for not renewing.
>
> Thank you for being a Hero Club member.
>
> Window Hero

Send it as its own email, not inside a newsletter or a visit report.

## 3. When a payment fails

ServiceMinder's help pages say it emails the member a link to update their
card and lists the failure under Failed Payments. The test in
`serviceminder-setup.md` Part 6 confirms that for your account. Check that
list every weekday.

| Day | What |
|---|---|
| 1 | Text the member (below). Hold their upcoming visits. |
| 7 | If still unpaid, email and text again. |
| 10 | Call. The agreement gives them 10 days to update the card. |
| 30 | If still unpaid, the membership ends that day with no further notice period. Work out the settlement in section 4, step 3. The card on file has already failed, so send an invoice for any balance. Cancel the remaining installments and set the board status to **Cancelled**. |

Day 1 text:

> Hi [FIRST NAME], it's Window Hero. Your Hero Club payment of $[AMOUNT]
> didn't go through. You can update your card with the link we emailed, or
> call us at [OFFICE PHONE]. We'll hold your next visit until it's sorted.

Day 7 email and text:

> Hi [FIRST NAME], your Hero Club payment of $[AMOUNT] from [DATE] is still
> unpaid and your visits are on hold. Please update your card with the link
> in our earlier email or call [OFFICE PHONE]. If we can't collect it by
> [DATE + 30 DAYS], your membership will end under the cancellation terms
> of your agreement.

When the payment goes through, release the held visits.

## 4. When a member cancels

1. Note the date they gave notice. Inside the first 3 business days after
   signing: refund everything, cancel all 12 installments in ServiceMinder,
   set the board status to **Cancelled**, and stop here.
2. Otherwise the membership ends 30 days after the notice. Monthly charges
   due before that end date still run. Visits already booked before it
   still happen.
3. On the end date, work out the settlement:
   - **Received:** add up every plan service performed, at the Schedule A
     price for their home size. Do not count add-ons; those were billed
     separately.
   - **Paid:** the down payment plus every monthly charge collected.
   - **Cap:** the number of monthly charges not yet collected, times their
     monthly charge.
   - If Received is more than Paid, they owe the difference, but never more
     than the Cap. Charge the card on file and email a receipt showing the
     sum. If the charge fails, send an invoice for the balance.
   - If Paid is more than Received, they owe nothing and no refund is due.
4. Cancel the remaining installments in ServiceMinder and set the board
   status to **Cancelled**.

If Window Hero ends the membership for any reason other than a failed
payment, the member owes nothing, and if Paid is more than Received, refund
the difference.

### When a member moves

1. Ask whether the buyer wants to take over the membership.
2. **If yes:** get the buyer's agreement in writing by sending them a
   proposal for the remaining monthly charges, with the agreement attached,
   to accept with their own card. Cancel the seller's remaining
   installments. Put the buyer's name and details on the board item and note
   the transfer. **Signed on** and **Renewal date** stay the same.
3. **If no:** the membership ends the day the member told you they moved.
   There is no 30-day notice period. Work out the settlement in step 3
   above, cancel the remaining installments and set the status to
   **Cancelled**.

### Worked examples

Both use Bronze for a home up to 2,500 sq ft: $70 down payment, $54 a month. The
service prices here ($400 for a house wash, $150 for a gutter cleaning) are
**made-up figures for the example, not Window Hero's prices**. Use Schedule
A.

**Example A: leaves right after the house wash.** The member signs, has the
house wash in the second week, and gives notice on day 10, which is past the
3-business-day refund window. The membership ends on day 40. One monthly
charge ran before then.

- Received: $400
- Paid: $70 + $54 = $124
- Cap: 11 charges left x $54 = $594
- $400 - $124 = $276, which is under the cap. **They owe $276.**

**Example B: leaves late in the year.** The member's membership ends after
nine monthly charges. They have had the house wash and one gutter cleaning.

- Received: $400 + $150 = $550
- Paid: $70 + 9 x $54 = $556
- Paid is more than Received. **They owe nothing, and no refund is due.**

## The weekly check

Once a week, the board owner looks at:

- New requests not yet called.
- Referrals: the two checks in `docs/referrals/office-steps.md`, section 5.
- Items at **Proposal sent** for more than 3 days: call.
- Failed Payments in ServiceMinder.
- Any **Active** item with a blank **Signed on** or **Renewal date**.
- Any item whose **Renewal date** is within 45 days and whose **Renewal
  notice sent** is blank. Send the notice that day.
