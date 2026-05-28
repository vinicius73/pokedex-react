import { mapPokemonListItem } from "~/lib/pokemon/mappers/pokemonMappers";
import { usePokemon } from "~/hooks/usePokemon";
import type { PokedexEntry } from "~/lib/pokemon/utils/mergePokedexEntries";
import { PokemonTypeBadge } from "~/components/PokemonTypeBadge";
import { Spinner } from "~/components/Spinner";

type PokemonCardProps = {
  entry: PokedexEntry;
  typeFilter: string | null;
  onSelect: (name: string, triggerElement: HTMLElement) => void;
};

function formatEntryNumber(entryNumber: number): string {
  return `#${String(entryNumber).padStart(3, "0")}`;
}

function matchesTypeFilter(types: string[], typeFilter: string | null): boolean {
  if (typeFilter === null) {
    return true;
  }

  return types.some(
    (type) => type.toLowerCase() === typeFilter.toLowerCase(),
  );
}

export function PokemonCard({ entry, typeFilter, onSelect }: PokemonCardProps) {
  const pokemonQuery = usePokemon(entry.pokemon_species.name);

  if (pokemonQuery.isLoading) {
    if (typeFilter !== null) {
      return null;
    }

    return (
      <button
        type="button"
        disabled
        className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        aria-label={`Loading ${entry.pokemon_species.name}`}
      >
        <Spinner className="h-5 w-5 text-gray-400" />
      </button>
    );
  }

  if (pokemonQuery.isError || !pokemonQuery.data) {
    return (
      <button
        type="button"
        disabled
        className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30"
        aria-label={`Failed to load ${entry.pokemon_species.name}`}
      >
        <span className="text-xs text-red-600 dark:text-red-400">
          {formatEntryNumber(entry.entry_number)}
        </span>
        <span className="mt-1 text-sm text-red-700 dark:text-red-300">
          Unavailable
        </span>
      </button>
    );
  }

  const item = mapPokemonListItem(entry, pokemonQuery.data);

  if (!matchesTypeFilter(item.types, typeFilter)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={(event) => onSelect(entry.pokemon_species.name, event.currentTarget)}
      className="flex min-h-44 flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-gray-800 dark:bg-gray-900"
      aria-label={item.displayName}
    >
      <span className="self-start text-xs font-medium text-gray-500 dark:text-gray-400">
        {formatEntryNumber(item.entryNumber)}
      </span>

      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.displayName}
          className="h-20 w-20 object-contain"
          loading="lazy"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center text-xs text-gray-400">
          No image
        </div>
      )}

      <span className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        {item.displayName}
      </span>

      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {item.types.map((type) => (
          <PokemonTypeBadge key={type} type={type} />
        ))}
      </div>
    </button>
  );
}
