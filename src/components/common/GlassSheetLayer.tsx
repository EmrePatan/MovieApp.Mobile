import { StyleSheet } from 'react-native';
import { GlassSurface } from '@/components/common/GlassSurface';
import { premiumSheet } from '@/theme/premium-sheet';

/**
 * Glass material for a bottom sheet. Render as the first child of the sheet
 * container; the container clips it to its own rounded top corners.
 */
export function GlassSheetLayer() {
  return <GlassSurface pointerEvents="none" style={styles.layer} />;
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: premiumSheet.cornerRadius,
    borderTopRightRadius: premiumSheet.cornerRadius,
  },
});
