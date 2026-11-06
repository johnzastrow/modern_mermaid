import { Moon, Sun } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useDarkMode } from '../contexts/DarkModeContext';
import Logo from './Logo';
import { APP_VERSION, MERMAID_VERSION, MERMAID_OVERRIDDEN, RELEASE_URL } from '../version';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between relative z-50 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Logo size={40} className="flex-shrink-0" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Modern <span className="text-indigo-600 dark:text-indigo-400">Mermaid</span>
        </h1>
        <a
          href={RELEASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          title={`Modern Mermaid v${APP_VERSION} (Mermaid ${MERMAID_VERSION}): release notes`}
          className={`hidden sm:inline-block text-xs font-medium px-2 py-0.5 rounded-full border transition-colors ${
            MERMAID_OVERRIDDEN
              ? 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30'
              : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          v{APP_VERSION}
          {/* Visible only while the ?mermaid= test switch is in effect. */}
          {MERMAID_OVERRIDDEN && ` · Mermaid ${MERMAID_VERSION}`}
        </a>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;

