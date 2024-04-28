<!--
 * @Description: 撤回消息
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="revoke-msg">
    <span v-if="isCurrentUser(props.msgItem.senderId)">
      你撤回了一条消息
      <span class="edit" @click="reEdit">重新编辑</span>
    </span>
    <span v-else>对方撤回了一条消息</span>
  </div>
</template>

<script setup lang="ts">
  import { isCurrentUser } from '@/utils/common';
  const props = defineProps({
    msgItem: {
      type: Object as PropType<Message>,
      required: true
    }
  });
  const reEdit = () => {
    console.log('重新编辑', props.msgItem);
  };
</script>
<style scoped lang="scss">
  @import '@/styles/base.scss';
  .revoke-msg {
    font-size: 14px;
    text-align: center;
    margin: 0 auto;
    padding: 0 10px;
    line-height: 25px;
    color: $primary-color5;
    border-radius: 5px;
    max-width: 70%;
  }
  .edit {
    color: $primary-color1;
    cursor: pointer;
  }
</style>
