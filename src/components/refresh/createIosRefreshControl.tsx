import { Platform } from 'react-native';
import {
  MovieAppRefreshControl,
  type MovieAppRefreshControlProps,
} from './MovieAppRefreshControl';

export function createIosRefreshControl(props: MovieAppRefreshControlProps) {
  return Platform.OS === 'ios' ? <MovieAppRefreshControl {...props} /> : undefined;
}
