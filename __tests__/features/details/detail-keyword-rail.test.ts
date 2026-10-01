import {

  DETAIL_KEYWORD_RAIL_MAX,

  layoutDetailKeywordRailRows,

  limitKeywordsForDetailRail,

  splitKeywordsIntoZigzagRows,

} from '@/features/details/shared/utils/detail-keyword-rail';

import { createKeywordDiscoverHref } from '@/features/discovery/utils/discover-params';

import { getDiscoverBrowseScreenTitle } from '@/features/discovery/types';



describe('detail keyword rail', () => {

  it('limits keywords to a compact rail cap', () => {

    const keywords = Array.from({ length: 30 }, (_, index) => ({

      id: `11111111-1111-4111-8111-${String(index).padStart(12, '0')}`,

      name: `Keyword ${index}`,

    }));



    expect(limitKeywordsForDetailRail(keywords)).toHaveLength(DETAIL_KEYWORD_RAIL_MAX);

  });



  it('keeps up to seven keywords on a single row', () => {

    const keywords = Array.from({ length: 7 }, (_, index) => ({

      id: `11111111-1111-4111-8111-${String(index).padStart(12, '0')}`,

      name: `K${index}`,

    }));



    const layout = layoutDetailKeywordRailRows(keywords);



    expect(layout.mode).toBe('single');

    expect(layout.rowOne).toHaveLength(7);

    expect(layout.rowTwo).toHaveLength(0);

  });



  it('uses zigzag rows from eight keywords upward', () => {

    const keywords = Array.from({ length: 15 }, (_, index) => ({

      id: `11111111-1111-4111-8111-${String(index).padStart(12, '0')}`,

      name: `K${index}`,

    }));



    const layout = layoutDetailKeywordRailRows(keywords);



    expect(layout.mode).toBe('double');

    const [expectedRowOne, expectedRowTwo] = splitKeywordsIntoZigzagRows(keywords);

    expect(layout.rowOne.map((item) => item.name)).toEqual(

      expectedRowOne.map((item) => item.name),

    );

    expect(layout.rowTwo.map((item) => item.name)).toEqual(

      expectedRowTwo.map((item) => item.name),

    );

    expect(layout.rowOne).toHaveLength(8);

    expect(layout.rowTwo).toHaveLength(7);

  });



  it('never lays out capped chips as a single row', () => {

    const twenty = Array.from({ length: 20 }, (_, index) => ({

      id: `11111111-1111-4111-8111-${String(index).padStart(12, '0')}`,

      name: `K${index}`,

    }));

    const capped = limitKeywordsForDetailRail(twenty);

    const layout = layoutDetailKeywordRailRows(capped);



    expect(capped).toHaveLength(16);

    expect(layout.mode).toBe('double');

    expect(layout.rowOne).toHaveLength(8);

    expect(layout.rowTwo).toHaveLength(8);

  });

});



describe('keyword discover navigation', () => {

  it('serializes keyword id and localized label for browse', () => {

    const keywordId = '11111111-1111-4111-8111-111111111111';

    const href = createKeywordDiscoverHref({

      id: keywordId,

      name: 'Time Travel',

    });



    expect(href).toContain(`keywords=${keywordId}`);

    const query = href.split('?')[1] ?? '';

    const params = new URLSearchParams(query);

    const labels = JSON.parse(params.get('keywordLabels') ?? '{}') as Record<string, string>;

    expect(labels[keywordId]).toBe('Time Travel');

  });



  it('uses keyword label as browse title when a single keyword is active', () => {

    const title = getDiscoverBrowseScreenTitle('trending', {

      genreIds: [],

      year: null,

      yearFrom: null,

      yearTo: null,

      minRating: null,

      minVoteCount: null,

      minRuntimeMinutes: null,

      maxRuntimeMinutes: null,

      language: null,

      originCountry: null,

      keywordIds: ['kw-guid'],

      keywordLabels: { 'kw-guid': 'Zeitreise' },

      tvStatuses: [],

      sort: 'popularity_desc',

    });



    expect(title).toBe('Zeitreise');

  });

});


