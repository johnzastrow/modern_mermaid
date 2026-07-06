import React, { useState } from 'react';
import { X, ClipboardPaste } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { parseThemeConfigInput } from '../utils/configImport';
import type { ExportableConfig } from '../utils/configExport';

interface ImportConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (config: ExportableConfig) => void;
}

const ImportConfig: React.FC<ImportConfigProps> = ({ isOpen, onClose, onImport }) => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleLoad = () => {
    const parsed = parseThemeConfigInput(text);
    if (!parsed) {
      setError(true);
      return;
    }
    setError(false);
    setText('');
    onImport(parsed);
  };

  const close = () => {
    setError(false);
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.importTitle || 'Import theme config'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t.importHint || 'Paste a %%{init}%% directive, YAML frontmatter, or a JSON config.'}
            </p>
          </div>
          <button onClick={close} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded cursor-pointer" aria-label={t.close || 'Close'}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          <textarea
            autoFocus
            spellCheck={false}
            value={text}
            onChange={(e) => { setText(e.target.value); if (error) setError(false); }}
            placeholder={'%%{init: {"theme":"base","themeVariables":{ ... }}}%%'}
            className="w-full h-48 font-mono text-xs p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-y"
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {t.importError || "Couldn't parse that — expected an init directive, frontmatter, or JSON config."}
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleLoad}
              disabled={!text.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer"
            >
              <ClipboardPaste className="w-4 h-4" />
              {t.loadTheme || 'Load theme'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportConfig;
