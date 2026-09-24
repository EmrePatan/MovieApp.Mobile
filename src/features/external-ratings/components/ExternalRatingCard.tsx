import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { EXTERNAL_RATING_CARD_LAYOUT } from '../config/external-rating-card-visuals';
import { resolveRottenTomatoesCardIcons } from '../config/external-rating-provider-brand-config';
import type {
  ExternalRatingCardModel,
  ExternalRatingRottenTomatoesCardModel,
  ExternalRatingStandardCardModel,
} from '../utils/format-external-rating';
import { ExternalRatingProviderBrand } from './ExternalRatingProviderBrand';

interface ExternalRatingCardProps {
  card: ExternalRatingCardModel;
}

export function ExternalRatingCard({ card }: ExternalRatingCardProps) {
  if (card.kind === 'rotten-tomatoes') {
    return <RottenTomatoesRatingCard card={card} />;
  }

  return <StandardRatingCard card={card} />;
}

function StandardRatingCard({ card }: { card: ExternalRatingStandardCardModel }) {
  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={card.accessibilityLabel}
      testID={`external-rating-card-${card.id}`}
    >
      <View style={styles.brandSlot}>
        <ExternalRatingProviderBrand source={card.source} variant="card" />
      </View>
      <View style={styles.scoreDivider} accessibilityElementsHidden importantForAccessibility="no" />
      <AppText style={styles.scoreLine} numberOfLines={1}>
        {card.scoreLine}
      </AppText>
    </View>
  );
}

function RottenTomatoesRatingCard({ card }: { card: ExternalRatingRottenTomatoesCardModel }) {
  const icons = resolveRottenTomatoesCardIcons();

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={card.accessibilityLabel}
      testID="external-rating-card-rotten-tomatoes"
    >
      {card.tomatometerScore ? (
        <View
          style={styles.rtPair}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          <Image
            source={icons.tomatometerIcon}
            style={{ width: icons.iconSize, height: icons.iconSize }}
            resizeMode="contain"
            accessibilityLabel="Tomatometer"
            testID="rt-tomatometer-icon"
          />
          <AppText style={styles.scoreLine}>{card.tomatometerScore}</AppText>
        </View>
      ) : null}
      {card.tomatometerScore && card.popcornmeterScore ? (
        <View style={styles.rtGroupsDivider} accessibilityElementsHidden importantForAccessibility="no" />
      ) : null}
      {card.popcornmeterScore ? (
        <View
          style={styles.rtPair}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          <Image
            source={icons.popcornIcon}
            style={{ width: icons.iconSize, height: icons.iconSize }}
            resizeMode="contain"
            accessibilityLabel="Popcornmeter"
            testID="rt-popcorn-icon"
          />
          <AppText style={styles.scoreLine}>{card.popcornmeterScore}</AppText>
        </View>
      ) : null}
    </View>
  );
}

const layout = EXTERNAL_RATING_CARD_LAYOUT;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minHeight,
    paddingHorizontal: layout.paddingHorizontal,
    paddingVertical: layout.paddingVertical,
    borderRadius: layout.borderRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceElevated,
    gap: layout.brandScoreGap,
  },
  brandSlot: {
    justifyContent: 'center',
    flexShrink: 0,
  },
  scoreDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 6,
    backgroundColor: colors.borderSubtle,
    flexShrink: 0,
  },
  scoreLine: {
    color: colors.textPrimary,
    fontSize: layout.scoreFontSize,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
  },
  rtPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.rtPairGap,
    flexShrink: 0,
  },
  rtGroupsDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 6,
    backgroundColor: colors.borderSubtle,
    flexShrink: 0,
  },
});
