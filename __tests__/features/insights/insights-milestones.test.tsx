import { render, screen } from '@testing-library/react-native';
import { InsightsMilestonesSection } from '@/features/insights/components/InsightsMilestonesSection';
import { insightsAnalyticsFixture } from '@/features/insights/utils/insights-fixtures';

describe('InsightsMilestonesSection', () => {
  it('shows achieved and in-progress milestones without fabricating dates', () => {
    render(<InsightsMilestonesSection milestones={insightsAnalyticsFixture.milestones} />);

    expect(screen.getByLabelText(/First movie watched, achieved/)).toBeTruthy();
    expect(screen.getByText(/Achieved/)).toBeTruthy();
    expect(screen.getByLabelText(/10 movies watched, in progress, 7 of 10/)).toBeTruthy();
    expect(screen.queryByText(/Achieved Jan/)).toBeNull();
  });
});
