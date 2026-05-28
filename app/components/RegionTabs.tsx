import { Link } from "react-router";
import { formatPokemonName } from "~/lib/pokemon/utils/formatPokemonName";
import type { NamedApiResource } from "~/types/api";

type RegionTabsProps = {
  regions: NamedApiResource[];
  activeRegion: string;
};

export function RegionTabs({ regions, activeRegion }: RegionTabsProps) {
  return (
    <nav aria-label="Regions" className="flex flex-wrap gap-2">
      {regions.map((region) => {
        const isActive = region.name === activeRegion;

        return (
          <Link
            key={region.name}
            to={`/regions/${region.name}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {formatPokemonName(region.name)}
          </Link>
        );
      })}
    </nav>
  );
}
