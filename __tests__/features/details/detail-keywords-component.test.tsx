import { fireEvent, render } from '@testing-library/react-native';

import { ScrollView } from 'react-native';

import { DetailKeywords } from '@/features/details/shared/components/DetailKeywordRail';

import { DETAIL_KEYWORD_RAIL_MAX } from '@/features/details/shared/utils/detail-keyword-rail';



const mockPush = jest.fn();



jest.mock('expo-router', () => ({

  useRouter: () => ({ push: mockPush }),

}));



const GUID_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const GUID_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const GUID_C = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';



describe('DetailKeywords', () => {

  beforeEach(() => {

    mockPush.mockClear();

  });



  it('hides the section when keywords are empty', () => {

    const { queryByTestId } = render(<DetailKeywords keywords={[]} />);

    expect(queryByTestId('detail-keywords-section')).toBeNull();

  });



  it('renders legacy string[] with labels and without navigation', () => {

    const { getByText, queryByRole } = render(

      <DetailKeywords keywords={['Time Travel', 'Space']} />,

    );



    expect(getByText('Time Travel')).toBeTruthy();

    expect(getByText('Space')).toBeTruthy();

    expect(queryByRole('button', { name: 'Time Travel' })).toBeNull();

    expect(mockPush).not.toHaveBeenCalled();

  });



  it('uses one horizontal scroll and a single row for a small keyword set', () => {

    const keywords = [

      { id: GUID_A, name: 'Alpha' },

      { id: GUID_B, name: 'Beta' },

      { id: GUID_C, name: 'Gamma' },

    ];



    const { getByTestId, UNSAFE_getAllByType } = render(

      <DetailKeywords keywords={keywords} />,

    );



    expect(getByTestId('detail-keywords-scroll')).toBeTruthy();

    expect(getByTestId('detail-keywords-row')).toBeTruthy();



    const scrollViews = UNSAFE_getAllByType(ScrollView);

    expect(scrollViews).toHaveLength(1);

  });



  it('uses two balanced rows inside one horizontal scroll for larger sets', () => {

    const keywords = Array.from({ length: 10 }, (_, index) => ({

      id: `11111111-1111-4111-8111-${String(index).padStart(12, '0')}`,

      name: `Keyword ${index}`,

    }));



    const { getByTestId, UNSAFE_getAllByType } = render(

      <DetailKeywords keywords={keywords} />,

    );



    expect(getByTestId('detail-keywords-rows')).toBeTruthy();

    expect(getByTestId('detail-keywords-row-1')).toBeTruthy();

    expect(getByTestId('detail-keywords-row-2')).toBeTruthy();

    expect(UNSAFE_getAllByType(ScrollView)).toHaveLength(1);

  });



  it('navigates with keyword Guid on press', () => {

    const keywords = [

      { id: GUID_A, name: 'Alpha' },

      { id: GUID_B, name: 'Beta' },

      { id: GUID_C, name: 'Gamma' },

    ];



    const { getByLabelText } = render(<DetailKeywords keywords={keywords} />);



    fireEvent.press(getByLabelText('Beta'));



    expect(mockPush).toHaveBeenCalledTimes(1);

    const href = String(mockPush.mock.calls[0][0]);

    expect(href).toContain(`keywords=${GUID_B}`);

    const params = new URLSearchParams(href.split('?')[1] ?? '');

    const labels = JSON.parse(params.get('keywordLabels') ?? '{}') as Record<string, string>;

    expect(labels[GUID_B]).toBe('Beta');

  });



  it('renders at most sixteen keywords in the rail', () => {

    const keywords = Array.from({ length: 30 }, (_, index) => ({

      id: `11111111-1111-4111-8111-${String(index).padStart(12, '0')}`,

      name: `Keyword ${index}`,

    }));



    const { getAllByRole } = render(<DetailKeywords keywords={keywords} />);



    expect(getAllByRole('button')).toHaveLength(DETAIL_KEYWORD_RAIL_MAX);

  });

});


