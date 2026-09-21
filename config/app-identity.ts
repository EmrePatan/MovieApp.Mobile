export const APP_IDENTITY = {
  androidPackage: 'com.movieapp.mobile',
  iosBundleIdentifier: 'com.movieapp.mobile',
  urlScheme: 'movieapp',
  easProjectId: '87854bea-c475-4d4d-85f2-dfc1ecb52997',
} as const;

export type AppIdentity = typeof APP_IDENTITY;
