import { PokemonCard } from "~/components/PokemonCard";
import type { PokedexEntry } from "~/lib/pokemon/utils/mergePokedexEntries";

type PokemonGridProps = {
  entries: PokedexEntry[];
  typeFilter: string | null;
  onSelectPokemon: (name: string, triggerElement: HTMLElement) => void;
};

const STAGGER_CAP_MS = 400;
const STAGGER_STEP_MS = 18;

export function PokemonGrid({
  entries,
  typeFilter,
  onSelectPokemon,
}: PokemonGridProps) {
  return (
    <section
      data-testid="pokemon-grid"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5"
    >
      {entries.map((entry, index) => (
        <PokemonCard
          key={entry.pokemon_species.url}
          entry={entry}
          typeFilter={typeFilter}
          onSelect={onSelectPokemon}
          animationDelay={Math.min(index * STAGGER_STEP_MS, STAGGER_CAP_MS)}
        />
      ))}
    </section>
  );
}
