import { View } from 'react-native';
import { AppText } from '@/components/common/AppText';
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
        {!overlay ? (
          <AppText variant="caption" style={homeHeaderStyles.tagline}>
            Watch smarter
          </AppText>
        ) : null}
      </View>
      <HomeHeaderActionCluster overlay={overlay} />
    </View>
  );
}
