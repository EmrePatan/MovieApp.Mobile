import { View } from 'react-native';
import type { SearchReturnOrigin } from '@/features/navigation/search-navigation';
import { HomeHeaderActionCluster } from './HomeHeaderActionCluster';
import { homeHeaderStyles } from './home-header-styles';

interface HomeHeaderProps {
  overlay?: boolean;
  searchOrigin?: SearchReturnOrigin;
}

export function HomeHeader({ overlay = false, searchOrigin = 'home' }: HomeHeaderProps) {
  return (
    <View style={homeHeaderStyles.row}>
      <HomeHeaderActionCluster overlay={overlay} searchOrigin={searchOrigin} />
    </View>
  );
}
