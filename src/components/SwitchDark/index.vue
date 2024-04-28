<!--
 * @Description: 切换黑暗模式
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 15:59:24
-->
<template>
  <el-switch active-value="dark" inactive-value="white" v-model="theme" @change="onAddDarkChange" />
</template>

<script setup lang="ts">
  import { useDark, useToggle } from '@vueuse/core';
  import useSystemStore from '@/store/modules/system';

  const systemStore = useSystemStore();

  const isDark = useDark();
  const theme = computed({
    get: () => systemStore.theme,
    set: (val) => {
      systemStore.setTheme(val);
    }
  });

  onMounted(() => {
    // 避免系統顔色為深色
    systemStore.setTheme(isDark.value ? 'dark' : 'white');
  });

  const onAddDarkChange = () => {
    useToggle(isDark)();
  };
</script>
