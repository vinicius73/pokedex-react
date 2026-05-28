import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, type PropsWithChildren } from "react";
import { createKyHttpClient } from "~/lib/http/KyHttpClient";
import { createPokeApiClient } from "~/lib/pokemon/createPokeApiClient";
import { PokeApiClientProvider } from "~/lib/pokemon/PokeApiClientContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24 * 7,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  const pokeApiClient = useMemo(() => {
    const httpClient = createKyHttpClient({
      baseUrl: "https://pokeapi.co/api/v2/",
    });

    return createPokeApiClient(httpClient);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PokeApiClientProvider client={pokeApiClient}>
        {children}
      </PokeApiClientProvider>
    </QueryClientProvider>
  );
}
