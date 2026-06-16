import { createContext, useContext, type PropsWithChildren } from "react";
import type { PokeApiClient } from "./PokeApiClient";

const PokeApiClientContext = createContext<PokeApiClient | null>(null);

type PokeApiClientProviderProps = PropsWithChildren<{
  client: PokeApiClient;
}>;

export function PokeApiClientProvider({ client, children }: PokeApiClientProviderProps) {
  return <PokeApiClientContext.Provider value={client}>{children}</PokeApiClientContext.Provider>;
}

export function usePokeApiClient(): PokeApiClient {
  const client = useContext(PokeApiClientContext);

  if (!client) {
    throw new Error("usePokeApiClient must be used within PokeApiClientProvider");
  }

  return client;
}
