import { formatPokemonName } from "~/lib/pokemon/utils/formatPokemonName";
import { getPokemonImage } from "~/lib/pokemon/utils/getPokemonImage";
import { normalizeFlavorText } from "~/lib/pokemon/utils/normalizeFlavorText";
import type { Pokedex, Pokemon, PokemonSpecies } from "~/types/api";
import type {
  PokemonDetailsViewModel,
  PokemonListItem,
} from "~/types/viewModels";

type PokedexEntry = Pokedex["pokemon_entries"][number];

const ENGLISH_LANGUAGE = "en";

function getEnglishFlavorText(species: PokemonSpecies): string | null {
  const entry = species.flavor_text_entries.find(
    (item) => item.language.name === ENGLISH_LANGUAGE,
  );

  if (!entry) {
    return null;
  }

  return normalizeFlavorText(entry.flavor_text);
}

function getEnglishGenus(species: PokemonSpecies): string | null {
  const entry = species.genera.find(
    (item) => item.language.name === ENGLISH_LANGUAGE,
  );

  return entry?.genus ?? null;
}

function getPokemonShinyImage(pokemon: Pokemon): string | null {
  return pokemon.sprites.other?.["official-artwork"]?.front_shiny ?? null;
}

function getSortedTypeNames(pokemon: Pokemon): string[] {
  return [...pokemon.types]
    .sort((a, b) => a.slot - b.slot)
    .map((item) => item.type.name);
}

export function mapPokemonListItem(
  entry: PokedexEntry,
  pokemon: Pokemon,
): PokemonListItem {
  return {
    entryNumber: entry.entry_number,
    id: pokemon.id,
    name: pokemon.name,
    displayName: formatPokemonName(pokemon.name),
    imageUrl: getPokemonImage(pokemon),
    types: getSortedTypeNames(pokemon),
    speciesName: entry.pokemon_species.name,
    speciesUrl: entry.pokemon_species.url,
  };
}

export function mapPokemonDetailsViewModel(
  pokemon: Pokemon,
  species: PokemonSpecies,
): PokemonDetailsViewModel {
  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: formatPokemonName(pokemon.name),
    imageUrl: getPokemonImage(pokemon),
    shinyImageUrl: getPokemonShinyImage(pokemon),
    types: getSortedTypeNames(pokemon),
    heightMeters: pokemon.height / 10,
    weightKg: pokemon.weight / 10,
    abilities: pokemon.abilities.map((item) => ({
      name: item.ability.name,
      displayName: formatPokemonName(item.ability.name),
      isHidden: item.is_hidden,
    })),
    stats: pokemon.stats.map((item) => ({
      name: item.stat.name,
      displayName: formatPokemonName(item.stat.name),
      value: item.base_stat,
    })),
    description: getEnglishFlavorText(species),
    genus: getEnglishGenus(species),
    captureRate: species.capture_rate,
    isBaby: species.is_baby,
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
  };
}
