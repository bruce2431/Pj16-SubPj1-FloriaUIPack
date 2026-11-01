// 管理页通用 UI（列表页壳 + 网格 + 详情头）：插件 / 技能 / 应用、模型等「列表 → 详情」页共用。
// 只吃**纯数据 + 回调**：不读 Floria state、不碰网关、不认识「插件/应用」这些业务概念。
// 业务侧负责数据、过滤、启停与详情内容；本件只负责结构与 DOM 绑定。
// 样式在 mgr.css（随 floria-web.css 一起发布），图标/转义取自包内。
import { I } from './icons.js'
import { esc } from './dom.js'

// 无图标项的色块取色（稳定哈希，同名恒同色）
const MGR_PALETTE = ['#5b8ff9', '#61a1c2', '#7b6bd6', '#5aa57a', '#d98a4a', '#c96a6a', '#4aa3a0', '#a06ba8', '#6b8f71', '#b48a5a']

export function mgrColor(name) {
  let h = 0
  for (const c of String(name || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return MGR_PALETTE[h % MGR_PALETTE.length]
}

// 动作位（细线 + = 未启用 / ✓ = 已启用）。给了 key 才是可点开关；不给 = 纯状态指示。
export function mgrActionHtml(on, opts = {}) {
  const key = opts.key ? ` data-mgr-action="${esc(opts.key)}"` : ''
  return `<button class="mgr-act-btn${on ? ' on' : ''}"${key} title="${esc(opts.title || '')}">${on ? I.dshCheck : I.dshPlus}</button>`
}

// 图标块：item.icon（SVG 字符串）优先，否则色块首字。
export function mgrIconHtml(item, big) {
  const cls = big ? 'mgr-dl-ic' : 'mgr-ic'
  if (item.icon) return `<div class="${cls} ic">${item.icon}</div>`
  const name = String(item.name || item.key || '')
  const initial = item.initial || (name[0] || '?').toUpperCase()
  const color = item.color || mgrColor(name)
  return `<div class="${cls}" style="background:${esc(color)}">${esc(initial)}</div>`
}

// 列表卡：图标 + 名称/描述 + 动作位。
// item = { key, name, desc, icon?, color?, initial?, action?: { on, key?, title? } }
export function mgrCardHtml(item) {
  const act = item.action ? mgrActionHtml(item.action.on, item.action) : ''
  return (
    `<div class="mgr-card" data-mgr-key="${esc(item.key)}">` +
    mgrIconHtml(item) +
    `<div class="mgr-meta"><div class="mgr-name">${esc(item.name)}</div>` +
    `<div class="mgr-desc">${esc(item.desc || '暂无描述')}</div></div>` +
    act +
    '</div>'
  )
}

// 只重渲网格（搜索输入时用，不重建壳、不丢焦点）。opts 同 mgrBrowse。
export function mgrGrid(host, o = {}) {
  const grid = host.querySelector('[data-mgr-grid]')
  if (!grid) return
  if (o.loading) {
    grid.innerHTML = `<div class="mgr-empty">${esc(o.loading)}</div>`
    return
  }
  if (o.error) {
    const msg = typeof o.error === 'string' ? o.error : o.error.message || String(o.error)
    grid.innerHTML =
      `<div class="mgr-empty">清单加载失败：${esc(msg)}<br>` +
      `<button class="mgr-retry" type="button" data-mgr-retry>重试</button></div>`
    if (o.onRetry) grid.querySelector('[data-mgr-retry]').addEventListener('click', () => o.onRetry())
    return
  }
  const items = o.items || []
  grid.innerHTML = items.length
    ? items.map(mgrCardHtml).join('')
    : `<div class="mgr-empty">${esc(o.empty || '没有匹配项')}</div>`
  const byKey = new Map(items.map((it) => [it.key, it]))
  grid.querySelectorAll('.mgr-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const key = card.dataset.mgrKey
      const act = e.target.closest('.mgr-act-btn')
      if (act && act.dataset.mgrAction) {
        e.stopPropagation()
        if (o.onAction) o.onAction(act.dataset.mgrAction, byKey.get(key))
        return
      }
      if (o.onItem) o.onItem(key, byKey.get(key))
    })
  })
}

// 列表页壳（分段切换 + 标题 + 搜索 + 分类 + 网格 + 脚注）。
// o = {
//   kinds?: [{id,label}], kind?, actionsHtml?: 右上角自定义 HTML,
//   title, sub?, search?: {placeholder, value?}, cats?: [{id,label}], cat?,
//   items, empty?, loading?, error?, foot?,
//   onKind?(id), onCat?(id), onSearch?(q), onItem?(key,item), onAction?(key,item), onRetry?()
// }
export function mgrBrowse(host, o = {}) {
  const kinds = o.kinds || []
  const cats = o.cats || []
  const s = o.search
  host.innerHTML =
    '<div class="mgr-pane">' +
    '<div class="mgr-top">' +
    (kinds.length
      ? '<div class="mgr-kind">' +
        kinds.map((k) => `<button class="mgr-kind-btn${k.id === o.kind ? ' on' : ''}" data-mgr-kind="${esc(k.id)}">${esc(k.label)}</button>`).join('') +
        '</div>'
      : '<span></span>') +
    (o.actionsHtml ? `<div class="mgr-acts">${o.actionsHtml}</div>` : '') +
    '</div>' +
    `<div class="mgr-head"><h2 class="mgr-title">${esc(o.title || '')}</h2>` +
    (o.sub ? `<div class="mgr-sub">${esc(o.sub)}</div>` : '') +
    '</div>' +
    (s
      ? `<div class="mgr-search">${I.mag}<input type="text" data-mgr-q placeholder="${esc(s.placeholder || '搜索…')}" value="${esc(s.value || '')}"></div>`
      : '') +
    (cats.length
      ? '<div class="mgr-cats">' +
        cats.map((c) => `<button class="mgr-cat${c.id === o.cat ? ' on' : ''}" data-mgr-cat="${esc(c.id)}">${esc(c.label)}</button>`).join('') +
        '</div>'
      : '') +
    '<div class="mgr-grid" data-mgr-grid></div>' +
    (o.foot ? `<div class="mgr-foot">${esc(o.foot)}</div>` : '') +
    '</div>'

  host.querySelectorAll('[data-mgr-kind]').forEach((b) =>
    b.addEventListener('click', () => o.onKind && o.onKind(b.dataset.mgrKind)),
  )
  host.querySelectorAll('[data-mgr-cat]').forEach((b) =>
    b.addEventListener('click', () => o.onCat && o.onCat(b.dataset.mgrCat)),
  )
  const q = host.querySelector('[data-mgr-q]')
  if (q && o.onSearch) q.addEventListener('input', () => o.onSearch(q.value))
  mgrGrid(host, o)
}

// 详情页（面包屑返回 + 大图标头 + 介绍 + 信息表）。
// o = {
//   typeLabel, name, sub?, icon?, color?, initial?, action?: {on,key?,title?},
//   desc?, info?: [[label, value]], extraHtml?: 自定义信息行（业务 HTML，调用方负责转义）,
//   onBack?(), onAction?(key, item), onMounted?(host)
// }
export function mgrDetail(host, o = {}) {
  const info = (o.info || [])
    .map(([k, v]) => `<div class="mgr-dl-kvrow"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('')
  host.innerHTML =
    '<div class="mgr-pane mgr-detail">' +
    `<div class="mgr-crumb"><button class="mgr-back" type="button" data-mgr-back>${I.collapse}<span>${esc(o.typeLabel || '')}</span></button>` +
    (o.name ? `<span class="mgr-crumb-sep">/</span><span class="mgr-crumb-cur">${esc(o.name)}</span>` : '') +
    '</div>' +
    '<div class="mgr-dl-hd">' +
    mgrIconHtml({ icon: o.icon, color: o.color, name: o.name, initial: o.initial }, true) +
    `<div class="mgr-dl-hdmeta"><h2 class="mgr-dl-name">${esc(o.name || '')}</h2>` +
    (o.sub ? `<div class="mgr-dl-sub">${esc(o.sub)}</div>` : '') +
    '</div>' +
    (o.action ? mgrActionHtml(o.action.on, o.action) : '') +
    '</div>' +
    `<p class="mgr-dl-desc">${esc(o.desc || '暂无介绍。')}</p>` +
    '<div class="mgr-dl-sec"><h3 class="mgr-dl-sech">信息</h3><dl class="mgr-dl-kv">' +
    info +
    (o.extraHtml || '') +
    '</dl></div>' +
    '</div>'

  const back = host.querySelector('[data-mgr-back]')
  if (back && o.onBack) back.addEventListener('click', () => o.onBack())
  const act = host.querySelector('[data-mgr-action]')
  if (act && o.onAction) act.addEventListener('click', () => o.onAction(act.dataset.mgrAction, o))
  if (o.onMounted) o.onMounted(host)
}

export const mgr = {
  color: mgrColor,
  actionHtml: mgrActionHtml,
  iconHtml: mgrIconHtml,
  cardHtml: mgrCardHtml,
  grid: mgrGrid,
  browse: mgrBrowse,
  detail: mgrDetail,
}
