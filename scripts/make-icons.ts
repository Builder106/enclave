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
const BG = "#090d12";
const ACCENT = "#3dbe8b";

// Mark viewBox is 64; scale 2.1 -> 134.4px, centered.
const MARK_SCALE = 2.1;
const OFFSET = (SIZE - 64 * MARK_SCALE) / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>
  <g transform="translate(${OFFSET} ${OFFSET}) scale(${MARK_SCALE})" fill="none">
    <g stroke="${ACCENT}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 19V14a6 6 0 0 1 6-6h5"/>
      <path d="M45 8h5a6 6 0 0 1 6 6v5"/>
      <path d="M56 45v5a6 6 0 0 1-6 6h-5"/>
      <path d="M19 56h-5a6 6 0 0 1-6-6v-5"/>
    </g>
    <rect x="24" y="24" width="16" height="16" rx="4.5" fill="${ACCENT}"/>
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
