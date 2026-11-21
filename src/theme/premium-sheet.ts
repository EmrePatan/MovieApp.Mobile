import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * Shared premium dark bottom-sheet tokens.
 * Sheet-scoped — do not fold into global theme colors.
 */
export const premiumSheet = {
  background: '#0C0C0F',
  elevated: '#141419',
  secondary: '#111115',
  border: '#29272D',
  rowBorder: '#28262C',
  textPrimary: '#F5F2ED',
  textSecondary: '#92909A',
  mutedGold: '#D2A451',
  goldBorder: '#B98B43',
  handle: '#7A7884',
  iconSurface: '#0A0A0D',
  cornerRadius: 30,
  handleWidth: 64,
  handleHeight: 5,
  contentPaddingH: 24,
  contentPaddingTop: 12,
  contentPaddingBottom: 20,
} as const;

/** Reusable chrome fragments for Modal / SafeArea bottom sheets. */
export const premiumSheetChrome = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: premiumSheet.background,
    borderTopLeftRadius: premiumSheet.cornerRadius,
    borderTopRightRadius: premiumSheet.cornerRadius,
    paddingHorizontal: premiumSheet.contentPaddingH,
    paddingTop: premiumSheet.contentPaddingTop,
    paddingBottom: premiumSheet.contentPaddingBottom,
  },
  handle: {
    alignSelf: 'center',
    width: premiumSheet.handleWidth,
    height: premiumSheet.handleHeight,
    borderRadius: 999,
    backgroundColor: premiumSheet.handle,
    marginBottom: 14,
  },
  title: {
    color: premiumSheet.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  subtitle: {
    color: premiumSheet.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionLabel: {
    color: premiumSheet.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: premiumSheet.border,
  },
  optionRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: premiumSheet.rowBorder,
    backgroundColor: premiumSheet.secondary,
  },
  optionRowSelected: {
    borderColor: premiumSheet.goldBorder,
    backgroundColor: premiumSheet.elevated,
  },
  optionLabelSelected: {
    color: premiumSheet.mutedGold,
    fontWeight: '600',
  },
});
