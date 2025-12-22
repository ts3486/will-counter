import { apiService } from '../../src/services/api';

describe('apiService.getStatistics', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it('normalizes camelCase statistics responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        totalCount: 9,
        todayCount: 2,
        weeklyAverage: 1.5,
        dailyCounts: [{ date: '2025-12-21', count: 3, sessions: 2 }],
      }),
    });

    const result = await apiService.getStatistics(7);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/will-counts/statistics?days=7',
      expect.objectContaining({ headers: expect.any(Object) })
    );

    expect(result).toEqual({
      total_count: 9,
      today_count: 2,
      weekly_average: 1.5,
      daily_counts: [{ date: '2025-12-21', count: 3, sessions: 2 }],
    });
  });

  it('throws when the backend returns an error response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Server error',
    });

    await expect(apiService.getStatistics(14)).rejects.toThrow(
      'Failed to load history: 500 - Server error'
    );
  });
});
