import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

// QA suite: fast, headless, assertion-bearing. Gherkin features compiled by
// `bddgen` into specs. The demo suite (video walkthroughs) has its own config.
const testDir = defineBddConfig({
  features: "e2e/features/**/*.feature",
  steps: "e2e/steps/**/*.ts",
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3300",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start --port 3300",
    url: "http://localhost:3300",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
