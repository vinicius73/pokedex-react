import { useEffect, useMemo, useState } from "react";
import { isRouteErrorResponse, useParams } from "react-router";
import { EmptyState } from "~/components/EmptyState";
import { ErrorState } from "~/components/ErrorState";
import { PokedexSelector } from "~/components/PokedexSelector";
import { PokemonGrid } from "~/components/PokemonGrid";
import { RegionTabs } from "~/components/RegionTabs";
import { Spinner } from "~/components/Spinner";
import { usePokedex } from "~/hooks/usePokedex";
import { useRegion } from "~/hooks/useRegion";
import { useRegionPokedexes } from "~/hooks/useRegionPokedexes";
import { useRegions } from "~/hooks/useRegions";
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

export default function RegionPage() {
  const { regionName = "kanto" } = useParams();
  const regionsQuery = useRegions();
  const regionQuery = useRegion(regionName);

  const pokedexes = regionQuery.data?.pokedexes ?? [];
  const hasMultiplePokedexes = pokedexes.length > 1;
  const pokedexNamesKey = pokedexes.map((pokedex) => pokedex.name).join(",");

  const [selectedPokedex, setSelectedPokedex] = useState<string | "all">("all");

  useEffect(() => {
    if (pokedexes.length >= 1) {
      setSelectedPokedex(pokedexes[0].name);
    }
  }, [regionName, pokedexNamesKey]);

  const singlePokedexQuery = usePokedex(
    selectedPokedex !== "all" ? selectedPokedex : null,
  );

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

  function renderContent() {
    if (regionsQuery.isLoading) {
      return (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-blue-600" />
        </div>
      );
    }

    if (regionsQuery.isError) {
      return (
        <ErrorState message="Failed to load regions. Please try again later." />
      );
    }

    if (regionQuery.isLoading) {
      return (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-blue-600" />
        </div>
      );
    }

    if (regionQuery.isError) {
      return (
        <ErrorState message={`Failed to load the ${regionName} region.`} />
      );
    }

    if (pokedexes.length === 0) {
      return <EmptyState message="No Pokédex available for this region." />;
    }

    if (isLoadingPokedex) {
      return (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-blue-600" />
        </div>
      );
    }

    if (hasPokedexError) {
      return (
        <ErrorState
          message={
            pokedexError instanceof Error
              ? pokedexError.message
              : "Failed to load Pokédex entries."
          }
        />
      );
    }

    if (sortedEntries.length === 0) {
      return <EmptyState message="No Pokémon found in this Pokédex." />;
    }

    return <PokemonGrid entries={sortedEntries} />;
  }

  return (
    <main data-testid="pokedex-page" className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Pokédex
        </h1>

        {regionsQuery.data ? (
          <RegionTabs
            regions={regionsQuery.data.results}
            activeRegion={regionName}
          />
        ) : null}

        {pokedexes.length > 0 ? (
          <PokedexSelector
            pokedexes={pokedexes}
            selected={selectedPokedex}
            onChange={setSelectedPokedex}
          />
        ) : null}
      </header>

      {renderContent()}
    </main>
  );
}
