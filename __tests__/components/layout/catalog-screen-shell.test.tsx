import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { CatalogScreenShell } from '@/components/layout/CatalogScreenShell';

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, testID, style }: { children: React.ReactNode; testID?: string; style?: object }) => (
      <View testID={testID} style={style}>{children}</View>
    ),
  };
});

describe('CatalogScreenShell', () => {
  it('uses a flex:1 body host below the header', () => {
    const { getByTestId } = render(
      <CatalogScreenShell shellScope="streaming-shell" testID="streaming-discover-screen" header={<Text>Header</Text>}>
        <Text testID="results-body">Results</Text>
      </CatalogScreenShell>,
    );

    const body = getByTestId('streaming-shell-body');
    expect(body.props.style).toMatchObject({ flex: 1 });
    expect(getByTestId('results-body')).toBeTruthy();
  });
});
