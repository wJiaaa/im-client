<!--
 * @Description: 欢迎页
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 15:59:09
-->
<template>
  <div class="welcome">
    <div>欢迎使用iM即时通信</div>
    <div class="text-2xl">
      code by :
      <span class="font-mono italic ml5px">wJiaaa</span>
    </div>
  </div>
</template>

<script lang="ts" setup></script>
<style scoped lang="scss">
  .welcome {
    flex: 1;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding-left: 40px;
    padding-top: 100px;
    flex-direction: column;
    background: url(../../assets/欢迎加入.png) no-repeat;
    background-size: cover;
    background-position-x: -17px;
    background-position-y: 160px;
    font-size: 36px;
  }
</style>
