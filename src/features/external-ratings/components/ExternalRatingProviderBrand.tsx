import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';

interface ExternalRatingProviderBrandProps {
  source: string;
}

const BRAND_HEIGHT = 18;

function ImdbBrand() {
  return (
    <View style={styles.brandRow} accessibilityElementsHidden importantForAccessibility="no">
      <Svg width={44} height={BRAND_HEIGHT} viewBox="0 0 44 18">
        <Rect x={0} y={0} width={44} height={18} rx={3} fill="#F5C518" />
        <SvgText
          x={22}
          y={13}
          fill="#000000"
          fontSize={11}
          fontWeight="700"
          textAnchor="middle"
        >
          IMDb
        </SvgText>
      </Svg>
    </View>
  );
}

function LetterboxdBrand() {
  return (
    <View style={styles.brandRow} accessibilityElementsHidden importantForAccessibility="no">
      <Svg width={88} height={BRAND_HEIGHT} viewBox="0 0 88 18">
        <SvgText x={0} y={13} fill={colors.textPrimary} fontSize={12} fontWeight="600">
          Letterboxd
        </SvgText>
      </Svg>
    </View>
  );
}

function RottenTomatoesBrand() {
  return (
    <View style={styles.brandRow} accessibilityElementsHidden importantForAccessibility="no">
      <Svg width={118} height={BRAND_HEIGHT} viewBox="0 0 118 18">
        <Circle cx={9} cy={9} r={7} fill="#FA320A" />
        <Circle cx={25} cy={9} r={7} fill="#FBC036" />
        <SvgText x={38} y={13} fill={colors.textPrimary} fontSize={11} fontWeight="600">
          Rotten Tomatoes
        </SvgText>
      </Svg>
    </View>
  );
}

function MetacriticBrand() {
  return (
    <View style={styles.brandRow} accessibilityElementsHidden importantForAccessibility="no">
      <Svg width={78} height={BRAND_HEIGHT} viewBox="0 0 78 18">
        <Rect x={0} y={1} width={16} height={16} rx={2} fill="#FFCC33" />
        <Path d="M4 13 L8 5 L12 13 Z" fill="#000" />
        <SvgText x={20} y={13} fill={colors.textPrimary} fontSize={11} fontWeight="600">
          Metacritic
        </SvgText>
      </Svg>
    </View>
  );
}

function TmdbBrand() {
  return (
    <View style={styles.brandRow} accessibilityElementsHidden importantForAccessibility="no">
      <Svg width={56} height={BRAND_HEIGHT} viewBox="0 0 56 18">
        <Rect x={0} y={0} width={56} height={18} rx={3} fill="#0D253F" />
        <SvgText x={28} y={13} fill="#01D277" fontSize={10} fontWeight="700" textAnchor="middle">
          TMDB
        </SvgText>
      </Svg>
    </View>
  );
}

function TextFallbackBrand({ label }: { label: string }) {
  return <AppText style={styles.fallbackLabel}>{label}</AppText>;
}

export function ExternalRatingProviderBrand({ source }: ExternalRatingProviderBrandProps) {
  switch (source) {
    case 'imdb':
      return <ImdbBrand />;
    case 'letterboxd':
      return <LetterboxdBrand />;
    case 'rotten-tomatoes':
      return <RottenTomatoesBrand />;
    case 'metacritic':
      return <MetacriticBrand />;
    case 'tmdb':
      return <TmdbBrand />;
    default:
      return <TextFallbackBrand label={source} />;
  }
}

const styles = StyleSheet.create({
  brandRow: {
    minHeight: BRAND_HEIGHT,
    justifyContent: 'center',
  },
  fallbackLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
