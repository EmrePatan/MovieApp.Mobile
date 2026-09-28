import { useContext } from 'react';
import { AppConfigContext } from '../AppConfigProvider';

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }

  return context;
}
