# Hero Club Membership Agreement, Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Window Hero a signable Hero Club agreement, a ServiceMinder setup guide that ends in a proven test proposal, and the office routine that keeps renewals and failed payments from slipping.

**Architecture:** Phase 1 is documents, not software. Everything lives in `docs/agreement/` in this repository. One small Node script checks that every price in those documents matches `TIERS` in `public/index.html`, because the prices must match the door hanger. Phase 2 (signup page creates a draft proposal in ServiceMinder) gets its own plan after the owner's test proposal passes.

**Tech Stack:** Markdown, one dependency-free Node script (`node:assert`, `node:fs`), the monday.com connector for one board change.

**Spec:** `docs/superpowers/specs/2026-11-20-membership-agreement-billing-design.md`

## Global Constraints

- Plain language a homeowner can read in a few minutes. No "heretofore", "party of the first part" or similar.
- Prices, exactly: Bronze $70 deposit + $54/month ($718/year) and $96 + $71 ($948); Silver $108 + $80 ($1,068) and $144 + $107 ($1,428); Gold $168 + $125 ($1,668) and $228 + $170 ($2,268). First of each pair is homes up to 2,500 sq ft, second is 2,501 to 3,500 sq ft.
- The year is the deposit at signing plus 12 monthly charges, the first one month after signing.
- Included services and member discounts are copied from the `services` arrays in `TIERS`, word for word.
- Add-ons and extras are invoiced separately when performed, at the member discount (10% Bronze, 15% Silver, 20% Gold).
- North Carolina law. Renewal notice goes by email 30 days before renewal (N.C. Gen. Stat. 75-41 requires 15 to 45 days).
- Nothing in the documents may state as fact a ServiceMinder behaviour that was only read in its help pages. Such steps say "the help pages say" and are covered by the test proposal.
- No card numbers, API keys or customer details in the repository.
- The agreement is a draft for a North Carolina lawyer. It says so at the top of the cover note, not in the text customers sign.

## Review Focus

- A member cancels after the house wash having paid only the deposit: the settlement must come out as the difference, capped at the payments left in the year. Pinned by the worked example in Task 3.
- A member cancels having paid more than the value received: nothing further is owed and no refund is implied. Pinned by a second worked example in Task 3.
- A home over 3,500 sq ft: no published price exists, so the agreement must work with amounts written on the proposal. Pinned by the Task 1 check that the agreement has no price that is not in `TIERS` and has wording for a custom price.
- A price changes in `TIERS` and the documents are forgotten: `scripts/check-agreement.js` fails. Pinned in Task 1.
- The renewal notice is not sent in the window: the renewal clause is void. Pinned by the Task 3 routine and the board change in Task 4.

---

### Task 1: The agreement, lawyer notes and price check

**Files:**
- Create: `docs/agreement/hero-club-membership-agreement.md`
- Create: `docs/agreement/lawyer-review-notes.md`
- Create: `scripts/check-agreement.js`
- Modify: `docs/superpowers/specs/2026-11-20-membership-agreement-billing-design.md` ("Open with the owner" section)

**Interfaces:**
- Produces: the section headings of the agreement, which Tasks 2 and 3 refer to by name: `Your plan`, `What you pay`, `Scheduling your visits`, `Our guarantee`, `Changing your mind in the first 3 business days`, `Cancelling`, `If a payment fails`, `If you move`, `Renewal`, `Schedule A: regular one-time prices`.
- Produces: `node scripts/check-agreement.js` exits 0 when every `[monthly, deposit]` pair and year total derived from `TIERS` appears in each file under `docs/agreement/` that mentions any plan price, and non-zero naming the missing figure otherwise.

- [ ] **Step 1: Write `scripts/check-agreement.js`**

Read `public/index.html`, cut out the object literal assigned to `var TIERS`, evaluate it with `new Function`, and for each tier and each of sizes `s` and `m` compute `total = deposit + 12 * monthly`. For each Markdown file in `docs/agreement/` that contains a `$` followed by digits, assert with `node:assert` that it contains `$<deposit>`, `$<monthly>` and the total formatted with a thousands comma (`$1,068`). Print one line per file checked.

- [ ] **Step 2: Run it and see it fail**

Run: `node scripts/check-agreement.js`
Expected: non-zero exit, because `docs/agreement/` does not exist yet.

- [ ] **Step 3: Write `docs/agreement/hero-club-membership-agreement.md`**

Sections in the order listed under Interfaces, each implementing the matching term in the spec's "The agreement's terms" and "Money" sections. Specifics the spec leaves open, decided here:
- `Your plan` holds a table of the three plans with their services copied from `TIERS`, and says the plan, home size, deposit and monthly charge for this member are the ones shown on the proposal they are accepting. Homes over 3,500 sq ft: "your deposit and monthly charge are the amounts shown on your proposal".
- `What you pay` holds the six-row price table from Global Constraints and the add-on rule.
- `Renewal` is set off so it stands out (a bordered or bold block directly above the acceptance line) and names how to opt out: reply to the notice, email or call, with placeholders `[OFFICE EMAIL]` and `[OFFICE PHONE]`.
- `Schedule A` is a table with a row per service (Gutter Cleaning, House Wash, Exterior Window Cleaning, Interior & Exterior Window Cleaning) and a column per home size, every cell `[PRICE]`.
- Business name placeholder `[WINDOW HERO LEGAL NAME]`.

- [ ] **Step 4: Write `docs/agreement/lawyer-review-notes.md`**

First line: this is a draft and has not been reviewed by a lawyer. Then a numbered list of what to check: 75-41 disclosure and notice wording and the status of HB 188; the 3-business-day cancellation and whether the home-solicitation notice form is needed for sales made at the home; whether the cancellation settlement could be read as a penalty; charging the card on file for the settlement; the no-deposit renewal year; transfer on sale of the home. Then a list of every placeholder to fill in.

- [ ] **Step 5: Run the check and see it pass**

Run: `node scripts/check-agreement.js`
Expected: exit 0, one "ok" line for the agreement.

- [ ] **Step 6: Record the owner's answers in the spec**

Replace the "Open with the owner" section with "Answered by the owner": the owner controls proposal terms, services, payment plans and API keys in ServiceMinder; there is one existing member, who needs no migration.

- [ ] **Step 7: Commit**

```bash
git add docs scripts
git commit -m "Hero Club membership agreement draft, lawyer notes and price check"
```

### Task 2: ServiceMinder setup guide

**Files:**
- Create: `docs/agreement/serviceminder-setup.md`

**Interfaces:**
- Consumes: the agreement file and its section names from Task 1.
- Produces: the names used inside ServiceMinder, which phase 2 will look up: services `Hero Club Bronze`, `Hero Club Silver`, `Hero Club Gold`; payment plans named `Hero Club <Plan> <S|M>` (for example `Hero Club Silver M`).

- [ ] **Step 1: Read the current help pages**

Fetch the ServiceMinder help articles on payment plans, deposits on proposals, proposal terms and conditions, and accepting proposals (`serviceminder.knowledgeowl.com/help/payment-plans-methods-recurring-billing`, `/help/deposits-proposals`, `/help/accept-view-print-proposals`, and whichever article covers terms). Note the menu paths they give.

- [ ] **Step 2: Write the guide**

Numbered steps in the order the owner does them: create the three services; create six payment plans, each with its flat deposit and 12 monthly installments, using the table from Global Constraints (the help pages say a plan's deposit is flat or a percentage, and the six deposits are not one percentage); set the deposit as required to accept; paste the agreement in as the proposal terms; build one saved proposal per plan. A short section for homes over 3,500 sq ft: copy the nearest plan and type the quoted amounts. Every menu path taken from a help page is marked as such.

End with the test script, as a checklist: send a Silver M proposal to yourself; confirm the agreement text and the renewal block display; sign; pay the $144 deposit with a real card; confirm the card shows on the contact; confirm 12 installments of $107 are scheduled monthly starting one month out; confirm the signed copy is stored on the contact; refund and void. A final line: if any check fails, stop and report which.

- [ ] **Step 3: Run the price check**

Run: `node scripts/check-agreement.js`
Expected: exit 0, "ok" lines for the agreement and the setup guide.

- [ ] **Step 4: Commit**

```bash
git add docs/agreement/serviceminder-setup.md
git commit -m "ServiceMinder setup guide for Hero Club proposals and payment plans"
```

### Task 3: Office routine

**Files:**
- Create: `docs/agreement/office-routine.md`
- Modify: `README.md` (add a short "Membership agreement" section linking the four documents)

**Interfaces:**
- Consumes: agreement section names from Task 1; payment plan names from Task 2.
- Produces: the board fields Task 4 creates: a date column `Signed on` and status label `Active`.

- [ ] **Step 1: Write the routine**

Four parts:
1. From request to member: confirm the price by phone, send the saved proposal, and on acceptance set the board item to `Active` and fill `Signed on`.
2. Renewal: who owns it (the owner of the Hero Club Requests board), the reminder 35 days before the anniversary, and the notice email in full, with merge placeholders for name, renewal date, new monthly price and how to opt out. Sent 30 days before.
3. Failed payment: the text and email to send on day 1 and day 7, pausing visits, and ending the membership on day 30 under `Cancelling`.
4. Cancellation settlement, with two worked examples using Bronze, home up to 2,500 sq ft, and a stated example Schedule A price for a house wash of `$400` (labelled as an example figure, not Window Hero's price). Example A: cancels in month 2 after the house wash, having paid $70 + $54 = $124; owes $400 - $124 = $276, which is under the cap of the 11 payments left ($594). Example B: cancels in month 10 after services worth $400 in total, having paid $70 + 9 x $54 = $556; owes nothing further and no refund is due.

- [ ] **Step 2: Check the arithmetic**

Run: `node -e "console.log(70+54, 400-124, 11*54, 70+9*54)"`
Expected: `124 276 594 556`, matching the examples.

- [ ] **Step 3: Add the README section and run the price check**

Run: `node scripts/check-agreement.js`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add docs/agreement/office-routine.md README.md
git commit -m "Office routine: renewals, failed payments and cancellation examples"
```

### Task 4: Board change on monday.com

**Files:** none in the repository.

**Interfaces:**
- Consumes: `Signed on` and `Active` from Task 3; board id `18440849405` from `netlify/functions/submission-created.js`.

- [ ] **Step 1: Look at the board as it is**

Read the board's columns and status labels with the monday.com connector. If a signing-date column or an `Active` label already exists, use it and correct the routine document to its name.

- [ ] **Step 2: Add the `Signed on` date column and the `Active` status label**

Do not touch existing items or columns. `submission-created.js` sets only its own column ids, so new columns do not affect it.

- [ ] **Step 3: Verify**

Read the board again and confirm both exist and the item count is unchanged. The 35-day reminder is a monday.com automation; if the connector cannot create it, the routine document gives the owner the three clicks to add it and the final report says so.

- [ ] **Step 4: Push**

```bash
git push -u origin claude/ecstatic-mayer-vjyylt
```
