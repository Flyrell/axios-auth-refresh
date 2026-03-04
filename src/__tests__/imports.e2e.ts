import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const rootDir = path.resolve(__dirname, '../..');
const distDir = path.resolve(rootDir, 'dist');

function run(script: string): string {
    return execSync(script, { cwd: rootDir, encoding: 'utf-8' }).trim();
}

describe('e2e import tests (against built dist)', () => {
    beforeAll(() => {
        // Ensure dist exists
        const cjsExists = fs.existsSync(path.join(distDir, 'index.cjs.js'));
        const esmExists = fs.existsSync(path.join(distDir, 'index.esm.js'));
        if (!cjsExists || !esmExists) {
            throw new Error('dist/ not found. Run `npm run build` before running e2e import tests.');
        }
    });

    it('CJS require() returns the default function directly', () => {
        const output = run(`node -e "const lib = require('./dist/index.cjs.js'); console.log(typeof lib)"`);
        expect(output).toBe('function');
    });

    it('CJS require() exposes named export createAuthRefresh', () => {
        const output = run(
            `node -e "const lib = require('./dist/index.cjs.js'); console.log(typeof lib.createAuthRefresh)"`,
        );
        expect(output).toBe('function');
    });

    it('CJS require() exposes deprecated createAuthRefreshInterceptor alias', () => {
        const output = run(
            `node -e "const lib = require('./dist/index.cjs.js'); console.log(typeof lib.createAuthRefreshInterceptor)"`,
        );
        expect(output).toBe('function');
    });

    it('ESM default import returns a function', async () => {
        const output = run(
            `node --input-type=module -e "import createAuthRefresh from './dist/index.esm.js'; console.log(typeof createAuthRefresh)"`,
        );
        expect(output).toBe('function');
    });

    it('ESM named import { createAuthRefresh } returns a function', async () => {
        const output = run(
            `node --input-type=module -e "import { createAuthRefresh } from './dist/index.esm.js'; console.log(typeof createAuthRefresh)"`,
        );
        expect(output).toBe('function');
    });

    it('ESM named import { createAuthRefreshInterceptor } returns a function', async () => {
        const output = run(
            `node --input-type=module -e "import { createAuthRefreshInterceptor } from './dist/index.esm.js'; console.log(typeof createAuthRefreshInterceptor)"`,
        );
        expect(output).toBe('function');
    });
});
