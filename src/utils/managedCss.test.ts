import { describe, it, expect } from 'vitest';
import {
  readRadius,
  writeRadius,
  readLineWidth,
  writeLineWidth,
  readArrowScale,
  writeArrowScale,
  stripManagedBlock,
  readManagedBlock,
} from './managedCss';

const USER_CSS = '.node rect { stroke-dasharray: 4 2; }';

describe('round-tripping a single control', () => {
  it('reads back the corner radius it wrote', () => {
    expect(readRadius(writeRadius('', 12))).toBe(12);
  });

  it('reads back the line width it wrote, including halves', () => {
    expect(readLineWidth(writeLineWidth('', 2.5))).toBe(2.5);
  });

  it('reads back the arrow scale it wrote', () => {
    expect(readArrowScale(writeArrowScale('', 1.8))).toBe(1.8);
  });

  it('reports the unset defaults for empty css', () => {
    expect(readRadius('')).toBe(0);
    expect(readLineWidth('')).toBe(0);
    expect(readArrowScale('')).toBe(1);
  });

  it('treats the neutral value as "remove the block"', () => {
    expect(writeRadius(writeRadius('', 10), 0)).toBe('');
    expect(writeLineWidth(writeLineWidth('', 4), 0)).toBe('');
    // 1x is the arrow's neutral value, not 0.
    expect(writeArrowScale(writeArrowScale('', 2), 1)).toBe('');
  });
});

describe('idempotence', () => {
  it('does not accumulate blocks when a slider is dragged', () => {
    let css = '';
    for (const px of [1, 2, 3, 4, 5]) css = writeLineWidth(css, px);
    expect(readLineWidth(css)).toBe(5);
    expect(css.match(/mm:linewidth:start/g)).toHaveLength(1);
  });

  it('rewriting one control leaves the others untouched', () => {
    let css = writeRadius('', 8);
    css = writeLineWidth(css, 3);
    css = writeArrowScale(css, 2);
    css = writeLineWidth(css, 6); // change only the middle one

    expect(readRadius(css)).toBe(8);
    expect(readLineWidth(css)).toBe(6);
    expect(readArrowScale(css)).toBe(2);
  });
});

describe('coexistence with hand-written css', () => {
  it('preserves user css when adding a control', () => {
    const css = writeLineWidth(USER_CSS, 3);
    expect(css).toContain(USER_CSS);
    expect(readLineWidth(css)).toBe(3);
  });

  it('preserves user css when removing a control', () => {
    const css = writeLineWidth(writeLineWidth(USER_CSS, 3), 0);
    expect(css).toBe(USER_CSS);
  });

  it('preserves user css written after a control block', () => {
    const withBlock = writeRadius('', 6);
    const mixed = `${withBlock}\n\n${USER_CSS}`;
    const next = writeRadius(mixed, 10);
    expect(next).toContain(USER_CSS);
    expect(readRadius(next)).toBe(10);
    expect(next.match(/mm:radius:start/g)).toHaveLength(1);
  });
});

describe('generated rules', () => {
  it('scales arrow heads and lifts the marker clip together', () => {
    const css = writeArrowScale('', 2);
    // Without overflow:visible the marker viewport clips the scaled path and
    // the head gets smaller instead of larger, so both must be present.
    expect(css).toContain('overflow: visible');
    expect(css).toContain('transform: scale(2)');
  });

  it('does not thicken the sequence lifeline', () => {
    // .actor-line is the vertical lifeline, not a connector.
    expect(writeLineWidth('', 4)).not.toContain('.actor-line');
  });

  it('covers the connector class of every major diagram type', () => {
    const css = writeLineWidth('', 4);
    for (const sel of [
      '.flowchart-link',
      '.messageLine0',
      '.relation',
      '.transition',
      '.relationshipLine',
      '.edge-thickness-normal',
    ]) {
      expect(css).toContain(sel);
    }
  });
});

describe('block helpers', () => {
  it('returns null for a block that is not present', () => {
    expect(readManagedBlock(USER_CSS, 'radius')).toBeNull();
  });

  it('leaves css untouched when stripping an absent block', () => {
    expect(stripManagedBlock(USER_CSS, 'radius')).toBe(USER_CSS);
  });

  it('tolerates a truncated block rather than corrupting the css', () => {
    const broken = '/* mm:radius:start */\n.node rect { rx: 4px; }';
    expect(stripManagedBlock(broken, 'radius')).toBe(broken);
    expect(readRadius(broken)).toBe(0);
  });
});
