<!--
 * @Description: 页面布局
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2023-12-26 14:14:36
-->
<!-- TODO 重构 -->
<template>
  <el-container>
    <section class="im-container">
      <Nav class="im-nav" />
      <section class="im-main">
        <router-view v-slot="{ Component, route }">
          <component :is="Component"></component>
        </router-view>
      </section>
    </section>
  </el-container>
</template>

<script setup lang="ts">
  import Nav from './components/Nav/index.vue';
</script>

<style scoped lang="scss">
  @import './index.scss';
</style>
