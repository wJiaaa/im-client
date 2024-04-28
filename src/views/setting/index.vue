<!--
 * @Description: 设置
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:05:09
-->
<template>
  <el-main class="main">
    <el-header>我的设置</el-header>
    <el-container>
      <el-aside>
        <ul v-for="item in menuList" :key="item.id">
          <li :class="['setting-item', item.id === activeMenu.id ? 'selectd' : '']" @click="activeMenu = item">
            <span :class="['mr10px', 'text-17px', item.iconName]" />
            <div>{{ item.label }}</div>
          </li>
        </ul>
      </el-aside>
      <el-main>
        <el-header>{{ activeMenu.label }}</el-header>
        <PersonInfo />
      </el-main>
    </el-container>
  </el-main>
</template>

<script lang="ts" setup>
  import PersonInfo from './components/PersonInfo.vue';
  const menuList: { id: number; label: string; iconName: string; path: string }[] = [
    { id: 1, label: '个人中心', iconName: 'i-icon-park-outline:user', path: '/home/chat' },
    { id: 2, label: '安全设置', iconName: 'i-icon-park-outline:protect', path: '/home/friend' },
    { id: 3, label: '个性设置', iconName: 'i-icon-park-outline:tool', path: '/home/group' },
    { id: 4, label: '绑定设置', iconName: 'i-icon-park-outline:link-three', path: '/home/group' },
    { id: 5, label: '通知设置', iconName: 'i-icon-park-outline:remind', path: '/home/setting' }
  ];
  const activeMenu = ref({
    id: 1,
    label: '个人中心'
  });
</script>
<style scoped lang="scss">
  @import './index.scss';
</style>
