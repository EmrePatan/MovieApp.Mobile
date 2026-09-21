import { isValidSearchQuery, normalizeSearchQuery } from './search-query';

export type SearchDisplayMode = 'explore' | 'autocomplete' | 'results';

export function resolveSearchDisplayMode({
  inputText,
  submittedQuery,
  debouncedInput,
}: {
  inputText: string;
  submittedQuery: string;
  debouncedInput: string;
}): SearchDisplayMode {
  const normalizedInput = normalizeSearchQuery(inputText);
  const normalizedSubmittedQuery = normalizeSearchQuery(submittedQuery);

  if (
    isValidSearchQuery(normalizedSubmittedQuery) &&
    normalizedInput === normalizedSubmittedQuery
  ) {
    return 'results';
  }

  if (isValidSearchQuery(normalizeSearchQuery(debouncedInput))) {
    return 'autocomplete';
  }

  return 'explore';
}
