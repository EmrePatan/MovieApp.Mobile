import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { FlatList, Platform, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';

const repoRoot = path.resolve(__dirname, '../../..');

const platformRefreshSurfaceFiles = [
  'app/(tabs)/(app-shell)/discover-browse.tsx',
  'app/(tabs)/(app-shell)/search.tsx',
  'app/(tabs)/(app-shell)/streaming-discover.tsx',
  'app/(tabs)/(app-shell)/world-cinema.tsx',
  'app/(tabs)/(app-shell)/upcoming.tsx',
  'app/(tabs)/(app-shell)/on-tv-this-week.tsx',
  'app/(tabs)/(app-shell)/now-in-theaters.tsx',
  'app/(tabs)/(app-shell)/advanced-discover.tsx',
];

describe('PlatformRefreshFlatList', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('uses Android pull header and omits native refreshControl on Android', () => {
    Platform.OS = 'android';

    const { getByTestId, UNSAFE_getByType } = render(
      <PlatformRefreshFlatList
        testID="platform-refresh-list"
        refreshing={false}
        onRefresh={jest.fn()}
        data={[{ id: '1', label: 'Alpha' }]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.label}</Text>}
        ListHeaderComponent={<Text testID="list-header">Header</Text>}
      />,
    );

    expect(getByTestId('platform-refresh-list')).toBeTruthy();
    expect(getByTestId('android-pull-refresh-header')).toBeTruthy();
    expect(getByTestId('list-header')).toBeTruthy();
    expect(UNSAFE_getByType(FlatList).props.refreshControl).toBeUndefined();
  });

  it('passes createIosRefreshControl on iOS', () => {
    Platform.OS = 'ios';

    const { UNSAFE_getByType } = render(
      <PlatformRefreshFlatList
        testID="platform-refresh-list"
        refreshing={true}
        onRefresh={jest.fn()}
        data={[]}
        renderItem={() => null}
      />,
    );

    expect(UNSAFE_getByType(FlatList).props.refreshControl).toBeTruthy();
  });
});

describe('platform refresh surface wiring', () => {
  it('uses PlatformRefreshFlatList in migrated stack result-list sources', () => {
    for (const relativePath of platformRefreshSurfaceFiles) {
      const source = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
      expect(source).toContain('PlatformRefreshFlatList');
      expect(source).not.toMatch(
        /refreshControl\s*=\s*\{[\s\S]*?<MovieAppRefreshControl/,
      );
    }
  });

  it('does not import temporary #45 debug probes into discover-browse', () => {
    const source = fs.readFileSync(
      path.join(repoRoot, 'app/(tabs)/(app-shell)/discover-browse.tsx'),
      'utf8',
    );
    expect(source).not.toContain('@/debug/');
    expect(source).not.toContain('DISCOVER CONTROL');
  });
});
