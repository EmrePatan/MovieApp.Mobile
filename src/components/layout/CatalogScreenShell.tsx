import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { describeViewStyle, logStackLayout } from '@/debug/stack-layout-probe';
import { commonStyles } from '@/theme/theme';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface CatalogScreenShellProps {
  shellScope: string;
  header?: ReactNode;
  children: ReactNode;
  edges?: Edge[];
  testID?: string;
}

/**
 * Favorites-aligned screen shell for #45: SafeAreaView → header sibling → flex:1 body.
 * Bypasses StackListScreen on routes where header-visible + body-invisible was observed.
 */
export function CatalogScreenShell({
  shellScope,
  header,
  children,
  edges = ['top', 'left', 'right'],
  testID,
}: CatalogScreenShellProps) {
  return (
    <SafeAreaView
      style={commonStyles.screen}
      edges={edges}
      testID={testID}
      onLayout={(event) =>
        logStackLayout(`${shellScope}:root:layout`, event, {
          testID,
          style: describeViewStyle(commonStyles.screen),
        })
      }
    >
      {header ? (
        <View
          collapsable={false}
          onLayout={(event) => logStackLayout(`${shellScope}:header:layout`, event, { testID })}
        >
          {header}
        </View>
      ) : null}
      <View
        testID={`${shellScope}-body`}
        style={styles.body}
        collapsable={false}
        onLayout={(event) =>
          logStackLayout(`${shellScope}:body:layout`, event, {
            testID,
            style: describeViewStyle(styles.body),
          })
        }
      >
        {__DEV__ && Platform.OS === 'android' ? (
          <View
            testID={`${shellScope}-body-canary`}
            collapsable={false}
            style={styles.bodyCanary}
            onLayout={(event) => logStackLayout(`${shellScope}:body-canary:layout`, event, { testID })}
          >
            <Text style={styles.bodyCanaryText}>BODY CANARY</Text>
          </View>
        ) : null}
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  bodyCanary: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#00FFFF',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  bodyCanaryText: {
    color: '#000000',
    fontWeight: '700',
  },
});
