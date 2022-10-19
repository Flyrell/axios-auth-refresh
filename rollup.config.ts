import { defineConfig } from 'rollup';
import rollupTypescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default defineConfig({
    plugins: [rollupTypescript(), terser()],
    input: 'src/index.ts',
    output: {
        file: 'dist/index.min.js',
        name: 'axios-auth-refresh',
        format: 'umd',
        globals: {
            axios: 'axios',
        },
    },
    external: ['axios'],
});
