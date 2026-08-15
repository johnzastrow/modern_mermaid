import { describe, it, expect, beforeAll } from 'vitest';
import mermaid from 'mermaid';
import { examples, exampleCategories, getCategoryName, findExampleById, type ExampleCategory } from './examples';
import type { Language } from './i18n';

const LANGS: Language[] = ['en', 'zh-CN', 'zh-TW', 'ja', 'es', 'pt'];
const categories = Object.keys(examples) as ExampleCategory[];
const allExamples = categories.flatMap((c) => examples[c].map((e) => ({ category: c, example: e })));

beforeAll(() => {
  mermaid.initialize({ startOnLoad: false, suppressErrorRendering: true });
});

describe('example catalogue structure', () => {
  it('declares an entry in exampleCategories for every category', () => {
    expect(Object.keys(exampleCategories).sort()).toEqual(categories.sort());
  });

  it('has at least one example per category', () => {
    const empty = categories.filter((c) => examples[c].length === 0);
    expect(empty).toEqual([]);
  });

  it('uses globally unique example ids', () => {
    const ids = allExamples.map(({ example }) => example.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('resolves every id through findExampleById', () => {
    const unresolved = allExamples
      .map(({ example }) => example.id)
      .filter((id) => findExampleById(id) === null);
    expect(unresolved).toEqual([]);
  });

  it('provides a non-empty name and code in every language', () => {
    const gaps: string[] = [];
    for (const { example } of allExamples) {
      for (const lang of LANGS) {
        if (!example.name[lang]?.trim()) gaps.push(`${example.id}.name.${lang}`);
        if (!example.code[lang]?.trim()) gaps.push(`${example.id}.code.${lang}`);
      }
    }
    expect(gaps).toEqual([]);
  });

  it('provides a category label in every language', () => {
    const gaps: string[] = [];
    for (const category of categories) {
      for (const lang of LANGS) {
        if (!getCategoryName(category, lang)?.trim()) gaps.push(`${category}.${lang}`);
      }
    }
    expect(gaps).toEqual([]);
  });
});

describe('every example parses under the installed mermaid', () => {
  // Newer examples share one English body across all six language keys, so
  // parsing per (example, language) would repeat identical work. Deduplicate on
  // the code itself and parse each distinct diagram exactly once, keeping a
  // label for whichever entries produced it so a failure is traceable.
  const byCode = new Map<string, string[]>();
  for (const { example } of allExamples) {
    for (const lang of LANGS) {
      const code = example.code[lang];
      const label = `${example.id} (${lang})`;
      const seen = byCode.get(code);
      if (seen) seen.push(label);
      else byCode.set(code, [label]);
    }
  }

  it.each([...byCode.entries()].map(([code, labels]) => [labels[0], code, labels] as const))(
    'parses %s',
    async (_label, code, labels) => {
      try {
        await expect(mermaid.parse(code)).resolves.toBeTruthy();
      } catch (error) {
        throw new Error(
          `Failed to parse the diagram shared by: ${labels.join(', ')}\n` +
            `${String((error as Error)?.message ?? error)}\n` +
            `--- source ---\n${code}`,
          { cause: error },
        );
      }
    },
    20_000,
  );
});
