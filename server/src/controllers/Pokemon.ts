import { Request, Response } from 'express';

import {
  capitalizeFirstLetter,
  getPokemonIdByUrl,
  getPokemonImageById,
} from '../utils';
import {
  EvolutionChain,
  Pokemon,
  PokemonApiResult,
  PokemonSpecie,
} from '../types';
import pokeApi from '../services/pokeApi';

export default class PokemonController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { offset, limit } = request.query;

    const apiResponse = await pokeApi.get<PokemonApiResult>('/pokemon', {
      params: {
        offset: offset || 0,
        limit: limit || 18,
      },
    });

    const { count, next, previous, results } = apiResponse.data;

    const pokemons = results.map(async pokemon => {
      const pokemonId = getPokemonIdByUrl(pokemon.url);

      const { data: pokemonData } = await pokeApi.get<Pokemon>(
        `/pokemon/${pokemonId}`,
      );
      const { data: pokemonSpecieData } = await pokeApi.get<PokemonSpecie>(
        `/pokemon-species/${pokemonId}`,
      );

      const pokemonIdInEvolutionChain = getPokemonIdByUrl(
        pokemonSpecieData.evolution_chain.url,
      );

      const { data: evolutionChain } = await pokeApi.get<EvolutionChain>(
        `/evolution-chain/${pokemonIdInEvolutionChain}`,
      );

      const pokemonNameIndex = pokemonSpecieData.names.findIndex(
        name => name.language.name === 'en',
      );

      const pokemonFlavorTextIndex = pokemonSpecieData.flavor_text_entries.findIndex(
        text => text.version.name === 'ruby',
      );

      const pokemonGeneraIndex = pokemonSpecieData.genera.findIndex(
        genera => genera.language.name === 'en',
      );

      const pokemonTypesFormatted = pokemonData.types.map(({ type }) => {
        return {
          name: capitalizeFirstLetter(type.name),
          url: type.url,
        };
      });

      const pokemonStatsFormatted = pokemonData.stats.map(stat => {
        let name = '';

        if (stat.stat.name === 'hp') {
          name = 'HP';
        } else if (stat.stat.name === 'attack') {
          name = 'Attack';
        } else if (stat.stat.name === 'defense') {
          name = 'Defense';
        } else if (stat.stat.name === 'special-attack') {
          name = 'Sp. Atk';
        } else if (stat.stat.name === 'special-defense') {
          name = 'Sp. Def';
        } else if (stat.stat.name === 'speed') {
          name = 'Speed';
        }

        return {
          base_stat: stat.base_stat,
          name,
          url: stat.stat.url,
        };
      });

      const pokemonAbilityFormatted = pokemonData.abilities.map(
        ({ ability }) => {
          return {
            name: capitalizeFirstLetter(ability.name),
            url: ability.url,
          };
        },
      );

      const eggGroupsFormatted = pokemonSpecieData.egg_groups.map(egg_group => {
        return {
          name: capitalizeFirstLetter(egg_group.name),
          url: egg_group.url,
        };
      });

      const evolutionFormatted = evolutionChain.chain.evolves_to.map(
        evolves => {
          let second_evolution;

          if (evolves.evolves_to.length !== 0) {
            evolves.evolves_to.map(secondEvolves => {
              const secondEvolutionPokemonId = getPokemonIdByUrl(
                secondEvolves.species.url,
              );

              second_evolution = {
                name: capitalizeFirstLetter(secondEvolves.species.name),
                url: secondEvolves.species.url,
                min_level: secondEvolves.evolution_details[0].min_level,
                image: getPokemonImageById(secondEvolutionPokemonId),
              };

              return second_evolution;
            });
          }

          const firstEvolutionPokemonId = getPokemonIdByUrl(
            evolves.species.url,
          );

          const first_evolution = {
            name: capitalizeFirstLetter(evolves.species.name),
            url: evolves.species.url,
            min_level: evolves.evolution_details[0].min_level,
            image: getPokemonImageById(firstEvolutionPokemonId),
          };

          return {
            first_evolution,
            second_evolution,
          };
        },
      );

      return {
        id: pokemonData.id,
        name: pokemonSpecieData.names[pokemonNameIndex].name,
        description:
          pokemonSpecieData.flavor_text_entries[pokemonFlavorTextIndex]
            .flavor_text,
        url: pokemon.url,
        image: getPokemonImageById(pokemonId),
        genera: pokemonSpecieData.genera[pokemonGeneraIndex].genus,
        pokedex_number: pokemonData.id.toString().padStart(3, '0'),
        base_experience: pokemonData.base_experience,
        types: pokemonTypesFormatted,
        stats: pokemonStatsFormatted,
        height: pokemonData.height,
        weight: pokemonData.weight,
        abilites: pokemonAbilityFormatted,
        evolution: evolutionFormatted,
        egg_groups: eggGroupsFormatted,
      };
    });

    return response.json({
      count,
      next,
      previous,
      results: await Promise.all(pokemons),
    });
  }

  //   public async show(request: Request, response: Response): Promise<Response> {
  //     const { id } = request.params;

  //     const { data: pokemonData } = await pokeApi.get<Pokemon>(`/pokemon/${id}`);
  //     const { data: pokemonSpecieData } = await pokeApi.get<PokemonSpecie>(
  //       `/pokemon-species/${id}`,
  //     );

  //     const pokemonIdInEvolutionChain = getPokemonIdByUrl(
  //       pokemonSpecieData.evolution_chain.url,
  //     );

  //     const { data: evolutionChain } = await pokeApi.get<EvolutionChain>(
  //       `/evolution-chain/${pokemonIdInEvolutionChain}`,
  //     );

  //     const pokemonNameIndex = pokemonSpecieData.names.findIndex(
  //       name => name.language.name === 'en',
  //     );

  //     const pokemonFlavorTextIndex = pokemonSpecieData.flavor_text_entries.findIndex(
  //       text => text.version.name === 'ruby',
  //     );

  //     const pokemonGeneraIndex = pokemonSpecieData.genera.findIndex(
  //       genera => genera.language.name === 'en',
  //     );

  //     const pokemonTypesFormatted = pokemonData.types.map(({ type }) => {
  //       return {
  //         name: capitalizeFirstLetter(type.name),
  //         url: type.url,
  //       };
  //     });

  //     const pokemonStatsFormatted = pokemonData.stats.map(stat => {
  //       let name = '';

  //       if (stat.stat.name === 'hp') {
  //         name = 'HP';
  //       } else if (stat.stat.name === 'attack') {
  //         name = 'Attack';
  //       } else if (stat.stat.name === 'defense') {
  //         name = 'Defense';
  //       } else if (stat.stat.name === 'special-attack') {
  //         name = 'Sp. Atk';
  //       } else if (stat.stat.name === 'special-defense') {
  //         name = 'Sp. Def';
  //       } else if (stat.stat.name === 'speed') {
  //         name = 'Speed';
  //       }

  //       return {
  //         base_stat: stat.base_stat,
  //         name,
  //         url: stat.stat.url,
  //       };
  //     });

  //     const pokemonAbilityFormatted = pokemonData.abilities.map(({ ability }) => {
  //       return {
  //         name: capitalizeFirstLetter(ability.name),
  //         url: ability.url,
  //       };
  //     });

  //     const eggGroupsFormatted = pokemonSpecieData.egg_groups.map(egg_group => {
  //       return {
  //         name: capitalizeFirstLetter(egg_group.name),
  //         url: egg_group.url,
  //       };
  //     });

  //     const evolutionFormatted = evolutionChain.chain.evolves_to.map(evolves => {
  //       let second_evolution;

  //       if (evolves.evolves_to.length !== 0) {
  //         evolves.evolves_to.map(secondEvolves => {
  //           const secondEvolutionPokemonId = getPokemonIdByUrl(
  //             secondEvolves.species.url,
  //           );

  //           second_evolution = {
  //             name: capitalizeFirstLetter(secondEvolves.species.name),
  //             url: secondEvolves.species.url,
  //             min_level: secondEvolves.evolution_details[0].min_level,
  //             image: getPokemonImageById(secondEvolutionPokemonId),
  //           };

  //           return second_evolution;
  //         });
  //       }

  //       const firstEvolutionPokemonId = getPokemonIdByUrl(evolves.species.url);

  //       const first_evolution = {
  //         name: capitalizeFirstLetter(evolves.species.name),
  //         url: evolves.species.url,
  //         min_level: evolves.evolution_details[0].min_level,
  //         image: getPokemonImageById(firstEvolutionPokemonId),
  //       };

  //       return {
  //         first_evolution,
  //         second_evolution,
  //       };
  //     });

  //     const pokemon = {
  //       id: pokemonData.id,
  //       name: pokemonSpecieData.names[pokemonNameIndex].name,
  //       description:
  //         pokemonSpecieData.flavor_text_entries[pokemonFlavorTextIndex]
  //           .flavor_text,
  //       image: pokemonData.sprites.other['official-artwork'].front_default,
  //       genera: pokemonSpecieData.genera[pokemonGeneraIndex].genus,
  //       pokedex_number: pokemonData.id.toString().padStart(3, '0'),
  //       base_experience: pokemonData.base_experience,
  //       types: pokemonTypesFormatted,
  //       stats: pokemonStatsFormatted,
  //       height: pokemonData.height,
  //       weight: pokemonData.weight,
  //       abilites: pokemonAbilityFormatted,
  //       evolution: evolutionFormatted,
  //       egg_groups: eggGroupsFormatted,
  //     };

  //     return response.json(pokemon);
  //   }
}
