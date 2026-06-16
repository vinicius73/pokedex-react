import { useQuery } from "@tanstack/react-query";
import { usePokeApiClient } from "~/lib/pokemon/PokeApiClientContext";
import { pokemonQueryKeys } from "~/lib/pokemon/pokemonQueryKeys";

export function usePokemon(pokemonNameOrId: string | number | null) {
  const pokeApiClient = usePokeApiClient();

  return useQuery({
    queryKey: pokemonNameOrId ? pokemonQueryKeys.pokemon(pokemonNameOrId) : ["pokemon", "empty"],
    enabled: Boolean(pokemonNameOrId),
    queryFn: ({ signal }) => {
      if (!pokemonNameOrId) {
        throw new Error("pokemonNameOrId is required");
      }

      return pokeApiClient.getPokemon(pokemonNameOrId, { signal });
    },
  });
}
