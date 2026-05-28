import { formatPokemonName } from "~/lib/pokemon/utils/formatPokemonName";
import type { NamedApiResource } from "~/types/api";

type PokedexSelectorProps = {
  pokedexes: NamedApiResource[];
  selected: string | "all";
  onChange: (name: string | "all") => void;
};

export function PokedexSelector({
  pokedexes,
  selected,
  onChange,
}: PokedexSelectorProps) {
  if (pokedexes.length <= 1) {
    return null;
  }

  const selectId = "pokedex-selector";

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-ink-muted dark:text-ink-muted-dark"
      >
        Pokédex
      </label>
      <select
        id={selectId}
        value={selected}
        onChange={(event) => onChange(event.target.value as string | "all")}
        className="pokdex-field w-auto min-w-[10rem]"
      >
        <option value="all">All</option>
        {pokedexes.map((pokedex) => (
          <option key={pokedex.name} value={pokedex.name}>
            {formatPokemonName(pokedex.name)}
          </option>
        ))}
      </select>
    </div>
  );
}
