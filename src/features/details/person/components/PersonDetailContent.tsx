import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import type { PersonDetailResponse } from '../types';
import { PersonFilmographySection } from './PersonFilmographySection';
import { PersonHero } from './PersonHero';
import { spacing } from '@/theme/spacing';

interface PersonDetailContentProps {
  person: PersonDetailResponse;
}

export function PersonDetailContent({ person }: PersonDetailContentProps) {
  const biography = person.biography?.trim();

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
          <AppText variant="body" style={styles.biography}>
            {biography}
          </AppText>
        ) : (
          <AppText variant="bodySmall" muted style={styles.emptyBiography} testID="person-biography-empty">
            Biography is not available for this person yet.
          </AppText>
        )}
      </View>

      <PersonFilmographySection filmography={person.filmography} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
  },
  biography: {
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  emptyBiography: {
    paddingHorizontal: spacing.lg,
  },
});
