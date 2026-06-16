import { useQuery } from "@tanstack/react-query";
import { usePokeApiClient } from "~/lib/pokemon/PokeApiClientContext";
import { pokemonQueryKeys } from "~/lib/pokemon/pokemonQueryKeys";

export function usePokemonDetails(pokemonName: string | null) {
  const pokeApiClient = usePokeApiClient();

  const pokemonQuery = useQuery({
    queryKey: pokemonName ? pokemonQueryKeys.pokemon(pokemonName) : ["pokemon", "empty"],
    enabled: Boolean(pokemonName),
    queryFn: ({ signal }) => {
      if (!pokemonName) {
        throw new Error("pokemonName is required");
      }

      return pokeApiClient.getPokemon(pokemonName, { signal });
    },
  });

  const speciesQuery = useQuery({
    queryKey: pokemonName
      ? pokemonQueryKeys.pokemonSpecies(pokemonName)
      : ["pokemon-species", "empty"],
    enabled: Boolean(pokemonName),
    queryFn: ({ signal }) => {
      if (!pokemonName) {
        throw new Error("pokemonName is required");
      }

      return pokeApiClient.getPokemonSpecies(pokemonName, { signal });
    },
  });

  const evolutionChainUrl = speciesQuery.data?.evolution_chain.url ?? null;

  const evolutionChainQuery = useQuery({
    queryKey: evolutionChainUrl
      ? pokemonQueryKeys.evolutionChain(evolutionChainUrl)
      : ["evolution-chain", "empty"],
    enabled: Boolean(evolutionChainUrl),
    queryFn: ({ signal }) => {
      if (!evolutionChainUrl) {
        throw new Error("evolutionChainUrl is required");
      }

      return pokeApiClient.getEvolutionChainByUrl(evolutionChainUrl, {
        signal,
      });
    },
  });

  return {
    pokemonQuery,
    speciesQuery,
    evolutionChainQuery,
    isLoading: pokemonQuery.isLoading || speciesQuery.isLoading || evolutionChainQuery.isLoading,
    isError: pokemonQuery.isError || speciesQuery.isError || evolutionChainQuery.isError,
  };
}
