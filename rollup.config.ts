import rollupTypescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';

export default defineConfig({
    plugins: [del({ targets: 'dist/*' }), rollupTypescript(), terser()],
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        entryFileNames: 'index.min.js',
        name: 'axios-auth-refresh',
        format: 'umd',
        sourcemap: true,
        globals: {
            axios: 'axios',
        },
    },
    external: ['axios'],
});
