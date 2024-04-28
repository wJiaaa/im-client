<!--
 * @Description: 文件消息
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 15:52:51
-->
<template>
  <div class="p10px w-240px">
    <div class="flex border-b-1px border-gray-200 pb10px mb5px">
      <div class="h45px w45px text-center leading-45px mr-10px">
        <SvgIcon :icon-class="props.msgItem.extra?.suffix || 'unknown'" class-name="file-icon" />
      </div>
      <div class="">
        <div>{{ props.msgItem.extra?.fileName }}</div>
        <div>{{ props.msgItem.extra?.size }}M</div>
      </div>
    </div>
    <div class="download">
      <el-button link type="primary" @click="download">下载</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { downloadFile } from '@/utils/download';
  const props = defineProps({
    msgItem: {
      type: Object as PropType<Message>,
      required: true
    }
  });
  const download = () => {
    downloadFile(props.msgItem.content, props.msgItem.extra?.fileName, '');
  };
</script>
<style scoped lang="scss">
  .file-icon {
    height: 45px;
    width: 45px;
  }
  .download {
    height: 20px;
    text-align: right;
  }
</style>
