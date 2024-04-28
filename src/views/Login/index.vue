<!--
 * @Description: 登录
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:04:19
-->
<template>
  <div class="login-container flx-center">
    <SwitchDark class="dark" />
    <div class="login-box">
      <div class="login-form">
        <div class="login-logo">
          <img class="login-icon" src="../../assets/img/logo.svg" alt="" />
          <p class="logo-text">XiXi ☺️ iM</p>
        </div>
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="login">
  import LoginForm from './LoginForm.vue';
</script>

<style scoped lang="scss">
  @import './index.scss';
</style>
