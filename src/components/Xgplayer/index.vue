<!--
 * @Description: 视频播放器
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2023-07-07 17:58:14
-->
<script setup lang="ts">
  import Player from 'xgplayer';
  const props = defineProps({
    url: {
      type: String,
      default: ''
    }
  });
  const player = ref<Player>();
  const init = () => {
    if (!props.url) return;
    if (player.value) {
      player.value.destroy();
    }
    player.value = new Player({
      id: 'xgplayer',
      url: props.url,
      width: '50%',
      fitVideoSize: 'fixWidth',
      videoInit: true, // 显示首帧
      miniplayer: true,
      miniplayerConfig: {
        bottom: 100,
        right: 10,
        width: 320,
        height: 180
      },
      pip: true, // 画中画
      cssFullscreen: true, // 全屏样式
      ignores: ['replay', 'fullscreen'],
      lang: 'zh-cn'
    });
  };
  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    if (player.value) {
      player.value.destroy();
    }
  });
</script>

<template>
  <div id="xgplayer"></div>
</template>
