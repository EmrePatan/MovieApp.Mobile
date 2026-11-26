import { fireEvent, render, screen } from '@testing-library/react-native';
import { DetailFacts } from '@/features/details/shared/components/DetailFacts';

describe('DetailFacts panel', () => {
  it('stays closed until it is tapped, then closes again', () => {
    render(
      <DetailFacts
        extras={{
          tagline: null,
          certifications: {},
          networks: ['HBO'],
          creators: [],
          productionCompanies: [],
          budget: null,
          revenue: null,
          lastEpisode: null,
        }}
      />,
    );

    expect(screen.queryByText('HBO')).toBeNull();

    fireEvent.press(screen.getByTestId('detail-facts-toggle'));
    expect(screen.getByText('HBO')).toBeTruthy();

    fireEvent.press(screen.getByTestId('detail-facts-toggle'));
    expect(screen.queryByText('HBO')).toBeNull();
  });
});
