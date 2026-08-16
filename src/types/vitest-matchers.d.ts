/**
 * Type registration for jest-dom's matchers under Vitest 4.
 *
 * jest-dom ships `@testing-library/jest-dom/vitest`, which does:
 *
 *     declare module 'vitest' { interface Assertion<T> extends TestingLibraryMatchers<any, T> {} }
 *
 * That worked when Vitest declared `Assertion` itself. Vitest 4 moved the
 * interface into `@vitest/expect` and merely *re-exports* it, and a module
 * augmentation cannot merge into a re-exported interface — it silently creates
 * a second, unrelated `Assertion` in the `vitest` namespace instead. The
 * matchers therefore work at runtime but fail `tsc -b` with
 * "Property 'toBeInTheDocument' does not exist".
 *
 * `@vitest/expect` exposes an empty `interface Matchers<T = any> {}` for exactly
 * this purpose, and its `Assertion` extends it. Augmenting that interface at its
 * source is what actually registers the matchers with the type checker.
 *
 * Two placement details matter:
 *  - it lives in src/types/, not src/test/, because tsconfig.app.json excludes
 *    src/test — an augmentation there is never loaded by `tsc -b`;
 *  - `@vitest/expect` is a direct devDependency so the specifier resolves.
 *    Without it, `declare module '@vitest/expect'` silently declares a *new*
 *    ambient module rather than augmenting the real one.
 *
 * This file can go away once jest-dom targets Vitest 4's extension point.
 */
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module '@vitest/expect' {
  // Intentionally adds no members of its own: the whole point is to pull
  // jest-dom's matcher signatures into the interface Vitest extends.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Matchers<T = any> extends TestingLibraryMatchers<void, T> {}
}

export {};
