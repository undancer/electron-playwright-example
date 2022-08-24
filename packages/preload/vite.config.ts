import path from 'path'
import { builtinModules } from 'module'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  plugins: [],
  build: {
    outDir: path.join(__dirname, '../../dist/preload'),
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      external: [
        ...['electron', /electron\/(common|main|renderer)/g],
        ...builtinModules.flatMap(module => [module, `node:${module}`]),
      ],
      input: {
        index: path.join(__dirname, 'src/index.ts'),
      },
      output: {
        format: 'cjs',
        entryFileNames: () => '[name].js',
      },
    },
  },
})
