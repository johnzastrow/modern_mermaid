// NOTE: jest-dom's matchers work at runtime but do NOT typecheck under
// vitest 4 — jest-dom 6.9.1 augments `Assertion` in module 'vitest', while
// vitest 4 re-exports that interface from '@vitest/expect', so the
// augmentation never merges. Until jest-dom moves off the 6.x pin (see
// CHANGELOG 0.1.1), assert with plain matchers in tests rather than
// toBeInTheDocument and friends.
import '@testing-library/jest-dom';
