import { resolveImageUri, getImageBaseUrl } from '@/utils/image-url';

describe('resolveImageUri', () => {
  const originalEnv = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalEnv;
  });

  it('returns absolute URLs unchanged', () => {
    expect(resolveImageUri('https://example.com/poster.jpg')).toBe('https://example.com/poster.jpg');
  });

  it('returns null for missing paths', () => {
    expect(resolveImageUri(null)).toBeNull();
  });

  it('returns null for relative paths when no base URL is configured', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;
    expect(resolveImageUri('/path.jpg')).toBeNull();
    expect(getImageBaseUrl()).toBeNull();
  });

  it('builds relative paths when EXPO_PUBLIC_IMAGE_BASE_URL is configured', () => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://images.example.com/';
    expect(resolveImageUri('/path.jpg')).toBe('https://images.example.com/path.jpg');
  });
});
