import type { PokemonListItem } from "~/types/viewModels";

export function filterPokemon(
  items: PokemonListItem[],
  nameQuery: string,
  typeFilter: string | null,
): PokemonListItem[] {
  const normalizedQuery = nameQuery.trim().toLowerCase();

  return items.filter((item) => {
    const matchesName =
      normalizedQuery.length === 0 ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.displayName.toLowerCase().includes(normalizedQuery);

    const matchesType =
      typeFilter === null ||
      item.types.some((type) => type.toLowerCase() === typeFilter.toLowerCase());

    return matchesName && matchesType;
  });
}
