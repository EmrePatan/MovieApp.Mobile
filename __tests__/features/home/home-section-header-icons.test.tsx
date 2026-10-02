import React from 'react';
import { render, screen, type ReactTestInstance } from '@testing-library/react-native';
import { HomeComingUpSection } from '@/features/home/components/HomeComingUpSection';
import { HomeSection } from '@/features/home/components/HomeSection';
import type { HomeItem, HomeSection as HomeSectionModel, HomeSectionType } from '@/features/home/types';
import { initI18nForTests, t } from '../../i18n/i18n-test-utils';

const HOME_RAILS: { type: HomeSectionType; titleKey: string; icon: string }[] = [
  { type: 'RecommendedForYou', titleKey: 'home.sections.recommendedForYou', icon: 'heart-outline' },
  { type: 'Trending', titleKey: 'home.sections.trending', icon: 'flame-outline' },
  { type: 'OnTvThisWeek', titleKey: 'home.sections.onTvThisWeek', icon: 'calendar-outline' },
  { type: 'NowInTheaters', titleKey: 'home.sections.nowInTheaters', icon: 'film-outline' },
];

const OFF_HOME_RAILS: { type: HomeSectionType; titleKey?: string }[] = [
  { type: 'Popular' },
  { type: 'TopRated', titleKey: 'home.sections.topRated' },
  { type: 'NewReleases', titleKey: 'home.sections.newReleases' },
  { type: 'HotThisWeek', titleKey: 'home.sections.hotThisWeek' },
];

function section(
  type: HomeSectionType,
  items: HomeItem[] = [],
  comingUpSource?: HomeSectionModel['comingUpSource'],
): HomeSectionModel {
  return { type, title: type, items, displayOrder: 1, comingUpSource };
}

function renderHomeRail(type: HomeSectionType) {
  return render(<HomeSection section={section(type)} onSeeAllPress={jest.fn()} />);
}

function isNamed(node: ReactTestInstance, name: string): boolean {
  return node.type === name || (typeof node.type !== 'string' && node.type.name === name);
}

function headerIconsBesideTitle(title: string): string[] {
  let current: ReactTestInstance | null = screen.getByText(title);

  while (current?.parent) {
    const elements = current.parent.children.filter(
      (child): child is ReactTestInstance => typeof child !== 'string',
    );

    if (elements.some((child) => isNamed(child, 'AppText'))) {
      return elements.filter((child) => isNamed(child, 'Ionicons')).map((icon) => {
        const host = icon.children.find(
          (child): child is ReactTestInstance => typeof child !== 'string' && child.type === 'Icon',
        );
        return String(host?.props.accessibilityLabel ?? '');
      });
    }

    current = current.parent;
  }

  return [];
}

const comingUpItem: HomeItem = {
  id: 'soon',
  contentType: 'movie',
  title: 'Soon',
  originalTitle: null,
  posterUrl: '/soon.jpg',
  backdropUrl: null,
  releaseDate: '2026-10-03',
  voteAverage: 0,
  voteCount: 0,
};

describe('Home section header icons', () => {
  afterAll(async () => {
    await initI18nForTests('en');
  });

  it('uses a distinct outline icon for each visible Home rail', () => {
    const icons = [
      ...HOME_RAILS.map((rail) => rail.icon),
      'time-outline',
    ];

    expect(new Set(icons).size).toBe(icons.length);
    expect(icons.every((icon) => icon.endsWith('-outline'))).toBe(true);
  });

  it.each(['en', 'tr'] as const)(
    'shows an icon beside each localized Home rail title (%s)',
    async (language) => {
      await initI18nForTests(language);

      for (const rail of HOME_RAILS) {
        const view = renderHomeRail(rail.type);
        const title = t(rail.titleKey);

        expect(headerIconsBesideTitle(title)).toEqual([rail.icon]);
        expect(screen.getByLabelText(t('home.seeAllTitle', { title }))).toBeTruthy();
        view.unmount();
      }

      const catalogComingUp = render(
        <HomeComingUpSection
          section={section('ComingUp', [comingUpItem], 'upcoming')}
          onSeeAllPress={jest.fn()}
        />,
      );
      const comingUpTitle = t('home.sections.comingUp');
      expect(headerIconsBesideTitle(comingUpTitle)).toEqual(['time-outline']);
      expect(screen.getByLabelText(t('home.seeAllTitle', { title: comingUpTitle }))).toBeTruthy();
      catalogComingUp.unmount();

      render(
        <HomeComingUpSection
          section={section('ComingUp', [comingUpItem], 'personalized')}
          onSeeAllPress={jest.fn()}
        />,
      );
      expect(headerIconsBesideTitle(t('home.sections.comingUpPersonalized'))).toEqual([
        'time-outline',
      ]);
    },
  );

  it.each(OFF_HOME_RAILS)('keeps $type icon-free because it is not a Home rail title', async ({
    type,
    titleKey,
  }) => {
    await initI18nForTests('en');
    renderHomeRail(type);

    expect(headerIconsBesideTitle(titleKey ? t(titleKey) : type)).toEqual([]);
  });
});
