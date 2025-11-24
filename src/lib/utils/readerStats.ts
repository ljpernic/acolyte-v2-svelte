export interface ReaderStats {
  totalClaimed: number;
  currentlyOpen: number;
  recommendations: {
    lastWeek: number;
    lastMonth: number;
    last3Months: number;
    lastYear: number;
  };
  rejections: {
    lastWeek: number;
    lastMonth: number;
    last3Months: number;
    lastYear: number;
  };
}

function getTimeRanges() {
  const now = new Date();
  return {
    lastWeek: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    lastMonth: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    last3Months: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    lastYear: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  };
}

export async function getReaderStats(readerId: string): Promise<ReaderStats> {
  try {
    const response = await fetch(`/stats/api/reader-stats?readerId=${readerId}`);
    if (!response.ok) throw new Error('Failed to fetch reader stats');
    
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching reader stats:', error);
    // Return empty stats as fallback
    return {
      totalClaimed: 0,
      currentlyOpen: 0,
      recommendations: { lastWeek: 0, lastMonth: 0, last3Months: 0, lastYear: 0 },
      rejections: { lastWeek: 0, lastMonth: 0, last3Months: 0, lastYear: 0 }
    };
  }
}

export async function getAllReaderStats(): Promise<Record<string, ReaderStats>> {
  try {
    const response = await fetch('/stats/api/all-reader-stats');
    if (!response.ok) throw new Error('Failed to fetch all reader stats');
    
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching all reader stats:', error);
    return {};
  }
}