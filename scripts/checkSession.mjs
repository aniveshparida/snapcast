import dotenv from 'dotenv';
import postgres from 'postgres';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const conn = process.env.DATABASE_URL_POSTGRES;
if (!conn) {
  console.error('DATABASE_URL_POSTGRES not set');
  process.exit(1);
}

const sql = postgres(conn, { ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    const token = process.argv[2] || 'KSsN3U4Ggn2bmwK5UNQr1uiprwImlVXuA';
    console.log('Checking session for token:', token);
    const row = await sql`SELECT id, expires_at, token, created_at, updated_at, ip_address, user_agent, user_id FROM "session" WHERE token = ${token}`;
    console.log('Result:', row);
    const count = await sql`SELECT count(*)::int as cnt FROM "session"`;
    console.log('Session count:', count[0]?.cnt);
  } catch (err) {
    console.error('DB check failed:', err);
  } finally {
    await sql.end({ timeout: 0 });
  }
})();
