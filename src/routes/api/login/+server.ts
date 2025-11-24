import { json } from '@sveltejs/kit';
import { getDB } from '$lib/server/db';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';
import { randomBytes } from 'crypto';
import { type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return json({ error: 'Missing email or password' }, { status: 400 });
  }

  const db = await getDB();
  const user = await db.collection('readers').findOne({ email });

  if (!user) {
    return json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Check if user account is active
  if (!user.isActive) {
    return json({ error: 'Account is inactive. Please contact support.' }, { status: 403 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Create a random session token
  const sessionToken = randomBytes(32).toString('hex');

  // Save session to DB
  await db.collection('sessions').insertOne({
    token: sessionToken,
    userId: user._id,
    createdAt: new Date()
  });

  // Set cookie for session
  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        'Set-Cookie': cookie.serialize('session', sessionToken, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        }),
        'Content-Type': 'application/json'
      }
    }
  );
}