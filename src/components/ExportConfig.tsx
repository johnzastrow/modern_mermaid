import React, { useEffect, useState } from 'react';
import type { MermaidConfig } from 'mermaid';
import { X, Copy, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { buildInitDirective, buildFrontmatter } from '../utils/configExport';

interface ExportConfigProps {
  isOpen: boolean;
  onClose: () => void;
  mermaidConfig: MermaidConfig;
  themeName: string;
}

interface Snippet {
  key: string;
  title: string;
  hint: string;
  value: string;
}

const ExportConfig: React.FC<ExportConfigProps> = ({ isOpen, onClose, mermaidConfig, themeName }) => {
  const { t } = useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const snippets: Snippet[] = [
    {
      key: 'frontmatter',
      title: t.exportFrontmatterTitle || 'YAML frontmatter — full styling',
      hint:
        t.exportFrontmatterHint ||
        'Place above the diagram. Carries themeCSS, so rich styling renders in Typora and other full renderers (Mermaid 10.5+).',
      value: buildFrontmatter(mermaidConfig),
    },
    {
      key: 'init',
      title: t.exportInitTitle || 'Inline %%{init}%% — colors & fonts',
      hint:
        t.exportInitHint ||
        'First line of a mermaid block. themeVariables only — works everywhere, including GitHub. (Mermaid cannot apply themeCSS inline.)',
      value: buildInitDirective(mermaidConfig),
    },
  ];

  const handleCopy = async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.value);
      setCopiedKey(snippet.key);
      window.setTimeout(() => setCopiedKey((k) => (k === snippet.key ? null : k)), 1500);
    } catch {
      // Clipboard may be unavailable (e.g. non-secure context); the textarea
      // still lets the user select and copy manually.
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.exportConfigTitle || 'Export theme config'}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.exportConfigTitle || 'Export theme config'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {(t.exportConfigSubtitle || 'Reusable style for your Markdown docs — theme:')} <b>{themeName}</b>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors cursor-pointer"
            aria-label={t.close || 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          {snippets.map((snippet) => (
            <div key={snippet.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{snippet.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{snippet.hint}</p>
                </div>
                <button
                  onClick={() => handleCopy(snippet)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-md transition-colors cursor-pointer flex-shrink-0"
                >
                  {copiedKey === snippet.key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === snippet.key ? (t.copied || 'Copied') : (t.copy || 'Copy')}
                </button>
              </div>
              <textarea
                readOnly
                value={snippet.value}
                onFocus={(e) => e.currentTarget.select()}
                spellCheck={false}
                className="w-full h-32 font-mono text-xs p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-y whitespace-pre overflow-auto"
              />
            </div>
          ))}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t.exportConfigNote ||
              'Note: GitHub honors colors/fonts (themeVariables) but strips themeCSS; full renderers like Typora apply both.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportConfig;
