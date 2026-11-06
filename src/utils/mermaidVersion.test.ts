import { describe, it, expect, beforeEach } from 'vitest';
import { resolveMermaidMajor, MERMAID_VERSION_KEY } from './mermaidVersion';

describe('resolveMermaidMajor', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to 11', () => {
    expect(resolveMermaidMajor('', localStorage)).toBe('11');
  });
  it('selects 12 from the URL and remembers it', () => {
    expect(resolveMermaidMajor('?mermaid=12', localStorage)).toBe('12');
    expect(localStorage.getItem(MERMAID_VERSION_KEY)).toBe('12');
    expect(resolveMermaidMajor('', localStorage)).toBe('12');
  });
  it('returns to the default with ?mermaid=11 or ?mermaid=default', () => {
    for (const q of ['?mermaid=11', '?mermaid=default']) {
      localStorage.setItem(MERMAID_VERSION_KEY, '12');
      expect(resolveMermaidMajor(q, localStorage)).toBe('11');
      expect(localStorage.getItem(MERMAID_VERSION_KEY)).toBeNull();
    }
  });
  it('ignores unknown values in the URL and in storage', () => {
    expect(resolveMermaidMajor('?mermaid=13', localStorage)).toBe('11');
    localStorage.setItem(MERMAID_VERSION_KEY, '<script>');
    expect(resolveMermaidMajor('', localStorage)).toBe('11');
  });
  it('still honours the URL when storage is unavailable', () => {
    const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } } as unknown as Storage;
    expect(resolveMermaidMajor('?mermaid=12', broken)).toBe('12');
    expect(resolveMermaidMajor('', broken)).toBe('11');
  });
});
