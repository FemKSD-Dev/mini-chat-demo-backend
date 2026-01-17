import { beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";

beforeAll(async () => {
  console.log("🧪 Setting up test environment...");
  
  // Ensure test database exists and is migrated
  try {
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: { ...process.env }
    });
    console.log("✅ Database migrations applied");
  } catch (error) {
    console.error("❌ Failed to apply migrations:", error);
    throw error;
  }
});

afterAll(async () => {
  console.log("🧹 Cleaning up test environment...");
});
