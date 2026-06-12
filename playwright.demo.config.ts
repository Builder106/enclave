import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

// Demo suite: a narrative, single-worker, video-recorded walkthrough. Shares
// the QA step library; adds dwell steps for readability. Video size must
// match the viewport exactly.
const VIEW = { width: 1280, height: 800 };

const testDir = defineBddConfig({
  features: "e2e/demo/features/**/*.feature",
  steps: ["e2e/steps/**/*.ts", "e2e/demo/steps/**/*.ts"],
  outputDir: ".features-gen/demo",
});

export default defineConfig({
  testDir,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  timeout: 120_000,
  outputDir: "test-results/demo",
  use: {
    baseURL: "http://localhost:3300",
    headless: true,
    viewport: VIEW,
    video: { mode: "on", size: VIEW },
    launchOptions: { slowMo: 650 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: VIEW,
        video: { mode: "on", size: VIEW },
      },
    },
  ],
  webServer: {
    command: "pnpm build && pnpm start --port 3300",
    url: "http://localhost:3300",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
