import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db';
import { requireUser } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
  const user = requireUser(event);
  const db = await getDB();
  
  const url = new URL(event.request.url);
  const alertDesignee = url.searchParams.get('alertDesignee');
  const includeEmails = url.searchParams.get('includeEmails');
  
  if (alertDesignee === 'true') {
    // Get all readers where alertDesignee is true
    const readers = await db.collection('readers').find({ alertDesignee: true }).toArray();
    
    if (includeEmails === 'true') {
      // Return full objects with emails
      const readersWithEmails = readers.map(reader => ({
        id: reader._id.toString(),
        email: reader.email 
      }));
      
      return new Response(JSON.stringify({ readers: readersWithEmails }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Keep existing behavior - return just IDs
      const readerIds = readers.map(reader => reader._id.toString());
      
      return new Response(JSON.stringify({ readers: readerIds }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  return new Response('Invalid query', { status: 400 });
};