export type PokedexEntry = {
  entry_number: number;
  pokemon_species: {
    name: string;
    url: string;
  };
};

export function mergePokedexEntries(entriesGroups: PokedexEntry[][]): PokedexEntry[] {
  const seen = new Set<string>();
  const result: PokedexEntry[] = [];

  for (const entries of entriesGroups) {
    for (const entry of entries) {
      const key = entry.pokemon_species.url;

      if (!seen.has(key)) {
        seen.add(key);
        result.push(entry);
      }
    }
  }

  return result;
}
