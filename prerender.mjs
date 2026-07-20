import { build } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Pre-rendering static pages...');

await build({
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: 'dist-ssr',
  },
  logLevel: 'warn',
});

const { render } = await import(resolve(__dirname, 'dist-ssr/entry-server.js'));

const template = readFileSync(resolve(__dirname, 'dist/index.html'), 'utf-8');

for (const route of ['/about']) {
  const appHtml = render(route);
  const html = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`
  );
  const dir = resolve(__dirname, `dist${route}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, html);
  console.log(`  ✓ ${route}`);
}

rmSync(resolve(__dirname, 'dist-ssr'), { recursive: true, force: true });
console.log('Done.');
