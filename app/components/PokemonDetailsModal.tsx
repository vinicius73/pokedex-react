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
  const displayImageUrl =
    showShiny && viewModel?.shinyImageUrl
      ? viewModel.shinyImageUrl
      : viewModel?.imageUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      titleId="pokemon-details-title"
      triggerRef={triggerRef}
    >
      <div data-testid="pokemon-details-modal">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8 text-blue-600" />
          </div>
        ) : null}

        {isError ? (
          <ErrorState message="Failed to load Pokémon details. Please try again." />
        ) : null}

        {!isLoading && !isError && viewModel ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="flex flex-col items-center">
                {displayImageUrl ? (
                  <img
                    src={displayImageUrl}
                    alt={viewModel.displayName}
                    className="h-40 w-40 object-contain"
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center text-sm text-gray-400">
                    No image
                  </div>
                )}

                {viewModel.shinyImageUrl ? (
                  <button
                    type="button"
                    onClick={() => setShowShiny((current) => !current)}
                    className="mt-2 rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {showShiny ? "Show normal" : "Show shiny"}
                  </button>
                ) : null}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {formatEntryNumber(viewModel.id)}
                </p>

                {viewModel.genus ? (
                  <p className="text-sm italic text-gray-600 dark:text-gray-400">
                    {viewModel.genus}
                  </p>
                ) : null}

                <div className="flex flex-wrap justify-center gap-1 sm:justify-start">
                  {viewModel.types.map((type) => (
                    <PokemonTypeBadge key={type} type={type} />
                  ))}
                </div>

                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  {viewModel.isBaby ? (
                    <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-800 dark:bg-pink-950 dark:text-pink-300">
                      Baby
                    </span>
                  ) : null}
                  {viewModel.isLegendary ? (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
                      Legendary
                    </span>
                  ) : null}
                  {viewModel.isMythical ? (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Mythical
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {viewModel.description ? (
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {viewModel.description}
              </p>
            ) : null}

            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Height
                </dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatHeight(viewModel.heightMeters)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Weight
                </dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatWeight(viewModel.weightKg)}
                </dd>
              </div>
              {viewModel.captureRate !== null ? (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Capture rate
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {viewModel.captureRate}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Abilities
              </h3>
              <ul className="flex flex-wrap gap-2">
                {viewModel.abilities.map((ability) => (
                  <li
                    key={ability.name}
                    className={`rounded-lg px-3 py-1 text-sm ${
                      ability.isHidden
                        ? "border border-dashed border-gray-400 bg-gray-50 text-gray-700 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300"
                        : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {ability.displayName}
                    {ability.isHidden ? (
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                        (hidden)
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Base stats
              </h3>
              <div className="space-y-2">
                {viewModel.stats.map((stat) => (
                  <StatBar
                    key={stat.name}
                    name={stat.name}
                    displayName={stat.displayName}
                    value={stat.value}
                  />
                ))}
              </div>
            </div>

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
