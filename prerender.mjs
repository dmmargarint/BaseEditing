import { build } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const routes = [
  {
    path: '/about',
    title: 'About — basediting.org',
    description: 'Learn how basediting.org works: DNA input types, supported base editors (ABE8e, BE4max), bystander edit detection, and off-target risk scoring.',
    canonical: 'https://basediting.org/about',
  },
];

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

for (const route of routes) {
  const appHtml = render(route.path);

  const html = template
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/,  `$1${route.description}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/,        `$1${route.canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/,       `$1${route.title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/,  `$1${route.description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/,          `$1${route.canonical}$2`);

  const dir = resolve(__dirname, `dist${route.path}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, html);
  console.log(`  ✓ ${route.path}`);
}

rmSync(resolve(__dirname, 'dist-ssr'), { recursive: true, force: true });
console.log('Done.');
