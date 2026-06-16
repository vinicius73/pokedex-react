import { expect, type Page } from "@playwright/test";

export async function waitForGrid(page: Page) {
  const grid = page.getByTestId("pokemon-grid");
  await expect(grid).toBeVisible();
  await expect
    .poll(async () => grid.getByRole("button").count(), { timeout: 15_000 })
    .toBeGreaterThan(0);
}

export async function cardCount(page: Page) {
  return page.getByTestId("pokemon-grid").getByRole("button").count();
}
