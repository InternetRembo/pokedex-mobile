import styled from 'styled-components/native';
import { Dimensions, Animated } from 'react-native';
import Constants from 'expo-constants';

const { height } = Dimensions.get('window');

export const Container = styled(Animated.View)`
  flex: 1;

  background: ${({ theme }) => theme.colors.white};
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  padding: 16px 24px 0;

  height: ${height - (Constants.statusBarHeight + 64)}px;

  position: absolute;
  top: 0;
  right: 0;
  left: 0;
`;
