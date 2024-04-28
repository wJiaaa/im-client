<!--
 * @Description: 群
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:04:13
-->
<template>
  <RightContainer>
    <GroupNotice v-if="showPageType === PAGE_SHOW_TYPE['groupNotice']" />
    <GroupInfo v-if="showPageType === PAGE_SHOW_TYPE['groupInfo']" />
  </RightContainer>
</template>

<script lang="ts" setup>
  import useSystemStore from '@/store/modules/system';
  import { PAGE_SHOW_TYPE } from '@/utils/constant';
  const showPageType = computed(() => {
    return useSystemStore().showPageType;
  });
</script>
<style scoped lang="scss"></style>
