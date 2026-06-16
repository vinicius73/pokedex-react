import { useQuery } from "@tanstack/react-query";
import { usePokeApiClient } from "~/lib/pokemon/PokeApiClientContext";
import { pokemonQueryKeys } from "~/lib/pokemon/pokemonQueryKeys";

export function useRegion(regionName: string | null) {
  const pokeApiClient = usePokeApiClient();

  return useQuery({
    queryKey: regionName ? pokemonQueryKeys.region(regionName) : ["region", "empty"],
    enabled: Boolean(regionName),
    queryFn: ({ signal }) => {
      if (!regionName) {
        throw new Error("regionName is required");
      }

      return pokeApiClient.getRegion(regionName, { signal });
    },
  });
}
