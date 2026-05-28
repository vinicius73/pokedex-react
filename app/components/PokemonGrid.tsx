import { PokemonCard } from "~/components/PokemonCard";
import type { PokedexEntry } from "~/lib/pokemon/utils/mergePokedexEntries";

type PokemonGridProps = {
  entries: PokedexEntry[];
  typeFilter: string | null;
  onSelectPokemon: (name: string, triggerElement: HTMLElement) => void;
};

export function PokemonGrid({
  entries,
  typeFilter,
  onSelectPokemon,
}: PokemonGridProps) {
  return (
    <section
      data-testid="pokemon-grid"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {entries.map((entry) => (
        <PokemonCard
          key={entry.pokemon_species.url}
          entry={entry}
          typeFilter={typeFilter}
          onSelect={onSelectPokemon}
        />
      ))}
    </section>
  );
}
