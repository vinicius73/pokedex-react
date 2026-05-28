import { formatPokemonName } from "~/lib/pokemon/utils/formatPokemonName";

type PokemonTypeBadgeProps = {
  type: string;
};

export function PokemonTypeBadge({ type }: PokemonTypeBadgeProps) {
  return (
    <span
      data-pokemon-type={type}
      className="inline-block rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide shadow-sm"
    >
      {formatPokemonName(type)}
    </span>
  );
}
