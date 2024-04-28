<!--
 * @Description: 表情消息
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-10 16:28:35
-->
<template>
  <el-image
    class="cursor-pointer image"
    hide-on-click-modal
    preview-teleported
    :src="msgItem.content"
    :style="{
      height: getImageHeight + 'px'
    }"
    :preview-src-list="[msgItem.content]"
    fit="scale-down"
  >
    <template #placeholder>
      <div class="image-slot" v-loading="true" element-loading-text="Loading..."></div>
    </template>
    <template #error>
      <div class="image-slot" :style="getWidthStyle()">加载失败</div>
    </template>
  </el-image>
</template>

<script setup lang="ts">
  const props = defineProps({
    msgItem: {
      type: Object as PropType<Message>,
      required: true
    }
  });
  /**
   * 核心就是的到高度，产生明确占位防止图片加载时页面抖动
   * @param width 宽度
   * @param height 高度
   */
  const getImageHeight = computed(() => {
    const { width, height } = props.msgItem.extra || {};
    return formatImage(width, height);
  });
  /**
   *  获取图片宽高
   */
  const formatImage = (
    width: number,
    height: number,
    option = {
      maxWidth: 150,
      maxHeight: 110
    }
  ) => {
    const { maxWidth, maxHeight } = option;
    // 小： 如果图片宽高都小于最大宽高，直接返回原高度
    if (width < maxWidth && height < maxHeight) {
      return height;
      // 宽： 根据宽度等比缩放
    } else if (width > height) {
      return (maxWidth / width) * height;
      // 窄：返回最大高度
    } else if (width === height || width < height) {
      return maxHeight;
    }
    return maxHeight;
  };
  // 没有图片的情况下计算出按比例的宽度
  const getWidthStyle = () => {
    const { width, height } = props.msgItem.extra || {};
    return `width: ${(getImageHeight.value / height) * width}px`;
  };
</script>
<style scoped lang="scss">
  .image {
    position: relative;
    border-radius: 4px;
    width: auto;

    img {
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }

    &-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-width: 70px;
      height: 100%;
      font-size: 12px;
      color: #bebebe;
      vertical-align: middle;
      background: #383c4b;
    }
  }
</style>
