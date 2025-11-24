import type { PageServerLoad } from './$types';
import { getDB } from '$lib/server/db';

function getTimeRanges() {
  const now = new Date();
  return {
    lastWeek: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    lastMonth: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    last3Months: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    lastYear: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  };
}

export const load: PageServerLoad = async (event) => {
  const db = await getDB();
  const timeRanges = getTimeRanges();

  const STATS_START_DATE = new Date('2025-10-01'); // Only count submissions from this date forward

  // Get current user from parent layout
  const parentData = await event.parent();
  const currentUser = parentData.user;
  console.log('currentUser: ' + JSON.stringify(currentUser))

  // Get all readers
  const allReaders = await db.collection('readers').find({}).toArray();
  
  // Filter out hidden readers
  let readers = allReaders.filter(reader => !reader.hidden);

  // If current user is NOT a userDesignee, hide inactive readers
  if (!currentUser?.userDesignee) {
    readers = readers.filter(reader => reader.isActive !== false);
  }
  // Single aggregation query to get all submission stats
  const submissionStats = await db.collection('submissions').aggregate([
    {
      // Only get submissions that have readers assigned AND are after start date
      $match: { 
        reader: { $exists: true, $ne: [] },
        createdAt: { $gte: STATS_START_DATE }  // NEW: Filter by creation date
      }
    },
    {
      // Unwind the reader array so we can group by individual readers
      $unwind: "$reader"
    },
    {
      // Group by reader and calculate all stats
      $group: {
        _id: "$reader",
        totalSubmissions: { $sum: 1 },
        
        // Currently open (not in final status list)
        currentlyOpen: {
          $sum: {
            $cond: [
              {
                $not: {
                  $in: [
                    "$status", 
                    ["Rejected, First Round", "Rejected, Second Round", "Rejected, Third Round", "Rejected, Anonymously", "Recommended", "Withdrawn", "Accepted"]
                  ]
                }
              },
              1, 0
            ]
          }
        },
        
        // Status counts for totals
        recommendedTotal: {
          $sum: { 
            $cond: [
              { 
                $or: [
                  { $eq: ["$status", "Recommended"] },      // OLD format
                  { $eq: ["$status", "Recommended, High"] },    // NEW formats
                  { $eq: ["$status", "Recommended, Middle"] },  // NEW formats
                  { $eq: ["$status", "Recommended, Low"] }      // NEW formats
                ]
              }, 
              1, 0
            ] 
          }
        },
        rejectedFirstTotal: {
          $sum: { $cond: [{ $eq: ["$status", "Rejected, First Round"] }, 1, 0] }
        },
        rejectedSecondTotal: {
          $sum: { $cond: [{ $eq: ["$status", "Rejected, Second Round"] }, 1, 0] }
        },
        rejectedThirdTotal: {
          $sum: { $cond: [{ $eq: ["$status", "Rejected, Third Round"] }, 1, 0] }
        },
        rejectedAnonymousTotal: {
          $sum: { $cond: [{ $eq: ["$status", "Rejected, Anonymously"] }, 1, 0] }
        },
        
        // Recommendations by time period
        recommendationsLastWeek: {
          $sum: {
            $cond: [
              {
                $and: [
                  { 
                    $or: [
                      { $eq: ["$status", "Recommended"] },
                      { $eq: ["$status", "Recommended, High"] },
                      { $eq: ["$status", "Recommended, Middle"] },
                      { $eq: ["$status", "Recommended, Low"] }
                    ]
                  },
                  { $gte: ["$updatedAt", timeRanges.lastWeek] }
                ]
              },
              1, 0
            ]
          }
        },
        recommendationsLastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "Recommended"] },
                  { $gte: ["$updatedAt", timeRanges.lastMonth] }
                ]
              },
              1, 0
            ]
          }
        },
        recorecommendationsLast3Months: {
          $sum: {
            $cond: [
              {
                $and: [
                  { 
                    $or: [
                      { $eq: ["$status", "Recommended"] },
                      { $eq: ["$status", "Recommended, High"] },
                      { $eq: ["$status", "Recommended, Middle"] },
                      { $eq: ["$status", "Recommended, Low"] }
                    ]
                  },
                  { $gte: ["$updatedAt", timeRanges.last3Months] }
                ]
              },
              1, 0
            ]
          }
        },
        rejectionsLastWeek: {
          $sum: {
            $cond: [
              {
                $and: [
                  { 
                    $in: [
                      "$status", 
                      ["Rejected, First Round", "Rejected, Second Round", "Rejected, Third Round", "Rejected, Anonymously"]
                    ] 
                  },
                  { $gte: ["$updatedAt", timeRanges.lastWeek] }
                ]
              },
              1, 0
            ]
          }
        },
        rejectionsLastMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { 
                    $in: [
                      "$status", 
                      ["Rejected, First Round", "Rejected, Second Round", "Rejected, Third Round", "Rejected, Anonymously"]
                    ] 
                  },
                  { $gte: ["$updatedAt", timeRanges.lastMonth] }
                ]
              },
              1, 0
            ]
          }
        },
        rejectionsLast3Months: {
          $sum: {
            $cond: [
              {
                $and: [
                  { 
                    $in: [
                      "$status", 
                      ["Rejected, First Round", "Rejected, Second Round", "Rejected, Third Round", "Rejected, Anonymously"]
                    ] 
                  },
                  { $gte: ["$updatedAt", timeRanges.last3Months] }
                ]
              },
              1, 0
            ]
          }
        }
      }
    }
  ]).toArray();

  // Convert to lookup map for easier access
  const statsMap = new Map();
  submissionStats.forEach(stat => {
    statsMap.set(stat._id, stat);
  });

  // Combine reader data with stats
  const userStats = readers.map(reader => {
    const readerId = reader._id.toString();
    const stats = statsMap.get(readerId) || {
      totalSubmissions: 0,
      currentlyOpen: 0,
      recommendedTotal: 0,
      rejectedFirstTotal: 0,
      rejectedSecondTotal: 0,
      rejectedThirdTotal: 0,
      rejectedAnonymousTotal: 0,
      recommendationsLastWeek: 0,
      recommendationsLastMonth: 0,
      recommendationsLast3Months: 0,
      rejectionsLastWeek: 0,
      rejectionsLastMonth: 0,
      rejectionsLast3Months: 0
    };

    return {
      _id: readerId,
      name: reader.name,
      email: reader.email,
      role: reader.role,
      subRole: reader.subRole,
      active: reader.isActive !== false,
      formDesignee: reader.formDesignee || false,
      userDesignee: reader.userDesignee || false,
      totalSubmissions: stats.totalSubmissions,
      currentlyOpen: stats.currentlyOpen,
      
      // Legacy statusCounts format for compatibility
      statusCounts: {
        'Recommended': stats.recommendedTotal,
        'Rejected, First Round': stats.rejectedFirstTotal,
        'Rejected, Second Round': stats.rejectedSecondTotal,
        'Rejected, Third Round': stats.rejectedThirdTotal,
        'Rejected, Anonymously': stats.rejectedAnonymousTotal
      },
      
      // Time-based stats
      recommendations: {
        lastWeek: stats.recommendationsLastWeek,
        lastMonth: stats.recommendationsLastMonth,
        last3Months: stats.recommendationsLast3Months,
        lastYear: stats.recommendedTotal // For now, use total as year fallback
      },
      rejections: {
        lastWeek: stats.rejectionsLastWeek,
        lastMonth: stats.rejectionsLastMonth,
        last3Months: stats.rejectionsLast3Months,
        lastYear: stats.rejectedFirstTotal + stats.rejectedSecondTotal + stats.rejectedThirdTotal + stats.rejectedAnonymousTotal
      }
    };
  });

  // Calculate totals across all users
  const totals = userStats.reduce((acc, user) => ({
    _id: 'TOTALS',
    name: 'TOTALS',
    email: '',
    role: '',
    subRole: '',
    active: true,
    formDesignee: false,
    userDesignee: false,
    totalSubmissions: acc.totalSubmissions + user.totalSubmissions,
    currentlyOpen: acc.currentlyOpen + user.currentlyOpen,
    statusCounts: {
      'Recommended': acc.statusCounts['Recommended'] + user.statusCounts['Recommended'],
      'Rejected, First Round': acc.statusCounts['Rejected, First Round'] + user.statusCounts['Rejected, First Round'],
      'Rejected, Second Round': acc.statusCounts['Rejected, Second Round'] + user.statusCounts['Rejected, Second Round'],
      'Rejected, Third Round': acc.statusCounts['Rejected, Third Round'] + user.statusCounts['Rejected, Third Round'],
      'Rejected, Anonymously': acc.statusCounts['Rejected, Anonymously'] + user.statusCounts['Rejected, Anonymously']
    },
    recommendations: {
      lastWeek: acc.recommendations.lastWeek + user.recommendations.lastWeek,
      lastMonth: acc.recommendations.lastMonth + user.recommendations.lastMonth,
      last3Months: acc.recommendations.last3Months + user.recommendations.last3Months,
      lastYear: acc.recommendations.lastYear + user.recommendations.lastYear
    },
    rejections: {
      lastWeek: acc.rejections.lastWeek + user.rejections.lastWeek,
      lastMonth: acc.rejections.lastMonth + user.rejections.lastMonth,
      last3Months: acc.rejections.last3Months + user.rejections.last3Months,
      lastYear: acc.rejections.lastYear + user.rejections.lastYear
    }
  }), {
    totalSubmissions: 0,
    currentlyOpen: 0,
    statusCounts: {
      'Recommended': 0,
      'Rejected, First Round': 0,
      'Rejected, Second Round': 0,
      'Rejected, Third Round': 0,
      'Rejected, Anonymously': 0
    },
    recommendations: { lastWeek: 0, lastMonth: 0, last3Months: 0, lastYear: 0 },
    rejections: { lastWeek: 0, lastMonth: 0, last3Months: 0, lastYear: 0 }
  });

  return {
    users: [...userStats, totals]
  };
};