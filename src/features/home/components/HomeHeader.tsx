import { View } from 'react-native';
import { HomeHeaderActionCluster } from './HomeHeaderActionCluster';
import { homeHeaderStyles } from './home-header-styles';

interface HomeHeaderProps {
  overlay?: boolean;
}

export function HomeHeader({ overlay = false }: HomeHeaderProps) {
  return (
    <View style={homeHeaderStyles.row}>
      <HomeHeaderActionCluster overlay={overlay} />
    </View>
  );
}
