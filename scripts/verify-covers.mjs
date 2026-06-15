import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });
const DATABASE_URL = process.env.DATABASE_URL;
const match = DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
const [, user, password, host, port, database] = match;
const conn = await createConnection({ host, port: parseInt(port), user, password, database, ssl: { rejectUnauthorized: false } });
const [rows] = await conn.execute("SELECT id, name, coverPhoto FROM businesses WHERE isClaimed = 1 ORDER BY name ASC");
for (const r of rows) {
  const hasCustom = r.coverPhoto && !r.coverPhoto.includes('SiestaKey_panorama');
  console.log(`${hasCustom ? '✅' : '❌'} [${r.id}] ${r.name}`);
}
await conn.end();
