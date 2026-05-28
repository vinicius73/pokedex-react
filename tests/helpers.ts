import { expect, type Page } from "@playwright/test";

export async function waitForGrid(page: Page) {
  const grid = page.getByTestId("pokemon-grid");
  await expect(grid).toBeVisible();
  await expect(grid.getByRole("button").first()).toBeVisible();
}

export async function cardCount(page: Page) {
  return page.getByTestId("pokemon-grid").getByRole("button").count();
}
