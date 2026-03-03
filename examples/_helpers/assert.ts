/**
 * Thin assertion helpers — no test framework needed.
 * Failures call process.exit(1) with a clear message.
 */

export function assertEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
        const label = message ? `${message}: ` : '';
        console.error(`  FAIL  ${label}expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        process.exit(1);
    }
}

export function assert(condition: boolean, message?: string): void {
    if (!condition) {
        console.error(`  FAIL  ${message ?? 'Assertion failed'}`);
        process.exit(1);
    }
}
