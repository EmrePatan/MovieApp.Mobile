import { StyleSheet, View } from 'react-native';
import {
  DETAIL_BACKGROUND_RGB,
  DETAIL_SCRIM_OPACITIES,
} from '../utils/detail-scrim';

export function DetailScrim() {
  return (
    <View style={styles.scrim} pointerEvents="none">
      {DETAIL_SCRIM_OPACITIES.map((opacity, index) => (
        <View
          key={index}
          style={[
            styles.strip,
            { backgroundColor: `rgba(${DETAIL_BACKGROUND_RGB}, ${opacity})` },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'column',
  },
  strip: {
    flex: 1,
  },
});
