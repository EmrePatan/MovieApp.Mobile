import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { NotificationPermissionPromptModal } from '@/features/follows/components/NotificationPermissionPromptModal';
import { changeUiLanguage, i18n } from '@/i18n';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

function renderModal(
  props: Partial<React.ComponentProps<typeof NotificationPermissionPromptModal>> = {},
) {
  return render(
    <I18nextProvider i18n={i18n}>
      <NotificationPermissionPromptModal
        visible
        requiresSettings={false}
        onDismiss={jest.fn()}
        onEnable={jest.fn()}
        {...props}
      />
    </I18nextProvider>,
  );
}

describe('NotificationPermissionPromptModal', () => {
  it('renders requestable action labels in English', async () => {
    await changeUiLanguage('en');

    renderModal({ requiresSettings: false });

    expect(screen.getAllByText('Enable notifications').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Allow notifications so we can alert you about new episodes and releases.')).toBeTruthy();
    expect(screen.getByText('Not now')).toBeTruthy();
    expect(screen.getByLabelText('Not now')).toBeTruthy();
    expect(screen.getByLabelText('Enable notifications')).toBeTruthy();
  });

  it('renders settings-required action labels in English', async () => {
    await changeUiLanguage('en');

    renderModal({ requiresSettings: true });

    expect(screen.getByText('Open settings')).toBeTruthy();
    expect(screen.getByLabelText('Open settings')).toBeTruthy();
    expect(screen.getByText('Not now')).toBeTruthy();
  });

  it('renders requestable action labels in Turkish', async () => {
    await changeUiLanguage('tr');

    renderModal({ requiresSettings: false });

    expect(screen.getAllByText('Bildirimleri aç').length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText('Yeni bölüm ve yayınlardan haberdar olmak için bildirimlere izin ver.'),
    ).toBeTruthy();
    expect(screen.getByText('Şimdi değil')).toBeTruthy();
    expect(screen.getByLabelText('Şimdi değil')).toBeTruthy();
    expect(screen.getByLabelText('Bildirimleri aç')).toBeTruthy();
  });

  it('renders settings-required action labels in Turkish', async () => {
    await changeUiLanguage('tr');

    renderModal({ requiresSettings: true });

    expect(screen.getByText('Ayarları aç')).toBeTruthy();
    expect(screen.getByLabelText('Ayarları aç')).toBeTruthy();
    expect(screen.getByText('Şimdi değil')).toBeTruthy();
  });
});
