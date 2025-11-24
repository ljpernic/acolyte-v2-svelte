import type { PageServerLoad } from './$types';
import { getDB } from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
  const db = await getDB();
  
  // Get filter parameters
  const search = url.searchParams.get('search') || '';
  const statusFilter = url.searchParams.get('status') || '';
  const typeFilter = url.searchParams.get('type') || '';
  const sortBy = url.searchParams.get('sort') || 'createdAt';
  const sortOrder = url.searchParams.get('order') || 'desc';
  
  // Build query
  const query: any = {};
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (statusFilter) {
    query.status = statusFilter;
  }
  
  if (typeFilter) {
    query.callType = typeFilter;
  }
  
  // Build sort
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  
  // Get calls and types
  const calls = await db.collection('calls')
    .find(query)
    .sort(sort)
    .toArray();
  
  const allCalls = await db.collection('calls').find({}).toArray();
  const callTypes = [...new Set(allCalls.map(call => call.callType).filter(Boolean))];
  
  return {
    calls: calls.map(call => ({
      id: call._id.toString(),
      title: call.title,
      description: call.description,
      callType: call.callType,
      status: call.status,
      deadline: call.deadline?.toISOString(),
      formFields: call.formFields,
      anonymousSubmissions: call.anonymousSubmissions || false,
      createdAt: call.createdAt.toISOString(),
      updatedAt: call.updatedAt?.toISOString(),
      submissionCount: call.submissionCount || 0
    })),
    callTypes,
    filters: {
      search,
      statusFilter,
      typeFilter,
      sortBy,
      sortOrder
    }
  };
};