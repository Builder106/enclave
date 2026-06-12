import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("I open the workbench", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Run extraction/i }),
  ).toBeVisible();
});

When("I select the {string} extractor", async ({ page }, name: string) => {
  await page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
});

When("I run the extraction", async ({ page }) => {
  await page.getByRole("button", { name: /Run extraction/i }).click();
});

Then("the structured record appears", async ({ page }) => {
  // The extraction panel populates with the patient block once a run settles.
  await expect(page.getByText("First name")).toBeVisible({ timeout: 15_000 });
});

Then("the specimen stays on-device", async ({ page }) => {
  await expect(page.getByText(/on-device/i).first()).toBeVisible();
});

Then("the specimen is transmitted off-site", async ({ page }) => {
  // The result bar's egress stat shows a non-zero byte figure (KB) for a
  // hosted provider — the document crossed the wire.
  await expect(page.getByText(/\bKB\b/).first()).toBeVisible({
    timeout: 15_000,
  });
});

Then("the egress reads {string}", async ({ page }, value: string) => {
  await expect(page.getByText(value, { exact: false }).first()).toBeVisible({
    timeout: 15_000,
  });
});

Then("the bench is idle again", async ({ page }) => {
  await expect(
    page.getByText(/Select an extractor and run/i),
  ).toBeVisible();
});
