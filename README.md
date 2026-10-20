# CivicPulse — Community Problem Reporting & Tracking

A website where people in a neighbourhood can report a problem, see what is
being done about it, and follow it until it is fixed.

**Everything is made with plain HTML, CSS and JavaScript.** No frameworks, no
animation libraries, no SVG, no canvas, no `IntersectionObserver`, no Web
Animations API. Just the things we have learned in class.

---

## 1. The pages

| Page | File | What it does |
|---|---|---|
| **Homepage** | `index.html` | The hero, how it works, the categories, the live list of reports with search and filters, the impact numbers and the community voices |
| **Report form** | `report.html` | Where somebody fills in the details of a problem and sends it in |
| **Track a report** | `track.html` | Where somebody types their reference code and sees what is happening with their report |
| **Admin dashboard** | `admin.html` | The review queue, where an official changes the status of a report and writes a reply |
| **Animation Lab** | `animation-lab.html` | A page that explains every animation used on the site |

### The files

```
civicpulse/
├── index.html
├── report.html
├── track.html
├── admin.html
├── animation-lab.html
├── assets/
│   ├── css/
│   │   ├── base.css        colours, fonts, buttons, header, footer, icons
│   │   ├── animations.css  all the animations
│   │   ├── app.css         how the homepage is put together
│   │   └── pages.css       the report form, tracker and dashboard
│   └── js/
│       ├── animations.js   the animation engine
│       ├── data.js         the list of reports
│       ├── app.js          the homepage (search, filters, votes)
│       └── pages.js        the form, the tracker and the dashboard
└── README.md
```

**14 files. No libraries. No build step.**

---

## 2. Running it

The site is just static files, so any of these work:

```bash
# open the file directly
xdg-open index.html

# or serve it locally (better, so nothing is blocked by the browser)
cd civicpulse
python3 -m http.server 8000
# then go to http://localhost:8000
```

---

## 3. The animations

### The one idea

The whole animation system works the same way everywhere:

1. **CSS hides the element.** Anything with `data-reveal` starts at `opacity: 0`
   and is pushed out of place with `transform`.
2. **JavaScript listens for scrolling.** It uses `getBoundingClientRect()` to
   see how far down the page each element is.
3. **When the element gets near the screen, JavaScript adds one class** —
   `el.classList.add("is-visible")`.
4. **CSS does the animating.** The `.is-visible` class moves the element back
   and the `transition` on the element makes it slide smoothly.

JavaScript never animates anything itself. It only adds and removes class
names, and the browser handles the movement. It is all DOM manipulation.

```html
<!-- the html -->
<h2 data-reveal="up" data-delay="2">Proof that showing up works</h2>
```

```css
/* the css */
.cp-motion [data-reveal="up"] { transform: translateY(40px); }
.cp-motion [data-reveal].is-visible { opacity: 1; transform: none; }
```

```javascript
/* the javascript */
if (item.getBoundingClientRect().top < window.innerHeight * 0.9) {
  item.classList.add("is-visible");
}
```

### The reveal types (14)

`fade`, `up`, `down`, `left`, `right`, `zoom`, `zoom-far`, `blur`, `blur-up`,
`flip`, `tilt`, `grow`, `rise`, `sweep`

### The other attributes

| Attribute | What it does |
|---|---|
| `data-delay="1..6"` | Waits 90ms extra for each step |
| `data-stagger="120"` | The children of the container each get 120ms more delay, so they come in one after another |
| `data-split="words"` / `"chars"` | JavaScript breaks the text into spans so each word or letter can move on its own |
| `data-count-to="12480"` | The number counts up when it scrolls into view. You can also use `data-count-prefix`, `data-count-suffix`, `data-count-decimals` and `data-count-duration` |
| `data-ripple` | A circle spreads out from the exact spot you clicked |
| `data-magnetic="0.35"` | The element drifts a little towards the mouse |
| `data-tilt="12"` | The card turns in 3D as the mouse moves across it |
| `data-glow` | A soft light follows the mouse inside the element |
| `data-parallax="0.18"` | The layer moves slower than the page when you scroll |
| `data-scramble="TEXT"` | The letters shuffle about and then settle on the real word |
| `data-typewriter` | The text types itself out, one letter at a time |
| `data-progress` | The bar at the top of the page that shows how far you have scrolled |
| `data-header` | The header gets a white background once you scroll |
| `data-nav-toggle` / `data-nav-links` | The button and the panel for the menu on a phone |

### The background layers

`.cp-aurora` (the slow green and gold blobs), `.cp-gradient-flow` (a gradient
that changes colour), `.cp-grid-overlay` (faint grid lines), `.cp-grain` (a dot
texture), `.cp-wave` (the waving flag divider), `.cp-marquee` (the ticker that
scrolls sideways) and `.cp-skeleton` (the grey loading placeholder).

### Things drawn without any images

| What | How |
|---|---|
| The icons | `.ico` classes — the shapes are made with `border-radius`, `clip-path` and `::before` / `::after` |
| The map | A street grid made with `repeating-linear-gradient`, a `conic-gradient` sweep and a pin made from `border-radius: 50% 50% 50% 0` |
| The round progress rings | A `conic-gradient` with a `::before` circle cut out of the middle |
| The little arrow on the select box | Three tiny `linear-gradient`s |
| The favicon | A small PNG saved as a data address |

### If the visitor does not want animations

`prefers-reduced-motion: reduce` is checked in **both** the CSS and the
JavaScript. When it is on, the reveals just appear and the background layers
stop moving.

### If JavaScript does not work

The page starts with `<html class="cp-motion">`, which is what makes the
content hidden before it appears. A small script in the `<head>` of every page
removes that class after 3 seconds if the animation script never loaded, so
the page is never left blank. The six starting reports are also written into
the HTML of the homepage, so the list still shows properly with JavaScript off.

---

## 4. The features

### Reporting a problem — `report.html`

Category, title, description, location, nearest landmark, photo and contact
details.

- Every field is checked when you leave it and again when you press send. A
  field that is wrong gets a red border and a message under it.
- There is a live counter under the description box.
- There is a small pin preview that updates as you type the location.
- The photo box lights up when you drag a file over it.
- When you send it, the report is saved and you are given a reference code
  like `CP-4824`, with a link to the tracking page for that report.

### Searching and filtering — `index.html`

- The search box looks through the title, the description and the location.
  There is a small delay so it does not redraw the list on every letter.
- The buttons filter by status: All, New, In review, In progress, Resolved.
- Search and filter work together.
- A message appears when nothing matches.
- There is a small box under the toolbar where you can type a reference code
  and go straight to that report.

### Tracking a report — `track.html`

- Type a code (or click one of the samples) to open a report.
- If the code is wrong you get a clear "we could not find that" message.
- The four step bar fills up as the report moves along.
- The history shows every update, with the status, the time and who posted it.
- You can add your support with one click.

### The admin dashboard — `admin.html`

- The numbers at the top show how many reports are in each status.
- The queue on the left lists every report. You can search it and filter it by
  status.
- Clicking a report opens it on the right, with the description, the details
  and the full activity trail.
- **Update the status** with one click. It gets written into the report's
  history, so the person who reported it can see it.
- **Post a response** — a note is added to the history without changing the
  status.

### The reports — `assets/js/data.js`

Every report is kept in one file, so the pages never disagree with each other.

```javascript
getReports()              // all the reports, newest first
findReport("CP-4821")     // find one by its code
addReport({...})          // add a new one
changeStatus(code, status, note, by)
addNote(code, note, by)   // a reply without changing the status
addVote(code)
countStatuses()           // how many in each status
resetReports()            // put everything back
```

The list is saved in `localStorage`, so a report you send is still there when
you come back. If the browser will not let us use `localStorage` the site
quietly falls back to the starting list and still works.

### The statuses

| Status | Meaning |
|---|---|
| New | Just sent in, nobody has looked at it yet |
| In Review | An official has picked it up and checked it |
| In Progress | The work has started |
| Resolved | It is fixed and has been checked |

The categories are Roads, Drainage, Waste, Streetlights, Safety and Facilities.

---

## 5. Responsive design

The layout uses Flexbox and CSS Grid, and the text sizes use `clamp()` so they
grow and shrink with the screen.

| Screen size | What changes |
|---|---|
| Big screen | Two column hero, six category cards across, three reports across, the dashboard has the queue and the detail side by side |
| Tablet | The hero stacks, the grids go to two columns, the dashboard stacks |
| Phone | Everything is one column and the menu becomes a button |

Checked on a 390px wide screen on all five pages: the page is exactly 390px
wide with no sideways scrolling.

---

## 6. What is not used, on purpose

- ❌ No SVG or SVG paths — the icons and graphics are all CSS.
- ❌ No `<canvas>`.
- ❌ No `IntersectionObserver` — the scroll code uses a `scroll` event and
  `getBoundingClientRect()`.
- ❌ No Web Animations API (`element.animate()`) — the movement is all CSS.
- ❌ No libraries — there is not a single link to a CDN.
- ❌ No build step and no npm.

---

## 7. What I would do next

1. Connect a database (Supabase) so the reports are saved for everybody and an
   official can log in.
2. Add real photo uploads.
3. Put the site online with Netlify.
4. Put a real map pin on the map using latitude and longitude.
5. Send an email or a text when a report changes status.

---

## 8. Testing

| Check | Result |
|---|---|
| `node --check` on all four JavaScript files | Pass |
| End to end test (30 checks across all five pages) | 30 / 30 pass, no errors in the console |
| Functional test (filter, search, empty message, mobile menu, reduced motion, no JavaScript) | Pass |
| Sideways scrolling on a 390px screen, all five pages | None |
| Errors in the browser console on every page | None |
| SVG, canvas, `IntersectionObserver` or `element.animate()` in the code | None |

---

*Project by Pinmo Paul — Group A, Front End Development Track.*
