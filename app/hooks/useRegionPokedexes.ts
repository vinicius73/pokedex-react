import { useQueries } from "@tanstack/react-query";
import { usePokeApiClient } from "~/lib/pokemon/PokeApiClientContext";
import { pokemonQueryKeys } from "~/lib/pokemon/pokemonQueryKeys";
import {
  mergePokedexEntries,
  type PokedexEntry,
} from "~/lib/pokemon/utils/mergePokedexEntries";

export function useRegionPokedexes(pokedexNames: string[] | null) {
  const pokeApiClient = usePokeApiClient();
  const names = pokedexNames ?? [];

  const queries = useQueries({
    queries: names.map((name) => ({
      queryKey: pokemonQueryKeys.pokedex(name),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        pokeApiClient.getPokedex(name, { signal }),
      enabled: names.length > 0,
    })),
  });

  const isLoading =
    names.length > 0 && queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const error = queries.find((query) => query.error)?.error ?? null;
  const allLoaded =
    names.length > 0 && queries.every((query) => query.data !== undefined);

  const entries: PokedexEntry[] | undefined = allLoaded
    ? mergePokedexEntries(queries.map((query) => query.data!.pokemon_entries))
    : undefined;

  return {
    isLoading,
    isError,
    error,
    entries,
  };
}
