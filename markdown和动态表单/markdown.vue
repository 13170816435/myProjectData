<template>
  <div class="container">
    <div class="markdown-app">
      <header class="header">
        <h1>Vue3 Markdown 渲染器</h1>
        <p>基于 marked + highlight.js 的专业 Markdown 编辑器</p>
      </header>

      <div class="app-content">
        <div class="editor-container">
          <div class="editor-header">
            <h2>Markdown 编辑器</h2>
            <div class="editor-actions">
              <button class="btn btn-secondary" @click="clearContent">
                <i class="fas fa-trash"></i> 清空
              </button>
              <button class="btn btn-primary" @click="exportHTML">
                <i class="fas fa-download"> 导出HTML</i>
              </button>
            </div>
          </div>
          <textarea 
            v-model="markdownText" 
            class="textarea" 
            placeholder="在此输入 Markdown 内容..."
            @input="handleInput"
          ></textarea>
        </div>

        <div class="preview-container">
          <div class="preview-header">
            <h2>实时预览</h2>
            <div class="word-count">
              字数: {{ wordCount }} | 字符: {{ charCount }}
            </div>
          </div>
          <div 
            class="preview" 
            v-html="renderedHTML"
          ></div>
        </div>
      </div>

      <footer class="footer">
        <p>Powered by Vue 3 + TypeScript + marked + highlight.js</p>
      </footer>
    </div>
  </div>
</template>
<script setup lang="ts">

declare module 'marked' {
  interface MarkedOptions {
    highlight?: (code: string, lang: string) => string;
  }
}

import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
// import marked from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
console.log(typeof(marked))
// 在项目中创建 `types/marked.d.ts` 文件（或在组件文件顶部）


// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }/*  */).value
  },
  langPrefix: 'hljs language-',
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
})

// 响应式数据
const markdownText = ref('')

// 计算属性
const renderedHTML = computed(() => {
  if (!markdownText.value.trim()) {
    return '<p class="text-gray-500">预览将在此处显示...</p>'
  }
  
  const rawHTML = marked(markdownText.value)
  return DOMPurify.sanitize(rawHTML)
})

const wordCount = computed(() => {
  return markdownText.value.trim() ? markdownText.value.split(/\s+/).length : 0
})

const charCount = computed(() => {
  return markdownText.value.length
})

// 方法
const handleInput = () => {
  // 实时处理输入，可添加防抖等优化
}

const clearContent = () => {
  markdownText.value = ''
}

const exportHTML = () => {
  const blob = new Blob([renderedHTML.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'markdown-export.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 生命周期
onMounted(() => {
  // 初始化示例内容
  markdownText.value = `# Vue3 Markdown 渲染器示例

## 功能特性

- ✅ **实时预览** - 边写边看效果
- ✅ **代码高亮** - 支持多种编程语言
- ✅ **数学公式** - 支持 LaTeX 语法
- ✅ **安全渲染** - 使用 DOMPurify 防止 XSS 攻击
- ✅ **响应式设计** - 完美适配各种设备

## 代码示例

\`\`\`javascript
// Vue3 组合式API示例
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

function increment() {
  count.value++
}
\`\`\`

## 数学公式支持

行内公式：$E = mc^2$

块级公式：
$$
\\sum_{i=1}^n i = \\frac{n(n+1)}{2}
$$

## 表格示例

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown 解析 | ✅ 完成 | 使用 marked 库 |
| 代码高亮 | ✅ 完成 | 使用 highlight.js |
| 安全过滤 | ✅ 完成 | 使用 DOMPurify |
| 主题切换 | 🔄 开发中 | 多套配色方案 |

## 引用块

> 这是一个优雅的 Markdown 渲染解决方案，结合了现代 Web 技术的最佳实践。
> 提供了出色的用户体验和开发体验。

**开始编写你的 Markdown 文档吧！**`
})
</script>
<style scoped>
.app-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  min-height: 600px;
}

@media (max-width: 1024px) {
  .app-content {
    grid-template-columns: 1fr;
  }
}

.word-count {
  color: #6c757d;
  font-size: 0.9rem;
}
</style>