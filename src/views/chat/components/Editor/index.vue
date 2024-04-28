<!--
 * @Description: 聊天发送框
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-03-28 15:09:27
-->
<template>
  <div class="message-send">
    <ToolBar ref="editBarRef" @sendByOther="sendByOther" />
    <!-- TODO 支持显示表情包 -->
    <MsgInput class="textarea" ref="textareaRef" @send="sendMsgHandler" />
    <div class="message-bottom">
      <div class="send-button-box">
        <span>Enter发送，Shift+Enter换行</span>
        <el-button type="primary" @click="sendMsgHandler">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import evEmitter from '@/utils/eventEmitter';
  import ToolBar from '../ToolBar/index.vue';
  import MsgInput from '@/components/Input/index.vue';
  import { deltaToMessage } from '@/components/Input/utils';
  import { MESSAGE_TYPE_IMAGE, MESSAGE_TYPE_TEXT } from '@/utils/constant';
  import useMessageStore from '@/store/modules/message';

  const messageStore = useMessageStore();

  const textareaRef = ref();

  const sendMsgHandler = async () => {
    const delta = textareaRef.value.getQuill().getContents();
    let data = await deltaToMessage(delta);
    const { items, mentions, quoteId } = data;
    if (!items.length) {
      return;
    }
    textareaRef.value.setContents();
    items.forEach((msgItem) => {
      console.log('msgItem', msgItem);
      switch (msgItem.messageType) {
        case MESSAGE_TYPE_TEXT:
          if (items[0].content.length > 1024) {
            return ElMessage({
              message: '内容过长',
              type: 'error'
            });
          }
          messageStore.sendMsg({
            content: msgItem.content,
            atUserIdList: mentions,
            extra: quoteId
              ? {
                  quoteId
                }
              : undefined
          });
          break;
        case MESSAGE_TYPE_IMAGE:
          messageStore.sendMsg({
            content: msgItem.content,
            atUserIdList: mentions,
            extra: msgItem.extra,
            messageType: msgItem.messageType
          });
          break;
      }
    });
  };
  /**
   *  子组件触发发送消息
   * @param data 消息内容
   */
  const sendByOther = (data: Pick<SendMessagePayload, 'content' | 'messageType' | 'extra'>) => {
    const { messageType, content, extra } = data;
    if (messageType === 1) {
      return textareaRef.value.onEmoticonEvent(data);
    } else {
      messageStore.sendMsg({ content, messageType, extra });
    }
  };

  onMounted(() => {
    evEmitter.on('onSubscribeQuote', (data) => {
      textareaRef.value.onSubscribeQuote(data);
    });
  });
  onUnmounted(() => {
    evEmitter.off('onSubscribeQuote');
  });
</script>
<style scoped lang="scss">
  .message-send {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border-top: 1px solid #f4f5f9;
    position: relative;
    background-color: #fff;
    .textarea {
      flex: 1;
      overflow: auto;
    }
    .message-bottom {
      padding: 10px 0;
      .send-button-box {
        padding: 0 20px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        color: #aaa;
        font-size: 14px;
        span {
          margin-right: 10px;
        }
      }
    }
  }
</style>
