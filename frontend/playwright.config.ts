import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.E2E_CHROMIUM_PATH ? { executablePath: process.env.E2E_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } } },
  ],
  webServer: [
    { command: "npx next start -p 3100", url: "http://127.0.0.1:3100", reuseExistingServer: false, timeout: 120000 },
    { command: `${process.env.E2E_PYTHON || "python"} -m uvicorn app.main:app --host 127.0.0.1 --port 8000`, cwd: "../backend", url: "http://127.0.0.1:8000/health", reuseExistingServer: false, timeout: 120000,
      env: { DATABASE_URL: "sqlite+aiosqlite:///:memory:", GROQ_API_KEY: "", OLLAMA_URL: "http://127.0.0.1:9", QDRANT_URL: "http://127.0.0.1:9", NEO4J_URI: "bolt://127.0.0.1:9" } },
  ],
});
