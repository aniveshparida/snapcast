import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MIGRATION_FILE = path.resolve(process.cwd(), 'drizzle', 'migrations', '0000_neat_rick_jones.sql');

if (!process.env.DATABASE_URL_POSTGRES) {
  console.error('DATABASE_URL_POSTGRES is not set in your .env file. Aborting.');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL_POSTGRES, { ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    const raw = fs.readFileSync(MIGRATION_FILE, 'utf-8');
    const parts = raw.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);
    console.log(`Found ${parts.length} statements in migration file.`);
    for (let i = 0; i < parts.length; i++) {
      const stmt = parts[i];
      console.log(`Executing statement ${i + 1}/${parts.length}...`);
      try {
        await sql.begin(async (tx) => {
          await tx.unsafe(stmt);
        });
        console.log('OK');
      } catch (err) {
        // Ignore duplicate-object / relation already exists / duplicate-constraint errors so migrations are idempotent
        const code = err && err.code ? String(err.code) : null;
        const ignorable = ['42P07', '42710']; // 42P07: duplicate_table, 42710: duplicate_object/constraint
        if (code && ignorable.includes(code)) {
          console.warn(`Statement ${i + 1} skipped: Postgres error code ${code} (already exists).`);
          continue;
        }
        throw err;
      }
    }
    console.log('Migrations applied successfully.');
    await sql.end({ timeout: 0 });
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    try { await sql.end({ timeout: 0 }); } catch {}
    process.exit(1);
  }
})();
