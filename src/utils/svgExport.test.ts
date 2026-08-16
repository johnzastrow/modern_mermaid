import { describe, it, expect, vi } from 'vitest';
import { buildStandaloneSvg, svgFilename } from './svgExport';

function makeSvg(attrs: Record<string, string>, inner = '<rect width="10" height="10"/>'): SVGSVGElement {
  const wrapper = document.createElement('div');
  const attrString = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" ${attrString}>${inner}</svg>`;
  return wrapper.firstElementChild as unknown as SVGSVGElement;
}

describe('buildStandaloneSvg', () => {
  it('emits an xml declaration and the svg namespace', () => {
    const out = buildStandaloneSvg(makeSvg({ viewBox: '0 0 100 50' }));
    expect(out.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(out).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('pins width and height from the viewBox', () => {
    const out = buildStandaloneSvg(makeSvg({ viewBox: '0 0 320 140' }));
    expect(out).toContain('width="320"');
    expect(out).toContain('height="140"');
  });

  it('prefers the viewBox over stale width/height attributes', () => {
    const out = buildStandaloneSvg(makeSvg({ viewBox: '0 0 320 140', width: '100%', height: '42' }));
    expect(out).toContain('width="320"');
    expect(out).toContain('height="140"');
  });

  it('falls back to width/height when there is no viewBox, and adds one', () => {
    const out = buildStandaloneSvg(makeSvg({ width: '200', height: '80' }));
    expect(out).toContain('viewBox="0 0 200 80"');
  });

  it('drops the max-width Mermaid uses to fit the preview pane', () => {
    const svg = makeSvg({ viewBox: '0 0 100 50' });
    svg.setAttribute('style', 'max-width: 100px; background: red;');
    const out = buildStandaloneSvg(svg);
    expect(out).not.toContain('max-width');
    expect(out).toContain('background: red');
  });

  it('never mutates the element it was handed', () => {
    const svg = makeSvg({ viewBox: '0 0 100 50' });
    svg.setAttribute('style', 'max-width: 100px;');
    buildStandaloneSvg(svg, { background: '#fff' });
    expect(svg.getAttribute('style')).toContain('max-width');
    expect(svg.querySelector('rect[fill="#fff"]')).toBeNull();
  });

  it('paints a background rect first so it sits behind the diagram', () => {
    const out = buildStandaloneSvg(makeSvg({ viewBox: '0 0 100 50' }), { background: '#0b0f12' });
    expect(out).toContain('fill="#0b0f12"');
    // the background must precede the diagram content
    expect(out.indexOf('#0b0f12')).toBeLessThan(out.indexOf('<rect width="10"'));
  });

  it('omits the background entirely when none is given', () => {
    const out = buildStandaloneSvg(makeSvg({ viewBox: '0 0 100 50' }));
    expect(out).not.toContain('width="100%"');
  });

  it('keeps the style element Mermaid embeds, so theming travels with the file', () => {
    const svg = makeSvg({ viewBox: '0 0 100 50' }, '<style>.node{fill:#123456}</style><rect/>');
    const out = buildStandaloneSvg(svg);
    expect(out).toContain('.node{fill:#123456}');
  });

  it('survives an svg with neither viewBox nor usable dimensions', () => {
    const out = buildStandaloneSvg(makeSvg({}));
    expect(out).toContain('<svg');
    expect(out).toContain('xmlns=');
  });
});

describe('svgFilename', () => {
  it('uses the svg extension and the shared diagram prefix', () => {
    expect(svgFilename(1700000000000)).toBe('mermaid-diagram-1700000000000.svg');
  });
});

describe('downloadSvg', () => {
  it('offers the file as an image/svg+xml blob and revokes the URL', async () => {
    const { downloadSvg } = await import('./svgExport');
    const created: Blob[] = [];
    const revoked: string[] = [];
    const clicked: HTMLAnchorElement[] = [];

    vi.useFakeTimers();
    const createURL = vi.spyOn(URL, 'createObjectURL').mockImplementation((b) => {
      created.push(b as Blob);
      return 'blob:stub';
    });
    const revokeURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation((u) => void revoked.push(u));
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreate(tag);
      if (tag === 'a') {
        (el as HTMLAnchorElement).click = () => void clicked.push(el as HTMLAnchorElement);
      }
      return el;
    });

    downloadSvg('<svg/>', 'diagram.svg');

    expect(created).toHaveLength(1);
    expect(created[0].type).toBe('image/svg+xml;charset=utf-8');
    expect(clicked[0].download).toBe('diagram.svg');
    expect(clicked[0].href).toContain('blob:stub');

    // The URL must survive the click and be released afterwards.
    expect(revoked).toEqual([]);
    vi.runAllTimers();
    expect(revoked).toEqual(['blob:stub']);

    createURL.mockRestore();
    revokeURL.mockRestore();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('defaults the filename when none is given', async () => {
    const { downloadSvg } = await import('./svgExport');
    let name = '';
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:stub');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreate(tag);
      if (tag === 'a') (el as HTMLAnchorElement).click = () => { name = (el as HTMLAnchorElement).download; };
      return el;
    });

    downloadSvg('<svg/>');
    expect(name).toMatch(/^mermaid-diagram-\d+\.svg$/);
    vi.restoreAllMocks();
  });
});
