import { env } from '$env/dynamic/private';
import { MongoClient, Db } from 'mongodb';

const uri = env.MONGODB_URI;
const client = new MongoClient(uri);
let db: Db | null = null; // explicitly type it

export async function getDB(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db('CurtsySubmissionDB'); // matches your connection string
  }
  return db;
}
