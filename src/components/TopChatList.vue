<!--
 * @Description: 置顶会话列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<!-- TODO 左右边距自适应 -->
<template>
  <div class="top-chat" v-if="chatList.length">
    <div
      v-for="item in chatList"
      :key="item.sessionId"
      :class="['top-chat-item', useChatStore().activeSession?.sessionId === item.sessionId ? 'selected' : '']"
      @click="emits('clickSession', item)"
    >
      <img class="avatar" alt="" :src="item.avatar" v-if="!isGroupChat(item.sessionType)" />
      <!-- 群聊头像 -->
      <el-image class="avatar" v-else :src="item?.avatar" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import useChatStore from '@/store/modules/chat';
  import { toArray } from 'lodash';
  import { isGroupChat } from '@/utils/common';
  const emits = defineEmits(['clickSession']);

  const chatList = computed(() => {
    return toArray(useChatStore().sessionGather).filter((item) => item.isTop);
  });
</script>
<style scoped lang="scss">
  @import '@/styles/base.scss';
  .top-chat {
    grid-template-columns: repeat(auto-fill, 45px);
    display: grid;
    padding: 5px;
    max-height: 180px;
    overflow: auto;
    .top-chat-item {
      padding-top: 5px;
      border-radius: 7px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      height: 45px;
      .top-item-name {
        font-size: 12px;
        transform: scale(0.84);
        color: #a2a2a2;
      }
    }
    .selected {
      background: $primary-color4 !important;
      .board {
        height: 45px;
        position: absolute;
        border-left: 3px solid $primary-color2;
        left: 0px;
      }
    }
    .top-chat-item:hover {
      // 与SessionList合并
      background: $primary-color4;
      transition: all 0.5s;
      cursor: pointer;
    }
  }
  .avatar {
    height: 35px;
    width: 35px;
    border-radius: 5px;
  }
</style>
