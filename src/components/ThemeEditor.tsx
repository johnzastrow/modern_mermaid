import React, { useState } from 'react';
import { X, RotateCcw, Save, FilePlus2, ChevronDown, RefreshCw } from 'lucide-react';
import type { ThemeConfig } from '../utils/themes';
import { fonts } from '../utils/fonts';
import { useLanguage } from '../contexts/LanguageContext';

interface ThemeEditorProps {
  /** The theme currently being edited (a mutable custom copy). */
  theme: ThemeConfig;
  onChange: (next: ThemeConfig) => void;
  onClose: () => void;
  /** Re-seed the custom theme from its source preset. */
  onReset: () => void;
  /** Start a fresh, blank theme. */
  onNew: () => void;
  /** Persist the current theme to the saved-theme library. */
  onSave: () => void;
  /** Force the preview to re-render (e.g. after editing raw themeCSS). */
  onReload: () => void;
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

// The corner-radius control writes a marker-delimited block into themeCSS so it
// can be updated idempotently without disturbing the user's own CSS.
const RADIUS_START = '/* mm:radius:start */';
const RADIUS_END = '/* mm:radius:end */';

function stripManagedRadius(css: string): string {
  const s = css.indexOf(RADIUS_START);
  if (s === -1) return css;
  const e = css.indexOf(RADIUS_END, s);
  if (e === -1) return css;
  return (css.slice(0, s) + css.slice(e + RADIUS_END.length)).replace(/\n{3,}/g, '\n\n').trim();
}

function readRadius(css: string): number {
  const s = css.indexOf(RADIUS_START);
  if (s === -1) return 0;
  const seg = css.slice(s, css.indexOf(RADIUS_END, s) + RADIUS_END.length);
  const m = seg.match(/rx:\s*([\d.]+)px/);
  return m ? Math.round(Number(m[1])) : 0;
}

function writeRadius(css: string, px: number): string {
  const base = stripManagedRadius(css);
  if (!px) return base;
  const block = `${RADIUS_START}\n.node rect, .node polygon, .cluster rect { rx: ${px}px !important; ry: ${px}px !important; }\n${RADIUS_END}`;
  return base ? `${base}\n\n${block}` : block;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange, onClose, onReset, onNew, onSave, onReload }) => {
  const { t, language } = useLanguage();
  const [showCss, setShowCss] = useState(false);
  const [showFonts, setShowFonts] = useState(false);
  const vars = (theme.mermaidConfig.themeVariables || {}) as Record<string, unknown>;
  const currentFont = typeof vars.fontFamily === 'string' ? (vars.fontFamily as string) : '';
  const currentCss = typeof theme.mermaidConfig.themeCSS === 'string' ? theme.mermaidConfig.themeCSS : '';
  const radius = readRadius(currentCss);

  const setVar = (key: string, value: unknown) => {
    onChange({
      ...theme,
      mermaidConfig: {
        ...theme.mermaidConfig,
        themeVariables: { ...theme.mermaidConfig.themeVariables, [key]: value },
      },
    });
  };

  // Background must also drive the visible canvas backdrop (bgClass/bgStyle),
  // not just Mermaid's themeVariable, or the change would be invisible.
  const setBackground = (value: string) => {
    onChange({
      ...theme,
      bgClass: '',
      bgStyle: { ...(theme.bgStyle || {}), backgroundColor: value },
      mermaidConfig: {
        ...theme.mermaidConfig,
        themeVariables: { ...theme.mermaidConfig.themeVariables, background: value },
      },
    });
  };

  const setCss = (css: string) =>
    onChange({ ...theme, mermaidConfig: { ...theme.mermaidConfig, themeCSS: css } });

  const inputCls =
    'px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100';
  const iconBtn =
    'p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded cursor-pointer';

  const selectedFont = fonts.find((f) => f.fontFamily === currentFont);

  return (
    <div className="w-80 max-h-full flex flex-col bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 text-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {t.themeEditorTitle || 'Theme editor'}
        </span>
        <div className="flex items-center gap-0.5">
          <button onClick={onNew} title={t.newTheme || 'New blank theme'} className={iconBtn}><FilePlus2 className="w-4 h-4" /></button>
          <button onClick={onSave} title={t.saveTheme || 'Save theme'} className={iconBtn}><Save className="w-4 h-4" /></button>
          <button onClick={onReset} title={t.reset || 'Revert to preset'} className={iconBtn}><RotateCcw className="w-4 h-4" /></button>
          <button onClick={onClose} title={t.close || 'Close'} className={iconBtn}><X className="w-4 h-4" /></button>
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
          const apply = (v: string) => (f.key === 'background' ? setBackground(v) : setVar(f.key, v));
          return (
            <div key={f.key} className="flex items-center gap-2">
              <span className="w-24 flex-shrink-0 text-xs text-gray-600 dark:text-gray-300">{f.label}</span>
              <input type="color" value={isHex(strVal) ? strVal : '#000000'}
                onChange={(e) => apply(e.target.value)} title={strVal || 'unset'}
                className="w-8 h-8 flex-shrink-0 rounded border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent" />
              <input type="text" value={strVal} placeholder="unset"
                onChange={(e) => apply(e.target.value)}
                className={`flex-1 min-w-0 font-mono text-xs ${inputCls}`} />
            </div>
          );
        })}

        {/* Corner radius */}
        <div className="flex items-center gap-2">
          <span className="w-24 flex-shrink-0 text-xs text-gray-600 dark:text-gray-300">{t.cornerRadius || 'Corner radius'}</span>
          <input type="range" min={0} max={24} step={1} value={radius}
            onChange={(e) => setCss(writeRadius(currentCss, Number(e.target.value)))}
            className="flex-1 cursor-pointer" />
          <span className="w-9 text-right text-xs font-mono text-gray-600 dark:text-gray-300">{radius}px</span>
        </div>

        {/* Font picker with live previews */}
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{t.fontFamily || 'Font'}</span>
          <button onClick={() => setShowFonts((s) => !s)}
            className={`mt-1 w-full flex items-center justify-between ${inputCls} cursor-pointer`}>
            <span className="truncate" style={{ fontFamily: currentFont || 'inherit' }}>
              {selectedFont ? selectedFont.name[language] : (currentFont || 'Custom')}
            </span>
            <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400" />
          </button>
          {showFonts && (
            <div className="mt-1 max-h-52 overflow-y-auto rounded border border-gray-200 dark:border-gray-700">
              {fonts.map((font) => (
                <button key={font.id}
                  onClick={() => { setVar('fontFamily', font.fontFamily); setShowFonts(false); }}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    font.fontFamily === currentFont ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                  }`}>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500">{font.name[language]}</div>
                  <div className="text-sm text-gray-800 dark:text-gray-200" style={{ fontFamily: font.fontFamily || 'inherit' }}>
                    {font.previewText[language]}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

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
            <>
              <textarea spellCheck={false}
                value={currentCss}
                onChange={(e) => setCss(e.target.value)}
                className="mt-2 w-full h-40 p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-mono text-xs resize-y" />
              <button onClick={onReload}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" /> {t.reloadDiagram || 'Reload diagram'}
              </button>
            </>
          )}
        </div>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 pt-1">
          {t.themeEditorHint || 'Edits preview live. Save to keep it; use Config to export for your docs. Stock themes are never modified.'}
        </p>
      </div>
    </div>
  );
};

export default ThemeEditor;
