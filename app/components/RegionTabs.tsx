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
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2 focus-visible:ring-offset-parchment focus-visible:outline-none dark:focus-visible:ring-offset-parchment-dark ${
              isActive
                ? "border-crimson bg-crimson text-white shadow-sm"
                : "border-border bg-surface-raised text-ink-muted hover:border-border-strong hover:text-ink dark:border-border-dark dark:bg-surface-raised-dark dark:text-ink-muted-dark dark:hover:text-ink-dark"
            }`}
          >
            {formatPokemonName(region.name)}
          </Link>
        );
      })}
    </nav>
  );
}
