<!--
 * @Description: 群信息
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 21:23:48
-->
<!-- TODO 修改群信息和好友信息 不然很空 ui不好看 -->
<template>
  <div class="show-friend-info">
    <div class="flex items-center justify-around">
      <div class="flex justify-center items-center">
        <!-- 群聊头像 -->
        <el-avatar shape="square" size="large" :src="activeContact.avatar" />
        <span class="ml10px">
          {{ activeContact?.groupName }}
          <!-- TODO 群也可以加个备注 -->
        </span>
      </div>
      <div class="text-gray-500 cursor-pointer flex items-center">
        <span class="i-mdi:delete-sweep text-[24px]" />
        <span class="text-[#797979] text-[14px] ml2px" @click="exitGroup()">退群</span>
      </div>
    </div>
    <el-button type="primary" @click="sendMsg">发消息</el-button>
  </div>
</template>

<script lang="ts" setup>
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { exitGroupApi } from '@/api';
  import useFriendStore from '@/store/modules/friend';
  import useChatStore from '@/store/modules/chat';
  import useSocketStore from '@/store/modules/socket';
  import useSystemStore from '@/store/modules/system';
  import { PAGE_SHOW_TYPE } from '@/utils/constant';
  import { clearMessageUnread } from '@/utils/common';
  import { useSessionOperate } from '@/Hooks';
  const activeContact = computed(() => {
    return useFriendStore().activeContact as Group;
  });
  const sendMsg = async () => {
    if (activeContact.value) {
      const { sessionId } = activeContact.value;
      await useSessionOperate().create(sessionId);
      useSystemStore().setActiveTab(1);
      useSystemStore().setShowPageType(PAGE_SHOW_TYPE['chat']);
    }
  };
  const exitGroup = () => {
    ElMessageBox.confirm('是否退出该群聊', 'Warning', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      console.log('activeContact', activeContact.value);
      exitGroupApi({ groupId: activeContact.value?.groupId!, sessionId: activeContact.value?.sessionId! }).then(
        (res) => {
          // 删除群列表
          delete useChatStore().groupGather[activeContact.value?.groupId!];
          // 删除最近会话列表
          delete useChatStore().sessionGather[activeContact.value?.sessionId as number];
          clearMessageUnread(activeContact.value?.sessionId!);
          useSocketStore().socketIo?.emit(
            'exitGroup',
            {
              groupId: activeContact.value?.groupId
            },
            () => {
              useFriendStore().setActiveContat(null);
              ElMessage({
                type: 'success',
                message: '退出成功'
              });
              useSystemStore().setShowPageType(PAGE_SHOW_TYPE['welcome']);
            }
          );
        }
      );
    });
  };
</script>
<style scoped lang="scss">
  .show-friend-info {
    width: 100%;
    height: 100%;
    background: #f3f3f3;
    padding-top: 50px;
    text-align: center;
  }
</style>
