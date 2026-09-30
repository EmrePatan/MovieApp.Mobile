import { fireEvent, render, screen } from '@testing-library/react-native';
import { CatalogResultRow } from '@/features/catalog/components/CatalogResultRow';

describe('CatalogResultRow', () => {
  it('renders title, metadata, and rating on separate lines', () => {
    render(
      <CatalogResultRow
        title="Simpsonlar"
        posterUrl={null}
        mediaType="tv"
        releaseDate="1989-12-17"
        year={1989}
        voteAverage={8}
      />,
    );

    expect(screen.getByText('Simpsonlar')).toBeTruthy();
    expect(screen.getByText('TV · 1989')).toBeTruthy();
    expect(screen.getByText('★ 8.0')).toBeTruthy();
  });

  it('omits rating when vote average is zero', () => {
    render(
      <CatalogResultRow
        title="Untitled"
        posterUrl={null}
        mediaType="movie"
        releaseDate="2026-01-01"
        year={2026}
        voteAverage={0}
      />,
    );

    expect(screen.getByText('Movie · 2026')).toBeTruthy();
    expect(screen.queryByText(/★/)).toBeNull();
  });

  it('renders metadata without year when unavailable', () => {
    render(
      <CatalogResultRow title="Mystery" posterUrl={null} mediaType="movie" voteAverage={7.2} />,
    );

    expect(screen.getByText('Movie')).toBeTruthy();
    expect(screen.queryByText(/·/)).toBeNull();
    expect(screen.getByText('★ 7.2')).toBeTruthy();
  });

  it('does not render rank numbers', () => {
    render(
      <CatalogResultRow
        title="Trending Item"
        posterUrl={null}
        mediaType="movie"
        year={2024}
        voteAverage={6.5}
      />,
    );

    expect(screen.queryByText('01')).toBeNull();
    expect(screen.queryByText(/^1$/)).toBeNull();
  });

  it('invokes onPress for the full row', () => {
    const onPress = jest.fn();
    render(
      <CatalogResultRow
        title="Saplantı"
        posterUrl={null}
        mediaType="movie"
        year={2026}
        voteAverage={8.2}
        onPress={onPress}
      />,
    );

    fireEvent.press(screen.getByLabelText('Saplantı, Movie · 2026, 8.2'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('truncates long titles without rendering synopsis', () => {
    const longTitle =
      'Law & Order: Special Victims Unit and the Very Long Subtitle That Keeps Going';
    render(
      <CatalogResultRow
        title={longTitle}
        posterUrl={null}
        mediaType="tv"
        year={1999}
        voteAverage={7.8}
      />,
    );

    expect(screen.getByText(longTitle)).toBeTruthy();
    expect(screen.queryByText(/synopsis|overview/i)).toBeNull();
  });
});
