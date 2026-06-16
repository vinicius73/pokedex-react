import { useEffect, useMemo, useRef, useState } from "react";
import { isRouteErrorResponse, useParams, useSearchParams } from "react-router";
import { EmptyState } from "~/components/EmptyState";
import { ErrorState } from "~/components/ErrorState";
import { PokedexSelector } from "~/components/PokedexSelector";
import { PokemonDetailsModal } from "~/components/PokemonDetailsModal";
import { PokemonGrid } from "~/components/PokemonGrid";
import { RegionTabs } from "~/components/RegionTabs";
import { Spinner } from "~/components/Spinner";
import { usePokedex } from "~/hooks/usePokedex";
import { useRegion } from "~/hooks/useRegion";
import { useRegionPokedexes } from "~/hooks/useRegionPokedexes";
import { useRegions } from "~/hooks/useRegions";
import { POKEMON_TYPES } from "~/lib/pokemon/constants/pokemonTypes";
import { formatPokemonName } from "~/lib/pokemon/utils/formatPokemonName";
import type { PokedexEntry } from "~/lib/pokemon/utils/mergePokedexEntries";
import type { Route } from "./+types/regions.$regionName";

export function meta({ params }: Route.MetaArgs) {
  const regionName = params.regionName ?? "kanto";

  return [
    { title: `Pokédex — ${regionName}` },
    {
      name: "description",
      content: `Browse Pokémon in the ${regionName} region.`,
    },
  ];
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong loading this region.";

  if (isRouteErrorResponse(error)) {
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <main data-testid="pokedex-page" className="mx-auto max-w-7xl px-4 py-8">
      <ErrorState message={message} />
    </main>
  );
}

function filterEntriesByName(entries: PokedexEntry[], nameQuery: string) {
  const normalizedQuery = nameQuery.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return entries;
  }

  return entries.filter((entry) => {
    const speciesName = entry.pokemon_species.name.toLowerCase();
    const displayName = formatPokemonName(entry.pokemon_species.name).toLowerCase();

    return speciesName.includes(normalizedQuery) || displayName.includes(normalizedQuery);
  });
}

export default function RegionPage() {
  const { regionName = "kanto" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const modalTriggerRef = useRef<HTMLElement | null>(null);

  const nameQuery = searchParams.get("q") ?? "";
  const typeFilter = searchParams.get("type");

  const regionsQuery = useRegions();
  const regionQuery = useRegion(regionName);

  const pokedexes = regionQuery.data?.pokedexes ?? [];
  const hasMultiplePokedexes = pokedexes.length > 1;
  const firstPokedexName = pokedexes[0]?.name;

  const [userPokedexSelection, setUserPokedexSelection] = useState<string | "all" | null>(null);
  const [pokedexSelectionRegion, setPokedexSelectionRegion] = useState(regionName);
  const previousRegionRef = useRef(regionName);

  if (pokedexSelectionRegion !== regionName) {
    setPokedexSelectionRegion(regionName);
    setUserPokedexSelection(null);
  }

  const selectedPokedex = userPokedexSelection ?? firstPokedexName ?? "all";

  useEffect(() => {
    if (previousRegionRef.current === regionName) {
      return;
    }

    previousRegionRef.current = regionName;

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("q");
        next.delete("type");
        next.delete("pokemon");
        return next;
      },
      { replace: true },
    );
  }, [regionName, setSearchParams]);

  const singlePokedexQuery = usePokedex(selectedPokedex !== "all" ? selectedPokedex : null);

  const allPokedexQuery = useRegionPokedexes(
    selectedPokedex === "all" && hasMultiplePokedexes
      ? pokedexes.map((pokedex) => pokedex.name)
      : null,
  );

  const entries = useMemo(() => {
    if (selectedPokedex === "all" && hasMultiplePokedexes) {
      return allPokedexQuery.entries ?? [];
    }

    return singlePokedexQuery.data?.pokemon_entries ?? [];
  }, [
    allPokedexQuery.entries,
    hasMultiplePokedexes,
    selectedPokedex,
    singlePokedexQuery.data?.pokemon_entries,
  ]);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => a.entry_number - b.entry_number),
    [entries],
  );

  const filteredEntries = useMemo(
    () => filterEntriesByName(sortedEntries, nameQuery),
    [sortedEntries, nameQuery],
  );

  const isLoadingPokedex =
    selectedPokedex === "all" && hasMultiplePokedexes
      ? allPokedexQuery.isLoading
      : singlePokedexQuery.isLoading;

  const pokedexError =
    selectedPokedex === "all" && hasMultiplePokedexes
      ? allPokedexQuery.error
      : singlePokedexQuery.error;

  const hasPokedexError =
    selectedPokedex === "all" && hasMultiplePokedexes
      ? allPokedexQuery.isError
      : singlePokedexQuery.isError;

  function handleNameQueryChange(value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);

        if (value.trim().length === 0) {
          next.delete("q");
        } else {
          next.set("q", value);
        }

        return next;
      },
      { replace: true },
    );
  }

  function handleTypeFilterChange(value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);

        if (value.length === 0) {
          next.delete("type");
        } else {
          next.set("type", value);
        }

        return next;
      },
      { replace: true },
    );
  }

  function handleSelectPokemon(name: string, triggerElement: HTMLElement) {
    modalTriggerRef.current = triggerElement;

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("pokemon", name);
        return next;
      },
      { replace: true },
    );
  }

  function renderContent() {
    if (regionsQuery.isLoading) {
      return (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-crimson" />
        </div>
      );
    }

    if (regionsQuery.isError) {
      return <ErrorState message="Failed to load regions. Please try again later." />;
    }

    if (regionQuery.isLoading) {
      return (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-crimson" />
        </div>
      );
    }

    if (regionQuery.isError) {
      return <ErrorState message={`Failed to load the ${regionName} region.`} />;
    }

    if (pokedexes.length === 0) {
      return <EmptyState message="No Pokédex available for this region." />;
    }

    if (isLoadingPokedex) {
      return (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-crimson" />
        </div>
      );
    }

    if (hasPokedexError) {
      return (
        <ErrorState
          message={
            pokedexError instanceof Error ? pokedexError.message : "Failed to load Pokédex entries."
          }
        />
      );
    }

    if (sortedEntries.length === 0) {
      return <EmptyState message="No Pokémon found in this Pokédex." />;
    }

    if (filteredEntries.length === 0) {
      return <EmptyState message="No Pokémon match your search." />;
    }

    return (
      <PokemonGrid
        entries={filteredEntries}
        typeFilter={typeFilter}
        onSelectPokemon={handleSelectPokemon}
      />
    );
  }

  return (
    <>
      <main
        data-testid="pokedex-page"
        className="relative z-[1] mx-auto max-w-7xl px-4 py-8 sm:py-10"
      >
        <header className="mb-8 space-y-6 sm:mb-10">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-crimson uppercase">
              Regional encyclopedia
            </p>
            <h1 className="pokdex-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl dark:text-ink-dark">
              Pokédex
            </h1>
          </div>

          {regionsQuery.data ? (
            <RegionTabs regions={regionsQuery.data.results} activeRegion={regionName} />
          ) : null}

          {pokedexes.length > 0 ? (
            <PokedexSelector
              pokedexes={pokedexes}
              selected={selectedPokedex}
              onChange={setUserPokedexSelection}
            />
          ) : null}

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-raised/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center dark:border-border-dark dark:bg-surface-raised-dark/80">
            <div className="flex-1">
              <label htmlFor="pokemon-search" className="sr-only">
                Search Pokémon
              </label>
              <input
                id="pokemon-search"
                type="search"
                aria-label="Search Pokémon"
                placeholder="Search by name…"
                value={nameQuery}
                onChange={(event) => handleNameQueryChange(event.target.value)}
                className="pokdex-field"
              />
            </div>

            <div className="sm:w-52">
              <label htmlFor="type-filter" className="sr-only">
                Filter by type
              </label>
              <select
                id="type-filter"
                aria-label="Filter by type"
                value={typeFilter ?? ""}
                onChange={(event) => handleTypeFilterChange(event.target.value)}
                className="pokdex-field"
              >
                <option value="">All types</option>
                {POKEMON_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatPokemonName(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {renderContent()}
      </main>

      <PokemonDetailsModal triggerRef={modalTriggerRef} />
    </>
  );
}
