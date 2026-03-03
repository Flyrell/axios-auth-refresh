/**
 * Runner — executes all examples and reports pass/fail.
 *
 * Usage: npx tsx examples/run-all.ts
 */

import { readdirSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, basename } from 'path';

const examplesDir = resolve(__dirname);
const self = basename(__filename);

const files = readdirSync(examplesDir)
    .filter((f) => f.endsWith('.ts') && f !== self && !f.startsWith('_'))
    .sort();

let passed = 0;
let failed = 0;

for (const file of files) {
    const filePath = resolve(examplesDir, file);
    const name = file.replace(/\.ts$/, '');

    try {
        execSync(`npx tsx ${filePath}`, {
            timeout: 10_000,
            stdio: 'pipe',
            cwd: resolve(examplesDir, '..'),
        });
        console.log(`  PASS  ${name}`);
        passed++;
    } catch (error: any) {
        const output = error.stdout?.toString() || '';
        const errOutput = error.stderr?.toString() || '';
        console.log(`  FAIL  ${name}`);
        if (output) console.log(output);
        if (errOutput) console.log(errOutput);
        failed++;
    }
}

console.log(`\nResults: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failed > 0) {
    process.exit(1);
}
