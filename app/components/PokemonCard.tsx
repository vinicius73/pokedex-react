import { mapPokemonListItem } from "~/lib/pokemon/mappers/pokemonMappers";
import { usePokemon } from "~/hooks/usePokemon";
import type { PokedexEntry } from "~/lib/pokemon/utils/mergePokedexEntries";
import { PokemonTypeBadge } from "~/components/PokemonTypeBadge";
import { Spinner } from "~/components/Spinner";

type PokemonCardProps = {
  entry: PokedexEntry;
  typeFilter: string | null;
  onSelect: (name: string, triggerElement: HTMLElement) => void;
  animationDelay?: number;
};

function formatEntryNumber(entryNumber: number): string {
  return String(entryNumber).padStart(3, "0");
}

function matchesTypeFilter(types: string[], typeFilter: string | null): boolean {
  if (typeFilter === null) {
    return true;
  }

  return types.some(
    (type) => type.toLowerCase() === typeFilter.toLowerCase(),
  );
}

export function PokemonCard({
  entry,
  typeFilter,
  onSelect,
  animationDelay = 0,
}: PokemonCardProps) {
  const pokemonQuery = usePokemon(entry.pokemon_species.name);

  if (pokemonQuery.isLoading) {
    if (typeFilter !== null) {
      return null;
    }

    return (
      <button
        type="button"
        disabled
        className="pokdex-card min-h-48 items-center justify-center p-4 opacity-70"
        style={{ animationDelay: `${animationDelay}ms` }}
        aria-label={`Loading ${entry.pokemon_species.name}`}
      >
        <Spinner className="h-5 w-5 text-ink-faint" />
      </button>
    );
  }

  if (pokemonQuery.isError || !pokemonQuery.data) {
    return (
      <button
        type="button"
        disabled
        className="pokdex-card min-h-48 items-center justify-center border-crimson/30 bg-crimson/5 p-4"
        aria-label={`Failed to load ${entry.pokemon_species.name}`}
      >
        <span className="pokdex-mono text-xs font-medium text-gold">
          {formatEntryNumber(entry.entry_number)}
        </span>
        <span className="mt-1 text-sm text-crimson">Unavailable</span>
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
      className="pokdex-card group pokdex-animate-in p-4"
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-label={item.displayName}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className="pokdex-mono text-[0.6875rem] font-medium tracking-wide text-gold">
          #{formatEntryNumber(item.entryNumber)}
        </span>
        <span
          className="text-[0.625rem] font-medium uppercase tracking-wider text-ink-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        >
          View
        </span>
      </div>

      <div className="mx-auto mt-1 flex h-24 w-full max-w-[7.5rem] items-center justify-center rounded-xl bg-gradient-to-b from-parchment to-parchment-deep/70 p-2 dark:from-parchment-deep-dark dark:to-parchment-dark">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="h-20 w-20 object-contain drop-shadow-[0_4px_8px_rgba(28,25,23,0.12)] transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="text-xs text-ink-faint">No image</span>
        )}
      </div>

      <span className="pokdex-display mt-3 line-clamp-1 text-center text-base font-semibold leading-tight text-ink dark:text-ink-dark">
        {item.displayName}
      </span>

      <div className="mt-auto flex flex-wrap justify-center gap-1 pt-3">
        {item.types.map((type) => (
          <PokemonTypeBadge key={type} type={type} />
        ))}
      </div>
    </button>
  );
}
