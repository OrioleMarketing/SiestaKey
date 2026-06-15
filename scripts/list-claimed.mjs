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
const [rows] = await conn.execute(
  "SELECT id, name, description, coverPhoto FROM businesses WHERE isClaimed = 1 ORDER BY name ASC"
);
console.log(JSON.stringify(rows, null, 2));
await conn.end();
