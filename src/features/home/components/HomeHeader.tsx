import { View } from 'react-native';
import type { HomeHeaderLayout } from '../utils/home-header-layout';
import { HomeBrandMark } from './HomeBrandMark';
import { HomeHeaderActionCluster } from './HomeHeaderActionCluster';
import { homeHeaderStyles } from './home-header-styles';

interface HomeHeaderProps {
  overlay?: boolean;
  layout: HomeHeaderLayout;
}

export function HomeHeader({ overlay = false, layout }: HomeHeaderProps) {
  return (
    <View style={homeHeaderStyles.row}>
      <View
        style={[
          homeHeaderStyles.brandBlock,
          { marginLeft: layout.brandLeftInset },
        ]}
      >
        <HomeBrandMark
          overlay={overlay}
          logoWidth={layout.logoWidth}
          logoHeight={layout.logoHeight}
        />
      </View>
      <HomeHeaderActionCluster overlay={overlay} />
    </View>
  );
}
