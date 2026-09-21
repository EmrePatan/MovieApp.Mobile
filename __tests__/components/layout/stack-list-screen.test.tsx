import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { StackListScreen } from '@/components/layout/StackListScreen';

jest.mock('expo-router', () => ({
  usePathname: () => '/search',
  useSegments: () => ['search'],
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, testID, style }: { children: React.ReactNode; testID?: string; style?: object }) => (
      <View testID={testID} style={style}>{children}</View>
    ),
  };
});

describe('StackListScreen', () => {
  it('uses SafeAreaView as the flex root container', () => {
    const { getByTestId } = render(
      <StackListScreen testID="stack-list-screen" topBar={<Text>Top</Text>}>
        <Text testID="list-content">Body</Text>
      </StackListScreen>,
    );

    const root = getByTestId('stack-list-screen');
    expect(root.props.style).toMatchObject({ flex: 1 });
    expect(getByTestId('list-content')).toBeTruthy();
  });

  it('wraps children in a flex:1 body host with minHeight:0', () => {
    const { getByTestId } = render(
      <StackListScreen testID="stack-list-screen">
        <FlatList
          testID="stack-list-flatlist"
          data={[{ id: '1', title: 'Item' }]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Text>{item.title}</Text>}
        />
      </StackListScreen>,
    );

    const body = getByTestId('stack-list-screen-body');
    expect(body).toBeTruthy();
    expect(body.props.style).toMatchObject({ flex: 1, minHeight: 0 });
    expect(getByTestId('stack-list-flatlist')).toBeTruthy();
  });
});
