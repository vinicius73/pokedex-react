import type { HttpClient } from "~/lib/http/HttpClient";
import type { PokeApiClient, RequestOptions } from "./PokeApiClient";
import type {
  EvolutionChain,
  NamedApiResourceList,
  Pokedex,
  Pokemon,
  PokemonSpecies,
  PokemonTypeDetails,
  Region,
} from "~/types/api";

export function createPokeApiClient(httpClient: HttpClient): PokeApiClient {
  return {
    getRegions(options?: RequestOptions) {
      return httpClient.get<NamedApiResourceList>("region", {
        signal: options?.signal,
      });
    },

    getRegion(regionName: string, options?: RequestOptions) {
      return httpClient.get<Region>(`region/${regionName}`, {
        signal: options?.signal,
      });
    },

    getPokedex(pokedexName: string, options?: RequestOptions) {
      return httpClient.get<Pokedex>(`pokedex/${pokedexName}`, {
        signal: options?.signal,
      });
    },

    getPokemon(pokemonNameOrId: string | number, options?: RequestOptions) {
      return httpClient.get<Pokemon>(`pokemon/${pokemonNameOrId}`, {
        signal: options?.signal,
      });
    },

    getPokemonSpecies(speciesNameOrId: string | number, options?: RequestOptions) {
      return httpClient.get<PokemonSpecies>(`pokemon-species/${speciesNameOrId}`, {
        signal: options?.signal,
      });
    },

    getEvolutionChainByUrl(url: string, options?: RequestOptions) {
      return httpClient.get<EvolutionChain>(url, {
        signal: options?.signal,
      });
    },

    getType(typeName: string, options?: RequestOptions) {
      return httpClient.get<PokemonTypeDetails>(`type/${typeName}`, {
        signal: options?.signal,
      });
    },
  };
}
