// Registers jest-dom's matchers at runtime. Their *types* are registered
// separately in ./matchers.d.ts — see that file for why the bundled
// '@testing-library/jest-dom/vitest' entry point cannot do it under Vitest 4.
import '@testing-library/jest-dom/vitest';
