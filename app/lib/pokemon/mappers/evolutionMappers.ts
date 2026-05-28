import type { EvolutionChainLink } from "~/types/api";

export type EvolutionStep = {
  speciesName: string;
  speciesUrl: string;
};

export function flattenEvolutionChain(
  chain: EvolutionChainLink,
): EvolutionStep[] {
  const result: EvolutionStep[] = [];

  function visit(link: EvolutionChainLink): void {
    result.push({
      speciesName: link.species.name,
      speciesUrl: link.species.url,
    });

    for (const next of link.evolves_to) {
      visit(next);
    }
  }

  visit(chain);
  return result;
}
