<!--
 * @Description: 创建右键菜单组件样式
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<!-- TODO 是否需要根据窗口、位置变化改变右键菜单的位置 -->
<script setup lang="ts">
  import { MenusOption } from '.';
  import { definePropType } from '@/utils/common';

  const props = defineProps({
    menuData: {
      type: definePropType<MenusOption[]>(Array),
      default: () => []
    },
    onClose: {
      type: Function,
      default: () => {}
    }
  });
  // 创建组件ref
  const contextMenu = ref<Nullable<HTMLElement>>(null);

  onMounted(async () => {
    // 确保组件已经渲染
    await nextTick();
    // 触发组件focus 不然无法触发 @blur
    contextMenu.value?.focus();
  });

  const clickMenuItem = (menuItem: MenusOption) => {
    menuItem.menuAction();
    props.onClose();
    props.menuData.map((item) => {});
    props.menuData.findIndex((item) => {});
  };
</script>
<template>
  <div class="context-menu" @blur="onClose()" ref="contextMenu" tabindex="-1">
    <div v-for="(item, idx) in menuData" :key="idx">
      <div class="context-menu__item" v-if="!item.hidden" @click="clickMenuItem(item)">
        <span :class="['text-16px', item.icon]" />
        <span class="menu-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .context-menu {
    z-index: 9999;
    position: fixed;
    padding: 6px;
    border-radius: 6px;
    border: 1px solid rgba(222, 222, 222, 0.5);
    background-color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    user-select: none;
    min-width: 80px;
    &:focus {
      outline: none;
    }
    &__item {
      padding: 8px 5px;
      padding-right: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.3s;
      height: 20px;
      color: #333639;
      .menu-label {
        margin-left: 8px;
      }
      &:hover {
        color: #202020;
        background: rgba(32, 32, 32, 0.08);
        border-radius: 6px;
      }
    }
  }
</style>
