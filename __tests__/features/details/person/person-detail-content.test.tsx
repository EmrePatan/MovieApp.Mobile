import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';
import { PersonDetailContent } from '@/features/details/person/components/PersonDetailContent';

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: jest.fn(() => ['(tabs)', 'person', '[tmdbId]']),
}));

jest.mock('@/features/gallery/hooks/useGallery', () => ({
  usePersonGallery: () => ({
    data: { backdrops: [], posters: [], logos: [], profiles: [] },
    isLoading: false,
  }),
}));

describe('PersonDetailContent', () => {
  it('renders biography and filmography', () => {
    renderWithQueryClient(
      <PersonDetailContent
        person={{
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          tmdbId: 1001,
          name: 'Matthew McConaughey',
          profileImagePath: '/profile.jpg',
          biography: 'Award-winning actor.',
          birthday: '1969-11-04',
          deathday: null,
          placeOfBirth: 'Texas',
          knownForDepartment: 'Acting',
          filmography: [
            {
              mediaType: 'movie',
              catalogId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
              tmdbId: 900001,
              title: 'Interstellar',
              posterPath: '/poster.jpg',
              character: 'Cooper',
              releaseDate: '2014-11-07',
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Matthew McConaughey')).toBeTruthy();
    expect(screen.getByText('Award-winning actor.')).toBeTruthy();
    expect(screen.getByText('Interstellar')).toBeTruthy();
    expect(screen.getByTestId('person-filmography-preview')).toBeTruthy();
  });

  it('shows biography empty state', () => {
    renderWithQueryClient(
      <PersonDetailContent
        person={{
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          tmdbId: 1001,
          name: 'Jane Actor',
          profileImagePath: null,
          biography: null,
          birthday: null,
          deathday: null,
          placeOfBirth: null,
          knownForDepartment: null,
          filmography: [],
        }}
      />,
    );

    expect(screen.getByTestId('person-biography-empty')).toBeTruthy();
    expect(screen.getByTestId('person-filmography-empty')).toBeTruthy();
  });
});
