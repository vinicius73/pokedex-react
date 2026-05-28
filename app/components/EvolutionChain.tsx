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
    <section aria-label="Evolution">
      <h3 className="pokdex-section-title">Evolution</h3>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
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
                  className="pokdex-mono text-sm font-medium text-gold"
                >
                  →
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => onSelectSpecies(step.speciesName)}
                disabled={isCurrent}
                className={`flex min-w-[5.5rem] flex-col items-center rounded-xl border p-2.5 transition-[border-color,background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised dark:focus-visible:ring-offset-surface-raised-dark ${
                  isCurrent
                    ? "cursor-default border-crimson bg-crimson/8 shadow-sm dark:bg-crimson/15"
                    : "border-border bg-surface-raised hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md dark:border-border-dark dark:bg-surface-dark dark:hover:border-border"
                }`}
                aria-label={
                  isCurrent
                    ? `${displayName} (current)`
                    : `View ${displayName}`
                }
                aria-current={isCurrent ? "true" : undefined}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-b from-parchment to-parchment-deep/70 dark:from-parchment-deep-dark dark:to-parchment-dark">
                  {spriteUrl ? (
                    <img
                      src={spriteUrl}
                      alt=""
                      className="h-14 w-14 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-ink-faint">No image</span>
                  )}
                </div>

                <span className="pokdex-display mt-2 line-clamp-1 text-xs font-semibold text-ink dark:text-ink-dark">
                  {displayName}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
