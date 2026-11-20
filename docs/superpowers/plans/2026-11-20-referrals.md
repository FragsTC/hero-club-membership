# Hero Club Referrals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A member's link or card puts their name on the neighbor's signup request, and the office has what it needs to give both their month.

**Architecture:** The referral code is the member's name in the link (`?ref=sarah-m`). One small shared script turns codes into names and names into codes; the signup page and a new office link-maker page both use it. The existing Netlify function passes the referrer's name to a new monday.com column. Credits are applied by hand in ServiceMinder.

**Tech Stack:** Plain HTML, CSS and JavaScript with no build step (as the rest of the site). `node:test` for unit tests, Playwright for page tests, the monday.com connector for board columns, a vendored MIT QR encoder.

**Spec:** `docs/superpowers/specs/2026-11-20-referrals-design.md`

## Global Constraints

- No build step, no framework, no new runtime dependency loaded from another site.
- Follow `DESIGN.md`: brave-navy, perfect-day-yellow, Barlow and Noto Sans, the fonts already in `public/fonts/`.
- An ordinary signup with no referral must behave exactly as it does today.
- Reward wording, everywhere: the new member's twelfth month is free; the referrer gets a credit equal to the new member's monthly charge, up to one month of their own plan; it counts once the new member has paid the down payment and first monthly charge.
- Customer-facing copy says "you each get a month free" only next to a link to the referral terms.
- Anything from the link is untrusted: it reaches the page only through `textContent` and form values, never `innerHTML`.
- No member names stored in the repository.
- After changing files under `public/`, bump `CACHE` in `public/sw.js`.

## Review Focus

- A link with a hostile or malformed `ref` (markup, very long, empty, unicode): no banner, no error, signup works.
- A referred visitor reloads or returns later in the same browser session: the referral is still attached.
- A referred visitor on a phone with no connection uses the email fallback: the referrer is in the email.
- Two members with the same first name and initial: codes stay distinct (`sarah-m`, `sarah-m2`) and both display as "Sarah M."
- Opening `/refer.html` or `/referral-terms.html` must not replace the cached signup page in the service worker.

---

### Task 1: Referral codes

**Files:** Create `public/referral.js`, `tests/referral.test.js`.

**Interfaces:** Produces a global `HeroReferral` (also `module.exports` under Node) with:
- `nameFromCode(code: string): string` — display name, or `''` if the code is not valid.
- `codeFromName(fullName: string, number?: number): string` — `''` if no usable name.
- `linkFor(origin: string, code: string): string`.

- [ ] Write `tests/referral.test.js` with `node:test`: `nameFromCode('sarah-m') === 'Sarah M.'`; `'mary-ann-k2'` gives `'Mary Ann K.'`; `'SARAH-M'` gives `'Sarah M.'`; each of `''`, `null`, `'sarah'`, `'-m'`, `'sarah-'`, `'<script>-x'`, `'sarah m'`, a 60-character code, `'sarah-mm'` gives `''`. `codeFromName('Sarah Mitchell') === 'sarah-m'`; `codeFromName('  mary ann   Keller ', 2) === 'mary-ann-k2'`; `codeFromName("Seán O'Brien") === 'sean-o'`; `codeFromName('Cher') === ''`; `nameFromCode(codeFromName('Sarah Mitchell', 3)) === 'Sarah M.'`. `linkFor('https://x.test', 'sarah-m') === 'https://x.test/?ref=sarah-m'`.
- [ ] Run `node --test tests/` and see it fail.
- [ ] Implement. A valid code is 3 to 40 characters matching `^[a-z]+(-[a-z]+)*-[a-z]\d{0,3}$` after lower-casing: one or more name parts, then a single-letter initial with an optional number.
- [ ] Run `node --test tests/`: pass. Commit.

### Task 2: Signup page

**Files:** Modify `public/index.html`, `public/sw.js`. Create `tests/signup-referral.e2e.js`, `tests/serve.js` (a static server for `public/` on a free port).

**Interfaces:** Consumes `HeroReferral.nameFromCode`. Produces a form field `referred-by` whose value is `'Sarah M. (link: sarah-m)'`, `'<typed text> (typed)'`, or empty.

- [ ] Write the Playwright test, driving the real flow to the details screen and intercepting the form POST. Cases: no `ref` → no banner, the "Did a Hero Club member refer you?" field is visible, POST has `referred-by=` empty; `?ref=sarah-m` → banner text contains `Sarah M. sent you` and `You each get a month free`, the typed field is hidden, POST has `referred-by=Sarah M. (link: sarah-m)`; `?ref=%3Cscript%3E` and `?ref=` → no banner, no page error; typed `Jane Doe` → `Jane Doe (typed)`; `?ref=sarah-m` then reload without the query → still attached; forced POST failure → the email fallback body contains `Referred by: Sarah M.`.
- [ ] Run `node tests/signup-referral.e2e.js`: fail.
- [ ] Implement: load `referral.js`; read `ref` once at start and keep the code in `sessionStorage` (try/catch); a banner element on the landing and details screens with a link to `referral-terms.html`; a hidden `referred-by` input in the form; an optional visible input with no `name`; set the hidden value in `submitLead`; add the line to `buildMessage`.
- [ ] In `sw.js`: add `referral.js` to `SHELL`; cache a navigation response as `./` only when the request path is the site root; bump `CACHE` to `hero-club-v39`.
- [ ] Run both test commands: pass. Commit.

### Task 3: Board and function

**Files:** Modify `netlify/functions/submission-created.js`. Create `tests/submission.test.js`.

- [ ] With the monday.com connector add three text columns to board `18440849405`: `Referred by`, `Referral code`, `Referral credit`. Record the new ids.
- [ ] Write the test: `buildColumnValues({ 'referred-by': ' Sarah M. (link: sarah-m) ' })[<Referred by id>] === 'Sarah M. (link: sarah-m)'`; with the field absent the key is absent; existing keys unchanged for a full sample submission.
- [ ] Run `node --test tests/`: fail. Add `referredBy` to `COL` and set it only when non-empty. Pass. Commit.

### Task 4: Link maker and terms pages

**Files:** Create `public/refer.html`, `public/referral-terms.html`, `public/vendor/qrcode.js` (qrcode-generator, MIT, with its licence header), `tests/refer.e2e.js`.

- [ ] Write the Playwright test: on `/refer.html`, typing `Sarah Mitchell` shows the link `<origin>/?ref=sarah-m` and a QR canvas with dark pixels; setting the number to 2 gives `sarah-m2`; typing `Cher` shows the message asking for a first and last name and no link; the message-to-send text contains the link. `/referral-terms.html` contains `twelfth` and `first monthly charge`. Run: fail.
- [ ] Build both pages in the site's design language. `refer.html` has `<meta name="robots" content="noindex">` and is not linked from the signup page. The terms page states every rule in the spec's Rules section.
- [ ] Run: pass. Commit.

### Task 5: Documents

**Files:** Create `docs/referrals/referral-terms.md`, `docs/referrals/messages.md`, `docs/referrals/office-steps.md` and Word copies under `docs/referrals/word/`. Modify `README.md`, `docs/agreement/office-routine.md` (one line in the weekly check).

- [ ] Write them. `office-steps.md`: issuing a link when a member goes Active (and recording `Referral code`), checking a referral (referrer active, household new, down payment and first charge paid), applying the referrer's credit and noting the new member's twelfth-month credit in `Referral credit`, with the ServiceMinder clicks marked as not yet confirmed. `messages.md`: the ask after a visit, the link message, "you earned a month", and the card wording.
- [ ] Run `node scripts/check-agreement.js` and both test commands: pass. Commit and push.
