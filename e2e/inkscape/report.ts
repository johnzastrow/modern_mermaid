import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { INKSCAPE, REPORT_DIR, RENDER_WIDTH, verdict, type FidelityResult } from './shared';

/** Global teardown: gather the per-diagram JSON into report.md and report.json. */
export default async function buildReport() {
  const files = (await readdir(REPORT_DIR).catch(() => [] as string[])).filter((f) => f.endsWith('.json') && f !== 'report.json');
  if (files.length === 0) return;
  const results: FidelityResult[] = await Promise.all(
    files.map(async (f) => JSON.parse(await readFile(join(REPORT_DIR, f), 'utf8')) as FidelityResult),
  );
  results.sort((a, b) => a.darkRatio - b.darkRatio);

  let version = 'unknown';
  try {
    version = execFileSync(INKSCAPE, ['--version'], { encoding: 'utf8' }).trim().split('\n')[0];
  } catch {
    // Report still useful without the version line.
  }

  const counts = { good: 0, degraded: 0, poor: 0 };
  for (const r of results) counts[verdict(r)]++;

  const flagged = (r: FidelityResult) =>
    Object.entries(r.features).filter(([, n]) => n > 0).map(([k, n]) => `${k} x${n}`).join(', ') || '-';

  const rows = results.map((r) =>
    `| ${r.category} | \`${r.id}\` | ${verdict(r)} | ${r.ssim.toFixed(3)} | ${r.coverageRatio.toFixed(2)} | ${r.darkRatio.toFixed(2)} | ${r.htmlLabels} | ${flagged(r)} | [compare](${r.id}.side-by-side.png) |`);

  const md = `# Inkscape SVG fidelity

- Inkscape: ${version}
- Theme: \`${results[0]?.theme}\`, render width ${RENDER_WIDTH} px, same fonts for both renderers
- Diagrams: ${results.length} (good ${counts.good}, degraded ${counts.degraded}, poor ${counts.poor})

**SSIM** is the structural similarity of Inkscape's render to Chromium's (1 = identical).
**Coverage** is Inkscape's drawn-pixel fraction divided by Chromium's; well below 1
means content is missing (for example HTML labels inside \`foreignObject\`).
**Dark** is the same ratio for dark pixels only (text and strokes); it drops when labels vanish.
**HTML labels** counts \`foreignObject\` elements with text, which Inkscape does not draw.
Verdict: poor = HTML labels lost (dark < 0.8), or dark < 0.5, coverage < 0.7 or SSIM < 0.85;
degraded = any HTML label lost, or coverage/dark > 1.5 (distortion);
good = SSIM >= 0.95, coverage >= 0.9 and dark >= 0.85; otherwise degraded.

| Type | Example | Verdict | SSIM | Coverage | Dark | HTML labels | Risky features in the SVG | Images |
|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
  await writeFile(join(REPORT_DIR, 'report.md'), md);
  await writeFile(join(REPORT_DIR, 'report.json'), JSON.stringify({ inkscape: version, results }, null, 2));
  console.log(`\nInkscape fidelity: good ${counts.good}, degraded ${counts.degraded}, poor ${counts.poor} -> ${join(REPORT_DIR, 'report.md')}`);
}
