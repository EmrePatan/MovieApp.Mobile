import type { ImageSourcePropType } from 'react-native';

/** Bundled stills for the Keşfet feature cards. Subjects sit on the right. */
const discoverAiBackground = require('../../../assets/images/discover/discover-ai-background.jpg');

export const discoverFeatureBackgrounds = {
  advancedDiscover: discoverAiBackground,
  pickSomething: require('../../../assets/images/discover/discover-pick-background.jpg'),
  aiRecommendations: discoverAiBackground,
} as const satisfies Record<string, ImageSourcePropType>;
