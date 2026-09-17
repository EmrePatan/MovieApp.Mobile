import { render, screen } from '@testing-library/react-native';
import { LibraryStatusIndicator } from '@/features/library/components/LibraryStatusIndicator';
import { colors } from '@/theme/colors';

describe('LibraryStatusIndicator', () => {
  it('renders completed semantics with label text', () => {
    render(<LibraryStatusIndicator status="completed" label="Completed" />);

    expect(screen.getByText('Completed')).toBeTruthy();
  });

  it('renders watching semantics with episode detail and progress', () => {
    render(
      <LibraryStatusIndicator
        status="watching"
        label="Watching"
        detail="S2 · E4"
        progressPercentage={43}
      />,
    );

    expect(screen.getByText('Watching')).toBeTruthy();
    expect(screen.getByText('S2 · E4')).toBeTruthy();
    expect(JSON.stringify(screen.toJSON())).toContain('"accessibilityRole":"progressbar"');
  });

  it('renders saved semantics without inventing progress', () => {
    render(<LibraryStatusIndicator status="saved" label="Watchlist" />);

    expect(screen.getByText('Watchlist')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('renders compact badge mode without visible status text', () => {
    render(<LibraryStatusIndicator status="liked" display="badge" />);

    expect(screen.queryByText('Liked')).toBeNull();
  });

  it('renders saved badge with accent bookmark styling', () => {
    render(<LibraryStatusIndicator status="saved" display="badge" />);

    expect(JSON.stringify(screen.toJSON())).toContain(colors.libraryWatchlist);
    expect(JSON.stringify(screen.toJSON())).toContain('bookmark');
  });

  it('renders poster progress overlay without a status label row', () => {
    render(
      <LibraryStatusIndicator
        status="watching"
        progressPercentage={42}
        display="poster-progress"
      />,
    );

    expect(screen.queryByText('Watching')).toBeNull();
    expect(JSON.stringify(screen.toJSON())).toContain('"accessibilityRole":"progressbar"');
  });
});
