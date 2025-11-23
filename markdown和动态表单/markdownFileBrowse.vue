<template>
  <div>
    <!-- 上传组件 -->
    <input type="file" accept=".md" @change="handleFileChange" />
    <!-- markdown 浏览区域 -->
    <div v-if="htmlContent" v-html="htmlContent"></div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
// import marked from 'marked';
import { marked } from 'marked'
export default {
  setup() {
    const fileContent = ref<string>(''); // markdown 文件内容
    const htmlContent = ref<string>(''); // 解析后的 HTML 内容

    const handleFileChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          fileContent.value = event.target?.result as string;
          // 解析 markdown 为 HTML
          htmlContent.value = marked(fileContent.value);
        };
        reader.readAsText(input.files[0]);
      }
    };

    return {
      handleFileChange,
      htmlContent,
    };
  },
};
</script>

<style scoped>
/* 可选：自定义 markdown 样式 */
</style>
