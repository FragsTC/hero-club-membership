# Setting up Hero Club in ServiceMinder

This sets up ServiceMinder so a Hero Club member gets one link, reads the
agreement, signs, pays the deposit, and is then charged monthly for 12 months
without anyone doing anything.

**Read this first.** These steps were written from search summaries of
ServiceMinder's help pages. We could not open the pages themselves or your
account while writing this. Where a step says *(help pages)*, the menu name
or behaviour comes from those summaries and may look different on your
screen. Nothing
here is proven until the test in Part 6 passes. Do the test before you send a
proposal to a real customer.

Allow about an hour, plus the test.

## The numbers you will type

| Plan | Home size | Short name | Deposit | Monthly | Year total |
|---|---|---|---|---|---|
| Bronze | up to 2,500 sq ft | Bronze S | $70 | $54 | $718 |
| Bronze | 2,501 to 3,500 sq ft | Bronze M | $96 | $71 | $948 |
| Silver | up to 2,500 sq ft | Silver S | $108 | $80 | $1,068 |
| Silver | 2,501 to 3,500 sq ft | Silver M | $144 | $107 | $1,428 |
| Gold | up to 2,500 sq ft | Gold S | $168 | $125 | $1,668 |
| Gold | 2,501 to 3,500 sq ft | Gold M | $228 | $170 | $2,268 |

The year total is what goes on the proposal as the price. We expect the
deposit to come off the top and the rest to divide into 12 equal monthly
charges; the test in Part 6 confirms it. For example,
Silver M: $1,428 less the $144 deposit leaves $1,284, which is 12 charges of
$107.

Use the names in this guide exactly. The next phase, where signup requests
create proposals for you, will look them up by name.

## Part 1: Fill in the agreement

1. Open `hero-club-membership-agreement.md` and fill in the four kinds of
   blank listed at the bottom of `lawyer-review-notes.md`: your legal
   business name, office email, office phone, and the 8 regular one-time
   prices in Schedule A.
2. Send it to your lawyer with `lawyer-review-notes.md`.
3. Carry on with Parts 2 to 6 while you wait. You can test with the draft.
   Do not send to customers until the lawyer has signed off.

## Part 2: Create three services

In **Control Panel > Services** *(help pages)*, create three services:

- `Hero Club Bronze`
- `Hero Club Silver`
- `Hero Club Gold`

These are for the membership itself, which is what the proposal sells. The
visits (gutter cleaning, house wash, windows) stay on the services you
already use for scheduling.

## Part 3: Create the six price lines and six proposal templates

Each plan and home size needs one line item priced at its year total.

1. In **Control Panel > Parts/Add-Ons** *(help pages)*, add six parts, one
   per row of the table above, named `Hero Club Bronze S` through
   `Hero Club Gold M`, each priced at its **year total**.
2. On the same screen click **Templates** in the top right, then **Add**, and
   choose **Proposal** as the type *(help pages)*. Make six templates with
   the same six names. For each, select the matching Hero Club service and
   add the matching part.

The help pages say creating templates needs the right permission, or an
Owner or Brand Administrator.

## Part 4: Create six payment plans

In **Control Panel > Payment Options**, in the **Payment Plans** section
*(help pages)*, create six plans named `Hero Club Bronze S` through
`Hero Club Gold M`. For each:

1. **Deposit:** choose the flat amount option and enter the deposit from the
   table. *(The help pages list the deposit choices as the first
   installment, a percentage of the total, a flat amount, or a month-based
   calculation.)* The six deposits are not the same percentage of their
   totals, which is why there are six plans and not one.
2. **Schedule:** equally spaced installments, 12 of them, one month apart.
   Not "by appointments": members are charged monthly whether or not a visit
   happened that month.
3. **Skip Payment:** leave it unchecked. The help pages say checking it
   emails invoices in place of charging the card.
4. If the plan can be limited to certain services, limit each to its Hero
   Club service so it is never offered on an ordinary job.
5. Leave the auto-include setting off so these plans do not appear on other
   proposals *(help pages)*.

**A shortcut worth trying during the test.** The help pages also describe
setting a flat deposit in the proposal's own Deposit section. If that works
together with a payment plan in your account, one plan called
`Hero Club 12 monthly` with the deposit typed on each proposal would replace
the six. Try the six-plan way first; it is the one the help pages describe
most directly.

## Part 5: Attach the agreement and require the deposit and signature

You told us ServiceMinder captures the signature on acceptance, so use the
method you already know. Two things to get right:

1. **The agreement must show only on Hero Club proposals.** Look in
   **Control Panel > Services > Edit** on a Hero Club service for its
   proposal settings *(help pages say service-level proposal customizations
   live there)*. If the Terms & Conditions can be set for that service, paste
   the agreement there on all three Hero Club services.

   If Terms & Conditions can only be set once for the whole account, do not
   paste it there, or every customer will see it. Put the agreement in an
   **Ad Hoc Form** with **Default Required** on, and add that form to the six
   templates. The help pages say a required form blocks acceptance until it
   is signed.

2. **The renewal block must stay prominent.** After pasting, check that the
   section headed "Renewal" is still bold and sits directly above where the
   customer signs. If the formatting was stripped, re-apply the bold. North
   Carolina law requires that notice to stand out.

Then on each of the six templates (or on the proposal, if the template does
not hold these):

3. In the proposal's **Deposit** section *(help pages)*, select the matching
   payment plan and mark the deposit **Required**. The help pages say a
   required deposit means the customer cannot accept without entering
   payment details and paying it.

## Part 6: Test it on yourself

Add yourself as a contact with your own email and a real card. Create a
proposal from the `Hero Club Silver M` template and send it. Then check each
of these:

- [ ] The proposal shows a price of $1,428.
- [ ] The full agreement text displays, including Schedule A.
- [ ] The "Renewal" block is bold and directly above the signature.
- [ ] You cannot accept without signing.
- [ ] You cannot accept without paying the $144 deposit.
- [ ] Apple Pay and Google Pay are not offered (the help pages say wallets
      do not appear on proposals with a payment plan). Customers will need a
      card.
- [ ] After accepting, your card shows as saved on your contact.
- [ ] 12 installments of $107 are scheduled, one month apart, the first one
      month from today and the twelfth on the anniversary.
- [ ] The signed agreement is stored on your contact where the office can
      find it later.
- [ ] You received a confirmation or receipt as the customer.

Then check the two things most likely to cause trouble later:

- [ ] **A visit does not charge the member again.** Schedule a gutter
      cleaning for yourself and finish it. The help pages say that when an
      appointment is finished with Auto Pay on and a card on file,
      ServiceMinder creates a payment. A member's included visit must
      finish at $0. If it tries to charge, stop and tell us; member visits
      will need to be set up at no charge or with the charge skipped.
- [ ] **A failed payment reaches you.** If you can, replace the card with
      one that will decline, or ask ServiceMinder support how to simulate
      it. Confirm the failure appears in the Failed Payments list and that
      the customer email with the update-card link goes out *(help pages)*.

Then check the two charges the office will make by hand:

- [ ] **An add-on bills at the member discount.** Create an invoice for an
      add-on for yourself, apply the 15% Silver discount, and charge it to
      the saved card. Note how you applied the discount.
- [ ] **A one-off charge to the saved card works.** This is how a
      cancellation balance is collected. Charge yourself a small amount
      against the card on file without the customer entering it again.

When you are done, refund every charge, cancel the remaining installments
and void the proposal.

**If any box cannot be ticked, stop there and report which one.** Do not
send Hero Club proposals to customers until every box is ticked and the
lawyer has signed off.

## Homes over 3,500 sq ft

There is no set price. After you quote the customer:

1. Create the proposal from the template for the same plan in size M.
2. Change the line price to the quoted year total.
3. The deposit and monthly charge will not match a saved payment plan.
   Either create a one-off payment plan for this customer with the quoted
   deposit, or use the proposal's own Deposit section if the shortcut in
   Part 4 worked.
4. Quote Schedule A prices for this home on the proposal, since the
   agreement points to them.

## What to send back

For the next phase we will need:

- which boxes in Part 6 passed and which did not;
- whether you used service Terms & Conditions or an Ad Hoc Form;
- whether the one-plan shortcut worked;
- how you made member visits finish at $0;
- how you applied the member discount to an add-on.
