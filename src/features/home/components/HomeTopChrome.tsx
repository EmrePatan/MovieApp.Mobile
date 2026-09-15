import { View } from 'react-native';
import { HomeHeader } from './HomeHeader';
import { homeHeaderStyles } from './home-header-styles';

export function HomeTopChrome() {
  return (
    <View style={homeHeaderStyles.shell}>
      <HomeHeader />
    </View>
  );
}
