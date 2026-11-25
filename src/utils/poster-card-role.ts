import { Platform } from 'react-native';

/**
 * Poster cards wrap interactive corner controls (watched / dismiss). On web,
 * `button` renders a <button>, so the nested controls would produce invalid
 * <button> inside <button> markup. A link role renders an anchor there and the
 * card still navigates. Native keeps the button role.
 */
export const POSTER_CARD_ROLE = Platform.OS === 'web' ? 'link' : 'button';
