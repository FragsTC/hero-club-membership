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

Landing → plan → add-ons → details → request received.

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

## Common changes

All of these are near the top of the `<script>` in `public/index.html`.

- **Prices, services, discounts, add-ons:** the `TIERS` object. `price` holds
  `[monthly, deposit]` for each home size. These must match the Hero Club door
  hanger.
- **Home sizes:** `HOME_SIZES`.
- **Landing photos:** add square images to `public/photos/` and list them in `PHOTOS`.
  With the list empty, drawn service icons show instead. Also add new files to
  the `SHELL` list in `sw.js` so they work offline.
- **Fallback email address:** `CONTACT_EMAIL`.

After changing anything, bump the `CACHE` name in `sw.js` (for example
`hero-club-v19` to `hero-club-v20`) so returning visitors get the new files.

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
