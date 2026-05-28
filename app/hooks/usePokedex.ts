import { useQuery } from "@tanstack/react-query";
import { usePokeApiClient } from "~/lib/pokemon/PokeApiClientContext";
import { pokemonQueryKeys } from "~/lib/pokemon/pokemonQueryKeys";

export function usePokedex(pokedexName: string | null) {
  const pokeApiClient = usePokeApiClient();

  return useQuery({
    queryKey: pokedexName
      ? pokemonQueryKeys.pokedex(pokedexName)
      : ["pokedex", "empty"],
    enabled: Boolean(pokedexName),
    queryFn: ({ signal }) => {
      if (!pokedexName) {
        throw new Error("pokedexName is required");
      }

      return pokeApiClient.getPokedex(pokedexName, { signal });
    },
  });
}
