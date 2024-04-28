<template>
  <RightContainer>
    <FriendNotice v-if="showPageType === PAGE_SHOW_TYPE['friendNotice']" />
    <FriendInfo v-if="showPageType === PAGE_SHOW_TYPE['friendInfo']" />
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
