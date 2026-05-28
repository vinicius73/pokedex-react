# Milestones — Pokédex AI

> Ordem de entrega incremental. Cada milestone produz código funcionando e integrável ao anterior.
> Adapta a estrutura de pastas do doc de referência para `app/` (convenção do projeto).

---

## M1 — Fundação: dependências, tipos e camada HTTP

**Objetivo:** ter a stack de dados pronta antes de qualquer UI.

### Tarefas

- [ ] Instalar `@tanstack/react-query` e `@playwright/test`
- [ ] Criar tipos da PokeAPI em `app/types/api.ts`
  - `NamedApiResource`, `NamedApiResourceList`, `Region`, `Pokedex`, `Pokemon`, `PokemonSpecies`, `EvolutionChain`, `EvolutionChainLink`, `EvolutionDetail`, `PokemonTypeDetails`
- [ ] Criar `app/lib/http/HttpClient.ts` — interface `HttpClient` + `HttpRequestOptions`
- [ ] Criar `app/lib/http/KyHttpClient.ts` — `createKyHttpClient` encapsulando Ky
- [ ] Criar `app/lib/pokemon/PokeApiClient.ts` — interface `PokeApiClient`
- [ ] Criar `app/lib/pokemon/createPokeApiClient.ts` — implementação concreta da interface
- [ ] Criar `app/lib/pokemon/PokeApiClientContext.tsx` — `PokeApiClientProvider` + `usePokeApiClient`
- [ ] Criar `app/components/AppProviders.tsx` — `QueryClient` + `PokeApiClientProvider` com base URL centralizada
- [ ] Integrar `AppProviders` no `app/root.tsx`
- [ ] Criar `app/lib/pokemon/pokemonQueryKeys.ts` — chaves tipadas para TanStack Query
- [ ] Criar hooks em `app/hooks/`:
  - `useRegions.ts`
  - `useRegion.ts`
  - `usePokedex.ts`
  - `usePokemon.ts`
  - `usePokemonDetails.ts` (pokemon + species + evolution chain encadeados)

### Critério de aceite

- `usePokeApiClient()` fora de provider lança erro explícito
- `AbortSignal` é propagado em todos os hooks
- Nenhum componente, hook ou página importa `ky` diretamente

---

## M2 — Utils, mappers e ViewModels

**Objetivo:** ter toda a transformação de dados isolada em funções puras testáveis.

### Tarefas

- [ ] Criar `app/types/viewModels.ts`
  - `PokemonListItem`
  - `PokemonDetailsViewModel`
- [ ] Criar `app/lib/pokemon/utils/formatPokemonName.ts`
- [ ] Criar `app/lib/pokemon/utils/getPokemonImage.ts` — fallback em 3 níveis
- [ ] Criar `app/lib/pokemon/utils/normalizeFlavorText.ts` — remove `\f`, `\n`, espaços múltiplos
- [ ] Criar `app/lib/pokemon/mappers/pokemonMappers.ts`
  - mapper de `PokemonListItem` a partir de `PokedexEntry` + `Pokemon`
  - mapper de `PokemonDetailsViewModel` a partir de `Pokemon` + `PokemonSpecies`
  - conversão decímetros → metros e hectogramas → kg
  - seleção de flavor text em inglês
  - seleção de genus em inglês
- [ ] Criar `app/lib/pokemon/mappers/evolutionMappers.ts` — achata `EvolutionChainLink` recursivo em lista linear
- [ ] Criar `app/lib/pokemon/utils/mergePokedexEntries.ts` — deduplica por `pokemon_species.url`
- [ ] Criar `app/lib/pokemon/utils/filterPokemon.ts` — filtro por nome (case-insensitive, parcial) e por tipo

### Critério de aceite

- Todas as funções são puras (sem React, sem rede, sem side-effects)
- Pronto para receber testes unitários no M5 sem mudanças

---

## M3 — Página principal e listagem regional

**Objetivo:** usuário consegue navegar entre regiões e ver a grade de Pokémon.

### Tarefas

- [ ] Criar rota `app/routes/regions.$regionName.tsx` — rota principal `/regions/:regionName`
- [ ] Criar `app/routes/home.tsx` — redireciona `/` para `/regions/kanto`
- [ ] Registrar rotas em `app/routes.ts`
- [ ] Criar componentes compartilhados em `app/components/`:
  - `Spinner.tsx`
  - `ErrorState.tsx`
  - `EmptyState.tsx`
- [ ] Criar `app/components/RegionTabs.tsx` — abas para cada região, ativa a da URL
- [ ] Criar `app/components/PokedexSelector.tsx` — visível apenas quando região tem múltiplas Pokédexes; inclui opção "All" com `mergePokedexEntries`
- [ ] Criar `app/components/PokemonTypeBadge.tsx` — `data-pokemon-type` attribute; cores centralizadas em CSS
- [ ] Criar `app/components/PokemonCard.tsx`
  - exibe número regional, nome, imagem, tipos
  - é `<button>` acessível por teclado
  - erro isolado: não quebra a grade
- [ ] Criar `app/components/PokemonGrid.tsx` — renderiza cards em grid responsivo
- [ ] Implementar todos os estados de UI na rota:
  - carregando regiões / região / Pokédex
  - erro em cada nível
  - região sem Pokédex
  - lista vazia
- [ ] Adicionar `data-testid="pokedex-page"` no `<main>` e `data-testid="pokemon-grid"` no `<section>`

### Critério de aceite

- Acessar `/regions/kanto` exibe os 151 Pokémon de Kanto
- Acessar `/regions/kalos` exibe o seletor de Pokédex
- Opção "All" de Kalos mescla entradas sem duplicatas
- Navegação entre regiões atualiza a URL e a lista
- Erro em um card não quebra a grade inteira

---

## M4 — Filtros, modal de detalhes e acessibilidade

**Objetivo:** usuário consegue filtrar a lista e ver os detalhes de qualquer Pokémon.

### Tarefas

- [ ] Adicionar campo de busca no header — `role="searchbox"`, label acessível
- [ ] Adicionar seletor de tipo — lista derivada dos tipos presentes na Pokédex ativa
- [ ] Integrar `filterPokemon` na rota — filtragem client-side, ordenação por `entryNumber`
- [ ] Criar `app/components/Modal.tsx` — base acessível:
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
  - fecha com `Esc` e clique no backdrop
  - prende foco enquanto aberto
  - devolve foco ao elemento que abriu
- [ ] Criar `app/components/StatBar.tsx` — barra de progresso para cada stat
- [ ] Criar `app/components/EvolutionChain.tsx` — cadeia evolutiva linear com setas
- [ ] Criar `app/components/PokemonDetailsModal.tsx`:
  - controlado por query param `?pokemon=<name>`
  - usa `usePokemonDetails` para buscar sob demanda
  - exibe todos os campos do `PokemonDetailsViewModel` + evolution chain
  - loading state e error state internos
  - adicionar `data-testid="pokemon-details-modal"`
- [ ] Implementar abertura do modal ao clicar no card (`setSearchParams`)
- [ ] Implementar fechamento sem perder query params de filtro
- [ ] Garantir que URL com `?pokemon=bulbasaur` abre modal diretamente (deep link)

### Critério de aceite

- Filtro por nome é case-insensitive e parcial
- Filtro por tipo restringe corretamente
- Modal abre, fecha por botão/Esc/backdrop
- Foco é retornado ao card após fechar
- Deep link funciona: recarregar a página com `?pokemon=bulbasaur` abre o modal
- Imagens têm `alt` descritivo

---

## M5 — Testes Playwright e polimento final

**Objetivo:** detectar regressões visuais e validar os fluxos críticos.

### Tarefas

- [ ] Criar `playwright.config.ts` com projetos `chromium-desktop` e `chromium-mobile`
- [ ] Criar `tests/golden/pokedex.golden.spec.ts` com os 4 golden tests mínimos:
  1. Listagem de Kanto em desktop — screenshot de `[data-testid="pokedex-page"]`
  2. Filtro por nome "bulbasaur" — screenshot de `[data-testid="pokemon-grid"]`
  3. Modal de Bulbasaur — screenshot de `role="dialog"`
  4. Listagem de Kanto em mobile — viewport Pixel 5
- [ ] Adicionar script `"test"` no `package.json` para rodar Playwright
- [ ] Gerar snapshots de referência iniciais (`--update-snapshots`)
- [ ] Verificar que todos os testes passam em modo headless

### Fora do escopo (pode entrar depois)

- Testes unitários de utils e mappers (M2 já os deixa prontos)
- Mock de `PokeApiClient` para testes de componente
- `renderWithProviders` helper

### Critério de aceite

- `npx playwright test` passa sem falhas em CI
- Screenshots de referência gerados e commitados
- Tolerância de diff configurada em `maxDiffPixelRatio: 0.02`

---

## Dependências entre milestones

```
M1 (HTTP + hooks)
  └─> M2 (utils + mappers)
        └─> M3 (listagem regional)
              └─> M4 (filtros + modal)
                    └─> M5 (testes)
```

M2 pode ser trabalhado em paralelo com partes de M3, pois os mappers não dependem da UI.
