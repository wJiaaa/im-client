<!--
 * @Description: 主页面
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:06:00
-->
<script setup lang="ts">
  import notify from '@/utils/notify';
  import { useTitle } from '@vueuse/core';
  const title = useTitle();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // title.value = '离开页面了';
    } else {
      // notify.setTitle('iM');
      // notify.close();
    }
  });
</script>

<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>
