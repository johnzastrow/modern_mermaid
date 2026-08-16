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

function setup(themeCSS = '', extra: Partial<{ savedThemeCount: number }> = {}) {
  const onChange = vi.fn();
  const onExportLibrary = vi.fn();
  const onImportLibrary = vi.fn();
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
        onExportLibrary={onExportLibrary}
        onImportLibrary={onImportLibrary}
        savedThemeCount={extra.savedThemeCount ?? 0}
      />
    </LanguageProvider>,
  );
  // Panel order: corner radius, line width, arrow size.
  const [radius, lineWidth, arrow] = screen.getAllByRole('slider') as HTMLInputElement[];
  return { onChange, radius, lineWidth, arrow, onExportLibrary, onImportLibrary };
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
    expect(screen.getByText(/corner radius/i)).toBeInTheDocument();
    expect(screen.getByText(/line width/i)).toBeInTheDocument();
    expect(screen.getByText(/arrow size/i)).toBeInTheDocument();
  });

  it('shows the unset state as "auto" for line width and arrow size', () => {
    setup();
    expect(screen.getAllByText('auto')).toHaveLength(2);
  });

  it('reflects a value parsed back out of existing themeCSS', () => {
    setup('/* mm:linewidth:start */\n.flowchart-link { stroke-width: 3px !important; }\n/* mm:linewidth:end */');
    expect(screen.getByText('3px')).toBeInTheDocument();
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
    expect(screen.queryByText(/frontmatter/i)).not.toBeInTheDocument();
  });

  it('appears once a CSS-only control is set', () => {
    setup('/* mm:arrow:start */\nmarker path { transform: scale(2); }\n/* mm:arrow:end */');
    expect(screen.getByText(/frontmatter/i)).toBeInTheDocument();
    expect(screen.getByText(/GitHub/i)).toBeInTheDocument();
  });
});

describe('theme library backup', () => {
  it('disables export while the library is empty', () => {
    setup('', { savedThemeCount: 0 });
    const button = screen.getByTitle(/no saved themes to export/i) as HTMLButtonElement;
    expect(button).toBeDisabled();
  });

  it('enables export once themes exist and calls back on click', () => {
    const { onExportLibrary } = setup('', { savedThemeCount: 3 });
    const button = screen.getByTitle(/export all saved themes/i) as HTMLButtonElement;
    expect(button).toBeEnabled();
    button.click();
    expect(onExportLibrary).toHaveBeenCalledOnce();
  });

  it('offers import regardless of how many themes are saved', () => {
    const { onImportLibrary } = setup('', { savedThemeCount: 0 });
    const button = screen.getByTitle(/import saved themes/i) as HTMLButtonElement;
    expect(button).toBeEnabled();
    button.click();
    expect(onImportLibrary).toHaveBeenCalledOnce();
  });
});
