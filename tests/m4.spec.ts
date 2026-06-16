import { test, expect } from "@playwright/test";
import { cardCount, waitForGrid } from "./helpers";

test("name filter is case-insensitive and partial", async ({ page }) => {
  await page.goto("/regions/kanto");
  await waitForGrid(page);

  await page.getByRole("searchbox", { name: "Search Pokémon" }).fill("saur");
  await expect(page).toHaveURL(/q=saur/);
  await expect(page.getByTestId("pokemon-grid").getByRole("button")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Bulbasaur" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ivysaur" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Venusaur" })).toBeVisible();
});

test("type filter restricts visible cards", async ({ page }) => {
  await page.goto("/regions/kanto");
  await waitForGrid(page);

  const totalCards = await cardCount(page);
  expect(totalCards).toBe(151);

  await page.getByLabel("Filter by type").selectOption("fire");
  await expect(page).toHaveURL(/type=fire/);
  await expect.poll(async () => cardCount(page), { timeout: 15_000 }).toBeLessThan(totalCards);
});

test("modal opens on card click and updates url", async ({ page }) => {
  await page.goto("/regions/kanto");
  await waitForGrid(page);

  await page.getByRole("button", { name: "Bulbasaur" }).click();
  await expect(page).toHaveURL(/pokemon=bulbasaur/);
  await expect(page.getByTestId("pokemon-details-modal")).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("modal closes via close button, esc, and backdrop", async ({ page }) => {
  await page.goto("/regions/kanto?pokemon=bulbasaur");
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page).not.toHaveURL(/pokemon=/);

  await page.goto("/regions/kanto?pokemon=bulbasaur");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();

  await page.goto("/regions/kanto?pokemon=bulbasaur");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .locator(".fixed.inset-0")
    .first()
    .click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("deep link opens modal directly", async ({ page }) => {
  await page.goto("/regions/kanto?pokemon=bulbasaur");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByTestId("pokemon-details-modal")).toContainText("Bulbasaur");
});

test("closing modal preserves filter query params", async ({ page }) => {
  await page.goto("/regions/kanto?q=bulba&type=grass&pokemon=bulbasaur");
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page).toHaveURL(/q=bulba/);
  await expect(page).toHaveURL(/type=grass/);
  await expect(page).not.toHaveURL(/pokemon=/);
});

test("focus returns to card after closing modal", async ({ page }) => {
  await page.goto("/regions/kanto");
  await waitForGrid(page);

  const bulbasaurCard = page.getByRole("button", { name: "Bulbasaur" });
  await bulbasaurCard.click();
  await expect(page).toHaveURL(/pokemon=bulbasaur/);
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close dialog" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(bulbasaurCard).toBeFocused();
});
