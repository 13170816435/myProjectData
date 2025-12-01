import MarkdownIt from 'markdown-it'
import * as sub from 'markdown-it-sub'
import * as sup from 'markdown-it-sup'
import * as taskLists from 'markdown-it-task-lists'
import * as hljs from 'markdown-it-highlightjs'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

export function useMarkdown() {
  let md = null

  const initMd = () => {
    md = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true,
      quotes: '""\'\'',
    })
      .use(sub.default || sub)
      .use(sup.default || sup)
      .use(taskLists.default || taskLists)
      .use(hljs.default || hljs)

    // 自定义代码块渲染规则
    md.renderer.rules.fence = (tokens, idx) => {
      const token = tokens[idx]
      const code = token.content
      const lang = token.info || ''
      const codeId = `code-block-${idx}`

      // 新增：echarts 代码块特殊处理
      if (lang.trim() === 'echarts') {
        /*
        echarts数据示例
        ```echarts
        {
          "xAxis": { "type": "category", "data": ["Mon", "Tue", "Wed"] },
          "yAxis": { "type": "value" },
          "series": [{ "data": [120, 200, 150], "type": "bar" }]
        }
        ```
        */
        // 这里将 option 数据作为 data-option 属性存储，供后续 JS 解析
        return `
          <div class="echarts-block-wrapper">
            <div class="code-header">
              <span class="code-lang">图表</span>
            </div>
            <div id="${codeId}" class="echarts-chart" data-option='${md.utils.escapeHtml(code)}' style="width: 100%; height: 300px; max-width: 100%;"></div>
          </div>
        `
      }

      return `
        <div class="code-block-wrapper">
          <div class="code-header">
            ${lang ? `<span class="code-lang">${lang}</span>` : ''}
            <button class="copy-btn" onclick="copyCode('${codeId}')">复制</button>
          </div>
          <pre><code id="${codeId}" class="hljs ${lang}">${md.utils.escapeHtml(code)}</code></pre>
        </div>
      `
    }

    // 自定义链接渲染规则
    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
      const token = tokens[idx]
      const href = token.attrGet('href')
      // 为链接添加新窗口打开和安全属性
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">`
    }

    // 添加图片渲染规则
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
      const token = tokens[idx]

      // 区分行内图片和参照式图片
      if (token.type === 'image') {
        let src = ''
        let alt = token.content.replace(/[^\s]*\]/, '') // 提取 Alt 文字
        let isInline = token.content.includes('](')

        if (isInline) {
          // 行内图片格式：![Alt](URL)
          const match = token.content.match(/$(.*?)$/)
          src = match ? match[1] : ''
        } else {
          // 参照式图片格式：![Alt][id]
          const match = token.attrs.find(([key]) => key === 'src')
          src = match?.[1] || ''
        }

        return `
          <div class="markdown-image-wrapper">
            <img 
              src="${src}"
              alt="${alt}"
              loading="lazy"
              onclick="window.dispatchEvent(new CustomEvent('markdown-preview-image', { detail: '${src}' }))"
            >
          </div>
        `
      }
      return tokens[idx].content // 兜底返回原始内容
    }

    window.copyCode = (id) => {
      const code = document.getElementById(id)
      const text = code.textContent
      navigator.clipboard.writeText(text).then(() => {
        ElMessage.success('复制成功！')
      })
    }
  }

  const renderMarkdown = (content) => {
    if (!content) return ''
    // 预处理：统一处理各种换行符
    const processedContent = content
      .replace(/\\\\n/g, '\n') // 处理 \\n
      .replace(/\\n/g, '\n') // 处理 \n
      .replace(/\r\n/g, '\n') // 处理 Windows 风格的 \r\n
      .replace(/\r/g, '\n') // 处理单独的 \r
    return md ? md.render(processedContent) : processedContent
  }

  const renderAllEcharts = () => {
    // 查找所有 .echarts-chart 元素
    const chartDivs = document.querySelectorAll('.echarts-chart')
    chartDivs.forEach((div) => {
      // 防止重复渲染
      if (div.getAttribute('data-echarts-inited')) return
      div.setAttribute('data-echarts-inited', '1')
      try {
        let optionStr = div.getAttribute('data-option')
        if (!optionStr) return
        // 反转义
        // optionStr = optionStr.replace(/option =/g, '')
        let option = JSON.parse(optionStr.replace(/&quot;/g, '"').replace(/&#39;/g, "'"))
        // 替换掉 option和=

        const chart = echarts.init(div)
        chart.setOption(option)
      } catch (e) {
        console.error('ECharts 配置错误', e)
        div.innerHTML = ''
      }
    })
  }

  return {
    initMd,
    renderMarkdown,
    renderAllEcharts,
  }
}
