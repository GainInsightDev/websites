/**
 * Visual comparison script: WordPress (climbhq.co.uk) vs Astro (wbs-16.gaininsight.co.uk)
 *
 * Takes full-page screenshots of both sites for each page, then generates
 * an HTML comparison report.
 *
 * Usage: node compare.mjs
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const WP_BASE = 'https://climbhq.co.uk';
const ASTRO_BASE = 'https://wbs-16.gaininsight.co.uk';

const PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/about/', name: 'about' },
  { path: '/marketing-services/', name: 'marketing-services' },
  { path: '/accounting-services/', name: 'accounting-services' },
  { path: '/hr-services/', name: 'hr-services' },
  { path: '/contact/', name: 'contact' },
  { path: '/blog/', name: 'blog' },
];

const VIEWPORT = { width: 1440, height: 900 };
const OUTPUT_DIR = join(process.cwd(), 'compare-output');

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT });

  const results = [];

  for (const page of PAGES) {
    console.log(`Comparing: ${page.name}...`);

    // Screenshot WordPress version
    const wpPage = await context.newPage();
    try {
      await wpPage.goto(`${WP_BASE}${page.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await wpPage.waitForTimeout(2000); // Wait for animations
    } catch (e) {
      console.log(`  WP page load issue: ${e.message.substring(0, 80)}`);
    }
    const wpFile = `wp-${page.name}.png`;
    await wpPage.screenshot({ fullPage: true, path: join(OUTPUT_DIR, wpFile) });
    await wpPage.close();

    // Screenshot Astro version
    const astroPage = await context.newPage();
    try {
      await astroPage.goto(`${ASTRO_BASE}${page.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await astroPage.waitForTimeout(1000);
    } catch (e) {
      console.log(`  Astro page load issue: ${e.message.substring(0, 80)}`);
    }
    const astroFile = `astro-${page.name}.png`;
    await astroPage.screenshot({ fullPage: true, path: join(OUTPUT_DIR, astroFile) });
    await astroPage.close();

    results.push({ name: page.name, path: page.path, wpFile, astroFile });
    console.log(`  Done: ${page.name}`);
  }

  await browser.close();

  // Generate HTML comparison report
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ClimbHQ: WordPress vs Astro Comparison</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #111; color: #fff; padding: 32px; }
    h1 { text-align: center; margin-bottom: 48px; font-size: 24px; }
    .page-compare { margin-bottom: 64px; border: 1px solid #333; border-radius: 8px; overflow: hidden; }
    .page-header { padding: 16px 24px; background: #222; display: flex; justify-content: space-between; align-items: center; }
    .page-header h2 { font-size: 18px; }
    .page-header span { color: #888; font-size: 14px; }
    .compare-row { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: #333; }
    .compare-col { background: #111; }
    .compare-col h3 { padding: 8px 16px; background: #1a1a2e; font-size: 13px; text-align: center; color: #18abd7; }
    .compare-col img { width: 100%; display: block; }
  </style>
</head>
<body>
  <h1>ClimbHQ: WordPress vs Astro — Visual Comparison</h1>
  ${results.map(r => `
  <div class="page-compare">
    <div class="page-header">
      <h2>${r.name}</h2>
      <span>${r.path}</span>
    </div>
    <div class="compare-row">
      <div class="compare-col">
        <h3>WordPress (Original)</h3>
        <img src="${r.wpFile}" alt="WordPress ${r.name}" loading="lazy" />
      </div>
      <div class="compare-col">
        <h3>Astro (New)</h3>
        <img src="${r.astroFile}" alt="Astro ${r.name}" loading="lazy" />
      </div>
    </div>
  </div>`).join('\n')}
</body>
</html>`;

  writeFileSync(join(OUTPUT_DIR, 'index.html'), html);
  console.log(`\nComparison report: ${join(OUTPUT_DIR, 'index.html')}`);
  console.log(`Serve it: npx serve ${OUTPUT_DIR}`);
}

main().catch(console.error);
