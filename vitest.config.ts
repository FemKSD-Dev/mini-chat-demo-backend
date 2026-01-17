import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    testTimeout: 30000,
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
