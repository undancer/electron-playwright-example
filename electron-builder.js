/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  directories: {
    output: 'dist/electron',
  },
  // publish: null,
  // npmRebuild: false,
  // buildDependenciesFromSource: true,
  electronDownload: {
    mirror: 'https://npmmirror.com/mirrors/electron/',
  },
  files: [
    'dist/main/**/*',
    'dist/preload/**/*',
    'dist/renderer/**/*',
  ],
  asar: false,
  mac: {
    target: ['dir'],
  },
}
module.exports = config
