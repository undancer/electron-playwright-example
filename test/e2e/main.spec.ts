/**
 * Example Playwright script for Electron
 * showing/testing various API features
 * in both renderer and main processes
 */

import path from 'path'
import { expect, test } from '@playwright/test'
import {
  clickMenuItemById,
  findLatestBuild,
  ipcMainCallFirstListener,
  ipcMainInvokeHandler,
  ipcRendererCallFirstListener,
  ipcRendererInvoke,
  parseElectronApp,
} from 'electron-playwright-helpers'
import jimp from 'jimp'
import { ElectronApplication, Page, _electron as electron } from 'playwright'

let electronApp: ElectronApplication

test.beforeAll(async () => {
  // find the latest build in the out directory
  const latestBuild = findLatestBuild(path.join(__dirname, '../../dist/electron'))
  // parse the directory and find paths and other info
  const appInfo = parseElectronApp(latestBuild)
  // set the CI environment variable to true
  process.env.CI = 'e2e'
  electronApp = await electron.launch({
    args: [appInfo.main],
    executablePath: appInfo.executable,
  })
  electronApp.on('window', async (page) => {
    const filename = page.url()?.split('/').pop()
    console.log(`Window opened: ${filename}`)

    // capture errors
    page.on('pageerror', (error) => {
      console.error(error)
    })
    // capture console messages
    page.on('console', (msg) => {
      console.log(msg.text())
    })
  })
})

test.afterAll(async () => {
  await electronApp.close()
})

let page: Page

test('renders the first page', async () => {
  page = await electronApp.firstWindow()
  await page.waitForSelector('h1')
  const text = await page.$eval('h1', el => el.textContent)
  expect(text).toBe('Hello World!')
  const title = await page.title()
  expect(title).toBe('Window 1')
})

test('"create new window" button exists', async () => {
  expect(await page.$('#new-window')).toBeTruthy()
})

test('click the button to open new window', async () => {
  await page.click('#new-window')
  const newPage = await electronApp.waitForEvent('window')
  expect(newPage).toBeTruthy()
  page = newPage
})

test('window 2 has correct title', async () => {
  const title = await page.title()
  expect(title).toBe('Window 2')
})

test('trigger IPC listener via main process', async () => {
  electronApp.evaluate(({ ipcMain }) => {
    ipcMain.emit('new-window')
  })
  const newPage = await electronApp.waitForEvent('window')
  expect(newPage).toBeTruthy()
  expect(await newPage.title()).toBe('Window 3')
  page = newPage
})

test('send IPC message from renderer', async () => {
  // evaluate this script in render process
  // requires webPreferences.nodeIntegration true and contextIsolation false
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('electron').ipcRenderer.send('new-window')
  })
  const newPage = await electronApp.waitForEvent('window')
  expect(newPage).toBeTruthy()
  expect(await newPage.title()).toBe('Window 4')
  page = newPage
})

test('receive IPC invoke/handle via renderer', async () => {
  // evaluate this script in RENDERER process and collect the result
  const result = await ipcRendererInvoke(page, 'how-many-windows')
  expect(result).toBe(4)
})

test('receive IPC handle data via main', async () => {
  // evaluate this script in MAIN process and collect the result
  const result = await ipcMainInvokeHandler(electronApp, 'how-many-windows')
  expect(result).toBe(4)
})

test('receive synchronous data via ipcRendererCallFirstListener()', async () => {
  const data = await ipcRendererCallFirstListener(page, 'get-synchronous-data')
  expect(data).toBe('Synchronous Data')
})

test('receive asynchronous data via ipcRendererCallFirstListener()', async () => {
  const data = await ipcRendererCallFirstListener(
    page,
    'get-asynchronous-data',
  )
  expect(data).toBe('Asynchronous Data')
})

test('receive synchronous data via ipcMainCallFirstListener()', async () => {
  const data = await ipcMainCallFirstListener(
    electronApp,
    'main-synchronous-data',
  )
  expect(data).toBe('Main Synchronous Data')
})

test('receive asynchronous data via ipcMainCallFirstListener()', async () => {
  const data = await ipcMainCallFirstListener(
    electronApp,
    'main-asynchronous-data',
  )
  expect(data).toBe('Main Asynchronous Data')
})

test('select a menu item via the main process', async () => {
  await clickMenuItemById(electronApp, 'new-window')
  const newPage = await electronApp.waitForEvent('window')
  expect(newPage).toBeTruthy()
  expect(await newPage.title()).toBe('Window 5')
  page = newPage
})

test('make sure two screenshots of the same page match', async ({ page }) => {
  // take a screenshot of the current page
  const screenshot1: Buffer = await page.screenshot()
  // create a visual hash using Jimp
  const screenshot1hash = (await jimp.read(screenshot1)).hash()
  // take a screenshot of the page
  const screenshot2: Buffer = await page.screenshot()
  // create a visual hash using Jimp
  const screenshot2hash = (await jimp.read(screenshot2)).hash()
  // compare the two hashes
  expect(screenshot1hash).toEqual(screenshot2hash)
})
