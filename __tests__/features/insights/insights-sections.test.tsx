import { render, screen } from '@testing-library/react-native';
import { InsightsMovieDnaHero } from '@/features/insights/components/InsightsMovieDnaHero';
import { InsightsRatingsSection } from '@/features/insights/components/InsightsRatingsSection';
import { InsightsTasteSection } from '@/features/insights/components/InsightsTasteSection';
import { InsightsYourYearSection } from '@/features/insights/components/InsightsYourYearSection';
import {
  emptyInsightsV3Fixture,
  insightsV3Fixture,
} from '@/features/insights/utils/insights-fixtures';

describe('insights sections', () => {
  it('renders Movie DNA identity and top genres', () => {
    render(<InsightsMovieDnaHero movieDna={insightsV3Fixture.movieDna} />);

    expect(screen.getByText('Sci-Fi Explorer')).toBeTruthy();
    expect(screen.getByText('Sci-Fi')).toBeTruthy();
    expect(screen.getByLabelText('Movies 28, series 9')).toBeTruthy();
    expect(screen.getByText('The long arc is where your story keeps returning.')).toBeTruthy();
  });

  it('shows empty Movie DNA discovery state', () => {
    render(<InsightsMovieDnaHero movieDna={emptyInsightsV3Fixture.movieDna} />);

    expect(screen.getByText(/Keep watching and rating/)).toBeTruthy();
    expect(screen.getByText('Your reel is still finding its signature.')).toBeTruthy();
  });

  it('renders monthly activity and year stats without heatmap cells', () => {
    render(
      <InsightsYourYearSection
        yourYear={insightsV3Fixture.yourYear}
        year={2026}
        years={[2026, 2025]}
        onSelectYear={jest.fn()}
      />,
    );

    expect(screen.getByText('active days')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('Jun 2026')).toBeTruthy();
    expect(screen.getByText('Saturday')).toBeTruthy();
    expect(screen.getByText(/watched something on/i)).toBeTruthy();
    expect(screen.queryByLabelText(/before you joined MovieApp/)).toBeNull();
  });

  it('shows rising genre only when provided', () => {
    render(<InsightsTasteSection taste={insightsV3Fixture.yourTaste} />);
    expect(screen.getByTestId('insights-rising-genre')).toBeTruthy();
    expect(screen.getByText('Horror')).toBeTruthy();

    render(<InsightsTasteSection taste={emptyInsightsV3Fixture.yourTaste} />);
    expect(screen.queryByTestId('insights-rising-genre')).toBeNull();
  });

  it('shows ratings empty state and genre highlights when available', () => {
    render(
      <InsightsRatingsSection
        ratings={{
          count: 0,
          averageStars: null,
          distribution: [],
          highestRatedGenre: null,
          lowestRatedGenre: null,
        }}
      />,
    );

    expect(screen.getByText(/No ratings yet/)).toBeTruthy();

    render(<InsightsRatingsSection ratings={insightsV3Fixture.yourRatings} />);

    expect(screen.getByText('Highest rated genre')).toBeTruthy();
    expect(screen.getByText('Lowest rated genre')).toBeTruthy();
    expect(screen.getByText('4.6 Sci-Fi')).toBeTruthy();
    expect(screen.getByText('3.2 Comedy')).toBeTruthy();
  });
});
