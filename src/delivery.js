// 交付卡与文件变更卡（纯 UI 组件族）：只吃**纯数据**，不读业务状态、不碰网关。
//   deliverGridHtml(items)  交付物卡片：图标块 + 文件名 + 可选说明 + 行尾动作位（打开/更多）
//   changesCardHtml(files)  文件变更卡：标题行（单文件显示文件名，多文件显示数量）+ 逐行 ±
// 业务侧负责取数、相对路径与点击行为（按 data-* 钩子委托）。
// 样式在 delivery.css（随 floria-web.css 一起发布），图标/转义取自包内。
import { I, fileIcon } from './icons.js'
import { esc } from './dom.js'

// 超过该行数折叠（dsh changed-files 同值）
const COLLAPSED_ROWS = 4

// 单个交付物卡：item = { name, desc?, icon?, path? }
function deliverCardHtml(item) {
  const key = item.path || item.name || ''
  const icon = item.icon || fileIcon(item.name || '')
  const desc = item.desc ? `<span class="dlv-desc">${esc(item.desc)}</span>` : ''
  return (
    `<div class="dlv-file" data-deliver-name="${esc(key)}">` +
    `<button class="dlv-hit" type="button" data-deliver-open="${esc(key)}" title="${esc(item.hint || '在侧边栏预览')}"></button>` +
    `<span class="dlv-ic">${icon}</span>` +
    `<div class="dlv-body"><span class="dlv-name" title="${esc(item.name || '')}">${esc(item.name || '')}</span>${desc}</div>` +
    `<div class="dlv-acts"><button class="dlv-act" type="button" data-deliver-menu="${esc(key)}" title="更多">${I.dshChevDown}</button></div>` +
    '</div>'
  )
}

// 交付物卡片组：items = [{ name, desc?, icon?, path? }]
// 单件走单列（data-single），多的按两列网格排。
export function deliverGridHtml(items) {
  const list = Array.isArray(items) ? items.filter(Boolean) : []
  if (!list.length) return ''
  const single = list.length === 1 ? 'true' : 'false'
  return `<div class="dlv"><div class="dlv-grid" data-single="${single}">${list.map(deliverCardHtml).join('')}</div></div>`
}

// 文件变更卡：files = [{ path, added, removed }]（path 由业务侧归一为展示用相对路径）
// 单文件：标题「已编辑 <文件名>」；多文件：「已编辑 N 个文件」+ 合计 ±。
// 超过 COLLAPSED_ROWS 行时余下行收进 .chg-extra，由 .chg.open 展开（点击委托由业务侧绑 data-chg-toggle）。
export function changesCardHtml(files) {
  const list = Array.isArray(files) ? files.filter(Boolean) : []
  if (!list.length) return ''
  let totalAdd = 0
  let totalDel = 0
  for (const f of list) {
    totalAdd += f.added || 0
    totalDel += f.removed || 0
  }
  const one = list.length === 1
  const title = one
    ? `<span class="chg-title">已编辑 <span class="chg-name">${esc(list[0].path)}</span></span>`
    : `<span class="chg-title">已编辑 ${list.length} 个文件</span>`
  const tile = one ? fileIcon(list[0].path) : I.dshFile
  let rows = ''
  list.forEach((f, i) => {
    const extra = i >= COLLAPSED_ROWS ? ' chg-extra' : ''
    rows +=
      `<div class="chg-row${extra}"><span class="chg-ic">${fileIcon(f.path)}</span>` +
      `<span class="chg-path" title="${esc(f.path)}">${esc(f.path)}</span>` +
      `<span class="chg-add">+${f.added || 0}</span><span class="chg-del">-${f.removed || 0}</span></div>`
  })
  const more =
    list.length > COLLAPSED_ROWS
      ? `<button class="chg-toggle" type="button" data-chg-toggle>全部 ${list.length} 个文件</button>`
      : ''
  // 单文件：文件名已在标题行，不再重复列出明细行
  const body = one ? '' : `<div class="chg-list">${rows}</div>${more}`
  return (
    `<div class="chg${one ? ' chg-single' : ''}">` +
    `<div class="chg-head"><span class="chg-tile">${tile}</span>` +
    `<div class="chg-meta">${title}` +
    `<div class="chg-stat"><span class="chg-add">+${totalAdd}</span><span class="chg-del">-${totalDel}</span></div></div></div>` +
    body +
    '</div>'
  )
}
