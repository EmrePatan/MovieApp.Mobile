import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { PersonGallerySection } from '@/features/gallery/components/PersonGallerySection';
import { usePersonGallery } from '@/features/gallery/hooks/useGallery';
import { buildPersonGalleryRoute } from '@/features/details/shared/routes';
import type { PersonDetailResponse } from '../types';
import { CollapsibleBiography } from './CollapsibleBiography';
import { PersonFilmographyPreviewSection } from './PersonFilmographyPreviewSection';
import { PersonHero } from './PersonHero';
import { spacing } from '@/theme/spacing';

interface PersonDetailContentProps {
  person: PersonDetailResponse;
}

export function PersonDetailContent({ person }: PersonDetailContentProps) {
  const biography = person.biography?.trim();
  const galleryQuery = usePersonGallery(person.tmdbId);

  return (
    <View>
      <PersonHero
        name={person.name}
        profileImagePath={person.profileImagePath}
        knownForDepartment={person.knownForDepartment}
        birthday={person.birthday}
        deathday={person.deathday}
        placeOfBirth={person.placeOfBirth}
      />

      <View style={styles.section}>
        <HomeSectionHeader title="Biography" />
        {biography ? (
          <CollapsibleBiography biography={biography} />
        ) : (
          <AppText variant="bodySmall" muted style={styles.emptyBiography} testID="person-biography-empty">
            Biography is not available for this person yet.
          </AppText>
        )}
      </View>

      <PersonGallerySection
        query={galleryQuery}
        seeAllRoute={buildPersonGalleryRoute(person.tmdbId)}
      />
      <PersonFilmographyPreviewSection
        tmdbPersonId={person.tmdbId}
        filmography={person.filmography}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
  },
  emptyBiography: {
    paddingHorizontal: spacing.lg,
  },
});
