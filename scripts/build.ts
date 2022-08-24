#!/usr/bin/env tsx

import path from 'path'
import { build } from 'vite'
import { build as electron } from 'electron-builder'

Promise.resolve()
  .then(() => build({
    configFile: path.join(__dirname, '../packages/main/vite.config.ts'),
  }))
  .then(() => build({
    configFile: path.join(__dirname, '../packages/preload/vite.config.ts'),
  }))
  .then(() => build({
    configFile: path.join(__dirname, '../packages/renderer/vite.config.ts'),
  }))
  .then(() => electron({ config: path.join(__dirname, '../electron-builder.js') }))
