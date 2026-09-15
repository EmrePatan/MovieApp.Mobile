import { render, screen } from '@testing-library/react-native';
import { LibraryStatusIndicator } from '@/features/library/components/LibraryStatusIndicator';

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
    render(<LibraryStatusIndicator status="saved" label="Saved" />);

    expect(screen.getByText('Saved')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
