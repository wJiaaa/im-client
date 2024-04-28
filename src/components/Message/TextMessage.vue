<!--
 * @Description: 文字内容
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 15:56:58
-->
<template>
  <!-- TODO 不应该用robot_1 当作机器人的消息 -->
  <RobotMessage :inversion="false" :text="msgItem.content" v-if="msgItem.senderId === 'robot_1'" />
  <pre v-html="textReplaceMention(msgItem.content)" class="pre" v-else />
</template>

<script setup lang="ts">
  import { textReplaceEmoji } from '@/utils/emojis';
  defineProps({
    msgItem: {
      type: Object as PropType<Message>,
      required: true
    }
  });
  const textReplaceMention = (msg: string) => {
    return textReplaceEmoji(msg);
  };
</script>
<style scoped lang="scss">
  pre {
    margin: 10px 15px;
    white-space: pre-wrap;
    word-break: break-word;
    word-wrap: break-word;
    line-height: 18px;
    font-family: RobotoBase;
    white-space: pre-wrap;
    overflow: hidden;
    font-size: 14px;
    display: flex;
    align-items: center;
  }
</style>
