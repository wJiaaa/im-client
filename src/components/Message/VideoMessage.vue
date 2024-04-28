<!--
 * @Description: 视频消息
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:38:58
-->
<!-- TODO 优化 增加关闭按钮 -->
<template>
  <div class="video">
    <el-image
      class="image"
      :src="msgItem?.extra?.thumbUrl"
      :style="{
        height: getImageStyle()?.height + 'px',
        width: getImageStyle()?.width + 'px',
        display: 'flex'
      }"
      fit="scale-down"
    >
      <template #placeholder>
        <div class="image-slot" v-loading="true" element-loading-text="Loading..."></div>
      </template>
      <template #error>
        <div class="image-slot">加载失败</div>
      </template>
    </el-image>
    <span @click="handleClick" class="play-icon i-mdi:motion-play-outline">123</span>
  </div>
</template>

<script setup lang="ts">
  import useSystemStore from '@/store/modules/system';

  const props = defineProps({
    msgItem: {
      type: Object as PropType<Message>,
      required: true
    }
  });
  const systemStore = useSystemStore();

  watch(
    () => systemStore.isPlaying,
    (val) => {
      if (!val) {
        window.removeEventListener('keydown', close);
      }
    }
  );

  const handleClick = () => {
    systemStore.open(props.msgItem.content);
    // window.addEventListener('')
    window.addEventListener('keydown', close);
  };
  const close = (event: any) => {
    if (event.code === 'Escape') {
      // 执行你想要的操作
      systemStore.close();
    }
  };
  /**
   *  获取图片宽高
   */
  const getImageStyle = () => {
    const { thumbWidth, thumbHeight } = props.msgItem.extra || {};
    const MAX_WIDTH = 300; // 预设宽度
    const MAX_HEIGHT = 225; // 预设高度
    // 小： 如果图片宽高都小于最大宽高，直接返回原高度
    if (thumbWidth < MAX_WIDTH && thumbHeight < MAX_HEIGHT) {
      return { thumbHeight, thumbWidth };
      // 宽： 根据宽度等比缩放
    } else if (thumbWidth > thumbHeight) {
      return { height: (MAX_WIDTH / thumbWidth) * thumbHeight, width: MAX_WIDTH };
      // 窄：返回最大高度
    } else if (thumbWidth === thumbHeight || thumbWidth < thumbHeight) {
      return { height: MAX_HEIGHT, width: (MAX_HEIGHT / thumbHeight) * thumbWidth };
    }
  };
</script>
<style scoped lang="scss">
  .video {
    position: relative;
    .image {
      max-width: 400px !important;
      min-height: 30px !important;
      max-height: 300px !important;
      border-radius: 6px;

      .image-slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: 12px;
        color: #bebebe;
        background: #383c4b;
      }
    }
    .play-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 30px;
      color: #fff;
      cursor: pointer;
    }
    .play-icon:active {
      color: #ccc;
    }
  }
</style>
