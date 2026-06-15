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

// First, get column names for businesses table
const [cols] = await conn.execute("DESCRIBE businesses");
console.log("=== BUSINESSES TABLE COLUMNS ===");
console.log(cols.map(c => c.Field).join(", "));

console.log("\n=== SIESTA 4 RENT DUPLICATES ===");
const [dupes] = await conn.execute("SELECT * FROM businesses WHERE id IN (270001, 150067)");
for (const r of dupes) {
  console.log(JSON.stringify(r, null, 2));
}

await conn.end();
