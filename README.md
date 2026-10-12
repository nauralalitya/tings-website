# tings website

static website for tings by biekin design. no build step: cloudflare pages serves these files as they are.

## pages
- `/` homepage (index.html)
- `/plan/` plan your space calculator
- `/project/#slug` project detail pages
- `/about/` and `/recognition/`

## add a new project
1. upload the main photo to `assets/img/projects/your-slug.jpg` (about 1800 px wide). for photos without a detail page, use `assets/img/works/`.
2. upload extra photos to `assets/img/gallery/your-slug-0.jpg`, `your-slug-1.jpg`, …
3. open `assets/js/data.js`:
   - add a line to `TINGS_WORKS` (homepage gallery) with name, loc, cat (`residential` or `commercial`), img, w, h (photo size in px) and slug.
   - add an entry to `TINGS_PROJECTS` with the story, facts and gallery list to give it a detail page.
4. commit. cloudflare pages redeploys in about a minute.

## leads
the plan your space form sends leads to the google apps script url inside `assets/js/plan.js` (search for `script.google.com`).
