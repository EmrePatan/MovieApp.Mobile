import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { FlatList, Platform, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { PlatformRefreshFlatList } from '@/components/refresh/PlatformRefreshFlatList';

const repoRoot = path.resolve(__dirname, '../../..');

const platformRefreshSurfaceFiles = [
  'app/discover-browse.tsx',
  'app/search.tsx',
  'app/streaming-discover.tsx',
  'app/world-cinema.tsx',
  'app/upcoming.tsx',
  'app/on-tv-this-week.tsx',
  'app/now-in-theaters.tsx',
  'app/advanced-discover.tsx',
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

  it('does not wire visual discover probes into discover-browse', () => {
    const source = fs.readFileSync(path.join(repoRoot, 'app/discover-browse.tsx'), 'utf8');
    expect(source).not.toContain('DiscoverRouteProbe');
    expect(source).not.toContain('DiscoverChromeProbe');
    expect(source).not.toContain('DISCOVER CONTROL');
  });
});
