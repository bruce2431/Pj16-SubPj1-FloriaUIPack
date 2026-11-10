// @floria/web 公共入口（ESM 形态）。IIFE 形态见 global.js。
export { I, fileIcon } from './icons.js'
export { esc, fromHtml } from './dom.js'
// 管理页通用 UI（列表页壳 / 搜索 / 分类 / 卡片 / 动作位 / 详情头）：纯数据 + 回调，样式见 mgr.css
export { mgr, mgrColor, mgrActionHtml, mgrIconHtml, mgrCardHtml, mgrGrid, mgrBrowse, mgrDetail } from './mgr.js'
// 交付卡与文件变更卡（纯 UI 组件族）：纯数据进、HTML 出，样式见 delivery.css
export { deliverGridHtml, changesCardHtml } from './delivery.js'

export const VERSION = '0.3.0'
