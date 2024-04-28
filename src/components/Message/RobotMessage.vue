<!--
 * @Description: 机器人回复的消息
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:14:46
-->
<script lang="ts" setup>
  import MarkdownIt from 'markdown-it';
  import mdKatex from '@traptitech/markdown-it-katex';
  import mila from 'markdown-it-link-attributes';
  import hljs from 'highlight.js';

  interface Props {
    inversion?: boolean;
    error?: boolean;
    text?: string;
    loading?: boolean;
    asRawText?: boolean;
  }
  const copyToClip = (text: string) => {
    return new Promise((resolve, reject) => {
      try {
        const input: HTMLTextAreaElement = document.createElement('textarea');
        input.setAttribute('readonly', 'readonly');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        if (document.execCommand('copy')) document.execCommand('copy');
        document.body.removeChild(input);
        resolve(text);
      } catch (error) {
        reject(error);
      }
    });
  };
  const props = defineProps<Props>();

  const textRef = ref<HTMLElement>();

  const mdi = new MarkdownIt({
    html: false,
    linkify: true,
    highlight(code: any, language: any) {
      const validLang = !!(language && hljs.getLanguage(language));
      if (validLang) {
        const lang = language ?? '';
        return highlightBlock(hljs.highlight(code, { language: lang }).value, lang);
      }
      return highlightBlock(hljs.highlightAuto(code).value, '');
    }
  });

  mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } });
  mdi.use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' });

  const wrapClass = computed(() => {
    return [
      'text-wrap',
      'min-w-[20px]',
      'rounded-md',
      'px-3 py-2',
      props.inversion ? 'bg-[#d2f9d1]' : 'bg-[#f4f6f8]',
      props.inversion ? 'dark:bg-[#a1dc95]' : 'dark:bg-[#1e1e20]',
      props.inversion ? 'message-request' : 'message-reply',
      { 'text-red-500': props.error }
    ];
  });

  const text = computed(() => {
    const value = props.text ?? '';
    if (!props.asRawText) return mdi.render(value);
    return value;
  });

  function highlightBlock(str: string, lang?: string) {
    return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">复制代码</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`;
  }

  function addCopyEvents() {
    if (textRef.value) {
      const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy');
      copyBtn.forEach((btn) => {
        btn.addEventListener('click', () => {
          const code = btn.parentElement?.nextElementSibling?.textContent;
          if (code) {
            copyToClip(code).then(() => {
              btn.textContent = '复制成功';
              setTimeout(() => {
                btn.textContent = '复制代码';
              }, 1000);
            });
          }
        });
      });
    }
  }

  function removeCopyEvents() {
    if (textRef.value) {
      const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy');
      copyBtn.forEach((btn) => {
        btn.removeEventListener('click', () => {});
      });
    }
  }

  onMounted(() => {
    addCopyEvents();
  });

  onUpdated(() => {
    addCopyEvents();
  });

  onUnmounted(() => {
    removeCopyEvents();
  });
</script>

<template>
  <div class="text-black" :class="wrapClass">
    <div ref="textRef" class="leading-relaxed break-words">
      <div v-if="!inversion">
        <div v-if="!asRawText" class="markdown-body" v-html="text" />
        <div v-else class="whitespace-pre-wrap" v-text="text" />
      </div>
      <div v-else class="whitespace-pre-wrap" v-text="text" />
      <!-- <template v-if="loading">
        <span class="dark:text-white w-[4px] h-[20px] block animate-blink" />
      </template> -->
    </div>
  </div>
</template>

<style lang="scss">
  .markdown-body {
    background-color: transparent;
    font-size: 14px;

    p {
      white-space: pre-wrap;
      margin: 0;
    }

    ol {
      list-style-type: decimal;
    }

    ul {
      list-style-type: disc;
    }

    pre code,
    pre tt {
      line-height: 1.65;
    }

    .highlight pre,
    pre {
      background-color: #fff;
    }

    .code-block {
      &-wrapper {
        position: relative;
        padding-top: 24px;
      }

      &-header {
        position: absolute;
        top: 2px;
        right: 0;
        width: 100%;
        padding: 0 1rem;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        color: #b3b3b3;

        &__copy {
          cursor: pointer;
          margin-left: 0.5rem;
          user-select: none;

          &:hover {
            color: #65a665;
          }
        }
      }
    }
  }

  // html.dark {
  //   .message-reply {
  //     .whitespace-pre-wrap {
  //       white-space: pre-wrap;
  //       color: var(--n-text-color);
  //     }
  //   }

  //   .highlight pre,
  //   pre {
  //     background-color: #282c34;
  //   }
  // }
</style>
