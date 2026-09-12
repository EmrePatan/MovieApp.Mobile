import { EmptyView } from '@/components/common/EmptyView';

interface SearchEmptyStateProps {
  title: string;
  message?: string;
}

export function SearchEmptyState({ title, message }: SearchEmptyStateProps) {
  return <EmptyView title={title} message={message} bordered={false} centered />;
}
