import { useMemo, type ReactNode } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import type { SocialProfileStatistics } from '@/features/social/types';
import { formatWatchDuration } from '@/features/social/utils/format-watch-duration';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';
import type { ProfileSocialLinks } from '../types';
import { COVER_ASPECT } from '../utils/cover-crop';
import { filledSocialLinks, PROFILE_SOCIAL_PLATFORMS } from '../utils/profile-social-links';
import { ProfileSocialPlatformIcon } from './ProfileSocialPlatformIcon';

export const PROFILE_AVATAR_SIZE = 76;
const ICON_SIZE = 30;

export interface ProfileHeaderCount {
  key: string;
  value: number;
  label: string;
  onPress?: () => void;
}

/** Gold ring every profile avatar sits in. */
export function ProfileAvatarRing({ children }: { children: ReactNode }) {
  return <View style={styles.avatarRing}>{children}</View>;
}

/** One hairline-separated row under the action buttons (taste match, watch totals…). */
export function ProfileLine({
  left,
  right,
  onPress,
  accessibilityLabel,
  testID,
}: {
  left: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const content = (
    <>
      <View style={styles.lineLeft}>{left}</View>
      {right ? <View style={styles.lineRight}>{right}</View> : null}
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.line} testID={testID}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.line, pressed && styles.pressed]}
      testID={testID}
    >
      {content}
    </Pressable>
  );
}

/** All platforms, always in the same slots: filled ones open the link, empty ones stay dimmed. */
function SocialLinksStrip({ links }: { links: ProfileSocialLinks | null | undefined }) {
  const { t } = useTranslation();
  const filled = useMemo(() => {
    const map = new Map<string, { url: string; value: string }>();
    for (const item of filledSocialLinks(links)) {
      map.set(item.platform, { url: item.url, value: item.value });
    }
    return map;
  }, [links]);

  return (
    <View style={styles.icons} testID="profile-social-strip">
      {PROFILE_SOCIAL_PLATFORMS.map((platform) => {
        const entry = filled.get(platform);
        const labelKey = `profile.socialPlatform${platform.charAt(0).toUpperCase()}${platform.slice(1)}`;
        const label = t(labelKey, { defaultValue: platform });
        if (!entry) {
          return (
            <View
              key={platform}
              accessible
              accessibilityRole="image"
              accessibilityLabel={label}
              accessibilityState={{ disabled: true }}
              style={[styles.icon, styles.iconOff]}
            >
              <ProfileSocialPlatformIcon platform={platform} size={14} color={colors.textPrimary} />
            </View>
          );
        }
        return (
          <Pressable
            key={platform}
            accessibilityRole="link"
            accessibilityLabel={`${label}: ${entry.value}`}
            hitSlop={4}
            onPress={() => {
              void Linking.openURL(entry.url);
            }}
            style={({ pressed }) => [styles.icon, pressed && styles.pressed]}
          >
            <ProfileSocialPlatformIcon platform={platform} size={14} color={colors.textPrimary} />
          </Pressable>
        );
      })}
    </View>
  );
}

function CountsLine({ counts }: { counts: ProfileHeaderCount[] }) {
  return (
    <View style={styles.counts}>
      {counts.map((count, index) => (
        <View key={count.key} style={styles.countItem}>
          {index > 0 ? <AppText style={styles.countDot}>·</AppText> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${count.value} ${count.label}`}
            onPress={count.onPress}
            disabled={!count.onPress}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <AppText style={styles.countText} numberOfLines={1}>
              <AppText style={styles.countValue}>{count.value}</AppText>
              {` ${count.label.toLowerCase()}`}
            </AppText>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function WatchLine({ statistics }: { statistics: SocialProfileStatistics }) {
  const { t, i18n } = useTranslation();
  const labels = useMemo(
    () => ({
      minutes: (count: number) => t('social.durationMinutes', { count }),
      hours: (count: number) => t('social.durationHours', { count }),
      hoursMinutes: (hours: number, minutes: number) =>
        t('social.durationHoursMinutes', { hours, minutes }),
      days: (count: number) => t('social.durationDays', { count }),
      daysHours: (days: number, hours: number) => t('social.durationDaysHours', { days, hours }),
    }),
    [t],
  );
  const total = (statistics.movieRuntimeMinutes ?? 0) + (statistics.episodeRuntimeMinutes ?? 0);
  const format = (value: number) => new Intl.NumberFormat(i18n.language).format(value);

  return (
    <ProfileLine
      testID="profile-watch-line"
      left={
        <AppText style={styles.lineText} numberOfLines={1}>
          <AppText style={styles.lineStrong}>{format(statistics.moviesWatched)}</AppText>
          {` ${t('social.movies').toLowerCase()} · `}
          <AppText style={styles.lineStrong}>{format(statistics.episodesWatched)}</AppText>
          {` ${t('social.episodes').toLowerCase()}`}
        </AppText>
      }
      right={
        total > 0 ? (
          <AppText style={styles.lineText} numberOfLines={1}>
            {formatWatchDuration(total, labels)}
          </AppText>
        ) : null
      }
    />
  );
}

interface ProfileIdentityHeaderProps {
  coverUri: string | null;
  isCustomPhotoCover: boolean;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  /** Avatar element, already wrapped in ProfileAvatarRing. */
  avatar: ReactNode;
  displayName: string;
  /** Level seal next to the name. */
  seal?: ReactNode;
  handle: string;
  /** Secondary text after the handle, e.g. "Mutual follow" or the join date. */
  handleNote?: string | null;
  isPrivate?: boolean;
  bio?: string | null;
  socialLinks?: ProfileSocialLinks | null;
  counts: ProfileHeaderCount[];
  /** Follow / message buttons (omitted on your own profile). */
  actions?: ReactNode;
  /** Extra ProfileLine rows between the buttons and the watch totals (e.g. taste match). */
  extraLines?: ReactNode;
  statistics?: SocialProfileStatistics;
  /** Own profile tab sits inside a padded list: bleed the cover to the screen edges. */
  bleed?: boolean;
  horizontalPadding: number;
  testID?: string;
}

/**
 * The one profile header, shared by your own tab and everyone else's: cover, avatar, name,
 * handle, bio, social icons, counts, buttons, then quiet info lines.
 */
export function ProfileIdentityHeader({
  coverUri,
  isCustomPhotoCover,
  topLeft,
  topRight,
  avatar,
  displayName,
  seal,
  handle,
  handleNote,
  isPrivate = false,
  bio,
  socialLinks,
  counts,
  actions,
  extraLines,
  statistics,
  bleed = false,
  horizontalPadding,
  testID,
}: ProfileIdentityHeaderProps) {
  useAuthFonts();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const coverImageHeight = Math.round(width / COVER_ASPECT);
  const coverHeight = insets.top + coverImageHeight;
  const avatarOverlap = Math.round(PROFILE_AVATAR_SIZE * 0.42);
  const stageStyle: StyleProp<ViewStyle> = bleed
    ? [styles.stage, { width, marginLeft: -horizontalPadding }]
    : styles.stage;

  return (
    <View style={stageStyle} testID={testID}>
      <View style={[styles.coverBleed, { height: coverHeight }]}>
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={[styles.coverImage, { height: coverImageHeight }]}
            contentFit="cover"
            contentPosition={isCustomPhotoCover ? 'center' : 'top'}
            cachePolicy="memory-disk"
            accessibilityElementsHidden
          />
        ) : (
          <LinearGradient
            colors={['#2A1F18', '#141018', colors.background]}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient
          colors={['rgba(10,10,15,0.35)', 'rgba(10,10,15,0.15)', colors.background]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      <View
        style={[styles.topChrome, { top: insets.top + spacing.sm, left: horizontalPadding, right: horizontalPadding }]}
        pointerEvents="box-none"
      >
        <View>{topLeft}</View>
        <View style={styles.topRight}>{topRight}</View>
      </View>

      <View style={[styles.body, { marginTop: -avatarOverlap, paddingHorizontal: horizontalPadding }]}>
        <View style={styles.identityRow}>
          {avatar}
          <View style={[styles.identityCopy, { paddingTop: avatarOverlap + spacing.xs }]}>
            <View style={styles.nameRow}>
              <AppText numberOfLines={2} style={[styles.name, resolveNameSize(displayName)]}>
                {displayName}
              </AppText>
              {seal}
            </View>
            <View style={styles.handleRow}>
              <AppText numberOfLines={1} style={styles.handle}>
                {handle}
                {handleNote ? ` · ${handleNote}` : ''}
              </AppText>
              {isPrivate ? (
                <Ionicons
                  name="lock-closed"
                  size={12}
                  color={colors.textSecondary}
                  accessibilityLabel={t('social.privateProfile')}
                />
              ) : null}
            </View>
          </View>
        </View>

        {bio ? (
          <AppText style={styles.bio} numberOfLines={4}>
            {bio}
          </AppText>
        ) : null}

        <SocialLinksStrip links={socialLinks} />
        <CountsLine counts={counts} />

        <View style={styles.lines}>
          {extraLines}
          {statistics ? <WatchLine statistics={statistics} /> : null}
        </View>

        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
    </View>
  );
}

/** Long display names step down so they stay within two lines. */
function resolveNameSize(name: string) {
  if (name.length > 26) return { fontSize: 20, lineHeight: 25 };
  if (name.length > 20) return { fontSize: 22, lineHeight: 28 };
  return null;
}

const styles = StyleSheet.create({
  stage: {
    marginBottom: spacing.sm,
  },
  coverBleed: {
    backgroundColor: '#120E16',
    overflow: 'hidden',
  },
  coverImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  topChrome: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  topRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  body: {},
  avatarRing: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.background,
    padding: 2,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  handle: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    opacity: 0.9,
    marginTop: spacing.sm,
  },
  icons: {
    flexDirection: 'row',
    gap: 7,
    marginTop: spacing.sm,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glass.panelElevated,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  iconOff: {
    opacity: 0.28,
    borderStyle: 'dashed',
  },
  counts: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countDot: {
    color: colors.textMuted,
    marginHorizontal: 6,
    fontSize: 13,
  },
  countText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  countValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    marginTop: spacing.md,
  },
  lines: {
    marginTop: spacing.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 44,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: glass.hairline,
  },
  lineLeft: {
    flex: 1,
    minWidth: 0,
  },
  lineRight: {
    flexShrink: 0,
  },
  lineText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  lineStrong: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  pressed: {
    opacity: 0.7,
  },
});
