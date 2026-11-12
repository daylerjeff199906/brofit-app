import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 60000,
  workers: 1,
  retries: 0,
  outputDir: "artifacts/browser",
  use: {
    baseURL: "http://localhost:3001",
    browserName: "chromium",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: "off",
    screenshot: "only-on-failure",
  },
});
