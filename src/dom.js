// 通用 DOM 工具：只在「无项目状态」的纯函数范围内——不读 state、不碰具体容器，
// 项目状态相关的工具（toast / 设备判定 / 会话落项目）留在 Floria core/util.js。

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// 由 HTML 字符串取单个根元素（模板拼装后需要挂事件/取句柄时用；多根/空串抛错，避免静默取错）
function fromHtml(html) {
  const t = document.createElement('template')
  t.innerHTML = String(html).trim()
  const nodes = t.content.children
  if (nodes.length !== 1) throw new Error(`fromHtml：期望单根元素，实得 ${nodes.length}`)
  return nodes[0]
}

export { esc, fromHtml }
