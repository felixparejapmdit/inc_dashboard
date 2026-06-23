const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

const rootDir = path.resolve(__dirname, "..", "..");
const rootEnvPath = path.join(rootDir, ".env");
const directusEnvPath = path.join(rootDir, "directus", ".env");
const schemaDir = path.join(rootDir, "directus", "schema");

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

if (fs.existsSync(directusEnvPath)) {
  dotenv.config({ path: directusEnvPath, override: false });
}

const getEnv = (...keys) => {
  for (const key of keys) {
    if (process.env[key]) return process.env[key];
  }
  return undefined;
};

const config = {
  host: getEnv("DIRECTUS_DB_HOST", "MYSQL_HOST", "DB_HOST") || "127.0.0.1",
  port: Number(getEnv("DIRECTUS_DB_PORT", "MYSQL_PORT", "DB_PORT") || 3306),
  database: getEnv("DIRECTUS_DB_DATABASE", "MYSQL_DATABASE", "DB_DATABASE") || "ppi",
  user: getEnv("DIRECTUS_DB_USER", "MYSQL_USER", "DB_USER") || "root",
  password: getEnv("DIRECTUS_DB_PASSWORD", "MYSQL_PASSWORD", "DB_PASSWORD") || "",
  multipleStatements: true,
};

const run = async () => {
  if (!fs.existsSync(schemaDir)) {
    throw new Error(`Schema folder not found: ${schemaDir}`);
  }

  const schemaFiles = fs
    .readdirSync(schemaDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (schemaFiles.length === 0) {
    throw new Error(`No SQL schema files found in: ${schemaDir}`);
  }

  const connection = await mysql.createConnection(config);

  try {
    console.log(
      `Applying File Organizer schema to ${config.database} at ${config.host}:${config.port}...`
    );
    for (const file of schemaFiles) {
      const filePath = path.join(schemaDir, file);
      console.log(`- ${file}`);
      await connection.query(fs.readFileSync(filePath, "utf8"));
    }
    console.log("File Organizer collections are ready.");
  } finally {
    await connection.end();
  }
};

run().catch((error) => {
  console.error("Could not apply File Organizer schema.");
  console.error(error.message);
  process.exit(1);
});
