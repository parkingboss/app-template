import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import getPort from "get-port";

const production = !process.env.ROLLUP_WATCH;

async function getConfig() {
  return {
    input: "src/scripts/app.js",

    output: {
      sourcemap: true,
      format: "iife",
      name: "app",
      file: "public/app.js"
    },

    plugins: [
      svelte({
        dev: !production
      }),

      resolve({
        browser: true,
        dedupe: importee =>
          importee === "svelte" || importee.startsWith("svelte/")
      }),

      commonjs(),

      copy({
        targets: [
          { src: "src/index.html", dest: "public" },
          { src: "src/assets/**/*", dest: "public" }
        ]
      }),

      !production && serve(),

      !production && livereload({
				name: "public",
				port: await getPort(),
				exclusions: ["./rollup.config.js"]
			}),

      production && terser()
    ],

    watch: {
      clearScreen: false
    }
  };

  function serve() {
    let started = false;

    return {
      writeBundle() {
        if (!started) {
          started = true;

          require("child_process").spawn(
            "npm",
            ["run", "start", "--", "--dev"],
            {
              stdio: ["ignore", "inherit", "inherit"],
              shell: true
            }
          );
        }
      }
    };
  }
}

export default getConfig();