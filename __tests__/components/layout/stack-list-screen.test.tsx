import React from 'react';
import { FlatList, Platform, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import {
  LIST_SCREEN_BODY_STYLE,
  StackListScreen,
} from '@/components/layout/StackListScreen';
import { getFlatListClippingProps } from '@/components/layout/flat-list-layout';

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, testID, style }: { children: React.ReactNode; testID?: string; style?: object }) => (
      <View testID={testID} style={style}>{children}</View>
    ),
  };
});

jest.mock('@/debug/render-boundary-probe', () => {
  const { View } = require('react-native');
  return {
    RenderBoundaryProbe: ({
      children,
      style,
      testID,
    }: {
      children: React.ReactNode;
      style?: object;
      testID?: string;
    }) => (
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

  it('wraps list content in a flex body without minHeight collapse', () => {
    const { getByTestId } = render(
      <StackListScreen testID="stack-list-screen" topBar={<Text>Top</Text>}>
        <Text testID="list-content">Body</Text>
      </StackListScreen>,
    );

    const body = getByTestId('stack-list-screen-body');
    expect(body.props.style).toMatchObject({ flex: 1 });
    expect(body.props.style).not.toMatchObject({ minHeight: 0 });
    expect(LIST_SCREEN_BODY_STYLE).toEqual({ flex: 1 });
    expect(LIST_SCREEN_BODY_STYLE).not.toHaveProperty('minHeight');
  });

  it('mounts a FlatList child without forcing flex:1 list styles', () => {
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

    const list = getByTestId('stack-list-flatlist');
    expect(list).toBeTruthy();
    expect(list.props.style).toBeUndefined();
  });
});

describe('flat-list-layout helpers', () => {
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
