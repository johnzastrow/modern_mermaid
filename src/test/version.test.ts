import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { APP_VERSION, MERMAID_VERSION, RELEASE_URL } from '../version';

const versionOf = (path: string) => JSON.parse(readFileSync(path, 'utf8')).version;

describe('version', () => {
  it('matches package.json and the installed mermaid', () => {
    expect(APP_VERSION).toBe(versionOf('package.json'));
    expect(MERMAID_VERSION).toBe(versionOf('node_modules/mermaid/package.json'));
  });
  it('links to the matching release tag', () => {
    expect(RELEASE_URL).toMatch(new RegExp(`/releases/tag/v${APP_VERSION.replace(/\./g, '\\.')}$`));
  });
});
