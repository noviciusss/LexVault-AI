import { test, expect } from "@playwright/test";

test("constitutional reading, Hindi, bookmarks, source-linked research, and mobile navigation", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/constitution?article=21");
  await expect(page.getByRole("heading", { name: "Life and Personal Liberty", exact: false })).toBeVisible();
  await page.getByRole("button", { name: "हिन्दी", exact: true }).click();
  await expect(page.locator('[lang="hi"]').filter({ hasText: "प्राण" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Bookmark article", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove article bookmark", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByLabel("Constitutional research question", { exact: true }).fill("Explain Article 21 and the right to privacy");
  await page.getByRole("button", { name: "Research question", exact: true }).click();
  await expect(page.getByText("Source reference mode", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Article 21", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add article to comparison", exact: true }).click();
  await page.getByLabel("Search constitutional articles").fill("32");
  await page.getByRole("button", { name: /32 Remedies for Enforcement/ }).click();
  await page.getByRole("button", { name: "Add article to comparison", exact: true }).click();
  await page.getByRole("button", { name: "Open comparison", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Toggle light and dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/light/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("constitution.png"), fullPage: true });
  if (testInfo.project.name !== "desktop") {
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Research assistant", exact: true }).click();
  } else {
    await page.getByRole("link", { name: "Research assistant", exact: true }).click();
  }
  await expect(page.getByRole("heading", { name: "Indian constitutional research assistant", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("assistant conversation persists and hearing diary saves to the server", async ({ page }) => {
  await page.goto("/assistant");
  await page.getByLabel("Research question", { exact: true }).fill("Explain Article 21 and personal liberty");
  await page.getByRole("button", { name: "Send research question", exact: true }).click();
  await expect(page.getByText("Constitution reference extracts", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send research question", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Constitution reference extracts", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Export memo", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Export research memorandum" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/tools");
  await page.getByRole("tab", { name: "Hearing diary" }).click();
  await page.getByLabel("Hearing matter title").fill("Article 226 writ research listing");
  await page.getByLabel("Court and bench").fill("Delhi High Court");
  await page.getByLabel("Hearing date").fill("2026-11-18");
  await page.getByRole("button", { name: "Save hearing", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Article 226 writ research listing" }).first()).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "Hearing diary" }).click();
  await expect(page.getByRole("heading", { name: "Article 226 writ research listing" }).first()).toBeVisible();
});

test("capture → pipeline → partner review → published source → audit", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Full pipeline is covered on desktop; reading and persistence run on all sizes.");
  await page.goto("/capture");
  const title = `Article 21 privacy research ${Date.now()}`;
  await page.getByLabel("Research or matter title").fill(title);
  await page.getByLabel("Working notes", { exact: true }).fill("A constitutional research note on Article 21, personal liberty and privacy. Maneka Gandhi v Union of India links fair procedure with Articles 14, 19 and 21. Counsel should distinguish the article provision from the judicial interpretation and inspect primary case authorities before drafting.");
  await page.getByRole("button", { name: "Review capture", exact: true }).click();
  await page.getByRole("button", { name: "Launch pipeline", exact: true }).click();
  await expect(page).toHaveURL(/\/pipeline\/\d+/);
  await expect(page.getByText("pending approval", { exact: true })).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: /Chandra & Rao/ }).click();
  await page.getByRole("menuitem", { name: "Use senior partner role" }).click();
  await page.getByRole("link", { name: /Partner review/ }).first().click();
  const submission = page.locator("div.rounded-2xl").filter({ has: page.getByRole("heading", { name: title, exact: true }) }).last();
  await submission.getByRole("button", { name: "Approve insight", exact: true }).click();
  await page.goto("/knowledge-hub");
  await page.getByLabel("Search published knowledge").fill(title);
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible({ timeout: 30000 });
  await page.getByRole("heading", { name: title, exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/admin");
  await expect(page.getByText("APPROVAL GRANTED", { exact: true }).first()).toBeVisible();
});
