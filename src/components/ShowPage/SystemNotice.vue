<!--
 * @Description: 系统通知
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2023-06-14 22:34:11
-->
<template>
  <div class="header">系统通知</div>
  <div class="system-notice-page">
    <div v-for="item in noticeList" :key="item.id" class="system-item">
      <!-- <span  class="system-time">{{ item.loginTime }}</span> -->
      <div class="login-info">
        <div class="login-title">登陆操作通知</div>
        <ul class="login-detail">
          <li>登陆时间:{{ item.loginTime }}</li>
          <li>ip 地址:{{ item.ipAddress }}</li>
          <li>登陆地点:{{ item.loginAddress }}</li>
          <li>登陆设备:{{ item.loginEquipment }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const noticeList = ref([
    {
      id: 1,
      loginTime: '2023年04月22日02:06',
      ipAddress: '183.14.133.76',
      loginAddress: '广东省深圳市',
      loginEquipment: 'Chrome 90.0.4430.93'
    },
    {
      id: 2,
      loginTime: '2023年04月22日02:06',
      ipAddress: '183.14.133.76',
      loginAddress: '广东省深圳市',
      loginEquipment: 'Chrome 90.0.4430.93'
    },
    {
      id: 3,
      loginTime: '2023年04月22日02:06',
      ipAddress: '183.14.133.76',
      loginAddress: '广东省深圳市',
      loginEquipment: 'Chrome 90.0.4430.93'
    },
    {
      id: 4,
      loginTime: '2023年04月22日02:06',
      ipAddress: '183.14.133.76',
      loginAddress: '广东省深圳市',
      loginEquipment: 'Chrome 90.0.4430.93'
    }
  ]);
</script>
<style scoped lang="scss">
  .system-notice-page {
    height: calc(100% - 90px);
    overflow: auto;
    padding: 20px 0;
    background-color: #f3f3f3;
  }
  .header {
    height: 50px;
    padding: 0 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .system-item {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    &:not(:last-child) {
      margin-bottom: 20px;
    }
    .system-time {
      margin-bottom: 15px;
      font-size: 14px;
    }
    .login-info {
      border: 1px solid #eee;
      background-color: #fff;
      border-radius: 5px;
      padding: 20px;
      width: 400px;
      .login-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .login-detail {
        display: flex;
        flex-direction: column;
        li {
          font-size: 14px;
          &:not(:last-child) {
            margin-bottom: 10px;
          }
        }
      }
    }
  }
</style>
