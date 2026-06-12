// Rasterizes the README banner SVGs to PNG fallbacks (1200x420). SVG is the
// primary source GitHub renders; the PNG is a fallback + social-card base.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

interface SharpPipeline {
  resize(w: number, h: number): SharpPipeline;
  png(): SharpPipeline;
  toFile(p: string): Promise<unknown>;
}
const require = createRequire(import.meta.url);
function loadSharp(): ((b: Buffer) => SharpPipeline) | null {
  try {
    return require("sharp");
  } catch {
    try {
      return createRequire(require.resolve("next/package.json"))("sharp");
    } catch {
      return null;
    }
  }
}

async function main(): Promise<void> {
  const sharp = loadSharp();
  if (!sharp) {
    console.error("make-banners: sharp not resolvable");
    process.exit(1);
  }
  for (const v of ["light", "dark"]) {
    const svg = fileURLToPath(new URL(`../assets/banner-${v}.svg`, import.meta.url));
    const out = fileURLToPath(new URL(`../assets/banner-${v}.png`, import.meta.url));
    await sharp(readFileSync(svg)).resize(1200, 420).png().toFile(out);
    console.log(`wrote ${out}`);
  }
}
main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
