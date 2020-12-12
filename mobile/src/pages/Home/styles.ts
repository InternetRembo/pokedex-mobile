import styled from 'styled-components/native';
import { FlatList } from 'react-native';

import { Pokemon } from '../../types';

export const Container = styled.View`
  flex: 1;
  padding: 0 24px;
  position: relative;
`;

export const PokemonsList = styled(FlatList as new () => FlatList<Pokemon>)`
  flex: 1;
`;
