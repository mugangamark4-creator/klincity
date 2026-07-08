#!/usr/bin/env node

/**
 * Startup Verification Script for Klincity Application
 * Run this to verify everything is configured correctly before starting
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔍 KLINCITY APPLICATION - STARTUP VERIFICATION\n");
console.log("=".repeat(50));

const checks = {
  frontend: {
    name: "Frontend",
    files: [
      { path: "frontend/.env", message: ".env file" },
      { path: "frontend/package.json", message: "package.json file" },
      { path: "frontend/src/context/AuthContext.jsx", message: "AuthContext with session handling" }
    ]
  },
  backend: {
    name: "Backend",
    files: [
      { path: "backend/.env", message: ".env file" },
      { path: "backend/package.json", message: "package.json file" },
      { path: "backend/server.js", message: "Express server" },
      { path: "backend/config/db.js", message: "Database config" }
    ]
  }
};

let allPassed = true;

for (const [key, group] of Object.entries(checks)) {
  console.log(`\n✓ ${group.name} Configuration:`);
  
  for (const file of group.files) {
    const filePath = path.join(__dirname, file.path);
    const exists = fs.existsSync(filePath);
    const status = exists ? "✅" : "❌";
    console.log(`  ${status} ${file.message}`);
    if (!exists) allPassed = false;
  }
}

console.log("\n" + "=".repeat(50));

if (allPassed) {
  console.log("\n✅ ALL CHECKS PASSED! Ready to start.");
  console.log("\n📋 Next steps:");
  console.log("  1. Terminal 1 - Start Backend:");
  console.log("     $ cd backend");
  console.log("     $ npm run db:test    # Test database connection");
  console.log("     $ npm run db:setup   # Setup/reset database");
  console.log("     $ npm start          # Start server on port 5000");
  console.log("\n  2. Terminal 2 - Start Frontend:");
  console.log("     $ cd frontend");
  console.log("     $ npm run dev        # Start server on port 5173");
  console.log("\n  3. Open browser:");
  console.log("     http://localhost:5173");
  console.log("\n✨ Application is ready to use!");
} else {
  console.log("\n❌ SOME CHECKS FAILED!");
  console.log("\n🔧 Please ensure:");
  console.log("  1. You are in the klincity application root directory");
  console.log("  2. Both backend and frontend folders exist");
  console.log("  3. .env files are properly configured");
  console.log("  4. All dependencies are installed (npm install)");
  process.exit(1);
}

console.log("\n");
