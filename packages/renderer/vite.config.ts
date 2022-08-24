import path from 'path'
import { defineConfig, loadConfigFromFile, mergeConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig(async env => ({
  root: __dirname,
  plugins: [
    ...electron({
      main: {
        entry: path.join(__dirname, '../main/src/index.ts'),
        vite: mergeConfig(
          (await loadConfigFromFile(
            env,
            path.join(__dirname, '../main/vite.config.ts'),
          ))!.config,
          defineConfig({
            build: {
              outDir: path.join(__dirname, '../../dist/main'),
            },
          }),
        ),
      },
      preload: {
        input: {
          preload: path.join(__dirname, '../preload/src/index.ts'),
        },
        vite: mergeConfig(
          (await loadConfigFromFile(
            env,
            path.join(__dirname, '../preload/vite.config.ts'),
          ))!.config,
          defineConfig({
            build: {
              outDir: path.join(__dirname, '../../dist/preload'),
            },
          }),
        ),
      },
    }).filter(({ apply }) => apply !== 'build'),
    ...renderer({}).filter(({ apply }) => apply !== 'serve'),
  ],
  build: {
    outDir: path.join(__dirname, '../../dist/renderer'),
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      // input: {
      //   index: path.join(__dirname, 'src/renderer/index.html'),
      // },
      // output: {
      // },
    },
  },
}))
