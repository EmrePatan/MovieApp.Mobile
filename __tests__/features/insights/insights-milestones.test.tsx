import { render, screen } from '@testing-library/react-native';
import { InsightsMilestonesSection } from '@/features/insights/components/InsightsMilestonesSection';
import { insightsV3Fixture } from '@/features/insights/utils/insights-fixtures';

describe('InsightsMilestonesSection', () => {
  it('shows achieved and in-progress achievements without fabricating dates', () => {
    render(<InsightsMilestonesSection achievements={insightsV3Fixture.achievements} />);

    expect(screen.getByLabelText(/First movie watched, achieved/)).toBeTruthy();
    expect(screen.getByLabelText(/10 movies watched, in progress, 7 of 10/)).toBeTruthy();
    expect(screen.getByText('1 of 2 unlocked')).toBeTruthy();
    expect(screen.getAllByText('Movies').length).toBe(2);
    expect(screen.getByTestId('insights-achievements-row')).toBeTruthy();
    expect(screen.getByText(/Keep watching to unlock your next milestone/)).toBeTruthy();
  });
});
