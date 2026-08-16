import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThemeEditor from './ThemeEditor';
import { LanguageProvider } from '../contexts/LanguageContext';
import type { ThemeConfig } from '../utils/themes';
import { readLineWidth, readArrowScale, readRadius } from '../utils/managedCss';

const baseTheme = (themeCSS = ''): ThemeConfig => ({
  name: 'Test',
  bgClass: '',
  mermaidConfig: { theme: 'base', themeVariables: {}, themeCSS },
  annotationColors: { primary: '#f00', secondary: '#0f0', text: '#000' },
});

function setup(themeCSS = '') {
  const onChange = vi.fn();
  render(
    <LanguageProvider>
      <ThemeEditor
        theme={baseTheme(themeCSS)}
        onChange={onChange}
        onClose={vi.fn()}
        onReset={vi.fn()}
        onNew={vi.fn()}
        onSave={vi.fn()}
        onReload={vi.fn()}
      />
    </LanguageProvider>,
  );
  // Panel order: corner radius, line width, arrow size.
  const [radius, lineWidth, arrow] = screen.getAllByRole('slider') as HTMLInputElement[];
  return { onChange, radius, lineWidth, arrow };
}

/** The themeCSS the component handed back on its most recent onChange call. */
const lastCss = (onChange: ReturnType<typeof vi.fn>): string =>
  onChange.mock.lastCall?.[0]?.mermaidConfig?.themeCSS ?? '';

/** Drive a range input the way a drag would, so React's onChange fires. */
function drag(input: HTMLInputElement, value: number) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, String(value));
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('ThemeEditor style sliders', () => {
  it('renders corner radius, line width and arrow size together', () => {
    setup();
    expect(screen.getByText(/corner radius/i)).toBeTruthy();
    expect(screen.getByText(/line width/i)).toBeTruthy();
    expect(screen.getByText(/arrow size/i)).toBeTruthy();
  });

  it('shows the unset state as "auto" for line width and arrow size', () => {
    setup();
    expect(screen.getAllByText('auto')).toHaveLength(2);
  });

  it('reflects a value parsed back out of existing themeCSS', () => {
    setup('/* mm:linewidth:start */\n.flowchart-link { stroke-width: 3px !important; }\n/* mm:linewidth:end */');
    expect(screen.getByText('3px')).toBeTruthy();
  });

  it('writes a line width into themeCSS', () => {
    const { onChange, lineWidth } = setup();
    drag(lineWidth, 4);
    expect(readLineWidth(lastCss(onChange))).toBe(4);
  });

  it('writes an arrow scale into themeCSS', () => {
    const { onChange, arrow } = setup();
    drag(arrow, 2);
    expect(readArrowScale(lastCss(onChange))).toBe(2);
  });

  it('keeps the radius control working after the helpers moved out of the component', () => {
    const { onChange, radius } = setup();
    drag(radius, 12);
    expect(readRadius(lastCss(onChange))).toBe(12);
  });
});

describe('themeCSS portability warning', () => {
  it('stays hidden while no CSS-only control is in use', () => {
    setup();
    expect(screen.queryByText(/frontmatter/i)).toBeNull();
  });

  it('appears once a CSS-only control is set', () => {
    setup('/* mm:arrow:start */\nmarker path { transform: scale(2); }\n/* mm:arrow:end */');
    expect(screen.getByText(/frontmatter/i)).toBeTruthy();
    expect(screen.getByText(/GitHub/i)).toBeTruthy();
  });
});
