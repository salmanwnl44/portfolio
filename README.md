# salmanwnl44.dev — portfolio

Personal portfolio for **Salman Ansari** — a single-page, dependency-free static site.
Content comes from my résumé and my GitHub profile.

## Run it

No build step. Open `index.html` directly, or serve the folder:

```bash
# from this directory
npx serve .
# or
python -m http.server 8080
```

## Structure

```
portfolio/
├── index.html                 # all content and markup
├── assets/
│   ├── styles.css             # design tokens + every style rule
│   ├── main.js                # marquee, scroll reveal, nav state, copy-email, GitHub stats
│   ├── portrait.jpg           # hero avatar (grayscale, colourises on hover)
│   ├── portrait-color.jpg     # spare colour portrait
│   └── Salman_Ansari_Resume.pdf
└── README.md
```

## Sections

`hero` → `stack` → `experience` (+ open source, education) → `projects` → `github` → `contact`

## Editing content

Everything is plain HTML — edit `index.html` directly.

| What | Where |
|------|-------|
| Name, handle, bio, status, location | `.hero` block |
| Social / résumé buttons | `.hero-actions` and `.contact-grid` |
| Skill pills | `.marquee-track` (two rows) and `.skill-grid` |
| Jobs, open-source work, education | `.timeline` blocks in `#experience` |
| Projects | `.project` cards in `#projects` |
| GitHub username | `GITHUB_USER` in `assets/main.js`, plus the `ghchart` image URL in `#github` |
| SEO / Open Graph / JSON-LD | `<head>` of `index.html` |

## Notes

- **Dark mode only**, by design — no theme toggle.
- The GitHub stat tiles (`public repos`, `building since`, `most used`) ship with static
  values and are refreshed at runtime from the public GitHub API when the section scrolls
  into view. If the API is rate-limited the static values stay on screen.
- The contribution graph image comes from `ghchart.rshah.org`.
- Respects `prefers-reduced-motion`: marquee, pulse and reveal animations all stop.
- Responsive breakpoints: 700px, 480px, 400px.

## Deploy

Static — drop the folder on any host.

- **GitHub Pages:** push to a repo, enable Pages on the branch root.
- **Vercel / Netlify:** import the repo, no build command, output directory `.`.

## Credit

Layout and design tokens follow the MIT-licensed design-system reference published at
[ig-imanish/manixh](https://github.com/ig-imanish/manixh) (manixh.dev), which is released
for exactly this purpose. All code here is written from scratch; all content is my own.
