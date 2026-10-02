import type { ImageSourcePropType } from 'react-native';

/** Bundled stills for the Keşfet feature cards. Subjects sit on the right. */
export const discoverFeatureBackgrounds = {
  advancedDiscover: require('../../../assets/images/discover/discover-advanced-background.jpg'),
  pickSomething: require('../../../assets/images/discover/discover-pick-background.jpg'),
  aiRecommendations: require('../../../assets/images/discover/discover-ai-background.jpg'),
} as const satisfies Record<string, ImageSourcePropType>;
