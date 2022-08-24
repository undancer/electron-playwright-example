import path from 'path'
import { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: path.join(__dirname, './test/e2e'),
  maxFailures: 2,
  // use: {
  //   video: 'on',
  // },
}

export default config
