import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MermaidConfig } from 'mermaid';
import ExportConfig from './ExportConfig';
import { LanguageProvider } from '../contexts/LanguageContext';

const config: MermaidConfig = {
  theme: 'base',
  themeVariables: { primaryColor: '#ff0000', fontSize: '14px' },
  themeCSS: '.node rect { rx: 8px !important; }',
  // Must never be exported:
  securityLevel: 'strict',
} as MermaidConfig;

function setup(
  isOpen = true,
  mermaidConfig: MermaidConfig = config,
  writeText = vi.fn().mockResolvedValue(undefined),
) {
  const onClose = vi.fn();
  render(
    <LanguageProvider>
      <ExportConfig isOpen={isOpen} onClose={onClose} mermaidConfig={mermaidConfig} themeName="Corporate" />
    </LanguageProvider>,
  );
  const user = userEvent.setup();
  // userEvent.setup() installs its own clipboard stub, so ours has to come
  // after it — and navigator.clipboard is getter-only, hence defineProperty.
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return { onClose, user, writeText };
}

/** [frontmatter, init] — the two snippets, in render order. */
const boxes = () => screen.getAllByRole('textbox') as HTMLTextAreaElement[];

describe('ExportConfig visibility', () => {
  it('renders nothing while closed', () => {
    setup(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('names the theme being exported', () => {
    setup();
    expect(screen.getByText('Corporate')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const { onClose, user } = setup();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('snippet contents', () => {
  it('offers both a frontmatter and an inline form', () => {
    setup();
    expect(boxes()).toHaveLength(2);
    expect(screen.getByText(/YAML frontmatter/i)).toBeInTheDocument();
    expect(screen.getByText(/Inline %%\{init\}%%/i)).toBeInTheDocument();
  });

  it('puts themeCSS in the frontmatter form', () => {
    setup();
    const [frontmatter] = boxes();
    expect(frontmatter.value).toContain('themeCSS: |');
    expect(frontmatter.value).toContain('rx: 8px');
  });

  it('leaves themeCSS out of the inline form, which cannot apply it', () => {
    setup();
    const [, init] = boxes();
    expect(init.value).toContain('%%{init:');
    expect(init.value).not.toContain('themeCSS');
    expect(init.value).toContain('primaryColor');
  });

  it('never exports non-styling config keys', () => {
    setup();
    for (const box of boxes()) {
      expect(box.value).not.toContain('securityLevel');
    }
  });

  it('renders both snippets read-only', () => {
    setup();
    for (const box of boxes()) expect(box).toHaveAttribute('readonly');
  });

  it('omits absent sections rather than emitting empty ones', () => {
    setup(true, { theme: 'base' } as MermaidConfig);
    const [frontmatter] = boxes();
    expect(frontmatter.value).not.toContain('themeVariables:');
    expect(frontmatter.value).not.toContain('themeCSS:');
  });
});

describe('copying', () => {
  it('writes the snippet to the clipboard', async () => {
    const { user, writeText } = setup();
    const [frontmatter] = boxes();
    await user.click(screen.getAllByRole('button', { name: /copy/i })[0]);
    expect(writeText).toHaveBeenCalledWith(frontmatter.value);
  });

  it('confirms the copy in the button label', async () => {
    const { user } = setup();
    await user.click(screen.getAllByRole('button', { name: /copy/i })[0]);
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
  });

  it('does not crash when the clipboard is unavailable', async () => {
    const { user } = setup(true, config, vi.fn().mockRejectedValue(new Error('not allowed')));
    // The textarea still allows manual selection, so a rejection must be silent.
    await user.click(screen.getAllByRole('button', { name: /copy/i })[0]);
    expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();
  });
});
