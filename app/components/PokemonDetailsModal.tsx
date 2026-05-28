import { useMemo, useState, type RefObject } from "react";
import { useSearchParams } from "react-router";
import { ErrorState } from "~/components/ErrorState";
import { EvolutionChain } from "~/components/EvolutionChain";
import { Modal } from "~/components/Modal";
import { PokemonTypeBadge } from "~/components/PokemonTypeBadge";
import { Spinner } from "~/components/Spinner";
import { StatBar } from "~/components/StatBar";
import { usePokemonDetails } from "~/hooks/usePokemonDetails";
import { flattenEvolutionChain } from "~/lib/pokemon/mappers/evolutionMappers";
import { mapPokemonDetailsViewModel } from "~/lib/pokemon/mappers/pokemonMappers";
import { formatPokemonName } from "~/lib/pokemon/utils/formatPokemonName";

type PokemonDetailsModalProps = {
  triggerRef?: RefObject<HTMLElement | null>;
};

function formatEntryNumber(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

function formatHeight(meters: number): string {
  return `${meters.toFixed(1)} m`;
}

function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`;
}

type TraitBadgeProps = {
  label: string;
  tone: "baby" | "legendary" | "mythical";
};

function TraitBadge({ label, tone }: TraitBadgeProps) {
  const toneClass =
    tone === "baby"
      ? "border-pink-300/60 bg-pink-50 text-pink-900 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-200"
      : tone === "legendary"
        ? "border-amber-300/60 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        : "border-violet-300/60 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide ${toneClass}`}
    >
      {label}
    </span>
  );
}

export function PokemonDetailsModal({ triggerRef }: PokemonDetailsModalProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pokemonName = searchParams.get("pokemon");
  const isOpen = Boolean(pokemonName);
  const [showShiny, setShowShiny] = useState(false);

  const { pokemonQuery, speciesQuery, evolutionChainQuery, isLoading, isError } =
    usePokemonDetails(pokemonName);

  const viewModel = useMemo(() => {
    if (!pokemonQuery.data || !speciesQuery.data) {
      return null;
    }

    return mapPokemonDetailsViewModel(pokemonQuery.data, speciesQuery.data);
  }, [pokemonQuery.data, speciesQuery.data]);

  const evolutionSteps = useMemo(() => {
    if (!evolutionChainQuery.data) {
      return [];
    }

    return flattenEvolutionChain(evolutionChainQuery.data.chain);
  }, [evolutionChainQuery.data]);

  function handleClose() {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("pokemon");
        return next;
      },
      { replace: true },
    );
    setShowShiny(false);
  }

  function handleSelectSpecies(speciesName: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("pokemon", speciesName);
        return next;
      },
      { replace: true },
    );
    setShowShiny(false);
  }

  const title = viewModel?.displayName ?? formatPokemonName(pokemonName ?? "");
  const subtitle = viewModel ? formatEntryNumber(viewModel.id) : undefined;
  const displayImageUrl =
    showShiny && viewModel?.shinyImageUrl
      ? viewModel.shinyImageUrl
      : viewModel?.imageUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      subtitle={subtitle}
      titleId="pokemon-details-title"
      triggerRef={triggerRef}
    >
      <div data-testid="pokemon-details-modal">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8 text-crimson" />
          </div>
        ) : null}

        {isError ? (
          <ErrorState message="Failed to load Pokémon details. Please try again." />
        ) : null}

        {!isLoading && !isError && viewModel ? (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-start">
              <div className="flex flex-col items-center gap-3">
                <div className="pokdex-specimen-plate w-full">
                  {displayImageUrl ? (
                    <img
                      src={displayImageUrl}
                      alt={viewModel.displayName}
                      className="h-36 w-36 object-contain drop-shadow-[0_8px_16px_rgba(28,25,23,0.15)]"
                    />
                  ) : (
                    <div className="flex h-36 w-36 items-center justify-center text-sm text-ink-faint">
                      No image
                    </div>
                  )}
                </div>

                {viewModel.shinyImageUrl ? (
                  <button
                    type="button"
                    onClick={() => setShowShiny((current) => !current)}
                    aria-pressed={showShiny}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised dark:focus-visible:ring-offset-surface-raised-dark ${
                      showShiny
                        ? "border-gold-soft bg-gold-soft/15 text-gold"
                        : "border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink dark:border-border-dark dark:bg-surface-dark dark:text-ink-muted-dark dark:hover:text-ink-dark"
                    }`}
                  >
                    {showShiny ? "Normal form" : "Shiny form"}
                  </button>
                ) : null}
              </div>

              <div className="space-y-4 text-center sm:text-left">
                {viewModel.genus ? (
                  <p className="text-sm italic text-ink-muted dark:text-ink-muted-dark">
                    {viewModel.genus}
                  </p>
                ) : null}

                <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
                  {viewModel.types.map((type) => (
                    <PokemonTypeBadge key={type} type={type} />
                  ))}
                </div>

                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  {viewModel.isBaby ? <TraitBadge label="Baby" tone="baby" /> : null}
                  {viewModel.isLegendary ? (
                    <TraitBadge label="Legendary" tone="legendary" />
                  ) : null}
                  {viewModel.isMythical ? (
                    <TraitBadge label="Mythical" tone="mythical" />
                  ) : null}
                </div>

                {viewModel.description ? (
                  <blockquote className="border-l-2 border-crimson/40 pl-4 text-left text-sm leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                    {viewModel.description}
                  </blockquote>
                ) : null}
              </div>
            </div>

            <section aria-label="Physical attributes">
              <h3 className="pokdex-section-title">Attributes</h3>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-parchment/50 p-3 dark:border-border-dark dark:bg-parchment-deep-dark/50">
                  <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink-faint dark:text-ink-muted-dark">
                    Height
                  </dt>
                  <dd className="pokdex-mono mt-1 text-base font-semibold tabular-nums text-ink dark:text-ink-dark">
                    {formatHeight(viewModel.heightMeters)}
                  </dd>
                </div>
                <div className="rounded-xl border border-border bg-parchment/50 p-3 dark:border-border-dark dark:bg-parchment-deep-dark/50">
                  <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink-faint dark:text-ink-muted-dark">
                    Weight
                  </dt>
                  <dd className="pokdex-mono mt-1 text-base font-semibold tabular-nums text-ink dark:text-ink-dark">
                    {formatWeight(viewModel.weightKg)}
                  </dd>
                </div>
                {viewModel.captureRate !== null ? (
                  <div className="rounded-xl border border-border bg-parchment/50 p-3 dark:border-border-dark dark:bg-parchment-deep-dark/50">
                    <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink-faint dark:text-ink-muted-dark">
                      Capture rate
                    </dt>
                    <dd className="pokdex-mono mt-1 text-base font-semibold tabular-nums text-ink dark:text-ink-dark">
                      {viewModel.captureRate}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section aria-label="Abilities">
              <h3 className="pokdex-section-title">Abilities</h3>
              <ul className="flex flex-wrap gap-2">
                {viewModel.abilities.map((ability) => (
                  <li
                    key={ability.name}
                    className={
                      ability.isHidden ? "pokdex-chip pokdex-chip--hidden" : "pokdex-chip"
                    }
                  >
                    {ability.displayName}
                    {ability.isHidden ? (
                      <span className="ml-1.5 text-xs text-ink-faint dark:text-ink-muted-dark">
                        (hidden)
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Base stats">
              <h3 className="pokdex-section-title">Base stats</h3>
              <div className="space-y-2.5">
                {viewModel.stats.map((stat) => (
                  <StatBar
                    key={stat.name}
                    name={stat.name}
                    displayName={stat.displayName}
                    value={stat.value}
                  />
                ))}
              </div>
            </section>

            {evolutionSteps.length > 0 ? (
              <EvolutionChain
                steps={evolutionSteps}
                currentSpeciesName={viewModel.name}
                onSelectSpecies={handleSelectSpecies}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
