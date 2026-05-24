import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

marked.setOptions({ gfm: true, breaks: false });

const REQUIRED_FIELDS = [
  "id",
  "slug",
  "category",
  "title",
  "metaDescription",
  "cardDesc",
  "techStackInline",
  "tagline",
];

const REQUIRED_SECTION_KEYS = ["problem", "process", "result"];
const OPTIONAL_SECTION_KEYS = ["experience", "reference"];

const GITHUB_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>`;

const FIGMA_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 2a4 4 0 0 0 0 8h4V2H8zM12 2v8h4a4 4 0 0 0 0-8h-4zM8 14a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM8 10a4 4 0 0 0 0 8v-8zM16 10a4 4 0 0 0 0 8 4 4 0 0 0 0-8z"/>
              </svg>`;

/** Paths relative to projects/*.html */
const LINK_ICON_PRESETS = {
  github: { kind: "svg", markup: GITHUB_SVG },
  figma: { kind: "svg", markup: FIGMA_SVG },
  youtube: { kind: "img", src: "../assets/icon/YT-icon-black.svg" },
};

const LEGACY_LINK_PRESETS = {
  github: { label: "View GitHub repository", icon: "github" },
  figma: { label: "View Figma prototype", icon: "figma" },
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseAttr(attrs, name) {
  const re = new RegExp(`${name}=["']([^"']*)["']`, "i");
  const m = attrs.match(re);
  return m ? m[1] : "";
}

/** Encode filename segment so paths with spaces work in HTML and lightbox. */
function encodeAssetPath(src) {
  if (!src) return src;
  const slash = src.lastIndexOf("/");
  if (slash === -1) return encodeURIComponent(src);
  return `${src.slice(0, slash + 1)}${encodeURIComponent(src.slice(slash + 1))}`;
}

function assetPathFromSrc(src) {
  if (!src || typeof src !== "string") return null;
  const normalized = src.replace(/^\.\.\//, "");
  return join(ROOT, normalized);
}

function loadSectionMarkdown(ref, slug) {
  if (!ref || typeof ref !== "string") {
    throw new Error(`Project "${slug}" section reference must be a non-empty string`);
  }
  if (ref.endsWith(".md")) {
    const filePath = join(ROOT, ref);
    if (!existsSync(filePath)) {
      throw new Error(`Project "${slug}" missing markdown file: ${ref}`);
    }
    return readFileSync(filePath, "utf8");
  }
  return ref;
}

function wrapImageForLightbox(attrs, index) {
  const alt = parseAttr(` ${attrs}`, "alt") || "View full size image";
  const label = escapeHtml(alt);
  return `<div class="case-content-img-wrap"
                onclick="openLightbox(${index})"
                role="button"
                tabindex="0"
                aria-label="${label}"
                onkeydown="if(event.key==='Enter')openLightbox(${index})"
              ><img ${attrs} loading="lazy" /></div>`;
}

function enhanceHtmlWithLightbox(html, lightboxImages, nextIndexRef) {
  let out = html.replace(/<p>\s*(<img[^>]*>)\s*<\/p>/gi, "$1");

  out = out.replace(/<img\b([^>]*)>/gi, (_full, attrsPart) => {
    const attrs = attrsPart.trim();
    const src = parseAttr(` ${attrs}`, "src");
    const alt = parseAttr(` ${attrs}`, "alt");
    const index = nextIndexRef.value++;
    const encodedSrc = src ? encodeAssetPath(src) : null;
    lightboxImages.push({ src: encodedSrc, alt: alt || "" });
    const attrsWithSrc = src
      ? attrs.replace(/src=(["'])([^"']*)\1/i, `src=$1${encodedSrc}$1`)
      : attrs;
    return wrapImageForLightbox(attrsWithSrc, index);
  });

  return out;
}

function stripHtmlTags(html) {
  return String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function injectTableDataLabels(tableHtml) {
  const theadMatch = tableHtml.match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/i);
  if (!theadMatch) return tableHtml;

  const labels = [...theadMatch[1].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map((m) =>
    stripHtmlTags(m[1])
  );
  if (labels.length === 0) return tableHtml;

  return tableHtml.replace(/<tbody\b[^>]*>[\s\S]*?<\/tbody>/i, (tbodyBlock) =>
    tbodyBlock.replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi, (row) => {
      let col = 0;
      return row.replace(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi, (cellFull, attrs, content) => {
        if (/\bdata-label\s*=/.test(attrs)) {
          col += 1;
          return cellFull;
        }
        const label = labels[col] ?? "";
        col += 1;
        const attrsTrimmed = attrs.trim();
        const attrPrefix = attrsTrimmed ? ` ${attrsTrimmed}` : "";
        return `<td${attrPrefix} data-label="${escapeHtml(label)}">${content}</td>`;
      });
    })
  );
}

/** Wrap bare tables for horizontal scroll; inject data-label for mobile card layout. */
function enhanceTables(html) {
  const placeholders = [];
  let placeholderIndex = 0;

  const withoutPreWrapped = html.replace(
    /<div class="table-wrap(?:\s[^"]*)?">\s*([\s\S]*?)\s*<\/div>/gi,
    (block) => {
      const key = `__TABLE_WRAP_PH_${placeholderIndex}__`;
      placeholders.push({ key, block });
      placeholderIndex += 1;
      return key;
    }
  );

  let out = withoutPreWrapped.replace(/<table\b[\s\S]*?<\/table>/gi, (tableHtml) => {
    const withLabels = injectTableDataLabels(tableHtml);
    return `<div class="table-wrap">\n${withLabels}\n</div>`;
  });

  for (const { key, block } of placeholders) {
    const inner = block.replace(
      /^<div class="table-wrap(?:\s[^"]*)?">\s*([\s\S]*?)\s*<\/div>$/i,
      "$1"
    );
    const tableMatch = inner.match(/<table\b[\s\S]*?<\/table>/i);
    if (tableMatch) {
      const enhanced = injectTableDataLabels(tableMatch[0]);
      out = out.replace(key, block.replace(tableMatch[0], enhanced));
    } else {
      out = out.replace(key, block);
    }
  }

  return out;
}

/** Unwrap invalid <p><div>… and group consecutive wraps for two-column layout. */
function groupConsecutiveContentImages(html) {
  const out = html.replace(
    /<p>\s*((?:<div class="case-content-img-wrap"[\s\S]*?<\/div>\s*)+)<\/p>/gi,
    "$1"
  );

  const wrapBlockRe = new RegExp(
    '(?:<div class="case-content-img-wrap"[^>]*>[\\s\\S]*?</div>\\s*)+',
    "g"
  );
  const singleWrapRe = new RegExp(
    '<div class="case-content-img-wrap"[^>]*>[\\s\\S]*?</div>',
    "g"
  );
  return out.replace(wrapBlockRe, (block) => {
    if (block.includes("case-content-images")) return block;
    const wraps = block.match(singleWrapRe) || [];
    if (wraps.length < 2) return block;
    return `<div class="case-content-images">\n${wraps.join("\n")}\n</div>\n`;
  });
}

function renderSectionHtml(ref, slug, lightboxImages, nextIndexRef) {
  const md = loadSectionMarkdown(ref, slug);
  const rawHtml = marked.parse(md);
  const withLightbox = enhanceHtmlWithLightbox(String(rawHtml).trim(), lightboxImages, nextIndexRef);
  const withTables = enhanceTables(withLightbox);
  return groupConsecutiveContentImages(withTables);
}

function renderIntroGallery(gallery, lightboxImages, nextIndexRef) {
  if (!Array.isArray(gallery) || gallery.length === 0) return "";

  const cells = gallery.map((item) => {
    const rawSrc = item.src;
    const src = escapeHtml(encodeAssetPath(rawSrc));
    const alt = escapeHtml(item.alt || "Project photo");
    const index = nextIndexRef.value++;
    lightboxImages.push({ src: encodeAssetPath(rawSrc), alt: item.alt || "" });
    return `              <div
                class="process-img-wrap"
                onclick="openLightbox(${index})"
                role="button"
                tabindex="0"
                aria-label="${alt}"
                onkeydown="if(event.key==='Enter')openLightbox(${index})"
              ><img src="${src}" alt="${alt}" loading="lazy" /></div>`;
  });

  return `          <div class="process-images intro-gallery" aria-label="Project gallery">
${cells.join("\n")}
          </div>

`;
}

function renderCardImage(image) {
  if (!image) {
    return `<div class="card-image-placeholder" style="background:#e8eaf4;">IMAGE PLACEHOLDER</div>`;
  }
  if (image.src) {
    const alt = escapeHtml(image.alt || "");
    const src = escapeHtml(encodeAssetPath(image.src));
    return `<img src="${src}" alt="${alt}" loading="lazy" />`;
  }
  const bg = escapeHtml(image.placeholderBg || "#e8eaf4");
  return `<div class="card-image-placeholder" style="background:${bg};">IMAGE PLACEHOLDER</div>`;
}

function renderHeroInner(image) {
  if (!image) {
    return `<div class="img-placeholder" style="background:#1a1a2e;">HERO IMAGE PLACEHOLDER</div>`;
  }
  if (image.src) {
    const alt = escapeHtml(image.alt || "");
    const src = escapeHtml(encodeAssetPath(image.src));
    return `<img src="${src}" alt="${alt}" width="960" height="540" loading="lazy" />`;
  }
  const bg = escapeHtml(image.placeholderBg || "#1a1a2e");
  return `<div class="img-placeholder" style="background:${bg};">HERO IMAGE PLACEHOLDER</div>`;
}

function renderTechStackList(items) {
  return (items || [])
    .map((item) => `                <li>${escapeHtml(item)}</li>`)
    .join("\n");
}

function normalizeProjectLinks(links) {
  if (Array.isArray(links)) return links.filter((item) => item?.url);
  if (!links || typeof links !== "object") return [];
  return Object.entries(LEGACY_LINK_PRESETS)
    .filter(([key]) => links[key])
    .map(([key, preset]) => ({
      url: links[key],
      label: preset.label,
      icon: preset.icon,
    }));
}

function resolveLinkIconMarkup(icon) {
  const key = String(icon || "").toLowerCase();
  const preset = LINK_ICON_PRESETS[key];
  if (preset?.kind === "svg") return preset.markup;
  if (preset?.kind === "img") {
    const src = escapeHtml(encodeAssetPath(preset.src));
    return `<img src="${src}" alt="" width="20" height="20" loading="lazy" aria-hidden="true" />`;
  }
  if (icon && typeof icon === "string") {
    const src = escapeHtml(encodeAssetPath(icon));
    return `<img src="${src}" alt="" width="20" height="20" loading="lazy" aria-hidden="true" />`;
  }
  throw new Error(`Link icon must be a preset (${Object.keys(LINK_ICON_PRESETS).join(", ")}) or an asset path`);
}

function renderMetaLink(link) {
  const href = escapeHtml(link.url);
  const label = escapeHtml(link.label || "External link");
  const iconMarkup = resolveLinkIconMarkup(link.icon);
  return `<a href="${href}" class="icon-btn" target="_blank" rel="noopener noreferrer" aria-label="${label}">
              ${iconMarkup}
            </a>`;
}

function renderMetaLinks(links) {
  const items = normalizeProjectLinks(links);
  if (items.length === 0) return "";
  return items.map(renderMetaLink).join("\n            ");
}

function renderOptionalSection(ref, slug, lightboxImages, nextIndexRef, { labelId, label, sectionClass = "" }) {
  if (!ref) return "";
  const html = renderSectionHtml(ref, slug, lightboxImages, nextIndexRef);
  const sectionClasses = ["case-section", sectionClass].filter(Boolean).join(" ");
  return `          <section class="${sectionClasses}" aria-labelledby="${labelId}">
            <p class="section-label" id="${labelId}">${label}</p>
            <div class="case-content">
              ${html}
            </div>
          </section>

`;
}

function renderMetaActionsCol(links) {
  const buttons = renderMetaLinks(links);
  if (!buttons) return "";
  return `          <div class="meta-col meta-col--actions">
            <div class="meta-actions">
            ${buttons}
            </div>
          </div>`;
}

function renderMetaPeekHtml(project) {
  const role = escapeHtml(project.meta.role);
  const timeline = escapeHtml(project.meta.timeline);
  const linkCount = normalizeProjectLinks(project.links).length;
  let text = `${role} &middot; ${timeline}`;
  if (linkCount > 0) {
    const label = linkCount === 1 ? "1 link" : `${linkCount} links`;
    text += ` &middot; ${label}`;
  }
  return text;
}

function renderLightboxJson(lightbox) {
  return JSON.stringify(lightbox || [], null, 2).replace(/\n/g, "\n    ");
}

function interpolate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (data[key] === undefined || data[key] === null) return "";
    return String(data[key]);
  });
}

function renderEachBlocks(template, data) {
  const eachRegex = /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  return template.replace(eachRegex, (_, listKey, block) => {
    const list = data[listKey];
    if (!Array.isArray(list)) return "";
    return list
      .map((item) => {
        let rendered = block;
        rendered = rendered.replace(
          /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
          (__, ifKey, ifBlock) => (item[ifKey] ? ifBlock : "")
        );
        return interpolate(rendered, item);
      })
      .join("");
  });
}

function renderTemplate(template, data) {
  let out = renderEachBlocks(template, data);
  out = interpolate(out, data);
  return out;
}

function validateProjects(projects) {
  const slugs = new Set();
  for (const p of projects) {
    for (const field of REQUIRED_FIELDS) {
      if (p[field] === undefined || p[field] === null || p[field] === "") {
        throw new Error(`Project "${p.slug || p.id || "unknown"}" missing required field: ${field}`);
      }
    }
    if (slugs.has(p.slug)) {
      throw new Error(`Duplicate slug: ${p.slug}`);
    }
    slugs.add(p.slug);
    const expectedHref = `./projects/${p.slug}.html`;
    if (p.href && p.href !== expectedHref) {
      throw new Error(`Project "${p.slug}" href must be ${expectedHref} or omitted`);
    }
    for (const key of REQUIRED_SECTION_KEYS) {
      const ref = p.sections?.[key];
      if (!ref) {
        throw new Error(`Project "${p.slug}" missing sections.${key}`);
      }
      loadSectionMarkdown(ref, p.slug);
    }
    for (const key of OPTIONAL_SECTION_KEYS) {
      const ref = p.sections?.[key];
      if (ref) loadSectionMarkdown(ref, p.slug);
    }
    if (!p.meta?.role || !p.meta?.timeline || !Array.isArray(p.meta?.techStack)) {
      throw new Error(`Project "${p.slug}" missing meta.role, meta.timeline, or meta.techStack`);
    }
  }
}

function warnMissingAsset(projectSlug, label, src) {
  const path = assetPathFromSrc(src);
  if (path && !existsSync(path)) {
    console.warn(`  [warn] ${projectSlug}: missing ${label} file at ${path}`);
  }
}

function buildDetailContext(project) {
  const heroSrc = project.hero?.src || null;
  const lightboxImages = [
    {
      src: heroSrc ? encodeAssetPath(heroSrc) : null,
      alt: project.hero?.alt || `${project.title} hero`,
    },
  ];
  const nextIndexRef = { value: 1 };

  if (heroSrc) warnMissingAsset(project.slug, "hero", heroSrc);
  if (project.cardImage?.src) warnMissingAsset(project.slug, "cardImage", project.cardImage.src);
  if (Array.isArray(project.introGallery)) {
    for (const item of project.introGallery) {
      warnMissingAsset(project.slug, "introGallery", item.src);
    }
  }

  const introGalleryHtml = renderIntroGallery(
    project.introGallery,
    lightboxImages,
    nextIndexRef
  );

  const sectionHtml = {};
  for (const key of REQUIRED_SECTION_KEYS) {
    sectionHtml[`${key}Html`] = renderSectionHtml(
      project.sections[key],
      project.slug,
      lightboxImages,
      nextIndexRef
    );
  }

  const experienceSectionHtml = renderOptionalSection(
    project.sections?.experience,
    project.slug,
    lightboxImages,
    nextIndexRef,
    { labelId: "label-experience", label: "The Experience" }
  );

  const referenceSectionHtml = renderOptionalSection(
    project.sections?.reference,
    project.slug,
    lightboxImages,
    nextIndexRef,
    { labelId: "label-reference", label: "References", sectionClass: "case-section--reference" }
  );

  return {
    title: project.title,
    metaDescription: project.metaDescription,
    category: project.category,
    tagline: project.tagline,
    heroHtml: renderHeroInner(project.hero),
    introGalleryHtml,
    problemHtml: sectionHtml.problemHtml,
    experienceSectionHtml,
    processHtml: sectionHtml.processHtml,
    resultHtml: sectionHtml.resultHtml,
    referenceSectionHtml,
    metaRole: project.meta.role,
    metaTimeline: project.meta.timeline,
    techStackListHtml: renderTechStackList(project.meta.techStack),
    metaActionsColHtml: renderMetaActionsCol(project.links),
    metaPeekHtml: renderMetaPeekHtml(project),
    lightboxJson: renderLightboxJson(lightboxImages),
  };
}

function buildCardContext(project) {
  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    cardDesc: project.cardDesc,
    techStackInline: project.techStackInline,
    featured: !!project.featured,
    cardImageHtml: renderCardImage(project.cardImage),
  };
}

function injectBetweenMarkers(content, startMarker, endMarker, replacement) {
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Markers not found in index.html: ${startMarker} / ${endMarker}`);
  }
  const before = content.slice(0, start + startMarker.length);
  const after = content.slice(end);
  const inner = "\n" + replacement.replace(/^\s*\n/, "\n") + "\n\n        ";
  return before + inner + after;
}

function main() {
  const dataPath = join(ROOT, "data", "projects.json");
  const detailTplPath = join(ROOT, "templates", "project-detail.html");
  const gridTplPath = join(ROOT, "templates", "projects-grid.html");
  const indexPath = join(ROOT, "index.html");
  const projectsDir = join(ROOT, "projects");

  const { projects } = JSON.parse(readFileSync(dataPath, "utf8"));
  validateProjects(projects);

  const detailTpl = readFileSync(detailTplPath, "utf8");
  const gridTpl = readFileSync(gridTplPath, "utf8");

  mkdirSync(projectsDir, { recursive: true });

  let written = 0;
  for (const project of projects) {
    const html = renderTemplate(detailTpl, buildDetailContext(project));
    const outPath = join(projectsDir, `${project.slug}.html`);
    writeFileSync(outPath, html, "utf8");
    written++;
    const draftNote = project.draft ? " (draft)" : "";
    console.log(`  projects/${project.slug}.html${draftNote}`);
  }

  const published = projects.filter((p) => !p.draft);
  const gridItems = published.map((p) => buildCardContext(p));
  const gridHtml = renderTemplate(gridTpl, { projects: gridItems });

  let indexContent = readFileSync(indexPath, "utf8");
  indexContent = injectBetweenMarkers(
    indexContent,
    "<!-- BUILD:PROJECTS_START -->",
    "<!-- BUILD:PROJECTS_END -->",
    gridHtml
  );
  writeFileSync(indexPath, indexContent, "utf8");

  console.log(`\nBuilt ${written} project page(s) and updated index.html projects grid.`);
}

main();
