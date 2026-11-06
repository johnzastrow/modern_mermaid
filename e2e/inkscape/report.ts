import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { INKSCAPE, REPORT_DIR, RENDER_WIDTH, verdict, type FidelityResult } from './shared';

type Pair = { standard: FidelityResult; editor: FidelityResult };

/** Global teardown: gather the per-diagram JSON into report.md and report.json. */
export default async function buildReport() {
  const files = (await readdir(REPORT_DIR).catch(() => [] as string[])).filter((f) => f.endsWith('.json') && f !== 'report.json');
  const parsed = await Promise.all(
    files.map(async (f) => JSON.parse(await readFile(join(REPORT_DIR, f), 'utf8')) as Partial<Pair>),
  );
  // Ignore leftovers from older report formats in the same directory.
  const pairs = parsed.filter((p): p is Pair => !!p.standard && !!p.editor);
  if (pairs.length === 0) return;
  pairs.sort((a, b) => a.standard.darkRatio - b.standard.darkRatio);

  let version = 'unknown';
  try {
    version = execFileSync(INKSCAPE, ['--version'], { encoding: 'utf8' }).trim().split('\n')[0];
  } catch {
    // Report still useful without the version line.
  }

  const tally = (key: keyof Pair) => {
    const c = { good: 0, degraded: 0, poor: 0 };
    for (const p of pairs) c[verdict(p[key])]++;
    return `good ${c.good}, degraded ${c.degraded}, poor ${c.poor}`;
  };

  const flagged = (r: FidelityResult) =>
    Object.entries(r.features).filter(([, n]) => n > 0).map(([k, n]) => `${k} x${n}`).join(', ') || '-';
  const cell = (r: FidelityResult) =>
    `${verdict(r)} | ${r.ssim.toFixed(3)} | ${r.darkRatio.toFixed(2)} | ${r.htmlLabels}`;

  const rows = pairs.map(({ standard: s, editor: e }) =>
    `| ${s.category} | \`${s.id}\` | ${cell(s)} | ${cell(e)} | ${flagged(e)} | [standard](${s.id}.standard.side-by-side.png), [editor](${s.id}.editor.side-by-side.png) |`);

  const md = `# Inkscape SVG fidelity

- Inkscape: ${version}
- Mermaid: ${pairs[0].standard.mermaid}.x; theme: \`${pairs[0].standard.theme}\`, render width ${RENDER_WIDTH} px, same fonts for both renderers
- Diagrams: ${pairs.length}
- **Standard SVG** export: ${tally('standard')}
- **Inkscape / editors** export: ${tally('editor')}

Both exports are scored against Chromium's render of the standard export (what the app shows).
**SSIM** is structural similarity (1 = identical). **Dark** is Inkscape's dark-pixel fraction
(text and strokes) over the reference's; it drops when labels vanish. **HTML** counts
\`foreignObject\` labels with text, which Inkscape does not draw.
Verdict: poor = HTML labels lost (dark < 0.8), or dark < 0.5, drawn-pixel ratio < 0.7 or SSIM < 0.85;
degraded = any HTML label lost, or a pixel ratio > 1.5 (distortion);
good = SSIM >= 0.95, drawn-pixel ratio >= 0.9 and dark >= 0.85; otherwise degraded.

| Type | Example | Standard | SSIM | Dark | HTML | Editor | SSIM | Dark | HTML | Risky features left (editor) | Images |
|---|---|---|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
  await writeFile(join(REPORT_DIR, 'report.md'), md);
  await writeFile(join(REPORT_DIR, 'report.json'), JSON.stringify({ inkscape: version, results: pairs }, null, 2));
  console.log(`\nInkscape fidelity -> ${join(REPORT_DIR, 'report.md')}\n  standard: ${tally('standard')}\n  editor:   ${tally('editor')}`);
}
