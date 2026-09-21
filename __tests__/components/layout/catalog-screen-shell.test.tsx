import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { CatalogScreenShell } from '@/components/layout/CatalogScreenShell';

jest.mock('expo-router', () => ({
  usePathname: () => '/discover-browse',
  useSegments: () => ['discover-browse'],
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, testID, style }: { children: React.ReactNode; testID?: string; style?: object }) => (
      <View testID={testID} style={style}>{children}</View>
    ),
  };
});

describe('CatalogScreenShell', () => {
  it('uses a flex:1 body host with minHeight:0 below the header', () => {
    const { getByTestId } = render(
      <CatalogScreenShell layoutScope="trending-see-all" testID="discover-browse-screen" header={<Text>Header</Text>}>
        <Text testID="results-body">Results</Text>
      </CatalogScreenShell>,
    );

    const body = getByTestId('trending-see-all-body');
    expect(body.props.style).toMatchObject({ flex: 1, minHeight: 0 });
    expect(getByTestId('results-body')).toBeTruthy();
  });
});
