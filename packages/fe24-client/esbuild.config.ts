import path from 'node:path'
import tailwindcss from '@tailwindcss/postcss'
import { build, PluginBuild, BuildOptions } from 'esbuild'
import { sassPlugin } from 'esbuild-sass-plugin'
import postcssPlugin from 'esbuild-postcss-plugin'
import EsbuildConditionalBundlePlugin from '@lark.js/conditional-bundle-plugin/esbuild'
import {
  copyPublicAssets,
  createClientEnv,
  createConditionalVars,
  packageRoot,
  resolveSelectedRoutes,
  toProcessEnvDefineMap,
  writeHtmlFile,
} from './common.js'

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production'
const outDir = path.resolve(packageRoot, 'dist-esbuild')
const { routeFlags } = await resolveSelectedRoutes({
  mode,
  interactive: false,
})

const stylePluginOptions = {
  plugins: [tailwindcss()],
  disableCache: true as const,
}

const buildOptions: BuildOptions = {
  absWorkingDir: packageRoot,
  entryPoints: [path.resolve(packageRoot, 'src/main.tsx')],
  outdir: outDir,
  bundle: true,
  format: 'esm',
  splitting: true,
  sourcemap: true,
  minify: mode === 'production',
  metafile: true,
  jsx: 'automatic',
  alias: {
    '@': path.resolve(packageRoot, 'src'),
  },
  entryNames: 'assets/[name]-[hash]',
  chunkNames: 'assets/[name]-[hash]',
  assetNames: 'assets/[name]-[hash]',
  conditions: ['style'],
  loader: {
    '.gif': 'file',
    '.jpeg': 'file',
    '.jpg': 'file',
    '.png': 'file',
    '.svg': 'file',
  },
  define: toProcessEnvDefineMap(createClientEnv(mode, routeFlags)),
  plugins: [
    EsbuildConditionalBundlePlugin({
      includes: ['**/*.ts', '**/*.tsx'],
      vars: createConditionalVars(routeFlags),
    }),
    sassPlugin({
      filter: /\.module\.scss$/,
      type: 'local-css',
    }),
    sassPlugin({
      filter: /\.scss$/,
      type: 'css',
    }),

    // createEsbuildPlugin
    (() => {
      const plugin = postcssPlugin(stylePluginOptions)
      return {
        name: plugin.name,
        setup(build: PluginBuild) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          plugin.setup(build)
        },
      }
    })(),
  ],
}

const result = await build(buildOptions)

const metafile = result.metafile
const outputs = Object.keys(metafile?.outputs ?? {})

const scripts = outputs
  .filter((file) => file.endsWith('.js') && metafile?.outputs[file]?.entryPoint)
  .map(
    (file) => `./${path.relative(outDir, path.resolve(packageRoot, file)).replaceAll('\\', '/')}`,
  )

const styles = outputs
  .filter((file) => file.endsWith('.css'))
  .map(
    (file) => `./${path.relative(outDir, path.resolve(packageRoot, file)).replaceAll('\\', '/')}`,
  )

await copyPublicAssets(outDir)
await writeHtmlFile({
  outDir,
  scripts,
  styles,
})
