import React, { useEffect, useState } from 'react';
import { loadWriteToken, saveWriteToken, serverWritable } from '../utils/customThemes';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Owner-only control for the shared server library. Shows whether this browser
 * may write to it, and lets the owner enter the instance's write token
 * (THEMES_WRITE_TOKEN on the server). Public visitors simply see "read-only";
 * their saves stay in their own browser.
 */
const SharedLibrarySettings: React.FC = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [writable, setWritable] = useState<boolean | null>(null);
  const [hasToken, setHasToken] = useState(() => loadWriteToken() !== '');
  const [draft, setDraft] = useState('');

  useEffect(() => {
    let cancelled = false;
    serverWritable().then((w) => {
      if (!cancelled) setWritable(w);
    });
    return () => {
      cancelled = true;
    };
  }, [hasToken]);

  const apply = (token: string) => {
    saveWriteToken(token);
    setDraft('');
    setWritable(null);
    setHasToken(token !== '');
  };

  const status =
    writable === null
      ? (t.sharedLibraryChecking || 'checking…')
      : writable
        ? (t.sharedLibraryWritable || 'saves sync to the server')
        : (t.sharedLibraryReadOnly || 'read-only; saves stay in this browser');

  return (
    <div>
      <button onClick={() => setOpen((s) => !s)}
        className="text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer">
        {open ? '▾' : '▸'} {t.sharedLibrary || 'Shared library'}: {status}
      </button>
      {open && (
        <form
          className="mt-2 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) apply(draft.trim());
          }}
        >
          <input
            type="password"
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={hasToken ? (t.writeTokenSet || 'Token saved on this browser') : (t.writeTokenPlaceholder || 'Owner write token')}
            aria-label={t.writeTokenPlaceholder || 'Owner write token'}
            className="flex-1 min-w-0 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs"
          />
          <button type="submit" disabled={!draft.trim()}
            className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-40 cursor-pointer">
            {t.save || 'Save'}
          </button>
          {hasToken && (
            <button type="button" onClick={() => apply('')}
              className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer">
              {t.forget || 'Forget'}
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default SharedLibrarySettings;
