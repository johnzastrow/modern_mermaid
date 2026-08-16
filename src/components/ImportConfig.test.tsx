import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportConfig from './ImportConfig';
import { LanguageProvider } from '../contexts/LanguageContext';

function setup(isOpen = true) {
  const onImport = vi.fn();
  const onClose = vi.fn();
  const view = render(
    <LanguageProvider>
      <ImportConfig isOpen={isOpen} onClose={onClose} onImport={onImport} />
    </LanguageProvider>,
  );
  return { onImport, onClose, user: userEvent.setup(), view };
}

const loadButton = () => screen.getByRole('button', { name: /load theme/i });
const textarea = () => screen.getByRole('textbox');

const INIT_DIRECTIVE = '%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ff0000"}}}%%';

describe('ImportConfig visibility', () => {
  it('renders nothing while closed', () => {
    setup(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a modal dialog when open', () => {
    setup();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});

describe('parsing pasted input', () => {
  it('disables Load until something is typed', async () => {
    const { user } = setup();
    expect(loadButton()).toBeDisabled();
    await user.type(textarea(), 'x');
    expect(loadButton()).toBeEnabled();
  });

  it('stays disabled for whitespace only', async () => {
    const { user } = setup();
    await user.type(textarea(), '    ');
    expect(loadButton()).toBeDisabled();
  });

  it('imports a valid init directive', async () => {
    const { onImport, user } = setup();
    await user.click(textarea());
    await user.paste(INIT_DIRECTIVE);
    await user.click(loadButton());

    expect(onImport).toHaveBeenCalledOnce();
    expect(onImport.mock.lastCall![0]).toMatchObject({
      theme: 'base',
      themeVariables: { primaryColor: '#ff0000' },
    });
  });

  it('imports a raw JSON config', async () => {
    const { onImport, user } = setup();
    await user.click(textarea());
    await user.paste('{"theme":"forest"}');
    await user.click(loadButton());
    expect(onImport.mock.lastCall![0]).toMatchObject({ theme: 'forest' });
  });

  it('imports YAML frontmatter including themeCSS', async () => {
    const { onImport, user } = setup();
    await user.click(textarea());
    await user.paste('---\nconfig:\n  theme: base\n  themeCSS: |\n    .node rect { rx: 8px; }\n---');
    await user.click(loadButton());
    expect(onImport.mock.lastCall![0].themeCSS).toContain('rx: 8px');
  });

  it('shows an error and does not import unparseable text', async () => {
    const { onImport, user } = setup();
    await user.click(textarea());
    await user.paste('this is not a theme config');
    await user.click(loadButton());

    expect(onImport).not.toHaveBeenCalled();
    expect(screen.getByText(/couldn't parse/i)).toBeInTheDocument();
  });

  it('clears the error as soon as the text changes', async () => {
    const { user } = setup();
    await user.click(textarea());
    await user.paste('garbage');
    await user.click(loadButton());
    expect(screen.getByText(/couldn't parse/i)).toBeInTheDocument();

    await user.type(textarea(), 'x');
    expect(screen.queryByText(/couldn't parse/i)).not.toBeInTheDocument();
  });
});

describe('untrusted input is sanitized before it reaches the app', () => {
  it('strips @import from pasted themeCSS', async () => {
    const { onImport, user } = setup();
    await user.click(textarea());
    await user.paste('---\nconfig:\n  theme: base\n  themeCSS: |\n    @import url("http://evil.test/x.css");\n    .node { fill: red; }\n---');
    await user.click(loadButton());

    const css = onImport.mock.lastCall![0].themeCSS as string;
    expect(css).not.toContain('@import');
    expect(css).toContain('fill: red');
  });

  it('strips executable url schemes from pasted themeCSS', async () => {
    const { onImport, user } = setup();
    await user.click(textarea());
    await user.paste('{"theme":"base","themeCSS":".node { background: javascript:alert(1); }"}');
    await user.click(loadButton());
    expect(onImport.mock.lastCall![0].themeCSS).not.toContain('javascript:');
  });

  it('drops keys outside the exportable allowlist', async () => {
    const { onImport, user } = setup();
    await user.click(textarea());
    await user.paste('{"theme":"base","securityLevel":"loose","htmlLabels":true}');
    await user.click(loadButton());

    const imported = onImport.mock.lastCall![0];
    expect(imported).not.toHaveProperty('securityLevel');
    expect(imported).not.toHaveProperty('htmlLabels');
  });
});

describe('closing', () => {
  it('closes via the close button', async () => {
    const { onClose, user } = setup();
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clears the textarea after a successful import', async () => {
    const { user } = setup();
    await user.click(textarea());
    await user.paste(INIT_DIRECTIVE);
    await user.click(loadButton());
    expect(textarea()).toHaveValue('');
  });
});
