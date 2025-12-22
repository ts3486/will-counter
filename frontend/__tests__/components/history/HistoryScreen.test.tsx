import React from 'react';
import renderer, { act } from 'react-test-renderer';

type TestTree = ReturnType<typeof renderer.create>;

const mockGetStatistics = jest.fn();

jest.mock('../../../src/services/api', () => ({
  apiService: {
    getStatistics: (...args: any[]) => mockGetStatistics(...args),
  },
}));

jest.mock('../../../src/components/shared/GradientBackground', () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>;
});

jest.mock('../../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#2E7D32',
        surface: {
          primary: '#FFFFFF',
          elevated: '#FFFFFF',
        },
        border: {
          light: '#E5E7EB',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          light: '#94A3B8',
        },
        background: {
          mid: '#DAF2C4',
        },
        status: {
          error: '#EF4444',
        },
      },
    },
  }),
}));

jest.mock('../../../src/hooks/useResponsiveDimensions', () => ({
  useResponsiveDimensions: () => ({
    width: 375,
    height: 812,
    isTablet: false,
    isLandscape: false,
    deviceType: 'phone',
    orientationType: 'portrait',
  }),
}));

describe('HistoryScreen', () => {
  beforeEach(() => {
    mockGetStatistics.mockReset();
  });

  const loadHistoryScreen = async () => {
    const HistoryScreen = require('../../../src/components/history/HistoryScreen').default;
    let tree: ReturnType<typeof renderer.create> | undefined;
    await act(async () => {
      tree = renderer.create(<HistoryScreen />);
      await Promise.resolve();
    });
    return tree!;
  };

  const flattenText = (tree: TestTree) => {
    return tree.root
      .findAll((node) => typeof node.type === 'string')
      .map((node) => node.props.children)
      .flat()
      .filter(Boolean)
      .map((child) => (Array.isArray(child) ? child.join('') : String(child)));
  };

  it('renders history from the statistics API', async () => {
    mockGetStatistics.mockResolvedValue({
      total_count: 6,
      today_count: 2,
      weekly_average: 2,
      daily_counts: [
        { date: '2025-12-21', count: 2, sessions: 1 },
        { date: '2025-12-22', count: 4, sessions: 2 },
      ],
    });

    const tree = await loadHistoryScreen();
    const texts = flattenText(tree);

    expect(mockGetStatistics).toHaveBeenCalledWith(14);
    expect(texts).toContain('History');
    expect(texts).toContain('Last 14 days');
    expect(texts).toContain('Recent log');
    expect(texts.join('')).toContain('Avg 2.0 / day');
    const joined = texts.join(' ');
    expect(joined.includes('2 sessions') || joined.includes('2  session')).toBe(true);
    expect(joined).toContain('4');
  });

  it('shows error state when the statistics API fails', async () => {
    mockGetStatistics.mockRejectedValue(new Error('Network down'));

    const tree = await loadHistoryScreen();
    const texts = flattenText(tree);

    expect(texts).toContain('Network down');
    expect(texts).toContain('No history yet. Come back after a few taps.');
  });
});
