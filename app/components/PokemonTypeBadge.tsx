import { formatPokemonName } from "~/lib/pokemon/utils/formatPokemonName";

type PokemonTypeBadgeProps = {
  type: string;
};

export function PokemonTypeBadge({ type }: PokemonTypeBadgeProps) {
  return (
    <span
      data-pokemon-type={type}
      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize"
    >
      {formatPokemonName(type)}
    </span>
  );
}
