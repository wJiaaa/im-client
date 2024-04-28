<!--
 * @Description: 系统消息
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="system-msg">
    <!-- 群系统消息 -->
    <div v-if="isGroupChat(nowChatUserInfo?.sessionType)">
      <!-- 入群通知 -->
      <span v-if="msgItem.extra?.type === MESSAGE_TYPE_TEXT">
        {{ tranFromSystemMsg(msgItem) }}
      </span>
    </div>
    <!-- 好友的系统消息 -->
    <div v-else>
      <span v-if="msgItem.messageType === MESSAGE_TYPE_TOP">
        {{ tranFromTopMessageSystemMsg(msgItem) }}
      </span>
      <span v-else>{{ msgItem.content }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import useChatStore from '@/store/modules/chat';
  import useUserStore from '@/store/modules/user';
  import { isCurrentUser, isGroupChat } from '@/utils/common';
  import { MESSAGE_TYPE_TEXT, MESSAGE_TYPE_TOP } from '@/utils/constant';
  // TODO 修改名称
  const nowChatUserInfo = computed(() => {
    return useChatStore().activeSession;
  });
  defineProps({
    msgItem: {
      type: Object as PropType<Message>,
      required: true
    }
  });
  /** 转换置顶消息提示用户名 */
  const tranFromTopMessageSystemMsg = (msgItem: Message) => {
    const regex = /\[(.*?)\](.*)/; // 使用括号分组提取方括号中的内容和剩余的内容
    const matches = msgItem.content.match(regex)!;
    return (
      (matches[1] === useUserStore().userId
        ? useUserStore().userInfo.username
        : useChatStore().friendGather[matches[1]]?.username) +
      ' ' +
      matches[2]
    );
  };
  /**
   *  转换系统消息提示用户名
   * @param msgItem 系统消息
   * @returns 转换名称后的系统消息
   */
  const tranFromSystemMsg = (msgItem: Message) => {
    let { extra } = msgItem;
    if (extra) {
      let inviteUserName = isCurrentUser(extra.ownerId) ? '你' : extra?.ownerName;
      const memberUserNameList = extra?.members
        .map((item: any) => {
          return isCurrentUser(item.userId) ? '你' : item.username;
        })
        .join('、');
      return `${inviteUserName} 邀请了 ${memberUserNameList} 加入群聊`;
    }
  };
</script>
<style scoped lang="scss">
  @import '@/styles/base.scss';
  .system-msg {
    font-size: 14px;
    text-align: center;
    background-color: $primary-color8;
    margin: 0 auto;
    padding: 0 10px;
    line-height: 25px;
    color: $primary-color5;
    border-radius: 5px;
    max-width: 70%;
  }
</style>
