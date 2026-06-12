import { createBdd } from "playwright-bdd";

const { Given, Then } = createBdd();

// Dwell beats — slowMo doesn't cover navigation or assertions, so hold the
// frame explicitly at "thing just appeared" moments for a watchable demo.
Given("I pause to read", async ({ page }) => {
  await page.waitForTimeout(1100);
});

Then("I dwell on the result", async ({ page }) => {
  await page.waitForTimeout(2400);
});
