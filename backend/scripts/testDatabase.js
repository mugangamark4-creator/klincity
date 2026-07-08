const mysql = require("mysql2/promise");
require("dotenv").config();

const testDatabaseConnection = async () => {
  console.log("🔍 Testing Database Connection...\n");
  console.log("Configuration:");
  console.log(`  Host: ${process.env.DB_HOST || "localhost"}`);
  console.log(`  User: ${process.env.DB_USER || "root"}`);
  console.log(`  Database: ${process.env.DB_NAME || "klincity_uganda"}`);
  console.log(`  Password: ${process.env.DB_PASSWORD ? "***set***" : "***not set***"}\n`);

  // Test 1: Connect without database to check credentials
  try {
    console.log("✓ Test 1: Connecting to MySQL server...");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });
    console.log("✅ Connected to MySQL server successfully!\n");
    await connection.end();
  } catch (error) {
    console.error("❌ Failed to connect to MySQL server!");
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}\n`);
    
    if (error.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("💡 Suggestion: MySQL server is not running. Start MySQL service.");
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("💡 Suggestion: Username or password is incorrect.");
    } else if (error.code === "ECONNREFUSED") {
      console.log("💡 Suggestion: Cannot connect to localhost:3306. Check if MySQL is running.");
    }
    return;
  }

  // Test 2: Check if database exists
  try {
    console.log("✓ Test 2: Checking if database exists...");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || ""
    });

    const [databases] = await connection.query(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
      [process.env.DB_NAME || "klincity_uganda"]
    );

    if (databases.length > 0) {
      console.log(`✅ Database '${process.env.DB_NAME || "klincity_uganda"}' exists!\n`);
    } else {
      console.log(`⚠️  Database '${process.env.DB_NAME || "klincity_uganda"}' does NOT exist!\n`);
      console.log("💡 Suggestion: Run 'npm run setup-db' to create the database.\n");
    }

    await connection.end();
  } catch (error) {
    console.error("❌ Failed to check database!");
    console.error(`   Error: ${error.message}\n`);
  }

  // Test 3: Connect with database
  try {
    console.log("✓ Test 3: Connecting to database...");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "klincity_uganda"
    });
    console.log("✅ Connected to database successfully!\n");

    // Test 4: Check users table
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'",
      [process.env.DB_NAME || "klincity_uganda"]
    );

    if (tables.length > 0) {
      console.log("✓ Test 4: Checking 'users' table...");
      const [users] = await connection.query("SELECT COUNT(*) as count FROM users");
      console.log(`✅ 'users' table exists with ${users[0].count} users!\n`);
    } else {
      console.log("⚠️  'users' table does NOT exist!\n");
      console.log("💡 Suggestion: Run 'npm run setup-db' to create tables.\n");
    }

    await connection.end();
  } catch (error) {
    console.error("❌ Failed to connect to database!");
    console.error(`   Error: ${error.message}\n`);
  }

  console.log("✅ Database diagnostics complete!");
};

testDatabaseConnection().catch(console.error);
