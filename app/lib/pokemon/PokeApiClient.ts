import type {
  EvolutionChain,
  NamedApiResourceList,
  Pokedex,
  Pokemon,
  PokemonSpecies,
  PokemonTypeDetails,
  Region,
} from "~/types/api";

export type RequestOptions = {
  signal?: AbortSignal;
};

export interface PokeApiClient {
  getRegions(options?: RequestOptions): Promise<NamedApiResourceList>;

  getRegion(regionName: string, options?: RequestOptions): Promise<Region>;

  getPokedex(pokedexName: string, options?: RequestOptions): Promise<Pokedex>;

  getPokemon(
    pokemonNameOrId: string | number,
    options?: RequestOptions,
  ): Promise<Pokemon>;

  getPokemonSpecies(
    speciesNameOrId: string | number,
    options?: RequestOptions,
  ): Promise<PokemonSpecies>;

  getEvolutionChainByUrl(
    url: string,
    options?: RequestOptions,
  ): Promise<EvolutionChain>;

  getType(
    typeName: string,
    options?: RequestOptions,
  ): Promise<PokemonTypeDetails>;
}
