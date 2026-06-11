import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { MeasurementFile } from "@/lib/contract";

export const dynamic = "force-dynamic";

export async function GET() {
  const dir = path.join(process.cwd(), "data/measurements");
  let names: string[];
  try {
    names = readdirSync(dir)
      .filter((n) => n.endsWith(".json"))
      .sort();
  } catch {
    names = [];
  }
  const files: MeasurementFile[] = [];
  for (const name of names) {
    try {
      const parsed = JSON.parse(
        readFileSync(path.join(dir, name), "utf8"),
      ) as MeasurementFile;
      if (parsed.version === 1 && Array.isArray(parsed.results)) {
        files.push(parsed);
      }
    } catch {
      // malformed or unreadable file — skip, never 500 the panel
    }
  }
  return Response.json({ files });
}
