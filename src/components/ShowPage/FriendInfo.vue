<!--
 * @Description: 好友信息
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-24 18:45:52
-->
<template>
  <div class="show-friend-info">
    <div class="flex items-center justify-around">
      <div class="flex justify-center items-center">
        <el-avatar shape="square" size="large" :src="activeContact.avatar" />
        <span class="ml10px inoneline max-w-280px">
          <span :title="activeContact.username">{{ activeContact.username }}</span>
          <span v-show="activeContact.remark" :title="activeContact.remark">({{ activeContact.remark }})</span>
        </span>
      </div>
      <div class="text-gray-500 cursor-pointer flex items-center">
        <span class="i-mdi:delete-sweep text-[24px]" />
        <span class="text-[#797979] text-[14px] ml2px" @click="deleteFriend()">删除好友</span>
      </div>
    </div>
    <div class="mt60px flex items-center justify-around text-left">
      <div class="w65%">
        <div class="mb10px flex">
          <span class="text-[16px] text-[#797979]">用户名</span>
          <span class="ml20px inoneline flex-1">{{ activeContact.username }}</span>
        </div>
        <div class="mb10px flex">
          <span class="text-[16px] text-[#797979]">性 &nbsp; 别</span>
          <span class="ml20px inoneline flex-1">{{ GENDER[activeContact.gender] }}</span>
        </div>
        <div class="mb10px flex">
          <span class="text-[16px] text-[#797979]">签 &nbsp; 名</span>
          <span class="ml20px inoneline flex-1">{{ activeContact.signature }}</span>
        </div>
      </div>
    </div>
    <!-- // TODO 重新实现 -->
    <el-button type="primary" @click="sendMsg">发消息</el-button>
  </div>
</template>

<script lang="ts" setup>
  import useFriendStore from '@/store/modules/friend';
  import { delFriend } from '@/api';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import useChatStore from '@/store/modules/chat';
  import { PAGE_SHOW_TYPE } from '@/utils/constant';
  import useSystemStore from '@/store/modules/system';
  import { clearMessageUnread } from '@/utils/common';
  import useSocketStore from '@/store/modules/socket';
  import useUserStore from '@/store/modules/user';
  import { useSessionOperate } from '@/Hooks';
  const GENDER = {
    0: '保密',
    1: '男',
    2: '女'
  };
  const activeContact = computed(() => {
    return useFriendStore().activeContact as Friend;
  });
  const deleteFriend = () => {
    ElMessageBox.confirm('该好友将从你的好友列表移除，是否继续', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      delFriend({ friendId: activeContact.value.userId, sessionId: activeContact.value?.sessionId }).then((res) => {
        // 删除好友列表
        delete useChatStore().friendGather[activeContact.value?.userId as string];
        // 删除最近会话列表
        delete useChatStore().sessionGather[activeContact.value?.sessionId as number];
        delete useChatStore().friendGather[activeContact.value?.userId as string];
        // 删除最近会话列表
        delete useChatStore().unReadGather[activeContact.value?.sessionId as number];
        // clearMessageUnread(activeContact.value?.sessionId);
        useSocketStore().socketIo?.emit('clearMessageUnread', {
          sessionId: activeContact.value?.sessionId,
          userId: useUserStore().userId
        });
        useFriendStore().setActiveContat(null);
        ElMessage({
          type: 'success',
          message: '删除成功'
        });
        useSystemStore().setShowPageType(PAGE_SHOW_TYPE['welcome']);
      });
    });
  };

  const sendMsg = async () => {
    if (activeContact.value) {
      const { sessionId } = activeContact.value;
      await useSessionOperate().create(sessionId);
      useSystemStore().setActiveTab(1);
      useSystemStore().setShowPageType(PAGE_SHOW_TYPE['chat']);
    }
  };
  const agree = () => {};
</script>
<style scoped lang="scss">
  .show-friend-info {
    height: 100%;
    background: #f3f3f3;
    padding-top: 50px;
    text-align: center;
  }
</style>
