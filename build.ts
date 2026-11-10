/**
 * 构建三份产物：
 *   dist/index.js             单文件 ESM（npm / 动态 import）
 *   dist/floria-web.iife.js   全局 IIFE（classic script，挂 window.FloriaWeb）
 *   dist/floria-web.css       主题令牌 + 全局基础样式 + 管理页通用 UI（theme.css + mgr.css）
 * 启动前先清空 dist/，避免旧文件残留。
 */
import { rm } from 'node:fs/promises'

const root = import.meta.dir
await rm(`${root}/dist`, { recursive: true, force: true })

async function build(entry, naming, format) {
  const result = await Bun.build({
    entrypoints: [`${root}/${entry}`],
    outdir: `${root}/dist`,
    naming,
    target: 'browser',
    format,
    minify: true,
    sourcemap: 'linked',
  })
  if (!result.success) {
    for (const log of result.logs) console.error(log)
    process.exit(1)
  }
  const text = await Bun.file(`${root}/dist/${naming}`).text()
  if (format === 'esm' && /export\s*\{/.test(text) === false) {
    console.error('[build] ESM 产物缺少 export')
    process.exit(1)
  }
  if (format === 'iife' && !text.includes('window.FloriaWeb')) {
    console.error('[build] IIFE 产物缺少 window.FloriaWeb')
    process.exit(1)
  }
  console.log(`[build] dist/${naming} ${(text.length / 1024).toFixed(0)} KB`)
}

await build('src/index.js', 'index.js', 'esm')
await build('src/global.js', 'floria-web.iife.js', 'iife')

const theme = await Bun.file(`${root}/src/theme.css`).text()
for (const token of [':root', 'html[data-theme="dark"]', '--bg:', '--plane:', '--ink:']) {
  if (!theme.includes(token)) {
    console.error(`[build] theme.css 缺少 ${token}`)
    process.exit(1)
  }
}
// 管理页通用 UI 的样式（mgr.js 配套）：与令牌同文件发布，消费方只引 floria-web.css 一件。
const mgrCss = await Bun.file(`${root}/src/mgr.css`).text()
if (!mgrCss.includes('.mgr-card ') || !mgrCss.includes('.mgr-detail ')) {
  console.error('[build] mgr.css 缺少 .mgr-card/.mgr-detail')
  process.exit(1)
}
// 交付卡 / 文件变更卡（delivery.js 配套）：同文件发布，消费方只引 floria-web.css 一件。
const deliveryCss = await Bun.file(`${root}/src/delivery.css`).text()
if (!deliveryCss.includes('.dlv-file ') || !deliveryCss.includes('.chg-row ')) {
  console.error('[build] delivery.css 缺少 .dlv-file/.chg-row')
  process.exit(1)
}
const css = `${theme}\n\n${mgrCss}\n\n${deliveryCss}`
await Bun.write(`${root}/dist/floria-web.css`, css)
console.log(`[build] dist/floria-web.css ${(css.length / 1024).toFixed(1)} KB`)
