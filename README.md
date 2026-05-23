# CKH Portfolio

Static portfolio site. Project metadata lives in JSON; case study body copy lives in Markdown files. HTML is generated at build time.

## Adding or editing a project

1. Edit [`data/projects.json`](data/projects.json) — card title, tagline, meta, hero, etc.
2. Edit section Markdown under `content/{slug}/`:
   - `problem.md` — The Problem
   - `process.md` — The Process
   - `result.md` — The Result
   - `experience.md` — The Experience (optional; shown between Problem and Process)
   - `reference.md` — References (optional; shown after Result)
3. Add images under `assets/projects/{slug}/` and reference them in Markdown or `introGallery` in JSON.
4. Run:

```bash
npm install
npm run build
```

This updates `projects/{slug}.html` and the project cards in `index.html`.

```bash
npm run build:watch
```

## Writing section content (Markdown)

Paths in Markdown are relative to the generated page (`projects/{slug}.html`), so use:

```markdown
![Caption](../assets/projects/firebase-app/screenshot.jpg)
```

### Paragraphs and images

```markdown
First paragraph of text.

![Hardware prototype](../assets/projects/my-slug/photo-1.jpg)

Second paragraph after the image.

## Subtitle

- Bullet one
- Bullet two

Another paragraph.
```

| Markdown | Output |
|----------|--------|
| `##` / `###` | Subheadings inside the section |
| `- item` | Bullet list |
| `1. item` | Numbered list |
| `> quote` | Blockquote |
| `![alt](path)` | Image (clickable lightbox); on desktop, ~50% width so consecutive images sit side by side — see [docs/PROJECT-IMAGES.md](docs/PROJECT-IMAGES.md#內文圖並排桌面) |
| Pipe table (`\| col \|`) | Full-width table, columns evenly split |

Images in Markdown are wired into `window.lbImages` automatically. The hero image (index `0`) still comes from `hero` in JSON.

### Intro gallery (before The Problem)

To show a **two-column grid** of photos between the hero and the first section, add an `introGallery` array in `projects.json` (paths like `hero`, relative to `projects/{slug}.html`). Build emits `.process-images` / `.process-img-wrap` markup and registers each image in the lightbox after the hero.

See **[docs/PROJECT-IMAGES.md](docs/PROJECT-IMAGES.md)** for folder layout, Tea Sensory Lab example, build flow, and step-by-step instructions (Traditional Chinese).

### Tables

Markdown pipe tables are styled automatically: the build wraps each table in `.table-wrap`, injects `data-label` on cells from header text, and applies responsive CSS — **≥769px** full-width table; **481–768px** horizontal scroll with a minimum table width; **≤480px** stacked cards with column labels. No extra markup is required:

```markdown
| Species | Silhouette Base | Tea Types | Design Language |
|---------|-----------------|-----------|-----------------|
| Floral  | Circle          | Jasmine   | Soft, rounded   |
```

To customize **one** table, use HTML in the `.md` file (mixed with Markdown is fine).

**Custom column widths** — add `colgroup`:

```html
<table class="case-table case-table--custom">
<colgroup>
  <col style="width: 15%" />
  <col style="width: 20%" />
  <col style="width: 35%" />
  <col style="width: 30%" />
</colgroup>
<thead>
<tr><th>Species</th><th>Base</th><th>Types</th><th>Language</th></tr>
</thead>
<tbody>
<tr><td>Floral</td><td>Circle</td><td>Jasmine</td><td>Soft</td></tr>
</tbody>
</table>
```

**Narrower, centered table**:

```html
<div class="table-wrap table-wrap--narrow">
  <table class="case-table">...</table>
</div>
```

After editing `.md`, run `npm run build`. CSS-only changes need a browser refresh only.

## JSON fields (summary)

| Field | Purpose |
|-------|---------|
| `slug` | Output: `projects/{slug}.html` |
| `sections.problem` / `process` / `result` | Path to `.md` file, e.g. `content/firebase-app/process.md` |
| `sections.experience` | Optional. Path to `experience.md`; inserted after Problem, omitted when absent |
| `sections.reference` | Optional. Path to `reference.md`; shown after Result, omitted when absent |
| `featured` | Featured card on home page |
| `draft` | Logged at build time only |
| `title`, `cardDesc`, `tagline` | Titles and short descriptions |
| `hero` | Top hero image or placeholder |
| `introGallery` | Optional array of `{ src, alt }` — grid before Problem (see docs) |
| `meta.role`, `meta.timeline`, `meta.techStack` | Sidebar metadata |
| `links` | Array of `{ url, label, icon }` — `icon` is a preset (`github`, `figma`, `youtube`) or asset path relative to `projects/` (e.g. `../assets/icon/foo.svg`). Omit or use `[]` for no buttons. |

## Source files (edit these, not generated HTML)

- [`data/projects.json`](data/projects.json)
- [`content/{slug}/*.md`](content/)
- [`docs/PROJECT-IMAGES.md`](docs/PROJECT-IMAGES.md) — image folders, hero/card/gallery, build flow
- [`templates/project-detail.html`](templates/project-detail.html)
- [`templates/projects-grid.html`](templates/projects-grid.html)
- [`scripts/build-projects.mjs`](scripts/build-projects.mjs)

[`projects/_template.html`](projects/_template.html) is a human reference only.
