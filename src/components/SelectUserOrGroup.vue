<!--
 * @Description: 选择好友或者群聊
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<!-- 作为全局方法进行挂载 -->
<template>
  <el-dialog class="start-group-chat-dialog" v-model="Pvisible" :title="props.title" width="650px">
    <div class="content">
      <div class="friend-list">
        <el-input
          class="mb10px pr10px"
          v-model="filterFriendValue"
          placeholder="搜索好友"
          clearable
          @keyup.enter="filterFriend"
          @clear="() => (friendList = allFriendListComputed)"
          @input="
            (val) => {
              if (!val) {
                friendList = allFriendListComputed;
              }
            }
          "
        >
          <template #prefix>
            <span class="text-lg i-mdi:magnify" />
          </template>
        </el-input>
        <div class="user-list">
          <el-button @click="selectAll">全选</el-button>
          <el-scrollbar v-if="friendList?.length" max-height="400px" class="user-list">
            <div
              class="flex justify-between mr15px cursor-pointer mb-5px"
              v-for="item in friendList"
              :key="item.userId"
              @click="selectInviteUserChange(item)"
            >
              <div class="flex items-center">
                <img class="user-avatar" :src="item.avatar || item.avatar" alt="" />
                <span
                  class="inoneline max-w-180px cursor-default"
                  :title="item.remark || item.username || item.groupName"
                >
                  {{ item.remark || item.username || item.groupName }}
                </span>
              </div>
              <el-checkbox
                v-model="item.inviteFlag"
                size="large"
                @change="selectInviteUserChange(item)"
                @click="(e: Event) => e.stopPropagation()"
              />
            </div>
          </el-scrollbar>
          <el-empty v-else description="暂无好友可邀请入群" />
        </div>
      </div>
      <div class="invite-info">
        <template v-if="type === SELECT_USER_TYPE.createGroup">
          <div class="group-name">群名称(必填)</div>
          <el-input v-model="groupInfo.groupName" maxlength="20" show-word-limit placeholder="请填写群名称" />
        </template>
        <el-divider content-position="left">已选 {{ groupInfo.selectUser?.length }} 个好友</el-divider>
        <div class="user-list" v-if="groupInfo.selectUser?.length">
          <el-scrollbar max-height="320px">
            <div
              class="flex justify-between items-center mr10px mb-5px"
              v-for="item in groupInfo.selectUser"
              :key="item.userId"
            >
              <div class="flex items-center">
                <img class="user-avatar" :src="item.avatar || item.avatar" alt="" />
                <span
                  class="max-w-285px cursor-default intwoline"
                  :title="item.remark || item.username || item.groupName"
                >
                  {{ item.remark || item.username || item.groupName }}
                </span>
              </div>
              <span class="i-mdi:delete text-[17px] text-red cursor-pointer" @click="handleRemoveUser(item)" />
            </div>
          </el-scrollbar>
        </div>
        <el-empty v-else description="暂未选择好友" />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="Pvisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="confim()">
          {{ type === SELECT_USER_TYPE.createGroup ? '创建' : '确定' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import useChatStore from '@/store/modules/chat';
  import { SELECT_USER_TYPE } from '@/utils/constant';
  import { cloneDeep, findIndex, remove, toArray } from 'lodash';

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    /** 群成员列表 (用来过滤不需要选择的用户 可以换个名字) */
    groupMemberList: {
      type: Array,
      default: () => []
    },
    type: {
      type: Number,
      default: SELECT_USER_TYPE.createGroup
    }
  });

  const emits = defineEmits(['update:visible', 'confim']);
  const loading = ref(false);
  const filterFriendValue = ref('');
  const friendList = ref<({ inviteFlag?: boolean } & Friend)[]>();

  const groupInfo = ref<{
    selectUser: Friend[];
    groupName: string;
  }>({
    selectUser: [],
    groupName: ''
  });

  const allFriendListComputed = computed(() => {
    if (props.type === SELECT_USER_TYPE.forwardMessage) {
      return toArray({ ...useChatStore().groupGather, ...useChatStore().friendGather });
    }
    return toArray(useChatStore().friendGather).filter(
      (item) => !props.groupMemberList.map((k) => k.userId).includes(item.userId)
    );
  });

  const Pvisible = computed({
    get() {
      return props.visible;
    },
    set(val) {
      emits('update:visible', val);
    }
  });

  watch(
    () => Pvisible.value,
    (val) => {
      if (val) {
        initCreatGourpValue();
      }
    }
  );

  /**
   * @description 初始化创建群组参数
   */
  const initCreatGourpValue = () => {
    friendList.value = cloneDeep(allFriendListComputed.value).map((item) => {
      return {
        ...item,
        inviteFlag: false
      };
    });
    groupInfo.value.selectUser = [];
    groupInfo.value.groupName = '';
  };

  watch(allFriendListComputed, (val) => {
    friendList.value = cloneDeep(val);
  });

  const filterFriend = () => {
    friendList.value = allFriendListComputed.value.filter(
      (item) => item.remark?.includes(filterFriendValue.value) || item.username?.includes(filterFriendValue.value)
    );
  };

  /**
   * @description 邀请好友变化
   */
  const selectInviteUserChange = (item: { inviteFlag?: boolean } & Friend) => {
    const index = findIndex(groupInfo.value.selectUser, (o) => o.userId === item.userId);
    if (index === -1) {
      item.inviteFlag = true;
      groupInfo.value.selectUser.push(item);
    } else {
      handleRemoveUser(item);
    }
  };
  /**
   * @description 移除邀请的好友
   */
  const handleRemoveUser = (item: Friend) => {
    friendList.value = friendList.value?.map((o) => {
      return {
        ...o,
        ...(o.userId === item.userId && { inviteFlag: false })
      };
    });
    remove(groupInfo.value.selectUser, (o) => o.userId === item.userId);
  };
  const selectAll = () => {
    groupInfo.value.selectUser = allFriendListComputed.value;
  };
  const confim = () => {
    loading.value = true;
    const payload = {
      ...groupInfo.value
    };
    emits('confim', payload, () => {
      groupInfo.value.groupName = (+groupInfo.value.groupName + 1).toString();
      loading.value = false;
    });
  };
</script>
<style lang="scss">
  .start-group-chat-dialog {
    border-radius: 5px;
    .el-dialog__header {
      margin-right: 0;
      padding: 15px;
    }
    .el-dialog__body {
      padding: 0;
      border-bottom: 1px solid rgb(225, 222, 222);
      border-top: 1px solid rgb(225, 222, 222);
    }
    .el-dialog__footer {
      padding: 15px;
    }
    .user-list {
      .user-avatar {
        width: 35px;
        height: 35px;
        margin-right: 10px;
      }
    }
    .content {
      height: 460px;
      display: flex;
      .friend-list {
        border-right: 1px solid rgb(225, 222, 222);
        padding: 10px 0px 10px 10px;
        width: 260px;
      }
      .invite-info {
        flex: 1;
        padding: 10px;
        .group-name {
          margin: 6px 0px 10px;
          font-weight: 700;
        }
      }
    }
  }
</style>
<style scoped lang="scss"></style>
