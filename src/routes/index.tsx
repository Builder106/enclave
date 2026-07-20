import { cache, createAsync } from "@solidjs/router";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Workbench } from "@/components/workbench";
import type { DemoData } from "@/lib/demo";

const getDemoData = cache(async () => {
  "use server";
  try {
    const raw = readFileSync(
      path.join(process.cwd(), "data/demo/seed-1.json"),
      "utf8",
    );
    const parsed = JSON.parse(raw) as DemoData;
    return Array.isArray(parsed.documents) && parsed.documents.length > 0
      ? parsed
      : null;
  } catch {
    return null;
  }
}, "demo-data");

export default function Page() {
  const demo = createAsync(() => getDemoData());
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null;
  return <Workbench demo={demo()} commit={commit} />;
}
