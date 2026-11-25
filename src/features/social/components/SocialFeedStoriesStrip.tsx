import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import type { SocialFeedItem } from '../types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

const STORY_SIZE = 58;

export interface SocialStoryActor {
  actorId: string;
  displayName: string;
  avatarUrl: string | null;
}

interface SocialFeedStoriesStripProps {
  currentUser?: { displayName: string; avatarUrl: string | null } | null;
  actors: SocialStoryActor[];
  onSelfPress: () => void;
  onFindPeoplePress: () => void;
  onActorPress: (actorId: string) => void;
}

export const SocialFeedStoriesStrip = memo(function SocialFeedStoriesStrip({
  currentUser,
  actors,
  onSelfPress,
  onFindPeoplePress,
  onActorPress,
}: SocialFeedStoriesStripProps) {
  const { t } = useTranslation();

  if (!currentUser && actors.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {currentUser ? (
        <View style={styles.story}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('social.storiesSelf', { name: currentUser.displayName })}
            onPress={onSelfPress}
            style={({ pressed }) => [styles.selfPressable, pressed && styles.pressed]}
          >
            <View style={styles.actorRing}>
              <View style={styles.selfAvatarInner}>
                <UserAvatar
                  displayName={currentUser.displayName}
                  effectiveAvatarUrl={currentUser.avatarUrl}
                  size={STORY_SIZE - 8}
                  accessibilityLabel={currentUser.displayName}
                />
              </View>
            </View>
            <AppText variant="caption" numberOfLines={1} style={styles.label}>
              {t('social.storiesSelfShort')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('social.storiesFindPeople')}
            onPress={onFindPeoplePress}
            hitSlop={6}
            style={({ pressed }) => [styles.findPeopleBadge, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={16} color={colors.background} />
          </Pressable>
        </View>
      ) : null}
      {actors.map((actor) => (
        <Pressable
          key={actor.actorId}
          accessibilityRole="button"
          accessibilityLabel={actor.displayName}
          onPress={() => onActorPress(actor.actorId)}
          style={({ pressed }) => [styles.story, pressed && styles.pressed]}
        >
          <View style={styles.actorRing}>
            <UserAvatar
              displayName={actor.displayName}
              effectiveAvatarUrl={actor.avatarUrl}
              size={STORY_SIZE}
              accessibilityLabel={actor.displayName}
            />
          </View>
          <AppText variant="caption" numberOfLines={1} style={styles.label}>
            {actor.displayName.split(' ')[0]}
          </AppText>
        </Pressable>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  story: {
    width: 68,
    alignItems: 'center',
    position: 'relative',
  },
  selfPressable: {
    alignItems: 'center',
    gap: spacing.xs,
    width: '100%',
  },
  findPeopleBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.background,
  },
  selfAvatarInner: {
    width: STORY_SIZE - 4,
    height: STORY_SIZE - 4,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  actorRing: {
    padding: 2.5,
    borderRadius: STORY_SIZE,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  label: {
    maxWidth: 68,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});