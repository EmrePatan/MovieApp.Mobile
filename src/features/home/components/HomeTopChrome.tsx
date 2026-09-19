import { View } from 'react-native';
import { useHomeHeaderLayout } from '../hooks/useHomeHeaderLayout';
import { HomeHeader } from './HomeHeader';
import { homeHeaderStyles } from './home-header-styles';

export function HomeTopChrome() {
  const headerLayout = useHomeHeaderLayout();

  return (
    <View
      style={[
        homeHeaderStyles.shell,
        { marginBottom: -headerLayout.heroOffsetCompensation },
      ]}
    >
      <HomeHeader layout={headerLayout} />
    </View>
  );
}
