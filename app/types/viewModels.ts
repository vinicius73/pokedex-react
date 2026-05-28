export type PokemonListItem = {
  entryNumber: number;
  id: number;
  name: string;
  displayName: string;
  imageUrl: string | null;
  types: string[];
  speciesName: string;
  speciesUrl: string;
};

export type PokemonDetailsViewModel = {
  id: number;
  name: string;
  displayName: string;
  imageUrl: string | null;
  shinyImageUrl: string | null;
  types: string[];
  heightMeters: number;
  weightKg: number;
  abilities: Array<{
    name: string;
    displayName: string;
    isHidden: boolean;
  }>;
  stats: Array<{
    name: string;
    displayName: string;
    value: number;
  }>;
  description: string | null;
  genus: string | null;
  captureRate: number | null;
  isBaby: boolean;
  isLegendary: boolean;
  isMythical: boolean;
};
