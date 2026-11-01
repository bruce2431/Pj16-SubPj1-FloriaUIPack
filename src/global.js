// IIFE 入口：classic script 加载后暴露 window.FloriaWeb。
// Floria 侧的 core/icons.js 转调本全局；缺包时直接抛错（不兜底、不回落到本地副本）。
import * as web from './index.js'

window.FloriaWeb = web
