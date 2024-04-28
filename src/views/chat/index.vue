<!--
 * @Description: 聊天页
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 21:07:56
-->
<template>
  <RightContainer>
    <div class="chat" v-if="!isEmpty(activeSession)">
      <!-- 聊天框头部 -->
      <header class="chat-header">
        <!-- TODO 备注需要返回 -->
        <div class="friend-info">
          <span
            :class="[
              'text-12px',
              'text-#fff',
              'px-3px',
              'rounded-2px',
              isGroupChat(activeSession?.sessionType) ? 'bg-#24a0ff' : 'bg-#f97348'
            ]"
          >
            <!-- TODO 增加机器人类型 -->
            {{ isGroupChat(activeSession?.sessionType) ? '群组' : activeSession?.isRobot ? '机器人' : '好友' }}
          </span>
          <span
            :title="
              !isGroupChat(activeSession.sessionType)
                ? activeSession.remark || activeSession.username
                : activeSession.groupName
            "
            class="ml5px inoneline max-w-280px"
          >
            {{
              !isGroupChat(activeSession.sessionType)
                ? activeSession.remark || activeSession.username
                : activeSession.groupName
            }}
          </span>
        </div>
        <div class="text-#333333">
          <span
            v-if="isGroupChat(activeSession?.sessionType)"
            @click.native="handleAddGroupMember"
            class="i-icon-park-outline:people-plus mr15px text-[24px] cursor-pointer"
          />
          <span @click.native="handleClick" id="showSideBar" class="i-mdi:dots-horizontal text-[26px] cursor-pointer" />
        </div>
      </header>
      <section class="flex h100% overflow-auto relative">
        <section class="chat-body">
          <split-pane split="horizontal" :default-percent="65" :minPercent="35">
            <template v-slot:paneL><ChatBox ref="chatBoxRef" /></template>
            <template v-slot:paneR><Editor /></template>
          </split-pane>
        </section>
        <GroupDetail
          v-if="isGroupChat(activeSession?.sessionType)"
          ref="groupDetailRef"
          :group-id="+activeSession.receiverId"
        />
        <Drawer v-model:showSideBar="showSideBar">
          <el-form label-position="top" label-width="auto" :model="infoForm">
            <template v-if="isGroupChat(activeSession?.sessionType)">
              <el-form-item label="群聊名称">
                <el-input v-model="infoForm.groupName" />
              </el-form-item>
              <el-form-item label="我的本群昵称">
                <el-input v-model="infoForm.nickName" />
              </el-form-item>
              <el-form-item label="群聊备注">
                <el-input v-model="infoForm.remark" placeholder="填写备注" />
              </el-form-item>
            </template>
            <template v-else>
              <el-form-item label="好友备注">
                <el-input v-model="infoForm.remark" placeholder="填写备注" />
              </el-form-item>
            </template>
            <el-form-item label="">
              <div class="setting">
                <div class="set-item">
                  <span>设为置顶</span>
                  <el-switch v-model="infoForm.isTop" />
                </div>
                <el-divider style="margin: 3px 0" />
                <div class="set-item">
                  <span>消息免打扰</span>
                  <el-switch v-model="infoForm.isDisturb" />
                </div>
              </div>
            </el-form-item>
            <el-form-item label="">
              <el-button class="w100% mt40px" type="danger" plain>删除聊天记录</el-button>
            </el-form-item>
            <el-form-item label="">
              <el-button v-if="isGroupChat(activeSession?.sessionType)" class="w100% mt10px" type="danger" plain>
                退出群聊
              </el-button>
              <el-button v-else class="w100% mt10px" type="danger" plain>删除好友</el-button>
            </el-form-item>
          </el-form>
        </Drawer>
      </section>
    </div>
    <SelectUserOrGroup
      :type="SELECT_USER_TYPE.inviteUserToGroup"
      title="为群聊选择用户"
      :groupMemberList="groupMemberList"
      @confim="confimAddUserToGroup"
      v-model:visible="addUserToGroupDialog"
    />
  </RightContainer>
</template>

<script lang="ts" setup>
  import GroupDetail from '@/components/GroupDetail.vue';
  import ChatBox from './components/ChatList/index.vue';
  import Editor from './components/Editor/index.vue';
  import useChatStore from '@/store/modules/chat';
  import SplitPane from '@/components/SplitPane/index.vue';
  import { SELECT_USER_TYPE } from '@/utils/constant';
  import { generateGroupAvatar, isGroupChat } from '@/utils/common';
  import { isEmpty } from '@/utils/is';
  import { invite } from '@/api';
  import useUserStore from '@/store/modules/user';
  import { useUserInfo } from '@/Hooks';
  const activeSession = computed(() => useChatStore().activeSession);
  const showSideBar = ref(false);
  const chatBoxRef = ref();
  const addUserToGroupDialog = ref(false);
  const groupMemberList = ref<GroupMember[]>([]);
  const infoForm = ref<Pick<Session, 'groupName' | 'remark' | 'isTop' | 'isDisturb'> & { nickName: string }>({
    groupName: '',
    nickName: '',
    remark: '',
    isTop: false,
    isDisturb: false
  });
  const groupDetailRef = ref<InstanceType<typeof GroupDetail>>();
  const handleAddGroupMember = () => {
    groupMemberList.value = groupDetailRef.value?.getMemberList() as GroupMember[];
    const user = groupDetailRef.value?.getMemberList().find((k) => k.userId === useUserStore().userId);
    if (user.isMaster) {
      addUserToGroupDialog.value = true;
    } else {
      ElMessage({
        type: 'warning',
        message: '群管理员才可进行邀请好友!'
      });
    }
  };
  const confimAddUserToGroup = (
    item: {
      selectUser: Friend[];
      groupName: string;
    },
    callback: Function
  ) => {
    const memberList = item.selectUser.map((item) => {
      return {
        userId: item.userId,
        username: item.username,
        avatar: item.avatar
      };
    });

    const payload = {
      memberList,
      groupId: +activeSession.value.receiverId,
      avatar: ''
    };
    if (groupDetailRef.value?.getMemberList() && groupDetailRef.value?.getMemberList().length >= 9) {
      invite(payload)
        .then(() => {
          addUserToGroupDialog.value = false;
        })
        .finally(() => {
          callback && callback();
        });
    } else {
      const list = groupDetailRef.value?.getMemberList() as GroupMember[];
      const newList = payload.memberList
        .concat(list)
        .slice(0, 8)
        .map((item) => item.avatar);
      generateGroupAvatar(newList, item.groupName).then((res) => {
        payload.avatar = res.fileUrl;
        invite(payload)
          .then(() => {
            addUserToGroupDialog.value = false;
            return groupDetailRef.value?.getGroupMemberList(payload.groupId);
          })
          .finally(() => {
            callback && callback();
          });
      });
    }
  };
  const handleClick = () => {
    showSideBar.value = !showSideBar.value;
    if (showSideBar.value) {
      const { userInfo } = useUserInfo(useUserStore().userId);
      console.log('userInfo', userInfo);
      infoForm.value = {
        groupName: activeSession.value.groupName,
        isTop: Boolean(activeSession.value.isTop),
        isDisturb: Boolean(activeSession.value.isDisturb),
        remark: userInfo.value?.remark,
        nickName: userInfo.value?.nickName
      };
    }
  };
</script>
<style scoped lang="scss">
  @import './index.scss';
  .setting {
    padding: 5px 10px;
    background-color: #fff;
    width: 100%;
    border-radius: 4px;
    margin-top: 15px;
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
    .set-item {
      display: flex;
      justify-content: space-between;
    }
  }
</style>
