/**
 * One-time placeholder JPEGs so asset paths resolve until real images are added.
 * Replace files under assets/projects/{slug}/ with your own photos (same filenames).
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ASSETS = join(ROOT, "assets", "projects");

/** Minimal valid 1×1 JPEG */
const PLACEHOLDER_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=",
  "base64"
);

const SLUGS = [
  "tea-sensory-lab",
  "firebase-app",
  "card-dispenser",
  "frontend-app",
  "genery-app",
  "godot-game",
  "arduino-project",
  "stem-teaching",
];

const EXTRA = {
  "firebase-app": ["process-2.jpg"],
  "tea-sensory-lab": ["process-2.jpg"],
};

for (const slug of SLUGS) {
  const dir = join(ASSETS, slug);
  mkdirSync(dir, { recursive: true });
  const files = ["hero.jpg", "card.jpg", "process-1.jpg", ...(EXTRA[slug] || [])];
  for (const name of files) {
    writeFileSync(join(dir, name), PLACEHOLDER_JPEG);
  }
}

console.log(`Placeholder images written under ${ASSETS}`);
