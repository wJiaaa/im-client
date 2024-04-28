<!--
 * @Description: 获取会话列表显示的消息内容
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 15:55:18
-->
<template>
  <span>
    <!-- <span v-if="sessionItem.atUserIdList?.includes(useUserStore().userId) && sessionItem.unReadNum" style="color: red">
      [有人@我]
    </span> -->
    {{ getSessionContent(sessionItem) }}
  </span>
</template>

<script lang="ts" setup>
  import useChatStore from '@/store/modules/chat';
  import useUserStore from '@/store/modules/user';
  import { definePropType, isCurrentUser, isGroupChat } from '@/utils/common';
  import { MESSAGE_SHOW_CONTENT, MESSAGE_TYPE_TOP } from '@/utils/constant';
  defineProps({
    sessionItem: {
      type: definePropType<Session>(Object),
      default: () => {}
    }
  });
  const getSessionContent = (sessionItem: Session) => {
    let content = sessionItem.content;
    if (sessionItem.isRevoke) {
      console.log('sessionItem', sessionItem);
      return isCurrentUser(sessionItem.lastMsgSendUserId || '') ? '你撤回了一条消息' : '对方撤回了一条消息';
    }
    if (sessionItem.messageType === MESSAGE_TYPE_TOP) {
      const regex = /\[(.*?)\](.*)/; // 使用括号分组提取方括号中的内容和剩余的内容
      const matches = sessionItem.content.match(regex)!;
      return (
        (matches[1] === useUserStore().userId
          ? useUserStore().userInfo.username
          : useChatStore().friendGather[matches[1]]?.username) +
        ' ' +
        matches[2]
      );
    }
    if ([2, 3, 4, 5].includes(sessionItem.messageType)) {
      content = MESSAGE_SHOW_CONTENT[sessionItem.messageType as 2 | 4];
    }
    if (!isGroupChat(sessionItem.sessionType) || sessionItem.lastMsgSendUserId === '0') {
      return content;
    }
    // 判断最后一条消息是否是自己发送的;
    const isSelf = sessionItem.lastMsgSendUserId === useUserStore().userId;
    if (isSelf) {
      return content;
    } else {
      return `${sessionItem.lastMsgSendUserName}: ${content}`;
    }
    return content;
  };
</script>
<style scoped lang="scss"></style>
