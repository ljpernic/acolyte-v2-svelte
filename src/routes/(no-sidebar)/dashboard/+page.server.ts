import type { PageServerLoad } from './$types';
import { getDB } from '$lib/server/db';
import { requireUser } from '$lib/server/auth';
import { ObjectId } from 'mongodb';

export const load: PageServerLoad = async (event) => {
  const user = requireUser(event);
  const userId = user.id;

  const db = await getDB();

  const filter = event.url.searchParams.get('filter') || 'assigned';
  const searchTerm = event.url.searchParams.get('q') || '';
  const typeFilter = event.url.searchParams.get('type') || 'all';
  const page = parseInt(event.url.searchParams.get('page') || '1', 10);
  const pageSize = 10;

  let query: Record<string, any> = {};

  switch (filter) {
    case 'assigned':
      query = { 
        $or: [
          { reader: { $in: [userId] } }, // Array case
          { reader: userId }             // String case
        ],
        status: "Open", 
        active: true 
      };
      break;
      
    case 'processed':
      query = {
        $or: [
          { reader: { $in: [userId] } }, // Array case
          { reader: userId }             // String case
        ],
        status: { $in: ["Rejected, First Round","Rejected, Second Round","Rejected, Third Round","Rejected, Anonymously","Recommended", "Withdrawn", "Accepted"] },
        active: false
      };
      break;
      
    case 'unclaimed':
      query = { 
        $or: [
          { reader: "unclaimed" },       // String case
          { reader: ["unclaimed"] },     // Array case
          { reader: { $size: 0 } },      // Empty array
          { reader: { $exists: false } } // Doesn't exist
        ],
        status: "Open", 
        active: true 
      };
      break;
      
    case 'recommendedForEIC':
      if (user.role === "EIC") {
        query = {
          $and: [
            { active: true },
            {
              $or: [
                { status: "Recommended" },
                { wasRecommended: true },
              ]
            }
          ]
        };
      } else {
        query = {
          $or: [
            { reader: { $in: [user.id] } }, // Array case
            { reader: user.id }             // String case
          ],
          wasRecommended: true
        };
      }
      break;
      
    case 'all':
      if (user.role !== 'EIC') {
        throw new Error('Unauthorized access to all submissions');
      }
      query = { 
        active: { $in: [true, false] },
        $nor: [
          { reader: "unclaimed" },
          { reader: ["unclaimed"] }
        ]
      };
      break;
  }

  if (typeFilter && typeFilter !== 'all') {
    query.type = typeFilter;
  }

if (searchTerm) {
  const regex = new RegExp(searchTerm, "i");
  const searchConditions = [
    { name: regex },
    { email: regex },
    { title: regex },
    { type: regex },
    { readerNote: regex }
  ];
  
  // Combine existing query with search conditions
  query = {
    $and: [
      query, // Original query with tab filtering
      { $or: searchConditions } // Search conditions
    ]
  };
}

  const totalSubmissions = await db.collection('submissions').countDocuments(query);

  const submissions = await db.collection('submissions')
    .find(query)
    .sort({ createdAt: 1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

// console.log('Query being used:', query);
// console.log('Total submissions found:', totalSubmissions);
// console.log('Submissions array length:', submissions.length);

const safeSubmissions = JSON.parse(JSON.stringify(submissions));

//console.log('Safe submissions:', safeSubmissions);

  return {
    user,
    submissions: safeSubmissions,
    page,
    totalPages: Math.ceil(totalSubmissions / pageSize),
    filter,
    searchTerm,
    typeFilter 
  };
};
