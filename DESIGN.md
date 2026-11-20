# Window Hero design language

This file records the Window Hero brand tokens and the decisions made when the
Hero Club membership page was built on them. Read it before designing or
restyling any Window Hero surface.

**Source of truth:** the "Window Hero" design system on claude.ai, installed in
the "Hero Club Door Hanger" design canvas (`project/ds/windowhero/tokens.json`).
The values below were copied from that file. If the two ever disagree, the
design system wins and this file should be updated.

**What has been checked against it:** the Hero Club membership page in this
repository. Other Window Hero apps have not been reviewed against this file.

## Brand tokens

### Colour

| Token | Value | Use |
|---|---|---|
| `brave-navy` | `#003b64` | Dark grounds. Headlines and body copy on white or mighty-gray. The default ink. |
| `iconic-indigo` | `#0075aa` | Supporting blue for blocks and secondary text on white. Do not set it on brave-navy (2.3:1). |
| `perfect-day-yellow` | `#fcaf17` | Accent. Headline words on brave-navy, primary actions. Never text on white (1.9:1). Never a background behind the logo. |
| `sidekick-blue` | `#009bd8` | Headline accent, large or bold text only. Not for body copy. |
| `mighty-gray` | `#dfe5ee` | Light tint ground. Text on brave-navy (9.2:1). |
| `white` | `#ffffff` | Page ground. Text on brave-navy (11.6:1). |

### Type

| Role | Face | Notes |
|---|---|---|
| Display | Barlow, fallback Tahoma | Headlines, prices, tier names, buttons |
| Body | Noto Sans, fallback Tahoma | Everything else |

Both faces are under the SIL Open Font License and can be bundled.

The brand headline is a pairing, not one style:

- **Emphasis:** Barlow Bold, all caps.
- **Connecting words:** Barlow Medium Italic, sentence case.

Example: *Welcome to the* **HERO CLUB**.

Other styles from the design system: callout is Barlow Bold Italic 22px; body
is Noto Sans 16/24; caption is Noto Sans 12/16.

### Spacing and radius

The brand guide defines neither. The design system offers starting values
only: spacing 4, 8, 16, 32px; radius 4px (tags), 8px (cards, buttons), and a
full pill.

## Hero Club membership page

Source in this repository. Live at https://heroclub-membership.netlify.app.

A phone-first page read by the customer, usually after scanning the QR code on
the Hero Club door hanger. Five screens: landing, tier, add-ons, details, and
"Request received".

### Decisions

- **It speaks to the customer.** "Your details", "Send my request", "Request
  received". The final screen says Window Hero will reach out to confirm; it
  never implies the customer has already joined or paid.
- **Dark theme.** Surfaces are brave-navy taken down toward black, so light has
  something to sit on. They are derived values, not new brand colours:
  page `#00111d`, card `#001d31`, raised `#002a47`, field `#00172a`.
- **One light source, the same for every tier.** The selected tier card sits in
  a lit shell: white across the top, perfect-day-yellow down the left,
  sidekick-blue down the right. The top stays white so the tier name always has
  the same background. The same lit edge marks selected add-ons, the order
  summary and the email dialog.
- **Colour roles.** White marks the selected tier and nothing else. Yellow
  means action, offer or confirmation: the primary button, the discount pill,
  check marks and the "received" mark. The primary button is solid yellow with
  navy text, with no gradient and no coloured glow.
- **Tier metals appear only in the medal icon.** Bronze `#d08a4a` and a cool
  silver `#b9c4d3` are not brand colours.
- **Secondary text is mighty-gray**; tertiary text is `#9db3c7`. Both pass
  4.5:1 on every dark surface.
- **Layout.** On phones one tier shows at a time, chosen by a three-way switch
  or a sideways swipe, with the main button fixed at the bottom. From 760px up
  all three tiers sit side by side and the button follows the content. On the
  details screen the button always sits at the end of the form, so it never
  covers a field.
- **Home size is asked once, above the tiers,** because it is a fact about the
  house and it sets every price. There are three choices and none is
  preselected.
- **Landing.** Rows of square photo tiles drift in opposite directions and fade
  into navy, above the headline *It's time to be the* HERO OF YOUR HOME.
- **Photography runs through every screen.** Each plan card opens with a photo,
  with its pills laid over it. The add-ons, details and confirmation screens
  sit over a soft, darkened photo that fades into navy. Later screens should
  never fall back to plain boxes on a flat background.
- **The details form is in short titled groups** (About you, Your home,
  Anything else?), each on its own card.
- **Motion.** The price rolls to its new value; the tier thumb and card slide;
  screens slide forward and back; an add-on's plus turns into a check; the
  landing tiles drift. All of it is disabled under `prefers-reduced-motion`.

### Departures from the design system

- **Radius.** Cards use 34px and controls are full pills, well past the 8px
  starting value. The system does not fix radii, and the lit-shell card depends
  on round corners.
- **The Hero Club logo** is the white lockup carried over from the original
  page. Official files are in SharePoint under Marketing Library, Brand Logos,
  Hero Club Logos.

### Photos

The twelve landing photos come from the Window Hero SharePoint Marketing
Library: four from Brand Photo Shoots 1 and 3, eight from Favorite Corporate
Photos. Use only Window Hero's own photos. Avoid any that show a house number,
a licence plate, another location's phone number, or a customer's face.

### Content rules

- Prices, deposits, discounts and inclusions come from the Hero Club door
  hanger. Do not change them here without changing the hanger.
- Prices are quoted for two home sizes: up to 2,500 sq ft and 2,501 to
  3,500 sq ft. Homes over 3,500 sq ft get a custom plan: the page shows
  "Custom plan" instead of a price and says Window Hero will give the price
  when it reaches out.
- The customer must choose a home size before continuing; no size is
  preselected, so nobody is shown a price that is not theirs.
- Add-ons are not priced on the page. The customer is told Window Hero will
  give a price when it reaches out to confirm the plan and schedule.
- The page says "plan" for Bronze, Silver and Gold, and "membership" for
  Hero Club as a whole. It does not say "tier".
- The confirmation promises contact within 1 business day. Change it on the
  page if that stops being true.
- Never invent prices, claims or testimonials.
