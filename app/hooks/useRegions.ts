import { useQuery } from "@tanstack/react-query";
import { usePokeApiClient } from "~/lib/pokemon/PokeApiClientContext";
import { pokemonQueryKeys } from "~/lib/pokemon/pokemonQueryKeys";

export function useRegions() {
  const pokeApiClient = usePokeApiClient();

  return useQuery({
    queryKey: pokemonQueryKeys.regions,
    queryFn: ({ signal }) => pokeApiClient.getRegions({ signal }),
  });
}
