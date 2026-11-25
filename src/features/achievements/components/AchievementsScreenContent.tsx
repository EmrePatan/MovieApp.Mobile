import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { InsightsCard } from '@/features/insights/components/InsightsCard';
import { useInsightsV3 } from '@/features/insights/hooks/useInsightsV3';
import { SocialSubscreenHeader } from '@/features/social/components/SocialSubscreenHeader';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { computeLevel, groupAchievements, nextUp, totalPoints } from '../achievement-model';
import { useAchievementCopy } from '../useAchievementCopy';
import { AchievementDetailSheet, type AchievementDetailTarget } from './AchievementDetailSheet';
import { AchievementFamilyCard } from './AchievementFamilyCard';
import { AchievementLevelCard } from './AchievementLevelCard';
import { AchievementNextUpRow } from './AchievementNextUpRow';

export function AchievementsScreenContent() {
  const router = useRouter();
  const [detail, setDetail] = useState<AchievementDetailTarget | null>(null);
  const { t } = useAchievementCopy();
  const query = useInsightsV3();
  const achievements = query.data?.achievements;

  const model = useMemo(() => {
    const families = groupAchievements(achievements ?? []);
    return {
      families,
      level: computeLevel(totalPoints(families)),
      next: nextUp(families, 3),
    };
  }, [achievements]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <SocialSubscreenHeader
        title={t('achievements.title')}
        subtitle={t('achievements.subtitle')}
        onBack={() => router.back()}
      />
      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : query.isError || !achievements ? (
        <ErrorView message={t('insights.hub.loadError')} onRetry={() => void query.refetch()} />
      ) : achievements.length === 0 ? (
        <View style={styles.center}>
          <AppText muted center>
            {t('achievements.empty')}
          </AppText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <InsightsCard glow>
            <AchievementLevelCard level={model.level} />
          </InsightsCard>

          {model.next.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="caption" style={styles.sectionTitle}>
                {t('achievements.nextUp')}
              </AppText>
              <InsightsCard style={styles.nextCard}>
                {model.next.map((family) => (
                  <AchievementNextUpRow key={family.category} family={family} />
                ))}
              </InsightsCard>
            </View>
          ) : null}

          <View style={styles.section}>
            <AppText variant="caption" style={styles.sectionTitle}>
              {t('achievements.allAchievements')}
            </AppText>
            {model.families.map((family) => (
              <AchievementFamilyCard
                key={family.category}
                family={family}
                onSelectTier={setDetail}
              />
            ))}
          </View>
        </ScrollView>
      )}
      <AchievementDetailSheet target={detail} onClose={() => setDetail(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '700',
    paddingHorizontal: spacing.xs,
  },
  nextCard: {
    gap: spacing.lg,
  },
});
