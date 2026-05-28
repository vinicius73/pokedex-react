import { formatPokemonName } from "~/lib/pokemon/utils/formatPokemonName";
import type { EvolutionStep } from "~/lib/pokemon/mappers/evolutionMappers";

type EvolutionChainProps = {
  steps: EvolutionStep[];
  currentSpeciesName: string;
  onSelectSpecies: (speciesName: string) => void;
};

function getSpeciesIdFromUrl(speciesUrl: string): number | null {
  const match = speciesUrl.match(/\/pokemon-species\/(\d+)\/?$/);

  if (!match) {
    return null;
  }

  const id = Number.parseInt(match[1], 10);
  return Number.isNaN(id) ? null : id;
}

function getSpeciesSpriteUrl(speciesUrl: string): string | null {
  const id = getSpeciesIdFromUrl(speciesUrl);

  if (id === null) {
    return null;
  }

  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function EvolutionChain({
  steps,
  currentSpeciesName,
  onSelectSpecies,
}: EvolutionChainProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Evolution
      </h3>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {steps.map((step, index) => {
          const displayName = formatPokemonName(step.speciesName);
          const spriteUrl = getSpeciesSpriteUrl(step.speciesUrl);
          const isCurrent =
            step.speciesName.toLowerCase() === currentSpeciesName.toLowerCase();

          return (
            <div key={step.speciesUrl} className="flex items-center gap-2">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="text-lg text-gray-400 dark:text-gray-500"
                >
                  →
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => onSelectSpecies(step.speciesName)}
                disabled={isCurrent}
                className={`flex flex-col items-center rounded-lg border p-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  isCurrent
                    ? "cursor-default border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-gray-700/50"
                }`}
                aria-label={
                  isCurrent
                    ? `${displayName} (current)`
                    : `View ${displayName}`
                }
                aria-current={isCurrent ? "true" : undefined}
              >
                {spriteUrl ? (
                  <img
                    src={spriteUrl}
                    alt={displayName}
                    className="h-16 w-16 object-contain"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}

                <span className="mt-1 text-xs font-medium text-gray-900 dark:text-gray-100">
                  {displayName}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
