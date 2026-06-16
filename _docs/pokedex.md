# Documento de referência — Pokédex por região com React, TypeScript, React Router v7, Ky, PokeAPI e Playwright

## 1. Contexto

O projeto é uma Pokédex construída com React Router v7 em framework mode (SPA, `ssr: false`), React 19, TypeScript 5.9 e Tailwind CSS v4.

A aplicação deve consumir a PokeAPI v2 para listar Pokémon por região. Cada Pokémon deve exibir nome, imagem e tipo. Ao clicar em um Pokémon, a aplicação deve abrir um modal com mais detalhes.

A implementação deve priorizar:

- arquitetura simples;
- TypeScript bem tipado;
- client HTTP centralizado;
- uso de Ky, não `fetch` direto;
- injeção do client via Context API;
- baixo acoplamento;
- boa testabilidade futura;
- testes iniciais com Playwright usando API real;
- poucos golden tests no primeiro momento.

---

## 2. Objetivo funcional

A aplicação deve permitir que o usuário:

1. Veja as regiões disponíveis.
2. Selecione uma região.
3. Veja a lista de Pokémon daquela região.
4. Veja em cada card:

   - número da Pokédex regional;
   - nome;
   - imagem;
   - tipos.

5. Filtre Pokémon por nome.
6. Filtre Pokémon por tipo.
7. Clique em um Pokémon.
8. Veja um modal com detalhes:

   - imagem;
   - nome;
   - ID nacional;
   - tipos;
   - altura;
   - peso;
   - abilities;
   - stats;
   - descrição;
   - categoria;
   - flags como bebê, lendário e mítico;
   - cadeia evolutiva, se implementada.

---

## 3. Stack

Stack principal:

```txt
React 19
React Router v7 (framework mode, SPA)
TypeScript 5.9
Tailwind CSS v4
Ky
TanStack Query
Playwright
PokeAPI v2
```

Dependências a instalar:

```bash
npm install @tanstack/react-query
npm install -D @playwright/test
```

> `ky` já está em `dependencies`. `react`, `react-router`, `typescript`, `tailwindcss` e `vite` já fazem parte do projeto base.

---

## 4. Decisões técnicas principais

### 4.1 Não usar `fetch` diretamente

Nenhum componente, hook ou página deve chamar `fetch`.

Errado:

```ts
fetch("https://pokeapi.co/api/v2/pokemon/bulbasaur");
```

Errado:

```ts
ky.get("pokemon/bulbasaur");
```

Correto:

```ts
pokeApiClient.getPokemon("bulbasaur");
```

Ky deve ficar encapsulado em uma implementação concreta de `HttpClient`.

---

### 4.2 Injetar `PokeApiClient`, não `KyInstance`

A aplicação deve depender da interface `PokeApiClient`.

Componentes e hooks devem conhecer apenas:

```ts
const pokeApiClient = usePokeApiClient();
```

Eles não devem conhecer:

- `ky`;
- `fetch`;
- URL base;
- headers;
- retry;
- timeout;
- detalhes de transporte HTTP.

Fluxo arquitetural:

```txt
React Page
  -> Feature Hooks
    -> usePokeApiClient()
      -> PokeApiClient interface
        -> createPokeApiClient()
          -> HttpClient interface
            -> KyHttpClient
              -> ky
                -> PokeAPI
```

---

### 4.3 Fluxo correto para listar Pokémon por região

A forma correta de listar Pokémon por região é:

```txt
Region -> Pokedex -> Pokemon entries -> Pokemon details
```

Não usar:

```txt
GET /pokemon?limit=100000
```

Motivo: a PokeAPI modela região por meio de `region.pokedexes`, e os Pokémon regionais vêm de `pokedex.pokemon_entries`.

---

### 4.4 Buscar detalhes sob demanda

A lista deve carregar apenas o necessário para os cards:

- nome;
- imagem;
- tipos;
- número regional.

O modal deve carregar dados mais detalhados:

- espécie;
- descrição;
- categoria;
- cadeia evolutiva;
- stats;
- abilities;
- flags especiais.

---

### 4.5 Usar TanStack Query

TanStack Query deve ser usado para:

- cache;
- loading states;
- error states;
- retry controlado;
- evitar chamadas repetidas;
- propagar `AbortSignal`;
- simplificar chamadas paralelas.

Configuração recomendada:

```ts
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
```

---

## 5. Base URL

```txt
https://pokeapi.co/api/v2/
```

A base URL deve ficar centralizada em `AppProviders`, na criação do `KyHttpClient`.

---

## 6. Endpoints necessários

### 6.1 Listar regiões

```http
GET /region
```

Uso:

- carregar abas ou seletor de regiões.

Tipos:

```ts
export type NamedApiResource = {
  name: string;
  url: string;
};

export type NamedApiResourceList = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
};
```

---

### 6.2 Buscar região

```http
GET /region/{regionName}
```

Uso:

- descobrir quais Pokédexes pertencem à região.

Tipo:

```ts
export type Region = {
  id: number;
  name: string;
  names: Array<{
    name: string;
    language: NamedApiResource;
  }>;
  main_generation: NamedApiResource;
  locations: NamedApiResource[];
  pokedexes: NamedApiResource[];
  version_groups: NamedApiResource[];
};
```

Regra:

- se a região tiver uma Pokédex, carregar automaticamente;
- se tiver múltiplas, exibir seletor;
- opcionalmente, oferecer opção “Todos”.

---

### 6.3 Buscar Pokédex

```http
GET /pokedex/{pokedexName}
```

Uso:

- obter entradas regionais de Pokémon.

Tipo:

```ts
export type Pokedex = {
  id: number;
  name: string;
  is_main_series: boolean;
  names: Array<{
    name: string;
    language: NamedApiResource;
  }>;
  descriptions: Array<{
    description: string;
    language: NamedApiResource;
  }>;
  pokemon_entries: Array<{
    entry_number: number;
    pokemon_species: NamedApiResource;
  }>;
  region: NamedApiResource | null;
  version_groups: NamedApiResource[];
};
```

Campo principal:

```ts
pokedex.pokemon_entries;
```

---

### 6.4 Buscar Pokémon

```http
GET /pokemon/{pokemonNameOrId}
```

Uso:

- imagem;
- tipos;
- altura;
- peso;
- abilities;
- stats;
- ID nacional.

Tipo:

```ts
export type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
        front_shiny: string | null;
      };
      home?: {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    slot: number;
    type: NamedApiResource;
  }>;
  abilities: Array<{
    is_hidden: boolean;
    slot: number;
    ability: NamedApiResource;
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: NamedApiResource;
  }>;
  species: NamedApiResource;
};
```

Prioridade de imagem:

```ts
pokemon.sprites.other?.["official-artwork"]?.front_default ??
  pokemon.sprites.other?.home?.front_default ??
  pokemon.sprites.front_default ??
  null;
```

---

### 6.5 Buscar espécie

```http
GET /pokemon-species/{speciesNameOrId}
```

Uso:

- descrição;
- categoria;
- capture rate;
- happiness;
- flags;
- evolution chain.

Tipo:

```ts
export type PokemonSpecies = {
  id: number;
  name: string;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  growth_rate: NamedApiResource;
  evolution_chain: {
    url: string;
  };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: NamedApiResource;
    version: NamedApiResource;
  }>;
  genera: Array<{
    genus: string;
    language: NamedApiResource;
  }>;
  varieties: Array<{
    is_default: boolean;
    pokemon: NamedApiResource;
  }>;
};
```

---

### 6.6 Buscar cadeia evolutiva

```http
GET /evolution-chain/{id}
```

A URL vem de:

```ts
pokemonSpecies.evolution_chain.url;
```

Tipo:

```ts
export type EvolutionChain = {
  id: number;
  baby_trigger_item: NamedApiResource | null;
  chain: EvolutionChainLink;
};

export type EvolutionChainLink = {
  is_baby: boolean;
  species: NamedApiResource;
  evolution_details: EvolutionDetail[] | null;
  evolves_to: EvolutionChainLink[];
};

export type EvolutionDetail = {
  trigger: NamedApiResource | null;
  min_level: number | null;
  item: NamedApiResource | null;
  held_item: NamedApiResource | null;
  min_happiness: number | null;
  time_of_day: string;
};
```

---

### 6.7 Buscar tipo

```http
GET /type/{typeName}
```

Uso opcional:

- fraquezas;
- resistências;
- imunidades.

Não é necessário para os badges, porque `/pokemon/{name}` já retorna os tipos.

Tipo:

```ts
export type PokemonTypeDetails = {
  id: number;
  name: string;
  damage_relations: {
    double_damage_from: NamedApiResource[];
    double_damage_to: NamedApiResource[];
    half_damage_from: NamedApiResource[];
    half_damage_to: NamedApiResource[];
    no_damage_from: NamedApiResource[];
    no_damage_to: NamedApiResource[];
  };
};
```

---

## 7. Estrutura de pastas

O projeto usa o layout padrão do React Router v7 framework mode com a raiz em `app/`.
O alias `~/` mapeia para `app/` — usar em todos os imports internos.

```txt
app/
  lib/
    http/
      HttpClient.ts
      KyHttpClient.ts

    pokemon/
      PokeApiClient.ts
      createPokeApiClient.ts
      PokeApiClientContext.tsx   ← provider + hook de injeção (React, mas infraestrutura)
      pokemonQueryKeys.ts
      mappers/
        pokemonMappers.ts
        evolutionMappers.ts
      utils/
        formatPokemonName.ts
        getPokemonImage.ts
        normalizeFlavorText.ts

  types/
    api.ts
    viewModels.ts

  hooks/
    useRegions.ts
    useRegion.ts
    usePokedex.ts
    usePokemon.ts
    usePokemonDetails.ts

  components/
    AppProviders.tsx
    Modal.tsx
    Spinner.tsx
    ErrorState.tsx
    EmptyState.tsx
    RegionTabs.tsx
    PokedexSelector.tsx
    PokemonGrid.tsx
    PokemonCard.tsx
    PokemonTypeBadge.tsx
    PokemonDetailsModal.tsx
    StatBar.tsx
    EvolutionChain.tsx

  routes/
    home.tsx                     ← redireciona / → /regions/kanto
    regions.$regionName.tsx      ← página principal

  root.tsx
  routes.ts
  app.css                        ← estilos globais + cores de tipos (Tailwind CSS v4)

tests/
  golden/
    pokedex.golden.spec.ts
```

---

## 8. HTTP Client

Arquivo:

```txt
app/lib/http/HttpClient.ts
```

```ts
export type HttpRequestOptions = {
  searchParams?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

export interface HttpClient {
  get<TResponse>(pathOrUrl: string, options?: HttpRequestOptions): Promise<TResponse>;
}
```

---

## 9. KyHttpClient

Arquivo:

```txt
app/lib/http/KyHttpClient.ts
```

```ts
import ky, { type KyInstance } from "ky";
import type { HttpClient, HttpRequestOptions } from "./HttpClient";

type CreateKyHttpClientParams = {
  baseUrl: string;
  timeoutMs?: number;
};

export function createKyHttpClient({
  baseUrl,
  timeoutMs = 10_000,
}: CreateKyHttpClientParams): HttpClient {
  const client = ky.create({
    baseUrl,
    timeout: timeoutMs,
    retry: {
      limit: 2,
      methods: ["get"],
      statusCodes: [429, 500, 502, 503, 504],
    },
    hooks: {
      beforeRequest: [
        (request) => {
          request.headers.set("Accept", "application/json");
        },
      ],
    },
  });

  return new KyHttpClient(client);
}

class KyHttpClient implements HttpClient {
  constructor(private readonly client: KyInstance) {}

  async get<TResponse>(pathOrUrl: string, options?: HttpRequestOptions): Promise<TResponse> {
    return this.client
      .get(pathOrUrl, {
        searchParams: options?.searchParams,
        signal: options?.signal,
      })
      .json<TResponse>();
  }
}
```

Decisão: não incluir `408` nos retries por padrão. Retry em `429`, `500`, `502`, `503` e `504` é suficiente.

---

## 10. PokeApiClient

Arquivo:

```txt
app/lib/pokemon/PokeApiClient.ts
```

```ts
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

  getPokemon(pokemonNameOrId: string | number, options?: RequestOptions): Promise<Pokemon>;

  getPokemonSpecies(
    speciesNameOrId: string | number,
    options?: RequestOptions,
  ): Promise<PokemonSpecies>;

  getEvolutionChainByUrl(url: string, options?: RequestOptions): Promise<EvolutionChain>;

  getType(typeName: string, options?: RequestOptions): Promise<PokemonTypeDetails>;
}
```

---

## 11. createPokeApiClient

Arquivo:

```txt
app/lib/pokemon/createPokeApiClient.ts
```

```ts
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
```

---

## 12. Context API

Arquivo:

```txt
app/lib/pokemon/PokeApiClientContext.tsx
```

```tsx
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
```

---

## 13. AppProviders

Arquivo:

```txt
app/components/AppProviders.tsx
```

```tsx
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
      <PokeApiClientProvider client={pokeApiClient}>{children}</PokeApiClientProvider>
    </QueryClientProvider>
  );
}
```

---

## 14. Query keys

Arquivo:

```txt
app/lib/pokemon/pokemonQueryKeys.ts
```

```ts
export const pokemonQueryKeys = {
  regions: ["regions"] as const,

  region: (regionName: string) => ["region", regionName] as const,

  pokedex: (pokedexName: string) => ["pokedex", pokedexName] as const,

  pokemon: (pokemonNameOrId: string | number) => ["pokemon", pokemonNameOrId] as const,

  pokemonSpecies: (speciesNameOrId: string | number) =>
    ["pokemon-species", speciesNameOrId] as const,

  evolutionChain: (url: string) => ["evolution-chain", url] as const,

  type: (typeName: string) => ["type", typeName] as const,
};
```

---

## 15. Hooks

### 15.1 useRegions

Arquivo: `app/hooks/useRegions.ts`

```ts
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
```

---

### 15.2 useRegion

Arquivo: `app/hooks/useRegion.ts`

```ts
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
```

---

### 15.3 usePokedex

Arquivo: `app/hooks/usePokedex.ts`

```ts
import { useQuery } from "@tanstack/react-query";
import { usePokeApiClient } from "~/lib/pokemon/PokeApiClientContext";
import { pokemonQueryKeys } from "~/lib/pokemon/pokemonQueryKeys";

export function usePokedex(pokedexName: string | null) {
  const pokeApiClient = usePokeApiClient();

  return useQuery({
    queryKey: pokedexName ? pokemonQueryKeys.pokedex(pokedexName) : ["pokedex", "empty"],
    enabled: Boolean(pokedexName),
    queryFn: ({ signal }) => {
      if (!pokedexName) {
        throw new Error("pokedexName is required");
      }

      return pokeApiClient.getPokedex(pokedexName, { signal });
    },
  });
}
```

---

### 15.4 usePokemon

Arquivo: `app/hooks/usePokemon.ts`

```ts
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
```

---

### 15.5 usePokemonDetails

Arquivo: `app/hooks/usePokemonDetails.ts`

```ts
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

      return pokeApiClient.getEvolutionChainByUrl(evolutionChainUrl, { signal });
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
```

---

## 16. ViewModels

### 16.1 PokemonListItem

```ts
export type PokemonListItem = {
  entryNumber: number;
  id: number;
  name: string;
  displayName: string;
  imageUrl: string | null;
  types: string[];
  speciesName: string;
  speciesUrl: string;
};
```

---

### 16.2 PokemonDetailsViewModel

```ts
export type PokemonDetailsViewModel = {
  id: number;
  name: string;
  displayName: string;
  imageUrl: string | null;
  shinyImageUrl: string | null;
  types: string[];
  heightMeters: number;
  weightKg: number;
  abilities: Array<{
    name: string;
    displayName: string;
    isHidden: boolean;
  }>;
  stats: Array<{
    name: string;
    displayName: string;
    value: number;
  }>;
  description: string | null;
  genus: string | null;
  captureRate: number | null;
  isBaby: boolean;
  isLegendary: boolean;
  isMythical: boolean;
};
```

---

## 17. Utils e mappers

### 17.1 formatPokemonName

```ts
export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
```

---

### 17.2 getPokemonImage

Arquivo: `app/lib/pokemon/utils/getPokemonImage.ts`

```ts
import type { Pokemon } from "~/types/api";

export function getPokemonImage(pokemon: Pokemon): string | null {
  return (
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default ??
    null
  );
}
```

---

### 17.3 normalizeFlavorText

```ts
export function normalizeFlavorText(value: string): string {
  return value.replace(/\f/g, " ").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}
```

---

### 17.4 Conversão de altura e peso

A PokeAPI retorna:

- altura em decímetros;
- peso em hectogramas.

Converter assim:

```ts
const heightMeters = pokemon.height / 10;
const weightKg = pokemon.weight / 10;
```

---

## 18. Fluxo de tela

### 18.1 Carregamento inicial

1. Carregar regiões com `useRegions`.
2. Exibir `RegionTabs`.
3. Se não houver região na URL, selecionar `kanto` ou a primeira região retornada.
4. Navegar para:

```txt
/regions/:regionName
```

Exemplo:

```txt
/regions/kanto
```

---

### 18.2 Seleção de região

1. Ler `regionName` da URL.
2. Chamar `useRegion(regionName)`.
3. Obter `region.pokedexes`.
4. Se houver uma única Pokédex, carregar automaticamente.
5. Se houver múltiplas, exibir `PokedexSelector`.

---

### 18.3 Seleção de Pokédex

1. Chamar `usePokedex(pokedexName)`.
2. Obter `pokemon_entries`.
3. Para cada entrada, buscar `/pokemon/{pokemon_species.name}`.
4. Mapear para `PokemonListItem`.
5. Renderizar `PokemonGrid`.

---

## 19. Múltiplas Pokédexes por região

Algumas regiões podem ter mais de uma Pokédex.

Regra:

```ts
if (region.pokedexes.length === 1) {
  selectPokedex(region.pokedexes[0].name);
} else {
  showPokedexSelector();
}
```

UX sugerida:

```txt
Kalos
[Todos] [kalos-central] [kalos-coastal] [kalos-mountain]
```

Para opção “Todos”, unir entradas e remover duplicatas por `pokemon_species.url`.

```ts
type PokedexEntry = {
  entry_number: number;
  pokemon_species: {
    name: string;
    url: string;
  };
};

export function mergePokedexEntries(entriesGroups: PokedexEntry[][]): PokedexEntry[] {
  const seen = new Set<string>();
  const result: PokedexEntry[] = [];

  for (const entries of entriesGroups) {
    for (const entry of entries) {
      const key = entry.pokemon_species.url;

      if (!seen.has(key)) {
        seen.add(key);
        result.push(entry);
      }
    }
  }

  return result;
}
```

---

## 20. Modal

### 20.1 Controle por URL

O modal deve ser controlado por query param.

Exemplo:

```txt
/regions/kanto?pokemon=bulbasaur
```

Ao clicar em um card:

```txt
setSearchParams({ pokemon: "bulbasaur" })
```

Ao fechar:

```txt
remove pokemon from search params
```

Benefícios:

- permite deep link;
- mantém contexto da região;
- facilita reload da página com modal aberto;
- evita complexidade de rotas paralelas.

---

### 20.2 Comportamento obrigatório

O modal deve:

- abrir ao clicar no card;
- buscar detalhes sob demanda;
- fechar pelo botão;
- fechar com `Esc`;
- fechar ao clicar no backdrop;
- prender foco enquanto aberto;
- devolver foco ao card depois de fechar;
- usar `role="dialog"`;
- usar `aria-modal="true"`;
- ter título associado via `aria-labelledby`.

---

## 21. Estados de UI

A aplicação deve lidar com:

- carregando regiões;
- erro ao carregar regiões;
- carregando região;
- erro ao carregar região;
- região sem Pokédex;
- carregando Pokédex;
- erro ao carregar Pokédex;
- lista vazia;
- erro parcial em card individual;
- carregando detalhes do modal;
- erro no modal.

Erro em um card não deve quebrar a grade inteira.

Fallback de card:

```txt
Nome vindo de pokemon_species
Imagem indisponível
Tipos indisponíveis
```

---

## 22. Filtros

Escopo do MVP:

- filtro por nome;
- filtro por tipo.

Regra de nome:

```ts
const matchesName = pokemon.displayName.toLowerCase().includes(searchTerm.toLowerCase());
```

Regra de tipo:

```ts
const matchesType = selectedType ? pokemon.types.includes(selectedType) : true;
```

Ordenação padrão:

```txt
entryNumber ascending
```

---

## 23. Design de interface

Layout:

```txt
Header
  Título: Pokédex
  Campo de busca
  Filtro por tipo

RegionTabs
  Kanto | Johto | Hoenn | Sinnoh | ...

PokedexSelector
  Visível apenas quando a região tiver múltiplas Pokédexes

PokemonGrid
  Cards responsivos

PokemonDetailsModal
```

Card:

```txt
#001
Imagem
Bulbasaur
[grass] [poison]
```

Modal:

```txt
Imagem principal
Nome
ID nacional
Tipos
Descrição
Altura
Peso
Abilities
Stats
Categoria
Flags especiais
Evolução
```

---

## 24. Acessibilidade

Requisitos:

- cards devem ser botões ou links acessíveis por teclado;
- evitar `<div onClick>`;
- modal com `role="dialog"`;
- modal com `aria-modal="true"`;
- modal com título acessível;
- `Esc` fecha o modal;
- foco preso dentro do modal;
- foco retorna ao card ao fechar;
- imagens com `alt` descritivo.

Exemplo:

```txt
Imagem de Bulbasaur
```

---

## 25. Tipos visuais

Componente:

```tsx
type PokemonTypeBadgeProps = {
  type: string;
};

export function PokemonTypeBadge({ type }: PokemonTypeBadgeProps) {
  return <span data-pokemon-type={type}>{type}</span>;
}
```

As cores são definidas via `data-pokemon-type` em `app/app.css` (Tailwind CSS v4 — `@layer` ou seletor de atributo puro). Não usar CSS Modules.

```css
/* app/app.css */
[data-pokemon-type="grass"] {
  background-color: #63bc5a;
  color: #fff;
}
[data-pokemon-type="poison"] {
  background-color: #b567ce;
  color: #fff;
}
[data-pokemon-type="fire"] {
  background-color: #ff9c54;
  color: #fff;
}
/* ... demais 15 tipos */
```

Centralizar todas as cores neste arquivo. Não espalhar lógica visual por múltiplos componentes.

---

## 26. Regras de arquitetura

### Permitido

Componentes podem importar:

```ts
useRegions;
useRegion;
usePokedex;
usePokemon;
usePokemonDetails;
```

Hooks podem importar:

```ts
usePokeApiClient;
```

Client da PokeAPI pode importar:

```ts
HttpClient;
```

Implementação HTTP pode importar:

```ts
ky;
```

---

### Proibido

Componentes não podem importar:

```ts
ky;
fetch;
createKyHttpClient;
createPokeApiClient;
```

Hooks de feature não devem importar:

```ts
ky;
fetch;
```

---

## 27. Estratégia de testes

Neste primeiro momento, os testes serão criados com Playwright e não usarão mocks.

Fluxo dos testes:

```txt
Playwright
  -> Browser real
    -> App real
      -> Client real
        -> PokeAPI real
```

A injeção do `PokeApiClient` via Context API continua obrigatória por arquitetura, mas não será usada inicialmente para mockar dados.

Fora do primeiro escopo:

```txt
createMockPokeApiClient.ts
renderWithProviders.tsx
testes de componentes com client mockado
```

Esses itens podem ser adicionados depois, se o projeto passar a ter testes unitários ou testes de componentes.

---

## 28. Golden tests com Playwright

Como os testes usam a PokeAPI real, a suíte inicial deve ser pequena.

Golden tests devem detectar regressões visuais grandes:

- layout quebrado;
- modal fora do lugar;
- cards desalinhados;
- filtros quebrando a grade;
- responsividade ruim;
- mudanças acidentais de UI.

Preferir screenshots de containers específicos:

```ts
await expect(page.getByTestId("pokedex-page")).toHaveScreenshot("kanto-list.png");
```

Evitar screenshots de página inteira quando possível:

```ts
await expect(page).toHaveScreenshot("full-page.png");
```

---

## 29. Golden tests mínimos

### 29.1 Listagem de Kanto em desktop

Fluxo:

```txt
Acessar /regions/kanto
Aguardar Bulbasaur aparecer
Capturar screenshot do container principal
```

Valida:

- carregamento de região;
- carregamento de Pokédex;
- renderização da grade;
- cards;
- imagens;
- nomes;
- tipos.

---

### 29.2 Filtro por nome

Fluxo:

```txt
Acessar /regions/kanto
Aguardar lista carregar
Digitar "bulbasaur"
Aguardar card Bulbasaur
Capturar screenshot da listagem
```

Valida:

- campo de busca;
- filtro client-side;
- card filtrado;
- estado visual da grade.

---

### 29.3 Modal de detalhes

Fluxo:

```txt
Acessar /regions/kanto
Clicar em Bulbasaur
Aguardar modal abrir
Capturar screenshot do modal
```

Valida:

- clique no card;
- query param do modal;
- carregamento sob demanda;
- layout do modal;
- dados principais.

---

### 29.4 Responsivo mobile

Fluxo:

```txt
Viewport mobile
Acessar /regions/kanto
Aguardar Bulbasaur aparecer
Capturar screenshot do container principal
```

Valida:

- responsividade;
- grid mobile;
- header;
- filtros;
- cards.

---

## 30. Configuração Playwright

Arquivo:

```txt
playwright.config.ts
```

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          width: 1280,
          height: 900,
        },
      },
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 5"],
      },
    },
  ],
});
```

---

## 31. Exemplo de golden tests

Arquivo:

```txt
tests/golden/pokedex.golden.spec.ts
```

```ts
import { expect, test } from "@playwright/test";

test.describe("Pokédex golden tests", () => {
  test("renders Kanto list on desktop", async ({ page }) => {
    await page.goto("/regions/kanto");

    await expect(page.getByRole("heading", { name: /pokédex/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /bulbasaur/i })).toBeVisible();

    await expect(page.getByTestId("pokedex-page")).toHaveScreenshot("kanto-list-desktop.png", {
      animations: "disabled",
    });
  });

  test("renders filtered list by Pokémon name", async ({ page }) => {
    await page.goto("/regions/kanto");

    await expect(page.getByRole("button", { name: /bulbasaur/i })).toBeVisible();

    await page.getByRole("searchbox", { name: /buscar pokémon/i }).fill("bulbasaur");

    await expect(page.getByRole("button", { name: /bulbasaur/i })).toBeVisible();

    await expect(page.getByTestId("pokemon-grid")).toHaveScreenshot(
      "kanto-filtered-bulbasaur.png",
      {
        animations: "disabled",
      },
    );
  });

  test("renders Pokémon details modal", async ({ page }) => {
    await page.goto("/regions/kanto");

    await page.getByRole("button", { name: /bulbasaur/i }).click();

    await expect(page).toHaveURL(/pokemon=bulbasaur/);
    await expect(page.getByRole("dialog", { name: /bulbasaur/i })).toBeVisible();

    await expect(page.getByRole("dialog", { name: /bulbasaur/i })).toHaveScreenshot(
      "bulbasaur-modal.png",
      {
        animations: "disabled",
      },
    );
  });

  test("renders Kanto list on mobile", async ({ page }) => {
    await page.goto("/regions/kanto");

    await expect(page.getByRole("button", { name: /bulbasaur/i })).toBeVisible();

    await expect(page.getByTestId("pokedex-page")).toHaveScreenshot("kanto-list-mobile.png", {
      animations: "disabled",
    });
  });
});
```

---

## 32. Requisitos para facilitar Playwright

Usar `data-testid` apenas em containers estáveis.

Recomendado:

```tsx
<main data-testid="pokedex-page">
  ...
</main>

<section data-testid="pokemon-grid">
  ...
</section>

<div data-testid="pokemon-details-modal">
  ...
</div>
```

Para interação e asserts funcionais, preferir:

```ts
getByRole;
getByLabel;
getByText;
```

Exemplos:

```ts
page.getByRole("button", { name: /bulbasaur/i });
page.getByRole("searchbox", { name: /buscar pokémon/i });
page.getByRole("dialog", { name: /bulbasaur/i });
```

---

## 33. Testes unitários úteis no futuro

Os testes unitários não fazem parte do primeiro foco. Eles podem ser adicionados depois para proteger lógica pura.

Devem cobrir funções sem React, sem browser e sem rede.

### 33.1 formatPokemonName

Casos:

```txt
bulbasaur -> Bulbasaur
mr-mime -> Mr Mime
ho-oh -> Ho Oh
type-null -> Type Null
```

---

### 33.2 normalizeFlavorText

Casos:

```txt
remove \n
remove \f
colapsa espaços duplicados
remove espaços no início e fim
```

---

### 33.3 getPokemonImage

Ordem esperada:

```txt
official-artwork.front_default
home.front_default
front_default
null
```

---

### 33.4 Conversão de altura e peso

Casos:

```txt
height 7 -> 0.7 m
weight 69 -> 6.9 kg
```

---

### 33.5 mergePokedexEntries

Casos:

```txt
mantém entradas únicas
remove duplicatas por pokemon_species.url
preserva a primeira ocorrência
retorna array vazio quando não há entradas
```

---

### 33.6 Filtro por nome

Casos:

```txt
case insensitive
match parcial
sem termo retorna todos
termo sem resultado retorna lista vazia
```

---

### 33.7 Filtro por tipo

Casos:

```txt
grass encontra Bulbasaur
poison encontra Bulbasaur
fire não encontra Bulbasaur
sem tipo selecionado retorna todos
```

---

### 33.8 Mapper de card

Casos:

```txt
usa entry_number da Pokédex
usa id nacional do Pokémon
formata displayName
extrai types ordenados por slot
usa fallback de imagem
preserva speciesName e speciesUrl
```

---

### 33.9 Mapper de detalhes

Casos:

```txt
converte altura
converte peso
mapeia abilities
mapeia hidden ability
mapeia stats
seleciona descrição em inglês
seleciona genus em inglês
mapeia flags isBaby, isLegendary e isMythical
```

---

### 33.10 Helpers de URL do modal

Casos:

```txt
adiciona ?pokemon=bulbasaur
remove pokemon mantendo outros query params
lê pokemon da URL
retorna null quando não existe
```

---

## 34. Critérios de aceite

### 34.1 Arquitetura

- O projeto usa Ky.
- O projeto não usa `fetch` diretamente para consumir a PokeAPI.
- Ky fica encapsulado em `KyHttpClient`.
- Existe uma interface `HttpClient`.
- Existe uma interface `PokeApiClient`.
- `PokeApiClient` é injetado via Context API.
- Componentes não conhecem Ky.
- Hooks não conhecem Ky.
- `AbortSignal` é propagado do TanStack Query até o Ky.
- Timeout, retry e base URL ficam centralizados.

---

### 34.2 Regiões

- A aplicação carrega regiões da PokeAPI.
- O usuário consegue selecionar uma região.
- A região selecionada é refletida na URL.
- Ao carregar uma região, a aplicação identifica suas Pokédexes.
- Se houver múltiplas Pokédexes, a aplicação exibe seletor secundário.

---

### 34.3 Lista

- A aplicação lista Pokémon por Pokédex regional.
- Cada card exibe:

  - número regional;
  - nome;
  - imagem;
  - tipos.

- A lista possui loading state.
- A lista possui error state.
- Erro em um card não quebra a tela inteira.
- A lista pode ser filtrada por nome.
- A lista pode ser filtrada por tipo.

---

### 34.4 Modal

- Clicar em um card abre modal.
- Modal é controlado por query param.
- URL com `?pokemon=bulbasaur` abre o modal diretamente.
- Modal busca detalhes sob demanda.
- Modal exibe dados principais do Pokémon.
- Modal fecha por botão.
- Modal fecha por `Esc`.
- Modal fecha por backdrop.
- Modal respeita acessibilidade básica.

---

### 34.5 Testes

- Testes iniciais usam Playwright.
- Testes iniciais usam a PokeAPI real.
- Testes iniciais não mockam `PokeApiClient`.
- Testes iniciais não interceptam requests.
- Golden tests cobrem poucos fluxos críticos.
- Screenshots devem focar containers estáveis.
- Interações devem usar roles e labels quando possível.

---

## 35. Fora do MVP

Não implementar inicialmente:

- favoritos persistidos;
- autenticação;
- backend próprio;
- GraphQL;
- modo offline completo;
- comparação entre Pokémon;
- infinite scroll;
- virtualização;
- tradução completa para português;
- animações complexas;
- busca global em todos os Pokémon;
- cache persistente em IndexedDB;
- mocks para testes de componentes.

---

## 36. Ordem recomendada de implementação

1. Instalar `@tanstack/react-query` e `@playwright/test` (`ky` já está instalado).
2. Criar tipos da PokeAPI em `app/types/api.ts` e `app/types/viewModels.ts`.
3. Criar `app/lib/http/HttpClient.ts`.
4. Criar `app/lib/http/KyHttpClient.ts`.
5. Criar `app/lib/pokemon/PokeApiClient.ts`.
6. Criar `app/lib/pokemon/createPokeApiClient.ts`.
7. Criar `app/lib/pokemon/PokeApiClientContext.tsx`.
8. Criar `app/components/AppProviders.tsx` e integrá-lo em `app/root.tsx`.
9. Criar `app/lib/pokemon/pokemonQueryKeys.ts`.
10. Criar hooks em `app/hooks/`:

    - `useRegions.ts`;
    - `useRegion.ts`;
    - `usePokedex.ts`;
    - `usePokemon.ts`;
    - `usePokemonDetails.ts`.

11. Criar utils e mappers em `app/lib/pokemon/`.
12. Criar componentes compartilhados: `Spinner`, `ErrorState`, `EmptyState`, `Modal`.
13. Criar `app/routes/regions.$regionName.tsx` e registrar em `app/routes.ts`.
14. Criar `app/routes/home.tsx` redirecionando para `/regions/kanto`.
15. Criar `RegionTabs`, `PokedexSelector`, `PokemonTypeBadge`.
16. Criar `PokemonCard` e `PokemonGrid`.
17. Implementar filtros por nome e tipo na rota.
18. Criar `PokemonDetailsModal` controlado por query param `?pokemon=`.
19. Buscar detalhes no modal com `usePokemonDetails`.
20. Implementar `StatBar` e `EvolutionChain` no modal.
21. Refinar loading, error e empty states em todos os níveis.
22. Configurar Playwright (`playwright.config.ts`).
23. Adicionar golden tests mínimos em `tests/golden/pokedex.golden.spec.ts`.
24. Gerar snapshots de referência com `--update-snapshots`.
25. Depois, se necessário, adicionar testes unitários para utils e mappers.

---

## 37. Decisão final

A aplicação deve ter client HTTP centralizado com Ky, mas o restante do app deve depender apenas da interface `PokeApiClient`.

A arquitetura final é:

```txt
React Page
  -> Feature Hooks
    -> usePokeApiClient()
      -> PokeApiClient interface
        -> createPokeApiClient()
          -> HttpClient interface
            -> KyHttpClient
              -> ky
                -> PokeAPI
```

A estratégia inicial de testes é:

```txt
Playwright
  -> Browser real
    -> App real
      -> Client real
        -> PokeAPI real
```

Mocks ficam fora do primeiro momento.

A suíte inicial deve ser pequena, visual e focada em regressões relevantes. Testes unitários entram depois apenas para funções puras que concentram regra de transformação ou negócio.
