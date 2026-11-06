import { ACTIVE_MERMAID, DEFAULT_MERMAID } from './utils/mermaidVersion';

// Injected by Vite `define` (vite.config.ts, vitest.config.ts).
declare const __APP_VERSION__: string;
declare const __MERMAID_VERSION__: string;
declare const __MERMAID12_VERSION__: string;

export const APP_VERSION = __APP_VERSION__;
export const RELEASE_URL = `https://github.com/johnzastrow/modern_mermaid/releases/tag/v${APP_VERSION}`;

/** The Mermaid version this page renders with. */
export const MERMAID_VERSION = ACTIVE_MERMAID === '12' ? __MERMAID12_VERSION__ : __MERMAID_VERSION__;
/** True when the hidden ?mermaid= switch selected a non-default version. */
export const MERMAID_OVERRIDDEN = ACTIVE_MERMAID !== DEFAULT_MERMAID;
