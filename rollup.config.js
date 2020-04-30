import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import svelte from 'rollup-plugin-svelte';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import watchAssets from 'rollup-plugin-watch-assets';
import getPort from 'get-port';

const production = !process.env.ROLLUP_WATCH;

async function getConfig() {
    return {
        input: 'src/scripts/app.js',

        output: {
            sourcemap: true,
            format: 'iife',
            name: 'app',
            file: 'public/app.js',
        },

        plugins: [
            replace({
                DEV: JSON.stringify(!production),
                PROD: JSON.stringify(production),
            }),

            alias({
                entries: {
                    '~': __dirname + '/src/scripts',
                },
            }),

            svelte({
                dev: !production,
            }),

            resolve({
                dedupe: (importee) => importee === 'svelte' || importee.startsWith('svelte/'),
            }),

            commonjs(),

            watchAssets({
                assets: ['src/index.html', 'src/assets/*', 'src/assets/**/*'],
            }),

            copy({
                targets: [
                    { src: 'src/index.html', dest: 'public' },
                    { src: 'src/assets/**/*', dest: 'public' },
                ],
            }),

            !production && serve(),

            !production &&
                livereload({
                    name: 'public',
                    port: await getPort(),
                    exclusions: ['./rollup.config.js'],
                }),

            production && terser(),
        ],

        watch: {
            clearScreen: false,
        },
    };

    function serve() {
        let started = false;

        return {
            writeBundle() {
                if (!started) {
                    started = true;

                    require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                        stdio: ['ignore', 'inherit', 'inherit'],
                        shell: true,
                    });
                }
            },
        };
    }
}

export default getConfig();
