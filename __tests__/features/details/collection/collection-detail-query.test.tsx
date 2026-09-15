import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import type { CollectionDetailResponse } from '@/features/details/collection/types';

jest.mock('@/features/details/shared/components/DetailLoadingSkeleton', () => ({
  DetailLoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'detail-loading-skeleton' }, 'Loading');
  },
}));

const collection: CollectionDetailResponse = {
  tmdbId: 9485,
  name: 'The Dark Knight Collection',
  overview: 'Batman trilogy.',
  posterPath: null,
  backdropPath: null,
  parts: [],
};

describe('collection detail query state', () => {
  it('renders loading skeleton while fetching', () => {
    render(
      <DetailQueryState
        query={{
          data: undefined,
          error: null,
          isLoading: true,
          isError: false,
          refetch: jest.fn(),
        }}
        notFoundTitle="Collection not found"
        notFoundMessage="This collection could not be found."
      >
        {() => null}
      </DetailQueryState>,
    );

    expect(screen.getByTestId('detail-loading-skeleton')).toBeTruthy();
  });

  it('renders not found state', () => {
    render(
      <DetailQueryState
        query={{
          data: undefined,
          error: new ApiError({ kind: 'not_found' }),
          isLoading: false,
          isError: true,
          refetch: jest.fn(),
        }}
        notFoundTitle="Collection not found"
        notFoundMessage="This collection could not be found."
      >
        {() => null}
      </DetailQueryState>,
    );

    expect(screen.getByText('Collection not found')).toBeTruthy();
  });

  it('renders retry on network error', () => {
    const refetch = jest.fn();

    render(
      <DetailQueryState
        query={{
          data: undefined,
          error: new ApiError({ kind: 'network' }),
          isLoading: false,
          isError: true,
          refetch,
        }}
        notFoundTitle="Collection not found"
        notFoundMessage="This collection could not be found."
      >
        {() => null}
      </DetailQueryState>,
    );

    fireEvent.press(screen.getByText('Try Again'));
    expect(refetch).toHaveBeenCalled();
  });

  it('renders collection content on success', () => {
    render(
      <DetailQueryState
        query={{
          data: collection,
          error: null,
          isLoading: false,
          isError: false,
          refetch: jest.fn(),
        }}
        notFoundTitle="Collection not found"
        notFoundMessage="This collection could not be found."
      >
        {(data) => {
          const React = require('react');
          const { Text } = require('react-native');
          return React.createElement(Text, null, data.name);
        }}
      </DetailQueryState>,
    );

    expect(screen.getByText('The Dark Knight Collection')).toBeTruthy();
  });
});
