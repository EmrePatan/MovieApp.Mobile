import { ReactNode, useCallback, useRef, useState } from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { UseQueryResult } from '@tanstack/react-query';

import { isApiError } from '@/api/errors';

import { ErrorView } from '@/components/common/ErrorView';

import { DetailScrollProvider } from '../context/DetailScrollContext';
import { DetailScrollLockProvider } from '../context/DetailScrollLockContext';

import { DetailBackButton } from './DetailBackButton';

import { DetailLoadingSkeleton } from './DetailLoadingSkeleton';

import { DetailNotFound } from './DetailNotFound';

import { DetailScreenScaffold } from './DetailScreenScaffold';

import { spacing } from '@/theme/spacing';



interface DetailQueryStateProps<TData> {

  query: Pick<UseQueryResult<TData>, 'data' | 'error' | 'isLoading' | 'isError' | 'refetch'>;

  invalidParamsMessage?: string;

  notFoundTitle: string;

  notFoundMessage: string;

  invalidRequestTitle?: string;

  invalidRequestMessage?: string;

  contentLayout?: 'scroll' | 'list';

  children: (data: TData) => ReactNode;

}



function DetailStateShell({ children }: { children: ReactNode }) {

  return (

    <DetailScreenScaffold>

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>

        {children}

      </SafeAreaView>

    </DetailScreenScaffold>

  );

}



export function DetailQueryState<TData>({

  query,

  invalidParamsMessage,

  notFoundTitle,

  notFoundMessage,

  invalidRequestTitle = 'Invalid request',

  invalidRequestMessage = 'The requested item could not be loaded.',

  contentLayout = 'scroll',

  children,

}: DetailQueryStateProps<TData>) {

  const { data, error, isLoading, isError, refetch } = query;

  const scrollRef = useRef<ScrollView>(null);
  const [scrollLocked, setScrollLocked] = useState(false);

  const handleScrollLockChange = useCallback((locked: boolean) => {

    setScrollLocked(locked);

  }, []);



  if (invalidParamsMessage) {

    return (

      <DetailStateShell>

        <View style={styles.stateContainer}>

          <DetailBackButton variant="inline" />

          <View style={styles.centered}>

            <DetailNotFound title={invalidRequestTitle} message={invalidParamsMessage} />

          </View>

        </View>

      </DetailStateShell>

    );

  }



  if (isLoading && !data) {

    return (

      <DetailStateShell>

        <DetailLoadingSkeleton />

      </DetailStateShell>

    );

  }



  if (isError && error && !data) {

    if (isApiError(error) && error.kind === 'not_found') {

      return (

        <DetailStateShell>

          <View style={styles.stateContainer}>

            <DetailBackButton variant="inline" />

            <View style={styles.centered}>

              <DetailNotFound title={notFoundTitle} message={notFoundMessage} />

            </View>

          </View>

        </DetailStateShell>

      );

    }



    if (isApiError(error) && error.kind === 'validation') {

      return (

        <DetailStateShell>

          <View style={styles.stateContainer}>

            <DetailBackButton variant="inline" />

            <View style={styles.centered}>

              <DetailNotFound title={invalidRequestTitle} message={invalidRequestMessage} />

            </View>

          </View>

        </DetailStateShell>

      );

    }



    const message = isApiError(error)

      ? error.userMessage

      : 'Unable to load details. Please try again.';



    return (

      <DetailStateShell>

        <View style={styles.stateContainer}>

          <DetailBackButton variant="inline" />

          <View style={styles.centered}>

            <ErrorView message={message} onRetry={() => void refetch()} retryLabel="Try Again" />

          </View>

        </View>

      </DetailStateShell>

    );

  }



  if (!data) {

    return (

      <DetailStateShell>

        <View style={styles.stateContainer}>

          <DetailBackButton variant="inline" />

          <View style={styles.centered}>

            <DetailNotFound title={notFoundTitle} message={notFoundMessage} />

          </View>

        </View>

      </DetailStateShell>

    );

  }



  if (contentLayout === 'list') {
    return (
      <DetailStateShell>
        <View style={styles.listContainer}>
          <DetailScrollLockProvider onScrollLockChange={handleScrollLockChange}>
            {children(data)}
          </DetailScrollLockProvider>
        </View>
      </DetailStateShell>
    );
  }

  return (

    <DetailStateShell>

      <ScrollView

        ref={scrollRef}

        scrollEnabled={!scrollLocked}

        showsVerticalScrollIndicator={false}

        keyboardShouldPersistTaps="handled"

        contentContainerStyle={styles.content}

      >

        <DetailScrollProvider scrollRef={scrollRef}>

          <DetailScrollLockProvider onScrollLockChange={handleScrollLockChange}>

            {children(data)}

          </DetailScrollLockProvider>

        </DetailScrollProvider>

      </ScrollView>

    </DetailStateShell>

  );

}



const styles = StyleSheet.create({

  safeArea: {

    flex: 1,

  },

  listContainer: {
    flex: 1,
  },

  content: {

    paddingBottom: spacing.xxl,

  },

  stateContainer: {

    flex: 1,

  },

  centered: {

    flex: 1,

    justifyContent: 'center',

    paddingHorizontal: spacing.lg,

  },

});


