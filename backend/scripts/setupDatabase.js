const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

const runSqlFile = async (connection, fileName) => {
  const filePath = path.join(__dirname, "..", "database", fileName);
  const sql = fs.readFileSync(filePath, "utf8");
  // Split by semicolon and execute each statement separately to avoid "multiple statements" issues
  const statements = sql.split(";").filter(s => s.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      await connection.query(statement);
    }
  }
};

const setupDatabase = async () => {
  try {
    console.log("🔄 Setting up CleanTrack Uganda database...\n");

    // First, connect without specifying a database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true
    });

    console.log("✓ Connected to MySQL server");

    // Run schema.sql to create database and tables
    console.log("✓ Creating database and tables...");
    await runSqlFile(connection, "schema.sql");

    // Run seed.sql to add test data
    console.log("✓ Seeding database with test data...");
    await runSqlFile(connection, "seed.sql");

    await connection.end();

    console.log("\n✅ Database setup completed successfully!");
    console.log(`   Database: ${process.env.DB_NAME || "klincity_uganda"}`);
    console.log("   You can now start the application with: npm start\n");
  } catch (error) {
    console.error("❌ Database setup failed!");
    console.error(`   Error: ${error.message}`);
    
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("\n💡 Possible issues:");
      console.error("   - Username or password is incorrect");
      console.error("   - Check your .env file for DB_USER and DB_PASSWORD");
    } else if (error.code === "ECONNREFUSED") {
      console.error("\n💡 Possible issues:");
      console.error("   - MySQL server is not running");
      console.error("   - Wrong host or port");
    }
    
    process.exit(1);
  }
};

setupDatabase().catch((error) => {
  console.error("Database setup failed:", error.message);
  process.exit(1);
});
