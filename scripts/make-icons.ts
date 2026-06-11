// Rasterizes public/apple-touch-icon.png (180x180, full-bleed solid bg —
// iOS rounds the corners itself and renders transparency as dirty edges).
// sharp is not a direct dependency; it ships with Next, so resolve it from
// Next's own node_modules when the root resolution misses (pnpm layout).

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

interface SharpPipeline {
  resize(width: number, height: number): SharpPipeline;
  removeAlpha(): SharpPipeline;
  png(): SharpPipeline;
  toFile(path: string): Promise<unknown>;
}
type SharpFactory = (input: Buffer) => SharpPipeline;

const require = createRequire(import.meta.url);

function loadSharp(): SharpFactory | null {
  try {
    return require("sharp") as SharpFactory;
  } catch {
    /* not hoisted to the root */
  }
  try {
    const fromNext = createRequire(require.resolve("next/package.json"));
    return fromNext("sharp") as SharpFactory;
  } catch {
    return null;
  }
}

const SIZE = 180;
const BG = "#0B0F14";
const ACCENT = "#4FD1A5";
const NEUTRAL = "#8B98A5";

// Mark viewBox is 64; scale 2.1 -> 134.4px, centered.
const MARK_SCALE = 2.1;
const OFFSET = (SIZE - 64 * MARK_SCALE) / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>
  <g transform="translate(${OFFSET} ${OFFSET}) scale(${MARK_SCALE})">
    <rect x="7" y="7" width="50" height="50" rx="14" fill="none" stroke="${ACCENT}" stroke-width="5"/>
    <path d="M23 18h11l8 8v19H23Z" fill="none" stroke="${NEUTRAL}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M34 18v8h8" fill="none" stroke="${NEUTRAL}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M27.5 33h10M27.5 39h6.5" stroke="${ACCENT}" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="51" cy="51" r="11.5" fill="${BG}"/>
    <path d="M47 50v-2.5a4 4 0 0 1 8 0V50" fill="none" stroke="${ACCENT}" stroke-width="2.6"/>
    <rect x="44.5" y="50" width="13" height="10" rx="2.5" fill="${ACCENT}"/>
  </g>
</svg>`;

async function main(): Promise<void> {
  const sharp = loadSharp();
  if (!sharp) {
    console.error(
      "make-icons: could not resolve 'sharp' (tried root node_modules and Next's). " +
        "Install it (`pnpm add -D sharp`) or run `pnpm install` so Next's optional dep is present.",
    );
    process.exit(1);
  }
  const out = fileURLToPath(new URL("../public/apple-touch-icon.png", import.meta.url));
  await sharp(Buffer.from(svg)).resize(SIZE, SIZE).removeAlpha().png().toFile(out);
  console.log(`make-icons: wrote ${out}`);
}

main().catch((err: unknown) => {
  console.error("make-icons: failed:", err);
  process.exit(1);
});
