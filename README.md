# Hero Club membership page

A customer-facing page for choosing a Hero Club tier and sending a request to
Window Hero. Plain HTML, CSS and JavaScript with no build step: `index.html`
is the whole app.

Live at https://heroclub-membership.netlify.app (Netlify site
`heroclub-membership`).

## Files

| Path | What it is |
|---|---|
| `index.html` | The page: styles, markup and script in one file |
| `sw.js` | Offline support. Pages load fresh when online, from cache when not |
| `manifest.webmanifest`, `icons/` | Home-screen name and icons |
| `fonts/` | Barlow and Noto Sans (SIL Open Font License) |
| `photos/` | Landing-screen photos, 480px squares |

## Flow

Landing → tier → add-ons → details → request received.

Requests are posted to Netlify Forms (form name `hero-club-lead`). If that
fails or the phone is offline, a dialog offers to send the same details by
email instead.

## Common changes

All of these are near the top of the `<script>` in `index.html`.

- **Prices, services, discounts, add-ons:** the `TIERS` object. `price` holds
  `[monthly, deposit]` for each home size. These must match the Hero Club door
  hanger.
- **Home sizes:** `HOME_SIZES`.
- **Landing photos:** add square images to `photos/` and list them in `PHOTOS`.
  With the list empty, drawn service icons show instead. Also add new files to
  the `SHELL` list in `sw.js` so they work offline.
- **Fallback email address:** `CONTACT_EMAIL`.

After changing anything, bump the `CACHE` name in `sw.js` (for example
`hero-club-v12` to `hero-club-v13`) so returning visitors get the new files.

## Deploying

Drag this folder onto the Deploys tab of the `heroclub-membership` project in
Netlify, or deploy it with the Netlify CLI. Deploy the whole folder, not just
`index.html`.

Form detection must stay enabled on the Netlify project, and the form needs an
email notification set up in Netlify for requests to reach an inbox.

## Design

See `DESIGN.md` at the repo root for the brand tokens and the design decisions
behind this page.
