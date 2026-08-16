import { describe, it, expect } from 'vitest';
import { translations, type Language } from './i18n';

const LANGS: Language[] = ['en', 'zh-CN', 'zh-TW', 'ja', 'es', 'pt'];

describe('translation catalogue', () => {
  it('defines every advertised language', () => {
    expect(Object.keys(translations).sort()).toEqual([...LANGS].sort());
  });

  it('gives every language the same key set as English', () => {
    // TypeScript enforces the required keys, but the optional ones — which is
    // most of the theme editor — can silently drift. English is the reference
    // because it is the fallback every other language falls back to.
    const reference = Object.keys(translations.en).sort();
    for (const lang of LANGS) {
      const keys = Object.keys(translations[lang]).sort();
      const missing = reference.filter((k) => !keys.includes(k));
      const extra = keys.filter((k) => !reference.includes(k));
      expect({ lang, missing, extra }).toEqual({ lang, missing: [], extra: [] });
    }
  });

  it('has no empty or whitespace-only strings', () => {
    const blanks: string[] = [];
    for (const lang of LANGS) {
      for (const [key, value] of Object.entries(translations[lang])) {
        if (typeof value === 'string' && !value.trim()) blanks.push(`${lang}.${key}`);
      }
    }
    expect(blanks).toEqual([]);
  });

  it('contains only string values', () => {
    const nonStrings: string[] = [];
    for (const lang of LANGS) {
      for (const [key, value] of Object.entries(translations[lang])) {
        if (value !== undefined && typeof value !== 'string') nonStrings.push(`${lang}.${key}`);
      }
    }
    expect(nonStrings).toEqual([]);
  });

  it('translates rather than copying English wholesale', () => {
    // A guard against a language block being pasted in untranslated. Some
    // overlap is legitimate (product names, "Mermaid"), so this only asserts
    // that the majority of a language's strings differ from English.
    const en = translations.en as unknown as Record<string, string>;
    for (const lang of LANGS.filter((l) => l !== 'en')) {
      const other = translations[lang] as unknown as Record<string, string>;
      const comparable = Object.keys(en).filter((k) => typeof en[k] === 'string' && typeof other[k] === 'string');
      const identical = comparable.filter((k) => en[k] === other[k]);
      expect({ lang, ratio: identical.length / comparable.length < 0.5 }).toEqual({ lang, ratio: true });
    }
  });
});
