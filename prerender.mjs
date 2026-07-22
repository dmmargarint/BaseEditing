import { build } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const routes = [
  {
    path: '/',
    title: 'Base Editing Guide RNA Design Tool',
    description: 'Design guide RNAs for CRISPR base editing applications. Supports ABE8e and BE4max with SpCas9 and SaCas9, with bystander edit detection and off-target risk scoring.',
    canonical: 'https://basediting.org/',
  },
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

  let outputPath;
  if (route.path === '/') {
    outputPath = resolve(__dirname, 'dist/index.html');
  } else {
    const dir = resolve(__dirname, `dist${route.path}`);
    mkdirSync(dir, { recursive: true });
    outputPath = resolve(__dirname, `dist${route.path}.html`);
  }
  writeFileSync(outputPath, html);
  console.log(`  ✓ ${route.path}`);
}

rmSync(resolve(__dirname, 'dist-ssr'), { recursive: true, force: true });
console.log('Done.');
