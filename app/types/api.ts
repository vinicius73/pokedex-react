export type NamedApiResource = {
  name: string;
  url: string;
};

export type NamedApiResourceList = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
};

export type Region = {
  id: number;
  name: string;
  names: Array<{
    name: string;
    language: NamedApiResource;
  }>;
  main_generation: NamedApiResource;
  locations: NamedApiResource[];
  pokedexes: NamedApiResource[];
  version_groups: NamedApiResource[];
};

export type Pokedex = {
  id: number;
  name: string;
  is_main_series: boolean;
  names: Array<{
    name: string;
    language: NamedApiResource;
  }>;
  descriptions: Array<{
    description: string;
    language: NamedApiResource;
  }>;
  pokemon_entries: Array<{
    entry_number: number;
    pokemon_species: NamedApiResource;
  }>;
  region: NamedApiResource | null;
  version_groups: NamedApiResource[];
};

export type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
        front_shiny: string | null;
      };
      home?: {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    slot: number;
    type: NamedApiResource;
  }>;
  abilities: Array<{
    is_hidden: boolean;
    slot: number;
    ability: NamedApiResource;
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: NamedApiResource;
  }>;
  species: NamedApiResource;
};

export type PokemonSpecies = {
  id: number;
  name: string;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  growth_rate: NamedApiResource;
  evolution_chain: {
    url: string;
  };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: NamedApiResource;
    version: NamedApiResource;
  }>;
  genera: Array<{
    genus: string;
    language: NamedApiResource;
  }>;
  varieties: Array<{
    is_default: boolean;
    pokemon: NamedApiResource;
  }>;
};

export type EvolutionChain = {
  id: number;
  baby_trigger_item: NamedApiResource | null;
  chain: EvolutionChainLink;
};

export type EvolutionChainLink = {
  is_baby: boolean;
  species: NamedApiResource;
  evolution_details: EvolutionDetail[] | null;
  evolves_to: EvolutionChainLink[];
};

export type EvolutionDetail = {
  trigger: NamedApiResource | null;
  min_level: number | null;
  item: NamedApiResource | null;
  held_item: NamedApiResource | null;
  min_happiness: number | null;
  time_of_day: string;
};

export type PokemonTypeDetails = {
  id: number;
  name: string;
  damage_relations: {
    double_damage_from: NamedApiResource[];
    double_damage_to: NamedApiResource[];
    half_damage_from: NamedApiResource[];
    half_damage_to: NamedApiResource[];
    no_damage_from: NamedApiResource[];
    no_damage_to: NamedApiResource[];
  };
};
