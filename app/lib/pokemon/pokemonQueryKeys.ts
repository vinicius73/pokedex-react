export const pokemonQueryKeys = {
  regions: ["regions"] as const,

  region: (regionName: string) => ["region", regionName] as const,

  pokedex: (pokedexName: string) => ["pokedex", pokedexName] as const,

  pokemon: (pokemonNameOrId: string | number) => ["pokemon", pokemonNameOrId] as const,

  pokemonSpecies: (speciesNameOrId: string | number) =>
    ["pokemon-species", speciesNameOrId] as const,

  evolutionChain: (url: string) => ["evolution-chain", url] as const,

  type: (typeName: string) => ["type", typeName] as const,
};
