import path from 'node:path'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import url from '@rollup/plugin-url'
import {
  defineConfig,
  type OutputBundle,
  type OutputOptions,
  type Plugin as RollupPlugin,
  type RollupOptions,
} from 'rollup'
import postcss from 'rollup-plugin-postcss'
import RollupConditionalBundlePlugin from '@lark.js/conditional-bundle-plugin/rollup'
import {
  copyPublicAssets,
  createClientEnv,
  createConditionalVars,
  createHtmlDocument,
  packageRoot,
  resolveSelectedRoutes,
  toProcessEnvDefineMap,
} from './common.js'

const mode: 'development' | 'production' =
  process.env.NODE_ENV === 'development' ? 'development' : 'production'
const isProduction = mode === 'production'
const outDir = path.resolve(packageRoot, 'dist-rollup')
const { routeFlags } = await resolveSelectedRoutes({
  mode,
  interactive: false,
})

/**
 * Emits `index.html` and copies public assets after Rollup writes bundles.
 */
function emitHtmlAndPublicAssets(): RollupPlugin {
  return {
    name: 'emit-html-and-public-assets',
    async generateBundle(_outputOptions: OutputOptions, bundle: OutputBundle): Promise<void> {
      const scripts: string[] = []
      const styles: string[] = []

      for (const [fileName, item] of Object.entries(bundle)) {
        if (item.type === 'chunk' && item.isEntry) {
          scripts.push(`./${fileName}`)
        }

        if (item.type === 'asset' && fileName.endsWith('.css')) {
          styles.push(`./${fileName}`)
        }
      }

      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: await createHtmlDocument({ scripts, styles }),
      })
    },
    async writeBundle(): Promise<void> {
      await copyPublicAssets(outDir)
    },
  }
}

const rollupOptions: RollupOptions = {
  input: path.resolve(packageRoot, 'src/main.tsx'),
  output: {
    dir: outDir,
    format: 'esm',
    sourcemap: true,
    entryFileNames: 'assets/[name]-[hash].js',
    chunkFileNames: 'assets/[name]-[hash].js',
    assetFileNames: 'assets/[name]-[hash][extname]',
  },
  plugins: [
    RollupConditionalBundlePlugin({
      includes: ['**/*.ts', '**/*.tsx'],
      vars: createConditionalVars(routeFlags),
    }),
    replace({
      preventAssignment: true,
      values: toProcessEnvDefineMap(createClientEnv(mode, routeFlags)),
    }),
    alias({
      entries: [{ find: '@', replacement: path.resolve(packageRoot, 'src') }],
    }),
    resolve({
      browser: true,
      extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx'],
    }),
    commonjs(),
    url({
      include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
      fileName: 'assets/[name]-[hash][extname]',
      limit: 0,
    }),
    postcss({
      extract: 'assets/main.css',
      minimize: isProduction,
      sourceMap: true,
      config: {
        path: path.resolve(packageRoot, 'postcss.config.mjs'),
        ctx: {},
      },
      extensions: ['.css', '.scss'],
      use: ['sass'],
    }),
    typescript({
      tsconfig: path.resolve(packageRoot, 'tsconfig.json'),
      compilerOptions: {
        noEmit: false,
        outDir: path.resolve(outDir, '.ts-temp'),
      },
    }),
    emitHtmlAndPublicAssets(),
  ],
}

export default defineConfig(rollupOptions)
