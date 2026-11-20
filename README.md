# Hero Club membership page

A customer-facing page for choosing a Hero Club tier and sending a request to
Window Hero. Plain HTML, CSS and JavaScript with no build step:
`public/index.html` is the whole app.

Live at https://heroclub-membership.netlify.app (Netlify site
`heroclub-membership`).

## Files

| Path | What it is |
|---|---|
| `public/index.html` | The page: styles, markup and script in one file |
| `public/sw.js` | Offline support. Pages load fresh when online, from cache when not |
| `public/manifest.webmanifest`, `public/icons/` | Home-screen name and icons |
| `public/fonts/` | Barlow and Noto Sans (SIL Open Font License) |
| `public/photos/` | Numbered files are landing tiles (480px squares). `plan-*.jpg` are the plan card photos and `bg-*.jpg` the page backgrounds |
| `netlify/functions/submission-created.js` | Adds each request to monday.com |
| `netlify.toml` | Tells Netlify to serve `public/` and where the function is |

## Flow

Landing → home size → plan → add-ons → details → request received.

Requests are posted to Netlify Forms (form name `hero-club-lead`). If that
fails or the phone is offline, a dialog offers to send the same details by
email instead.

## Where requests go

Each accepted request goes to three places:

1. **Netlify Forms**, under the `heroclub-membership` project.
2. **Email**, if a notification is set up on the form in Netlify.
3. **monday.com**, on the "Hero Club Requests" board. The function
   `submission-created.js` runs on every accepted submission and creates one
   item per request.

The monday.com step needs an environment variable on the Netlify project:
`monday_api_key` (or `MONDAY_API_TOKEN`), a monday.com API token that can add
items to the board. Set it for the production context and redeploy afterwards.
Without it the function logs a message and does nothing; the request is still
in Netlify Forms and the email still goes out. The board id and column ids are
at the top of the function. If a column is deleted or recreated on the board,
update its id there.

## Membership agreement

Signing and billing happen in ServiceMinder, not on this page. The documents
are in `docs/agreement/`:

| File | What it is |
|---|---|
| `hero-club-membership-agreement.md` | The agreement members sign. A draft until a lawyer has reviewed it |
| `lawyer-review-notes.md` | What to ask the lawyer, and the blanks to fill in |
| `serviceminder-setup.md` | Setting up the services, payment plans and proposals, with a test to run first |
| `office-routine.md` | Renewals, failed payments and cancellations |

Word copies of every document (agreement, referrals and the technician
scripts in `docs/sales/`) are together in `docs/hero-club-documents/`. The
`.md` files are the originals: after changing one, run
`sh scripts/make-word-copies.sh` to remake the Word copies.

The prices in those documents must match `TIERS` in `public/index.html`.
After changing a price, run `node scripts/check-agreement.js`; it fails and
names the figure if a document is out of step.

## Email templates

`email-templates/` holds the ServiceMinder email templates: the general
Window Hero set and fourteen for the Hero Club. `HERO-CLUB-EMAILS.md` there
says when to send each one and what to type in by hand; `HANDOFF.md` covers
the whole kit. Build with `python3 email-templates/build_emails.py`.

## Referrals

Referrals (a member who refers a neighbor gets a credit equal to the
neighbor's first monthly charge) are run by the office and is not part of this
page yet. A new customer tells Window Hero the name and street address of
the member who referred them, and the office matches the address in
ServiceMinder. The terms, messages and office steps are in
`docs/referrals/`.

An earlier version with referral links, a banner on this page and a link
maker page was built and then removed. It is in the git history at commit
`847dd6b` if it is wanted later.

## Common changes

All of these are near the top of the `<script>` in `public/index.html`.

- **Prices, services, discounts, add-ons:** the `TIERS` object. `price` holds
  `[monthly, down payment]` for each home size. The page and the agreement
  say "down payment"; the door hanger says "deposit" for the same amount. These must match the Hero Club door
  hanger.
- **Home sizes:** `HOME_SIZES`.
- **Landing photos:** add square images to `public/photos/` and list them in `PHOTOS`.
  With the list empty, drawn service icons show instead. Also add new files to
  the `SHELL` list in `sw.js` so they work offline.
- **Fallback email address:** `CONTACT_EMAIL`.

When replacing a photo, give the new file a new name (for example
`plan-gold-v3.jpg`) and update the reference. Phones keep photos they have
already downloaded, so a new file under an old name can go on showing the old
picture.

After changing anything, bump the `CACHE` name in `sw.js` (for example
`hero-club-v38` to `hero-club-v39`) so returning visitors get the new files.

## Deploying

Deploy this repository with the Netlify CLI, or connect it to the
`heroclub-membership` project in Netlify so every push to `main` deploys.
Dragging a folder onto the Deploys tab publishes the page but does not deploy
the monday.com function.

Form detection must stay enabled on the Netlify project, and the form needs an
email notification set up in Netlify for requests to reach an inbox.

## Design

See `DESIGN.md` for the Window Hero brand tokens and the design decisions
behind this page.
