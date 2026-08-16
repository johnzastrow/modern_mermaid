import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DarkModeProvider, useDarkMode } from './DarkModeContext';

function Probe() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <button onClick={toggleDarkMode}>{isDarkMode ? 'dark' : 'light'}</button>
  );
}

const renderProbe = () =>
  render(
    <DarkModeProvider>
      <Probe />
    </DarkModeProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});
afterEach(() => vi.restoreAllMocks());

describe('DarkModeProvider', () => {
  it('defaults to light when nothing is stored', () => {
    renderProbe();
    expect(screen.getByRole('button')).toHaveTextContent('light');
  });

  it('restores a stored dark preference', () => {
    localStorage.setItem('darkMode', 'true');
    renderProbe();
    expect(screen.getByRole('button')).toHaveTextContent('dark');
  });

  it('restores a stored light preference', () => {
    localStorage.setItem('darkMode', 'false');
    renderProbe();
    expect(screen.getByRole('button')).toHaveTextContent('light');
  });

  it('toggles between modes', async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('dark');
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('light');
  });

  it('drives the `dark` class on the document element', async () => {
    const user = userEvent.setup();
    renderProbe();
    expect(document.documentElement).not.toHaveClass('dark');

    await user.click(screen.getByRole('button'));
    expect(document.documentElement).toHaveClass('dark');

    await user.click(screen.getByRole('button'));
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('persists the choice so it survives a reload', async () => {
    const user = userEvent.setup();
    const { unmount } = renderProbe();
    await user.click(screen.getByRole('button'));
    expect(localStorage.getItem('darkMode')).toBe('true');

    unmount();
    renderProbe();
    expect(screen.getByRole('button')).toHaveTextContent('dark');
  });
});

describe('useDarkMode outside a provider', () => {
  it('throws a directive error rather than returning undefined', () => {
    // Rendering without the provider is a programming error; failing loudly
    // beats every consumer silently reading undefined.
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => act(() => { render(<Probe />); })).toThrow(/DarkModeProvider/);
    quiet.mockRestore();
  });
});
