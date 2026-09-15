import { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { ImageViewerModal } from '@/features/gallery/components/ImageViewerModal';
import { createGalleryImageFromPath } from '@/features/gallery/utils/gallery-images';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
import { DetailScrim } from '@/features/details/shared/components/DetailScrim';
import { formatIsoDate } from '@/utils/format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface PersonHeroProps {
  name: string;
  profileImagePath: string | null;
  knownForDepartment: string | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
}

export const PersonHero = memo(function PersonHero({
  name,
  profileImagePath,
  knownForDepartment,
  birthday,
  deathday,
  placeOfBirth,
}: PersonHeroProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const heroHeight = Math.round(Math.min(360, Math.max(260, width * 0.62)));
  const portraitSize = Math.round(Math.min(148, width * 0.36));

  const birthLine = formatLifeDates(birthday, deathday);
  const metaParts = [knownForDepartment, birthLine, placeOfBirth].filter(Boolean);
  const [isPortraitViewerOpen, setIsPortraitViewerOpen] = useState(false);

  const portraitImages = useMemo(
    () => (profileImagePath ? [createGalleryImageFromPath(profileImagePath, 'profile')] : []),
    [profileImagePath],
  );

  const openPortraitViewer = useCallback(() => {
    if (profileImagePath) {
      setIsPortraitViewerOpen(true);
    }
  }, [profileImagePath]);

  const closePortraitViewer = useCallback(() => {
    setIsPortraitViewerOpen(false);
  }, []);

  const portraitLabel = `${name} portrait`;

  return (
    <View style={styles.container}>
      <View style={[styles.mediaContainer, { height: heroHeight }]}>
        {profileImagePath ? (
          <CatalogImage
            path={profileImagePath}
            width={width}
            height={heroHeight}
            accessibilityLabel={`${name} portrait backdrop`}
          />
        ) : (
          <View style={[styles.fallbackBackdrop, { height: heroHeight }]} />
        )}
        <DetailScrim />
        <DetailBackButton variant="overlay" topOffset={insets.top + spacing.sm} />
      </View>

      <View style={styles.content}>
        <View style={[styles.portraitFrame, { width: portraitSize, height: portraitSize }]}>
          {profileImagePath ? (
            <Pressable
              onPress={openPortraitViewer}
              accessibilityRole="button"
              accessibilityLabel={portraitLabel}
              accessibilityHint="Opens full screen portrait"
              style={({ pressed }) => [pressed && styles.portraitPressed]}
              testID="person-hero-portrait"
            >
              <CatalogImage
                path={profileImagePath}
                width={portraitSize}
                height={portraitSize}
                rounded
                accessibilityLabel={portraitLabel}
              />
            </Pressable>
          ) : (
            <View style={[styles.portraitFallback, { width: portraitSize, height: portraitSize }]}>
              <Ionicons name="person-outline" size={48} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.textBlock}>
          <AppText variant="title" numberOfLines={3}>
            {name}
          </AppText>
          {metaParts.length > 0 ? (
            <View style={styles.metaList}>
              {metaParts.map((part) => (
                <AppText key={part} variant="bodySmall" muted numberOfLines={2}>
                  {part}
                </AppText>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      {isPortraitViewerOpen ? (
        <ImageViewerModal
          visible
          images={portraitImages}
          initialIndex={0}
          onClose={closePortraitViewer}
        />
      ) : null}
    </View>
  );
});

function formatLifeDates(birthday: string | null, deathday: string | null): string | null {
  const birth = formatIsoDate(birthday);
  if (!birth) {
    return null;
  }

  const death = formatIsoDate(deathday);
  return death ? `${birth} – ${death}` : `Born ${birth}`;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  mediaContainer: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  fallbackBackdrop: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
  },
  content: {
    marginTop: -72,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  portraitFrame: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: colors.surfaceElevated,
  },
  portraitFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
  },
  textBlock: {
    flex: 1,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  metaList: {
    gap: 2,
  },
  portraitPressed: {
    opacity: interaction.pressedOpacity,
  },
});
