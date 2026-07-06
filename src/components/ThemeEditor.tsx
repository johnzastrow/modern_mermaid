import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { ThemeConfig } from '../utils/themes';
import { useLanguage } from '../contexts/LanguageContext';

interface ThemeEditorProps {
  /** The theme currently being edited (a mutable custom copy). */
  theme: ThemeConfig;
  onChange: (next: ThemeConfig) => void;
  onClose: () => void;
  /** Re-seed the custom theme from its source preset. */
  onReset: () => void;
}

const COLOR_FIELDS: { key: string; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'primaryColor', label: 'Node fill' },
  { key: 'primaryTextColor', label: 'Text' },
  { key: 'primaryBorderColor', label: 'Border' },
  { key: 'lineColor', label: 'Lines' },
  { key: 'secondaryColor', label: 'Secondary' },
  { key: 'tertiaryColor', label: 'Tertiary' },
];

const isHex = (v: unknown): v is string =>
  typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());

const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange, onClose, onReset }) => {
  const { t } = useLanguage();
  const [showCss, setShowCss] = useState(false);
  const vars = (theme.mermaidConfig.themeVariables || {}) as Record<string, unknown>;

  const setVar = (key: string, value: unknown) => {
    onChange({
      ...theme,
      mermaidConfig: {
        ...theme.mermaidConfig,
        themeVariables: { ...theme.mermaidConfig.themeVariables, [key]: value },
      },
    });
  };
  const setCss = (css: string) =>
    onChange({ ...theme, mermaidConfig: { ...theme.mermaidConfig, themeCSS: css } });

  const inputCls =
    'px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100';

  return (
    <div className="w-80 max-h-full flex flex-col bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 text-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {t.themeEditorTitle || 'Theme editor'}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onReset} title={t.reset || 'Reset to preset'}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded cursor-pointer">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={onClose} title={t.close || 'Close'}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto">
        <label className="block">
          <span className="text-xs text-gray-500 dark:text-gray-400">{t.themeName || 'Name'}</span>
          <input type="text" value={theme.name}
            onChange={(e) => onChange({ ...theme, name: e.target.value })}
            className={`mt-1 w-full ${inputCls}`} />
        </label>

        {COLOR_FIELDS.map((f) => {
          const strVal = typeof vars[f.key] === 'string' ? (vars[f.key] as string) : '';
          return (
            <div key={f.key} className="flex items-center gap-2">
              <span className="w-24 flex-shrink-0 text-xs text-gray-600 dark:text-gray-300">{f.label}</span>
              <input type="color" value={isHex(strVal) ? strVal : '#000000'}
                onChange={(e) => setVar(f.key, e.target.value)}
                title={strVal || 'unset'}
                className="w-8 h-8 flex-shrink-0 rounded border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent" />
              <input type="text" value={strVal} placeholder="unset"
                onChange={(e) => setVar(f.key, e.target.value)}
                className={`flex-1 min-w-0 font-mono text-xs ${inputCls}`} />
            </div>
          );
        })}

        <label className="block">
          <span className="text-xs text-gray-500 dark:text-gray-400">{t.fontFamily || 'Font family'}</span>
          <input type="text" value={typeof vars.fontFamily === 'string' ? (vars.fontFamily as string) : ''}
            onChange={(e) => setVar('fontFamily', e.target.value)}
            className={`mt-1 w-full font-mono text-xs ${inputCls}`} />
        </label>

        <div className="flex items-end gap-3">
          <label className="flex-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t.fontSize || 'Font size'}</span>
            <input type="text" value={typeof vars.fontSize === 'string' ? (vars.fontSize as string) : ''}
              onChange={(e) => setVar('fontSize', e.target.value)}
              className={`mt-1 w-full font-mono text-xs ${inputCls}`} />
          </label>
          <label className="flex items-center gap-2 pb-1.5 cursor-pointer">
            <input type="checkbox" checked={vars.darkMode === true}
              onChange={(e) => setVar('darkMode', e.target.checked)} className="cursor-pointer" />
            <span className="text-xs text-gray-600 dark:text-gray-300">{t.darkMode || 'Dark mode'}</span>
          </label>
        </div>

        <div>
          <button onClick={() => setShowCss((s) => !s)}
            className="text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer">
            {showCss ? '▾' : '▸'} {t.advancedCss || 'Advanced: themeCSS'}
          </button>
          {showCss && (
            <textarea spellCheck={false}
              value={typeof theme.mermaidConfig.themeCSS === 'string' ? theme.mermaidConfig.themeCSS : ''}
              onChange={(e) => setCss(e.target.value)}
              className="mt-2 w-full h-40 p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-mono text-xs resize-y" />
          )}
        </div>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 pt-1">
          {t.themeEditorHint || 'Edits preview live. Use the Config button to export this theme for your docs.'}
        </p>
      </div>
    </div>
  );
};

export default ThemeEditor;
