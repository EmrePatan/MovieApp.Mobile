import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { useStableFetchedItems } from '@/features/library/hooks/useStableFetchedItems';

function Probe({
  items,
  fetching,
  scope,
}: {
  items: string[];
  fetching: boolean;
  scope: string;
}) {
  const display = useStableFetchedItems(items, fetching, scope);
  return <Text testID="items">{display.join('|')}</Text>;
}

describe('useStableFetchedItems', () => {
  it('keeps the previous page while the same filter refetches an empty list', () => {
    const { rerender } = render(<Probe items={['Show A']} fetching={false} scope="liked:all" />);

    rerender(<Probe items={[]} fetching scope="liked:all" />);

    expect(screen.getByTestId('items').props.children).toBe('Show A');
  });

  it('drops the previous page when the filter scope changes', () => {
    const { rerender } = render(<Probe items={['Show A']} fetching={false} scope="liked:all" />);

    rerender(<Probe items={[]} fetching scope="liked:movie" />);

    expect(screen.getByTestId('items').props.children).toBe('');
  });
});
