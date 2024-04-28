<!--
 * @Description: 搜索好友/群聊
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div class="search">
      <el-select
        v-model="filterValue"
        filterable
        remote
        :reserve-keyword="false"
        :remote-method="remoteMethod"
        placeholder="搜索"
        no-data-text="暂无记录"
        :loading="loading"
        @change="selectChange"
      >
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-dropdown @command="handleCommand">
        <div class="ml10px add-icon">
          <span class="text-xl i-mdi:plus text-#858585" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :command="START_GROUP_CHAT">{{ $t('common.createGroup') }}</el-dropdown-item>
            <el-dropdown-item :command="ADD_FRIEND">{{ $t('common.addFriend') }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div
      @click="useSystemStore().setShowPageType(PAGE_SHOW_TYPE['friendNotice'])"
      v-if="activeTab === 2"
      class="flex items-center justify-between hover:bg-#e2dfdf h35px cursor-pointer"
    >
      <span class="text-[15px] pl10px">{{ $t('common.friendNotice') }}</span>
      <span class="i-mdi:chevron-right text-[20px] pr20px text-#645f5f" />
    </div>
    <div
      @click="useSystemStore().setShowPageType(PAGE_SHOW_TYPE['groupNotice'])"
      v-if="activeTab === 3"
      class="flex items-center justify-between hover:bg-#e2dfdf h35px cursor-pointer"
    >
      <span class="text-[15px] pl10px">群通知</span>
      <span class="i-mdi:chevron-right text-[20px] pr20px text-#645f5f" />
    </div>

    <el-dialog v-model="searchFriendDialogVisible" class="search-friend-dialog" title="搜索好友" width="350px">
      <div class="flex mb15px">
        <el-input v-model="searchTel" placeholder="手机号" />
        <el-button type="primary" class="ml5" @click="searchFriend">搜索</el-button>
      </div>
      <div v-if="!isEmpty(searchResult)" class="search-result">
        <div>
          <img class="avatar" :src="searchResult?.avatar" alt="" />
          <span class="ml10px">{{ searchResult?.username }}</span>
        </div>
        <el-tooltip
          effect="dark"
          content="添加好友"
          placement="top-start"
          v-if="searchResult?.userId !== useUserStore().userInfo.userId"
        >
          <el-button size="small" @click="addFriend">添加</el-button>
        </el-tooltip>
      </div>
      <template #footer></template>
    </el-dialog>
    <SelectUserOrGroup
      title="创建群聊"
      :type="SELECT_USER_TYPE.createGroup"
      @confim="confimCreateGroup"
      v-model:visible="createGroupDialogVisible"
    />
  </div>
</template>

<script setup lang="ts">
  import { PAGE_SHOW_TYPE, SELECT_USER_TYPE } from '@/utils/constant';
  import { search, requestAddFriend, createGroup } from '@/api';
  import { ElMessage } from 'element-plus';
  import { toArray, cloneDeep } from 'lodash';
  import useChatStore from '@/store/modules/chat';
  import useSystemStore from '@/store/modules/system';
  import { isEmpty } from '@/utils/is';
  import { generateGroupAvatar } from '@/utils/common';
  import useUserStore from '@/store/modules/user';
  const START_GROUP_CHAT = 1;
  const ADD_FRIEND = 2;
  const loading = ref(false);
  defineProps({
    activeTab: {
      type: Number,
      default: 1
    }
  });

  const emits = defineEmits(['changeActiveSession', 'update:activeTab', 'update:showPageType']);
  const searchTel = ref('');
  const searchResult = ref<Nullable<Omit<User, 'password'>>>(null);
  const options = ref<{ value: number; label: string }[]>([]);
  const createGroupDialogVisible = ref(false);
  const list = computed(() => toArray(useChatStore().sessionGather));

  const selectChange = (val: number) => {
    filterValue.value = '';
    const sessionItem = list.value.find((ele) => ele.sessionId === val);
    // useChatStore().setActiveSession(sessionItem);
    emits('changeActiveSession', { ...sessionItem, updatedAt: new Date().getTime() });
    // emits('update:showPageType', PAGE_SHOW_TYPE['chat']);
  };
  const remoteMethod = (query: string) => {
    if (query) {
      options.value = list.value
        .map((item) => {
          return {
            value: item.sessionId,
            label: item.username || item.remark
          };
        })
        .filter((item) => {
          return item?.label.includes(query);
        });
    } else {
      options.value = [];
    }
  };

  const searchFriendDialogVisible = ref(false);
  const filterValue = ref('');

  /**
   * @description 点击弹出框回调事件
   */
  const handleCommand = (key: number) => {
    if (key === ADD_FRIEND) {
      searchFriendDialogVisible.value = true;
    }
    if (key === START_GROUP_CHAT) {
      createGroupDialogVisible.value = true;
    }
  };

  /**
   * @description 确认创建群聊
   */
  const confimCreateGroup = (
    item: {
      selectUser: Friend[];
      groupName: string;
    },
    callback: Function
  ) => {
    if (!item.groupName) {
      ElMessage({
        message: '请填写群名称',
        type: 'warning'
      });
      return callback && callback();
    }
    if (item.selectUser.length < 2) {
      ElMessage({
        message: '请至少选择两个好友',
        type: 'warning'
      });
      return callback && callback();
    }
    let payload = {
      memberList: item.selectUser.map((item) => {
        return {
          userId: item.userId,
          username: item.username,
          avatar: item.avatar
        };
      }),
      groupName: item.groupName,
      avatar: ''
    };
    generateGroupAvatar(
      [useUserStore().userInfo.avatar, ...payload.memberList.slice(0, 8).map((item) => item.avatar)],
      item.groupName
    ).then((res) => {
      payload.avatar = res.fileUrl;
      console.log('res111', res);
      createGroup(payload)
        .then((res) => {
          ElMessage({
            message: '创建成功',
            type: 'success'
          });
          // // 设置最新的群聊gather和会话列表gather
          // useChatStore().setActiveSession(res.data);
          // useChatStore().setSingleGroupGather(res.data);
          // useChatStore().setSingleRecentMsgGather(res.data);
          // TODO bug修改
          emits('update:activeTab', 1);
          // createGroupDialogVisible.value = false;
        })
        .finally(() => {
          callback && callback();
        });
    });
  };
  /**
   * @description 搜索好友
   */
  // TODO 不能添加自己为好友
  const searchFriend = () => {
    search({
      tel: searchTel.value
    }).then((res) => {
      searchResult.value = res.data;
    });
  };
  const addFriend = () => {
    requestAddFriend({
      friendId: searchResult.value?.userId as string
    }).then(() => {
      searchFriendDialogVisible.value = false;
      searchResult.value = null;
      ElMessage({
        message: '发送请求成功',
        type: 'success'
      });
    });
  };
</script>
<style scoped lang="scss">
  :deep(.el-select .el-input__inner) {
    cursor: revert;
  }
  .add-icon {
    background-color: #f3f3f3;
    padding: 4px;
    border-radius: 50%;
    border: #f3f3f3;
    display: flex;
    align-items: center;
    outline: none;
    justify-content: center;
    cursor: pointer;
  }
  .search {
    padding: 0px 10px;
    display: flex;
    align-items: center;
    height: 50px;
    color: #ccc;
    .el-select {
      width: 100%;
    }
  }
  .search-result {
    display: flex;
    justify-content: space-between;
    align-items: center;
    div {
      display: flex;
      align-items: center;
    }
  }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 5px;
  }

  :deep(.search-friend-dialog) {
    .el-dialog__body {
      padding-top: 10px;
      padding-bottom: 0;
    }
  }
</style>
