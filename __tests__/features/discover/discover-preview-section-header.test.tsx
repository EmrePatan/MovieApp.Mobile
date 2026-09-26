import React from 'react';
import { Dimensions } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { DiscoverPreviewSection } from '@/features/discover/components/DiscoverPreviewSection';
import { initI18nForTests, t } from '../../i18n/i18n-test-utils';

const baseItem = {
  id: 'tv-1',
  type: 'tv' as const,
  title: 'Sample Show',
  posterUrl: '/poster.jpg',
};

function renderOnTvSection(width: number, isLoading = false) {
  Dimensions.set({ window: { width, height: 844, scale: 3, fontScale: 1 } });

  return render(
    <DiscoverPreviewSection
      title={t('discover.hub.onTvThisWeek.title')}
      subtitle={t('discover.hub.onTvThisWeek.subtitle')}
      icon="calendar-outline"
      items={isLoading ? [] : [baseItem]}
      isLoading={isLoading}
      onItemPress={jest.fn()}
      onSeeAll={jest.fn()}
      testID="on-tv-this-week-preview"
    />,
  );
}

describe('DiscoverPreviewSection header layout', () => {
  beforeAll(async () => {
    await initI18nForTests('tr');
  });

  afterEach(() => {
    Dimensions.set({ window: { width: 390, height: 844, scale: 3, fontScale: 1 } });
  });

  it.each([390, 402])(
    'keeps Turkish see-all action on screen at %ipt width while loading and loaded',
    (width) => {
      const { rerender } = renderOnTvSection(width, true);

      const seeAllLabel = t('common.seeAll');
      const seeAllNode = screen.getByText(seeAllLabel);
      expect(seeAllNode).toBeTruthy();

      rerender(
        <DiscoverPreviewSection
          title={t('discover.hub.onTvThisWeek.title')}
          subtitle={t('discover.hub.onTvThisWeek.subtitle')}
          icon="calendar-outline"
          items={[baseItem]}
          isLoading={false}
          onItemPress={jest.fn()}
          onSeeAll={jest.fn()}
          testID="on-tv-this-week-preview"
        />,
      );

      expect(screen.getByLabelText(
        t('common.seeAllTitle', { title: t('discover.hub.onTvThisWeek.title') }),
      )).toBeTruthy();
    },
  );

  it('renders now-in-theaters Turkish copy with see-all affordance', () => {
    Dimensions.set({ window: { width: 390, height: 844, scale: 3, fontScale: 1 } });

    render(
      <DiscoverPreviewSection
        title={t('discover.hub.nowInTheaters.title')}
        subtitle={t('discover.hub.nowInTheaters.subtitle')}
        icon="film-outline"
        items={[baseItem]}
        onItemPress={jest.fn()}
        onSeeAll={jest.fn()}
      />,
    );

    expect(
      screen.getByLabelText(
        t('common.seeAllTitle', { title: t('discover.hub.nowInTheaters.title') }),
      ),
    ).toBeTruthy();
  });
});
