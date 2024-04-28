<!--
 * @Description: 弹窗
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 15:51:01
-->
<template>
  <div :class="['absolute', 'h100%', 'w100%', 'duration-600', 'overflow-hidden', isShow ? 'z-10' : 'z--1']">
    <div
      ref="containerRef"
      :class="[
        'w-280px',
        'bg-#f6f8fa',
        'duration-600',
        'top-0',
        'right-0',
        'h-100%',
        'absolute',
        'drawer',
        !isShow && 'navbar-close'
      ]"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onClickOutside } from '@vueuse/core';
  const props = defineProps({
    showSideBar: {
      type: Boolean,
      default: false
    }
  });
  const containerRef = ref<Nullable<HTMLElement>>(null);
  const isShow = computed({
    get() {
      return props.showSideBar;
    },
    set(val) {
      emits('update:showSideBar', val);
    }
  });
  nextTick(() => {
    onClickOutside(
      containerRef,
      () => {
        if (isShow.value) {
          isShow.value = false;
        }
      },
      {
        ignore: [document.getElementById('showSideBar')]
      }
    );
  });
  document.getElementById('open');
  const emits = defineEmits(['update:showSideBar']);
</script>
<style scoped lang="scss">
  .navbar-close {
    transform: translateX(100%);
  }
  .drawer {
    padding: 20px;
  }
</style>
