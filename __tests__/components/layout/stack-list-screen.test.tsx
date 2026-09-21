import React from 'react';
import { FlatList, Platform, Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { StackListScreen } from '@/components/layout/StackListScreen';
import {
  getFlatListClippingProps,
  mergeFlatListStyle,
} from '@/components/layout/flat-list-layout';

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, testID }: { children: React.ReactNode; testID?: string }) => (
      <View testID={testID}>{children}</View>
    ),
  };
});

describe('StackListScreen', () => {
  it('uses a full-height root wrapper before SafeAreaView', () => {
    const { getByTestId } = render(
      <StackListScreen testID="stack-list-screen" topBar={<Text>Top</Text>}>
        <Text testID="list-content">Body</Text>
      </StackListScreen>,
    );

    const root = getByTestId('stack-list-screen');
    expect(root.props.style).toMatchObject({ flex: 1 });
    expect(getByTestId('list-content')).toBeTruthy();
  });

  it('wraps list content in a flex body container', () => {
    const { getByTestId } = render(
      <StackListScreen testID="stack-list-screen" topBar={<Text>Top</Text>}>
        <Text testID="list-content">Body</Text>
      </StackListScreen>,
    );

    const body = getByTestId('stack-list-screen-body');
    expect(body.props.style).toMatchObject({ flex: 1, minHeight: 0 });
  });
});

describe('flat-list-layout helpers', () => {
  it('merges flex list styles for stack destinations', () => {
    expect(mergeFlatListStyle({ backgroundColor: 'red' })).toEqual([
      { flex: 1, minHeight: 0 },
      { backgroundColor: 'red' },
    ]);
  });

  it('disables removeClippedSubviews on Android', () => {
    const originalPlatform = Platform.OS;
    Platform.OS = 'android';
    expect(getFlatListClippingProps(true)).toEqual({ removeClippedSubviews: false });
    Platform.OS = originalPlatform;
  });

  it('preserves removeClippedSubviews on iOS when requested', () => {
    const originalPlatform = Platform.OS;
    Platform.OS = 'ios';
    expect(getFlatListClippingProps(true)).toEqual({ removeClippedSubviews: true });
    Platform.OS = originalPlatform;
  });
});
