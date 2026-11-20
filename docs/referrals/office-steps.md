# Referrals: office steps

How the office runs "give a month, get a month". The customer-facing rules
are in `referral-terms.md`. One person should own this: the owner of the
**Hero Club Requests** board.

Nothing here is automatic. The signup page records who referred whom. The
office checks it and applies the credits in ServiceMinder.

## 1. Give every new member a link

When a member's board item goes to **Active**:

1. Open the link maker: `https://heroclub-membership.netlify.app/refer.html`
2. Type the member's full name. It shows their code, for example `sarah-m`.
3. Look down the **Referral code** column on the board. If another member
   already has that code, type `2` in the Number box (then `3`, and so on).
4. Put the code in the member's **Referral code** column.
5. Copy the message and send it to the member by text or email.
6. If you hand out cards, save the QR code and print it on the member's
   card.

The link maker is not linked from the signup page. Bookmark it.

## 2. When a request arrives with "Referred by" filled in

The signup page fills **Referred by** in one of two ways:

- `Sarah M. (link: sarah-m)`: the customer came through a member's link.
  Find the member whose **Referral code** is `sarah-m`.
- `Sarah Mitchell (typed)`: the customer typed a name. Find that member by
  name. If you cannot tell who they mean, ask the customer when you call to
  confirm their plan.

Then check all three:

- [ ] The referrer's item is **Active**.
- [ ] The new customer's household has never had a Hero Club membership, at
      this address or another. A past one-time customer is fine.
- [ ] The new customer's address is not the referrer's own.

If any check fails, the referral does not count. Write why in the new
customer's **Referral credit** column, for example `Not counted: referrer not
a member`. Carry on with the signup as normal.

If the checks pass, write `Pending: referred by Sarah M.` in the new
customer's **Referral credit** column.

## 3. When the referral counts

A referral counts when the new member has signed, paid the down payment, and
paid their **first monthly charge**, which runs one month after **Signed
on**. The referrer gets their credit only if they are still **Active** on
that day. The new member gets their free month either way.

On that day:

1. **Work out the referrer's credit.** It is the new member's monthly
   charge, but never more than the referrer's own monthly charge.

   | Referrer pays | New member pays | Referrer's credit |
   |---|---|---|
   | $125 a month | $54 a month | $54 |
   | $54 a month | $170 a month | $54 |
   | $80 a month | $80 a month | $80 |

2. **Check the limit.** Count the credits already noted in the referrer's
   **Referral credit** column since their last **Renewal date** (or
   **Signed on**, in their first year). The limit is 12. If they already
   have 12, skip step 3: the referrer gets no credit for this one. Still do
   step 4, because the new member gets their month regardless. Note it in
   the referrer's column as `No credit: 12 already this year`.
3. **Apply the referrer's credit in ServiceMinder.** Reduce their next
   monthly installment by the credit amount. If the next installment is
   already reduced to zero by another credit, use the one after it.
4. **Set the new member's free month in ServiceMinder.** Reduce their
   twelfth monthly installment to zero now, so it is not forgotten. If
   ServiceMinder will not let you edit an installment that far ahead, do it
   when the renewal reminder for that member arrives, 35 days before their
   **Renewal date**.
5. **Write it down on the board.**
   - Referrer's **Referral credit**: add a line such as
     `$54 for Pat Example, applied 15 Jan 2027`.
   - New member's **Referral credit**: change `Pending` to
     `Month 12 free, referred by Sarah M., set 15 Jan 2027`.
6. **Tell them both.** The messages are in `messages.md`.

How to reduce a single installment on a ServiceMinder payment plan has not
been confirmed. Try it on your own test membership first. If an installment
cannot be edited, the fallback is to refund that amount after the charge
runs.

## 4. Things that will come up

- **The new member cancels in the first 3 business days, or never pays the
  first monthly charge.** The referral never counted. Change **Referral
  credit** to `Not counted: cancelled` and do nothing else.
- **The new member leaves before month twelve.** They do not get their free
  month. The referrer keeps their credit. If you already set the twelfth
  installment to zero, it is cancelled with the rest when the membership
  ends; it does not change the cancellation settlement, which counts only
  what was paid and what was received.
- **The referrer leaves before the referral counts.** No credit for the
  referrer. The new member still gets their twelfth month.
- **The referrer has no monthly charges left this year.** The credit carries
  into their renewal year: reduce the first monthly charge of the new year.
  If they do not renew, it is lost.
- **Two members claim the same neighbor.** The name in **Referred by**
  decides it. One referral, one credit.
- **A renewal.** Referral credits apply to monthly charges only, not to a
  down payment.

## 5. The weekly check

Add these to the weekly check in `docs/agreement/office-routine.md`:

- Any **Active** member with a blank **Referral code**: give them a link.
- Any item with **Referral credit** starting `Pending` whose **Signed on**
  is more than a month ago: the first monthly charge should have run. Do
  step 3.
