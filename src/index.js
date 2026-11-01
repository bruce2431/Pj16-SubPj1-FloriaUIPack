// @floria/web 公共入口（ESM 形态）。IIFE 形态见 global.js。
export { I, fileIcon } from './icons.js'
export { esc, fromHtml } from './dom.js'
// 管理页通用 UI（列表页壳 / 搜索 / 分类 / 卡片 / 动作位 / 详情头）：纯数据 + 回调，样式见 mgr.css
export { mgr, mgrColor, mgrActionHtml, mgrIconHtml, mgrCardHtml, mgrGrid, mgrBrowse, mgrDetail } from './mgr.js'

export const VERSION = '0.2.0'
