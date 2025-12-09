import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const headers = req.headers;
    const session = await auth.api.getSession({ headers });
    return new Response(JSON.stringify({ session }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[DEBUG] /api/debug/session error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
