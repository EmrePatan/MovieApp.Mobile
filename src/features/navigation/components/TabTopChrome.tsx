import { View } from 'react-native';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { useHomeHeaderLayout } from '@/features/home/hooks/useHomeHeaderLayout';
import { homeHeaderStyles } from '@/features/home/components/home-header-styles';
import type { SearchReturnOrigin } from '../search-navigation';

interface TabTopChromeProps {
  searchOrigin: SearchReturnOrigin;
}

export function TabTopChrome({ searchOrigin }: TabTopChromeProps) {
  const headerLayout = useHomeHeaderLayout();

  return (
    <View
      style={[
        homeHeaderStyles.shell,
        { marginBottom: -headerLayout.heroOffsetCompensation },
      ]}
    >
      <HomeHeader searchOrigin={searchOrigin} />
    </View>
  );
}
