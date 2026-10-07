import { defineConfig, devices } from '@playwright/test';

const BASE_URL =
  process.env.BASE_URL ?? 'https://verzel-store.qa-test-verzel-store.workers.dev';

export default defineConfig({
  testDir: './tests',
  // Ambiente compartilhado com outros candidatos: poucos workers e sem carga.
  workers: 2,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'api', testMatch: /tests\/api\/.*\.spec\.ts/ },
    {
      name: 'ui',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
