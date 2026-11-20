# Referrals: office steps

How the office runs referrals: a member who refers a neighbor gets a credit
equal to the neighbor's first monthly charge. The neighbor gets nothing
extra. The rules customers see are
in `referral-terms.md`. One person should own this: the owner of the **Hero
Club Requests** board.

There are no referral links or codes. The new customer tells you who
referred them, and you match that to a member in ServiceMinder by street
address. Nothing is automatic, and the signup page does not ask about
referrals yet, so you ask.

## 1. Ask every new customer

On the call to confirm a new request, ask:

> "Did a Hero Club member refer you?"

If yes, take down:

- **Their name.** Whoever the customer knows. It may be the spouse of the
  person the account is under, so do not expect it to match.
- **Their street address.** This is what you match on. If the customer does
  not know the house number, the street and a description is enough to
  start.
- **Their phone number**, if the customer has it. Optional.

Write it in the new customer's **Referred by** column on the board, for
example `Sarah Mitchell, 14 Oak Hollow Ct, 919-555-0100`.

Ask before they sign the agreement. A referral named after signing does not
count.

## 2. Match it in ServiceMinder

1. Search ServiceMinder for the **street address**.
2. Use the name and phone only as a check. A different first name at the
   same address is normal: it is usually the spouse.
3. Confirm all three:
   - [ ] That address has an **active** Hero Club membership.
   - [ ] The new customer's household has never had a Hero Club membership,
         at this address or another. A past one-time customer is fine.
   - [ ] The new customer's address is not the same as the referrer's.

If the address is not a Hero Club member's home, or any check fails, the
referral does not count. Write why in the new customer's **Referral credit**
column, for example `Not counted: 14 Oak Hollow Ct is not a member`, and
carry on with the signup as normal.

If you cannot find the address, ask the customer once more for the house
number or the phone number before deciding it does not count.

If the checks pass, write `Pending` in the new customer's **Referral
credit** column, and the referring member's account name as it appears in
ServiceMinder after it, for example `Pending: David Mitchell account`.

## 3. When the referral counts

A referral counts when the new member has signed, paid the down payment, and
paid their **first monthly charge**, which runs one month after **Signed
on**. The referrer gets the credit only if their membership is still
**Active** on that day.

On that day:

1. **Work out the credit.** It is the new member's first monthly charge,
   whatever the referrer's own plan costs.

   | Referrer pays | New member pays | Credit | How it comes off |
   |---|---|---|---|
   | $125 a month | $54 a month | $54 | $54 off the next charge |
   | $80 a month | $80 a month | $80 | The next charge is free |
   | $54 a month | $170 a month | $170 | The next three charges are free, and the rest comes off the fourth |

2. **Check the limit.** Count the credits already noted in the referrer's
   **Referral credit** column since their last **Renewal date** (or
   **Signed on**, in their first year). The limit is 12. If they already
   have 12, there is no credit for this one. Note it in the referrer's
   column as `No credit: 12 already this year`.
3. **Apply the credit in ServiceMinder.** Reduce the referrer's next monthly
   installment by the credit amount. If the credit is more than that
   installment, set it to zero and take the rest off the installments that
   follow until the credit is used up. If an installment is already reduced
   by an earlier credit, start from the first one that is not.
4. **Write it down on the board.**
   - Referrer's **Referral credit**: add a line such as
     `$170 for Pat Example, applied 15 Jan 2027: Feb, Mar and Apr free, the rest off May`.
   - New member's **Referral credit**: change `Pending` to
     `Counted 15 Jan 2027, credit to Mitchell account`.
5. **Tell the referrer.** The message is in `messages.md`.

Nothing changes on the new member's bill. They pay the normal price.

How to reduce a single installment on a ServiceMinder payment plan has not
been confirmed. Try it on your own test membership first. If an installment
cannot be edited, the fallback is to refund that amount after the charge
runs.

## 4. Things that will come up

- **The name does not match the account.** Expected. Match on the address
  and credit the membership at that address.
- **Two members live on the same street and the customer is not sure which
  house.** Ask for the house number or phone. Do not guess.
- **The new member cancels in the first 3 business days, or never pays the
  first monthly charge.** The referral never counted. Change **Referral
  credit** to `Not counted: cancelled` and do nothing else.
- **The new member leaves after the referral counted.** The referrer keeps
  their credit.
- **The referrer's membership has ended before the referral counts.** No
  credit.
- **The credit is more than the monthly charges the referrer has left this
  year.** What is left over carries into their renewal year: take it off the
  first monthly charges of the new year. If they do not renew, it is lost.
- **A member says they referred someone who did not mention them.** The
  terms say the new member has to name them before signing. If the new
  member confirms it when you ask, and they have not been a member more
  than a few days, use your judgment and note what you did.
- **A renewal.** Referral credits apply to monthly charges only, not to a
  down payment.

## 5. The weekly check

- Any item at **Proposal sent** or **Active** with a blank **Referred by**
  where nobody asked the question: ask.
- Any item with **Referral credit** starting `Pending` whose **Signed on**
  is more than a month ago: the first monthly charge should have run. Do
  step 3.

## Board columns

| Column | What goes in it |
|---|---|
| **Referred by** | On the new customer's item: the name, street address and phone they gave |
| **Referral credit** | On both items: what is pending, owed or applied, with dates |
| **Referral code** | Not used. It was for referral links, which were dropped. It can be deleted |
