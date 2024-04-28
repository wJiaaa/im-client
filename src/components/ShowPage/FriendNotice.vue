<!--
 * @Description: 好友请求通知列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="msg-chat bg-#f3f3f3">
    <header class="message-header">
      <div>{{ $t('common.friendNotice') }}</div>
    </header>
    <!-- TODO 重新实现该样式 -->
    <!-- TODO 将已同意、已拒绝的放到最下面 -->
    <div class="main">
      <div v-for="item in addUserReqList" :key="item.id" class="add-item">
        <div class="flex items-center text-[15px] h50px w80%">
          <!-- 头像 -->
          <img
            :src="isCurrentUser(item.applicantId) ? item.friendAvatar : item.applicantAvatar"
            alt=""
            class="avatar mr10px"
          />
          <div class="w100%">
            <span class="text-blue">
              {{ isCurrentUser(item.applicantId) ? item.friendUsername : item.applicantUsername }}
            </span>
            <span class="ml5px">
              {{ isCurrentUser(item.applicantId) ? ADD_STATUS_TITLE[item.status] : '请求加为好友' }}
            </span>
            <div class="text-[13px] text-#aba7a7 mt3px w80% inoneline">留言: {{ item.remark }}</div>
          </div>
        </div>
        <div v-if="!isCurrentUser(item.applicantId)">
          <el-dropdown
            class="w91px"
            v-if="item.status === 0"
            split-button
            @click="() => handleClick('agree', item)"
            @command="() => handleClick('refuse', item)"
          >
            同意
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="refuse">拒绝</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div v-else class="text-14px text-#575757">
            {{ item.status === 1 ? '已同意' : '已拒绝' }}
          </div>
        </div>
        <div class="text-14px text-#575757" v-else>{{ ADD_STATUS_LABEL[item.status] }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import useFriendStore from '@/store/modules/friend';
  import { agreeFriendAddReq, refuseFriendAddReq } from '@/api';
  import { isCurrentUser } from '@/utils/common';
  const ADD_STATUS_TITLE = {
    0: '正在验证你的好友请求',
    1: '已同意你的好友请求',
    2: '已拒绝你的好友请求'
  };
  const ADD_STATUS_LABEL = {
    0: '等待验证',
    1: '已同意',
    2: '已拒绝'
  };
  const addUserReqList = computed(() => {
    return useFriendStore().addReqUserList.slice(0, 40);
  });
  console.log('addUserReqList', addUserReqList.value);
  const handleClick = (flag: 'agree' | 'refuse', item: FriendAddRequest) => {
    if (flag === 'agree') {
      agreeFriendAddReq({ requestUserId: item.applicantId, id: item.id }).then(() => {
        useFriendStore().updateReqUserList({ id: item.id, status: 1 });
      });
    } else {
      refuseFriendAddReq({ id: item.id }).then(() => {
        useFriendStore().updateReqUserList({ id: item.id, status: 2 });
      });
    }
  };
</script>
<style scoped lang="scss">
  .msg-chat {
    flex: 1;
    height: 100%;
    position: relative;
  }
  .message-header {
    padding: 0 12px;
    height: 60px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e4e3e3;
  }
  .main {
    padding: 10px 80px;
    padding-top: 15px;
    overflow: auto;
    height: calc(100% - 75px);
    .add-item {
      background-color: #fff;
      border-radius: 10px;
      height: 80px;
      margin: 0 auto;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 25px;
      .avatar {
        border-radius: 50%;
        width: 40px;
        height: 40px;
      }
    }
  }
</style>
