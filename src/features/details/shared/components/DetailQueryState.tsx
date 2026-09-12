import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UseQueryResult } from '@tanstack/react-query';
import { isApiError } from '@/api/errors';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/loading/LoadingView';
import { DetailBackButton, DetailScreenScaffold } from './DetailScreenScaffold';
import { DetailNotFound } from './DetailNotFound';
import { spacing } from '@/theme/spacing';

interface DetailQueryStateProps<TData> {
  query: Pick<UseQueryResult<TData>, 'data' | 'error' | 'isLoading' | 'isError' | 'refetch'>;
  invalidParamsMessage?: string;
  notFoundTitle: string;
  notFoundMessage: string;
  invalidRequestTitle?: string;
  invalidRequestMessage?: string;
  children: (data: TData) => ReactNode;
}

export function DetailQueryState<TData>({
  query,
  invalidParamsMessage,
  notFoundTitle,
  notFoundMessage,
  invalidRequestTitle = 'Invalid request',
  invalidRequestMessage = 'The requested item could not be loaded.',
  children,
}: DetailQueryStateProps<TData>) {
  const { data, error, isLoading, isError, refetch } = query;

  if (invalidParamsMessage) {
    return (
      <DetailScreenScaffold>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <DetailBackButton />
          <View style={styles.centered}>
            <DetailNotFound title={invalidRequestTitle} message={invalidParamsMessage} />
          </View>
        </SafeAreaView>
      </DetailScreenScaffold>
    );
  }

  if (isLoading && !data) {
    return (
      <DetailScreenScaffold>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <DetailBackButton />
          <LoadingView message="Loading..." />
        </SafeAreaView>
      </DetailScreenScaffold>
    );
  }

  if (isError && error && !data) {
    if (isApiError(error) && error.kind === 'not_found') {
      return (
        <DetailScreenScaffold>
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <DetailBackButton />
            <View style={styles.centered}>
              <DetailNotFound title={notFoundTitle} message={notFoundMessage} />
            </View>
          </SafeAreaView>
        </DetailScreenScaffold>
      );
    }

    if (isApiError(error) && error.kind === 'validation') {
      return (
        <DetailScreenScaffold>
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <DetailBackButton />
            <View style={styles.centered}>
              <DetailNotFound title={invalidRequestTitle} message={invalidRequestMessage} />
            </View>
          </SafeAreaView>
        </DetailScreenScaffold>
      );
    }

    const message = isApiError(error)
      ? error.userMessage
      : 'Unable to load details. Please try again.';

    return (
      <DetailScreenScaffold>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <DetailBackButton />
          <View style={styles.centered}>
            <ErrorView message={message} onRetry={() => void refetch()} retryLabel="Try Again" />
          </View>
        </SafeAreaView>
      </DetailScreenScaffold>
    );
  }

  if (!data) {
    return (
      <DetailScreenScaffold>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <DetailBackButton />
          <View style={styles.centered}>
            <DetailNotFound title={notFoundTitle} message={notFoundMessage} />
          </View>
        </SafeAreaView>
      </DetailScreenScaffold>
    );
  }

  return (
    <DetailScreenScaffold>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <DetailBackButton />
          {children(data)}
        </ScrollView>
      </SafeAreaView>
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
});
