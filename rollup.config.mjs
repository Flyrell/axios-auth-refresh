import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/index.ts',
    external: ['axios'],
    plugins: [
        typescript({
            declaration: true,
            declarationDir: 'dist',
            rootDir: 'src',
        }),
        terser(),
    ],
    output: [
        {
            file: 'dist/index.cjs.js',
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
            outro: 'module.exports = Object.assign(exports.default, exports);',
        },
        {
            file: 'dist/index.esm.js',
            format: 'esm',
            sourcemap: true,
        },
    ],
};
