import path from 'node:path'
import { defineConfig } from 'tsup'
import tailwindcss from '@tailwindcss/postcss'
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
import type { PluginBuild, BuildOptions } from 'esbuild'

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production'
const outDir = path.resolve(packageRoot, 'dist-tsup')
const { routeFlags } = await resolveSelectedRoutes({
  mode,
  interactive: false,
})

export default defineConfig({
  entry: [path.resolve(packageRoot, 'src/main.tsx')],
  outDir,
  format: 'esm',
  splitting: true,
  sourcemap: true,
  minify: mode === 'production',
  clean: true,
  treeshake: false,
  esbuildOptions(options: BuildOptions) {
    options.jsx = 'automatic'
    options.alias = {
      '@': path.resolve(packageRoot, 'src'),
    }
    options.entryNames = 'assets/[name]-[hash]'
    options.chunkNames = 'assets/[name]-[hash]'
    options.assetNames = 'assets/[name]-[hash]'
    options.conditions = ['style']
    options.loader = {
      ...options.loader,
      '.gif': 'file',
      '.jpeg': 'file',
      '.jpg': 'file',
      '.png': 'file',
      '.svg': 'file',
    }
    options.define = {
      ...options.define,
      ...toProcessEnvDefineMap(createClientEnv(mode, routeFlags)),
    }
  },
  esbuildPlugins: [
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
    (() => {
      const plugin = postcssPlugin({
        plugins: [tailwindcss()],
        disableCache: true as const,
      })
      return {
        name: plugin.name,
        setup(build: PluginBuild) {
          // @ts-ignore
          plugin.setup(build)
        },
      }
    })(),
  ],
  async onSuccess() {
    const fs = await import('node:fs/promises')
    const metafilePath = path.resolve(outDir, 'metafile-esm.json')
    let scripts: string[] = []
    let styles: string[] = []

    try {
      const raw = await fs.readFile(metafilePath, 'utf8')
      const metafile = JSON.parse(raw)
      const outputs = Object.keys(metafile.outputs ?? {})

      scripts = outputs
        .filter((file: string) => file.endsWith('.js') && metafile.outputs[file]?.entryPoint)
        .map(
          (file: string) =>
            `./${path.relative(outDir, path.resolve(packageRoot, file)).replaceAll('\\', '/')}`,
        )

      styles = outputs
        .filter((file: string) => file.endsWith('.css'))
        .map(
          (file: string) =>
            `./${path.relative(outDir, path.resolve(packageRoot, file)).replaceAll('\\', '/')}`,
        )
    } catch {
      const entries = await fs.readdir(path.resolve(outDir, 'assets'), { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isFile()) {
          if (entry.name.endsWith('.js')) scripts.push(`./assets/${entry.name}`)
          if (entry.name.endsWith('.css')) styles.push(`./assets/${entry.name}`)
        }
      }
    }

    await copyPublicAssets(outDir)
    await writeHtmlFile({ outDir, scripts, styles })
  },
  metafile: true,
})
