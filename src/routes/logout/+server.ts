import { json, type RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { getDB } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
  const cookies = cookie.parse(request.headers.get('cookie') || '');
  const token = cookies.session;

  if (token) {
    const db = await getDB();
    await db.collection('sessions').deleteOne({ token });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Set-Cookie': cookie.serialize('session', '', {
        httpOnly: true,
        path: '/',
        expires: new Date(0)
      }),
      'Content-Type': 'application/json'
    }
  });
};