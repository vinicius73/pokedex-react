import { test, expect } from "@playwright/test";
import { cardCount, waitForGrid } from "./helpers";

test("redirects / to kanto", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/regions\/kanto/);
});

test("kanto shows 151 cards", async ({ page }) => {
  await page.goto("/regions/kanto");
  await waitForGrid(page);
  await expect(await cardCount(page)).toBe(151);
});

test("kalos shows pokedex selector", async ({ page }) => {
  await page.goto("/regions/kalos");
  await expect(page.locator("#pokedex-selector")).toBeVisible();
});

test("kalos all renders merged grid", async ({ page }) => {
  await page.goto("/regions/kalos");
  await page.selectOption("#pokedex-selector", "all");
  await waitForGrid(page);
  expect(await cardCount(page)).toBeGreaterThan(150);
});

test("region tabs update url and grid", async ({ page }) => {
  await page.goto("/regions/kanto");
  await page.getByRole("link", { name: "Johto" }).click();
  await expect(page).toHaveURL(/\/regions\/johto/);
  await waitForGrid(page);
  expect(await cardCount(page)).toBeGreaterThan(0);
});
