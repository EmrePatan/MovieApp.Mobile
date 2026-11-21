import { View } from 'react-native';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { useHomeHeaderLayout } from '@/features/home/hooks/useHomeHeaderLayout';
import { homeHeaderStyles } from '@/features/home/components/home-header-styles';
import type { SearchReturnOrigin } from '../search-navigation';

interface TabTopChromeProps {
  searchOrigin: SearchReturnOrigin;
  /** Social feed: keep clearance below the search bar divider. */
  spaciousListGap?: boolean;
}

export function TabTopChrome({ searchOrigin, spaciousListGap = false }: TabTopChromeProps) {
  const headerLayout = useHomeHeaderLayout();

  return (
    <View
      style={[
        homeHeaderStyles.shell,
        spaciousListGap
          ? { marginBottom: 0 }
          : { marginBottom: -headerLayout.heroOffsetCompensation },
      ]}
    >
      <HomeHeader searchOrigin={searchOrigin} />
    </View>
  );
}
