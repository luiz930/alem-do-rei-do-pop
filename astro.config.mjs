import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
  site: isGitHubPages
    ? 'https://luiz930.github.io'
    : process.env.DEPLOY_PRIME_URL ?? process.env.URL ?? 'http://localhost:4321',
  base: isGitHubPages ? '/alem-do-rei-do-pop/' : '/'
});
