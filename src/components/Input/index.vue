<script setup lang="ts">
  // TODO 重构 改成tiptap
  import { QuillEditor, Quill } from '@vueup/vue-quill';
  import ImageUploader from 'quill-image-uploader';
  import QuoteBlot from './formats/quote';
  import 'quill-mention';
  import '@vueup/vue-quill/dist/vue-quill.snow.css';
  import 'quill-image-uploader/dist/quill.imageUploader.min.css';
  import useChatStore from '@/store/modules/chat';
  import { deltaToString } from './utils';
  import { uploadFileToCos } from '@/api/upload';
  import eventEmitter from '@/utils/eventEmitter';
  const emit = defineEmits(['send']);
  // 关闭透传 attrs 到组件根节点，传递到子节点  v-bind="$attrs"
  defineOptions({ inheritAttrs: false });
  if (!Quill.imports['modules/imageUploader']) {
    Quill.register('modules/imageUploader', ImageUploader);
  }
  if (!Quill.imports['formats/quote']) {
    Quill.register('formats/quote', QuoteBlot);
  }
  const editor = ref();
  // 是否展示选人弹窗
  const personList = ref<[]>([]);
  const nowChatUserInfo = computed(() => useChatStore().activeSession);
  watch(
    () => nowChatUserInfo.value,
    () => {
      if (nowChatUserInfo.value.sessionType !== 2) {
        personList.value = [];
      }
      nextTick(() => {
        setContents();
        getQuill().focus();
      });
    },
    {
      immediate: true
    }
  );
  // watch(
  //   () => useCurrentChatInfo().currentGroup,
  //   (newVal) => {
  //     personList.value = newVal;
  //   },
  //   { immediate: true, deep: true }
  // );
  const onClipboardMatcher = (node: any, Delta) => {
    const ops: any[] = [];
    Delta.ops.forEach((op) => {
      // 如果粘贴了图片，这里会是一个对象，所以可以这样处理
      if (op.insert && typeof op.insert === 'string') {
        ops.push({
          insert: op.insert, // 文字内容
          attributes: {} //文字样式（包括背景色和文字颜色等）
        });
      } else {
        ops.push(op);
      }
    });
    Delta.ops = ops;
    return Delta;
  };
  const onSendMessage = async () => {
    emit('send');
  };
  const getQuill = () => {
    return editor.value?.getQuill();
  };
  const getQuillSelectionIndex = () => {
    let quill = getQuill();
    return (quill.getSelection() || {}).index || quill.getLength();
  };
  const onEditorUpload = (file: File) => {
    return new Promise(async (resolve, reject) => {
      if (file.type.indexOf('image/') === 0) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await uploadFileToCos(formData);
        return resolve(res.data.fileUrl);
      }
      reject();
      if (file.type.includes('video')) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await uploadFileToCos(formData);
        console.log('res', res);
      }
    });
  };
  const editorOption = {
    debug: false,
    modules: {
      toolbar: false,
      clipboard: {
        // 粘贴版，处理粘贴时候的自带样式
        matchers: [[Node.ELEMENT_NODE, onClipboardMatcher]]
      },
      keyboard: {
        bindings: {
          enter: {
            key: 13,
            handler: onSendMessage
          }
        }
      },
      imageUploader: {
        upload: onEditorUpload
      },
      mention: {
        allowedChars: /^[\u4e00-\u9fa5a-zA-Z0-9]*$/,
        mentionDenotationChars: ['@'],
        positioningStrategy: 'fixed',
        dataAttributes: ['userId', 'username', 'avatar'],
        renderItem: (data: any) => {
          const el = document.createElement('div');
          el.className = 'person-item';
          el.innerHTML = `<img src="${data.avatar}" class="avatar"/>`;
          el.innerHTML += `<span class="person-item__name">${data.username}</span>`;
          return el;
        },
        source: function (searchTerm: string, renderList: any) {
          if (!personList.value.length) {
            return renderList([]);
          }
          let list = [{ userId: 'all', username: '所有人', avatar: '' }, ...personList.value];
          const items = list.filter((item: any) => item.username.indexOf(searchTerm) !== -1);
          renderList(items);
        },
        // 选中后触发
        onSelect: (item, insertItem) => {
          item.value = item.username;
          insertItem(item);
        },
        mentionContainerClass: 'person-wrapper'
      }
    },
    placeholder: '说点什么.....',
    theme: 'snow'
  };
  const setContents = () => {
    getQuill().setContents([], Quill.sources.USER);
  };
  const onEditorChange = () => {
    let delta = getQuill().getContents();
  };
  const onEmoticonEvent = (data) => {
    const quill = getQuill();
    let index = getQuillSelectionIndex();
    if (index == 1 && quill.getLength() == 1 && quill.getText(0, 1) == '\n') {
      quill.deleteText(0, 1);
      index = 0;
    }
    if (data.elImg) {
      quill.insertText(index - 1, data.content);
      quill.setSelection(index + data.content.length, 0, 'user');
    } else {
      quill.insertText(index - 1, data.content);
      quill.setSelection(index + 1, 0, 'user');
    }
  };
  const onSubscribeQuote = (data: any) => {
    const delta = getQuill().getContents();
    if (delta.ops?.some((item: any) => item.insert.quote)) {
      return;
    }
    const quill = getQuill();
    const index = getQuillSelectionIndex();
    quill.insertEmbed(0, 'quote', data);
    quill.setSelection(index + 1, 0, 'user');
  };
  const subscribeMention = (data) => {
    const mention = getQuill().getModule('mention');
    mention.insertItem({ ...data, denotationChar: '@', value: data.username }, true);
  };
  onMounted(() => {
    eventEmitter.on('mentionUser', (data) => subscribeMention(data));
  });
  defineExpose({ setContents, onEmoticonEvent, onSendMessage, getQuill, onSubscribeQuote });
</script>

<template>
  <div class="at-mentions" :class="['at-mentions', $attrs.class]">
    <QuillEditor @editorChange="onEditorChange" theme="snow" ref="editor" :options="editorOption" />
  </div>
</template>

<style src="./styles.scss"></style>
<style>
  .span-emoji {
    font-size: 24px;
  }
</style>
