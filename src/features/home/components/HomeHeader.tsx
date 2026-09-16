import { View } from 'react-native';
import { HomeBrandMark } from './HomeBrandMark';
import { HomeHeaderActionCluster } from './HomeHeaderActionCluster';
import { homeHeaderStyles } from './home-header-styles';

interface HomeHeaderProps {
  overlay?: boolean;
}

export function HomeHeader({ overlay = false }: HomeHeaderProps) {
  return (
    <View style={homeHeaderStyles.row}>
      <View style={homeHeaderStyles.brandBlock}>
        <HomeBrandMark overlay={overlay} />
      </View>
      <HomeHeaderActionCluster overlay={overlay} />
    </View>
  );
}
