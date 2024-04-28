<template>
  <div class="main">
    <div class="group-announcement">
      <div class="flex items-center justify-between p10px">
        <span class="text-14px mt2px">最近群公告</span>
        <span
          title="更多群公告"
          class="i-icon-park-outline:right cursor-pointer"
          v-if="groupAnnouncement.length"
          @click="groupAnnouncementRef.openDialog()"
        />
        <span @click="addAnnouncement" v-else class="i-icon-park-outline:plus cursor-pointer" />
      </div>
      <div class="px10px text-13px h118px overflow-hidden text-ellipsis line-clamp-6 break-all">
        {{ lastGroupAnnouncement }}
      </div>
    </div>
    <div class="text-14px flex items-center justify-between h40px mx5px">
      <template v-if="!openSearchVisible">
        <span>群成员 {{ allGroupMemberList.length }}</span>
        <span class="i-icon-park-outline:search cursor-pointer" @click="openSearch" />
      </template>
      <template v-else>
        <el-input ref="inputRef" v-model="searchValue" placeholder="搜索" style="height: 24px" clearable>
          <template #prefix>
            <span class="i-icon-park-outline:search cursor-pointer" />
          </template>
        </el-input>
      </template>
    </div>
    <div class="flex-1 overflow-auto" ref="groupMemberListRef">
      <!-- TODO 这里多写一个div包裹是为了实现点击其他区域关闭输入框 清空输入值 可以看下是否可以优化 避免该div节点 实现上一层div高度动态 给个最大高度 -->
      <div ref="groupMemberRef">
        <div
          v-for="item in groupMemberList"
          :key="item.userId"
          class="groupmember-item"
          @click.right="($event) => showContextMenu($event, item)"
          @click="() => setFriendModelInfo(item)"
        >
          <span :class="['flex', 'items-center', item.type ? 'max-w-120px' : 'max-w-170px']">
            <img :src="item.avatar" alt="" />
            <span class="name truncate">{{ item.nickName }}</span>
          </span>
          <span v-if="item.type === 2" class="group-master">群主</span>
          <span v-else-if="item.type === 1" class="group-master">管理员</span>
        </div>
      </div>
    </div>
  </div>
  <transition name="el-fade-in">
    <div
      ref="modelRef"
      v-if="showMemberInfoModel"
      class="model"
      :style="{ right: modelRight + 'px', top: modelTop + 'px' }"
    >
      <div class="inner" :style="{ height: clickGroupMemberItem.isFriend ? '300px' : '250px' }">
        <div class="flex mb20px">
          <el-avatar shape="square" :size="65" :src="clickGroupMemberItem?.avatar" />
          <div class="ml10px flex flex-col text-14px">
            <!-- 备注/昵称 -->
            <span class="text-17px">
              {{ clickGroupMemberItem.remark || clickGroupMemberItem.username || clickGroupMemberItem.nickName }}
              <span
                v-if="clickGroupMemberItem.gender === 2"
                class="text-15px ml5px text-#ff5722 i-icon-park-outline:female"
              />
              <span
                v-if="clickGroupMemberItem.gender === 1"
                class="text-15px ml5px text-#2F88FF i-icon-park-outline:male"
              />
            </span>
            <template v-if="clickGroupMemberItem.isFriend">
              <span>昵称：{{ clickGroupMemberItem.username }}</span>
              <span>手机：{{ clickGroupMemberItem.tel }}</span>
            </template>
          </div>
        </div>
        <div class="text-15px flex flex-col">
          <div class="mb20px min-h-30px rounded-5px px-10px py-5px bg-#f3f5f7 text-12px">
            <span>{{ clickGroupMemberItem.signature || '-' }}</span>
          </div>
          <span class="mb10px" v-if="clickGroupMemberItem.isFriend">
            备注：
            <el-popover
              ref="remarkPopoverRef"
              :teleported="false"
              placement="top-start"
              :width="270"
              title="设置备注"
              trigger="click"
            >
              <template #reference>
                <span class="cursor-pointer underline underline-offset-3px">
                  {{ clickGroupMemberItem.remark || '未设置' }}
                </span>
              </template>
              <div ref="remarkRef">
                <el-input v-model="remark" style="width: 170px" placeholder="请设置备注" />
              </div>
            </el-popover>
          </span>
          <span class="mb10px">
            性别：
            <span>{{ clickGroupMemberItem.gender ? (clickGroupMemberItem.gender === 1 ? '男' : '女') : '未知' }}</span>
          </span>
          <span class="mb10px">
            邮箱：
            <span>{{ clickGroupMemberItem.email || '-' }}</span>
          </span>
          <div class="self-center mt10px" v-if="clickGroupMemberItem.isFriend">
            <el-button type="primary" @click="sendMsg(clickGroupMemberItem.sessionId)">发送消息</el-button>
          </div>
        </div>
        <div v-if="!clickGroupMemberItem.isFriend" class="flex self-center mt10px">
          <el-button type="primary" @click="addFriend(clickGroupMemberItem.userId)">添加好友</el-button>
        </div>
      </div>
    </div>
  </transition>
  <GroupAnnouncement
    :groupAnnouncement="groupAnnouncement"
    ref="groupAnnouncementRef"
    @addAnnouncement="addAnnouncement"
  />
  <AddAnnouncement
    @closeGroupAnnouncement="groupAnnouncementRef.close()"
    ref="addAnnouncementRef"
    :group-id="groupId"
  />
</template>

<script lang="ts" setup>
  import { useSessionOperate } from '@/Hooks';
  import { ElMessage } from 'element-plus';
  import { onClickOutside } from '@vueuse/core';
  import { useElementBounding } from '@vueuse/core';
  import { getGroupInfoApi, getGroupAnnouncementApi, getFriendInfo, requestAddFriend } from '@/api';
  import useCacheStore from '@/store/modules/cache';
  import eventEmitter from '@/utils/eventEmitter';
  import createContextMenu, { MenusOption } from '@/components/ContextMenu';
  import useChatStore from '@/store/modules/chat';
  import useUserStore from '@/store/modules/user';
  const props = defineProps({
    groupId: {
      type: Number,
      default: 0
    }
  });
  /** 是否显示搜索栏 */
  const openSearchVisible = ref(false);
  /** 搜索栏输入的值 */
  const searchValue = ref();
  /** 搜索栏ref */
  const inputRef = ref();
  const remarkRef = ref();
  const remarkPopoverRef = ref();
  /** 显示的群成员列表 */
  const groupMemberList = ref<GroupMember[]>([]);
  const groupMemberListRef = ref();
  const showMemberInfoModel = ref(false);
  const modelRef = ref();
  const groupInfo = ref<{
    groupName?: string;
    creatorId?: string;
  }>({});
  const lastGroupAnnouncement = ref('');
  const groupMemberRef = ref();
  const addAnnouncementRef = ref();
  /** 群公告列表 */
  const groupAnnouncement = ref<GroupAnnouncement[]>([]);
  // TODO 子组件ref  所有的都要添加子组件暴露的方法和变量的类型
  const groupAnnouncementRef = ref();
  let allGroupMemberList: GroupMember[] = [];
  /** 点击群成员列表 */
  const clickGroupMemberItem = ref<GroupMember | {}>({});
  const remark = ref();

  const { left, y } = useElementBounding(groupMemberListRef);
  const modelRight = ref();
  const modelTop = ref();

  onClickOutside(
    modelRef,
    () => {
      if (showMemberInfoModel.value) {
        showMemberInfoModel.value = false;
      }
    },
    {
      ignore: [remarkRef]
    }
  );

  onClickOutside(
    groupMemberRef,
    () => {
      if (openSearchVisible.value) {
        searchValue.value = '';
        openSearchVisible.value = false;
      }
    },
    {
      ignore: [inputRef]
    }
  );
  // 增加群公告
  const addAnnouncement = () => {
    addAnnouncementRef.value.openDialog();
  };
  const openSearch = () => {
    openSearchVisible.value = true;
    nextTick(() => {
      inputRef.value.focus();
    });
  };
  /**
   * @Description 获取群聊信息
   * @param groupId 群Id
   */
  const getGroupInfo = (groupId: number) => {
    getGroupInfoApi({ groupId }).then((res) => {
      groupInfo.value = {
        groupName: res.data.groupName,
        creatorId: res.data.creatorId
      };
      lastGroupAnnouncement.value =
        res.data.groupAnnouncement.find((o) => o.isTop)?.content ||
        res.data.groupAnnouncement[0]?.content ||
        '暂无公告';
      groupAnnouncement.value = res.data.groupAnnouncement;
      getGroupMemberList(groupId);
    });
  };
  /**
   *  添加好友
   */
  const addFriend = (friendId: string) => {
    requestAddFriend({
      friendId
    }).then(() => {
      showMemberInfoModel.value = false;
      ElMessage({
        message: '发送请求成功',
        type: 'success'
      });
    });
  };
  /**
   *  获取群成员列表
   */
  const getGroupMemberList = (groupId: number) => {
    useCacheStore()
      .getGroupMemberList(groupId)
      .then((res) => {
        const newList = getNewGroupListOrderByGroupMaster(res, groupInfo.value.creatorId!);
        groupMemberList.value = newList;
        allGroupMemberList = newList;
      });
  };
  /**
   *  获取群公告
   */
  const getGroupAnnouncement = (groupId: number) => {
    getGroupAnnouncementApi({ groupId }).then((res) => {
      groupAnnouncement.value = res.data;
      lastGroupAnnouncement.value = res.data.find((o) => o.isTop)?.content || res.data[0]?.content || '暂无公告';
    });
  };
  /**
   * @Description 将群的管理员放到列表前面
   */
  const getNewGroupListOrderByGroupMaster = (list: GroupMember[], creatorId: string): GroupMember[] => {
    const masterIndex = list.findIndex((o) => o.userId === creatorId);
    const masterItem = list.splice(masterIndex, 1);
    list.unshift({ ...masterItem[0], isMaster: true });
    return list;
  };
  const changeSearchValue = (value: string) => {
    if (!value) {
      groupMemberList.value = allGroupMemberList;
    } else {
      groupMemberList.value = allGroupMemberList.filter((item) => item.username.indexOf(value) !== -1);
    }
  };
  // TODO 群好友变更需要通知群进行修改 或者设置一个好友的标识 如果变了则重新拉取
  const setFriendModelInfo = (friendInfo: GroupMember) => {
    const friendItem = useChatStore().friendGather[friendInfo.userId];
    if (friendInfo.userId === useUserStore().userId) return;
    console.log('friendInfo', friendInfo);

    if (friendItem) {
      getFriendInfo({
        friendId: friendInfo.userId
      }).then((res) => {
        //TODO 优化
        clickGroupMemberItem.value = { isFriend: true, ...res.data[0], sessionId: friendItem.sessionId };
        remark.value = res.data[0].remark;
        showMemberInfoModel.value = true;
      });
    } else {
      clickGroupMemberItem.value = {
        ...friendInfo,
        isFriend: false
      };
      showMemberInfoModel.value = true;
    }
  };
  /**
   * @description 处理更新群公告
   */
  const handleUpdateGroupAnnouncement = () => {
    getGroupAnnouncement(props.groupId);
  };
  /**
   * @description
   * 不使用v-menus指令是由于菜单需要动态创建
   */
  const showContextMenu = (e: MouseEvent, memberItem: GroupMember) => {
    if (memberItem.userId === useUserStore().userId) {
      return;
    }
    e.preventDefault();
    const menu = createMenu(memberItem);
    createContextMenu(e, menu);
  };
  const createMenu = (memberItem: GroupMember): any => {
    const friendList = useChatStore().friendGather;
    const { userId } = memberItem;
    const isFriend = friendList[userId];
    const menuList = [
      {
        label: '@TA',
        menuAction: () => {
          eventEmitter.emit('mentionUser', memberItem);
        }
      },
      {
        label: '查看资料',
        menuAction: () => {
          setFriendModelInfo(memberItem);
        }
      }
    ];
    if (isFriend) {
      menuList.unshift({
        label: '发送消息',
        menuAction: () => {
          const { sessionId } = isFriend;
          sendMsg(sessionId);
        }
      });
    } else {
      menuList.push({
        label: '添加好友',
        menuAction: () => {
          addFriend(memberItem.userId);
        }
      });
    }
    return menuList;
  };
  const sendMsg = async (sessionId: number) => {
    await useSessionOperate().create(sessionId);
    eventEmitter.emit('handleSessionScroll', { sessionId });
  };
  watch(
    () => left.value,
    (val) => {
      modelRight.value = window.innerWidth - val + 5;
      modelTop.value = y.value - 20;
    }
  );
  watch(
    () => searchValue.value,
    (val) => {
      changeSearchValue(val);
    }
  );
  watch(
    () => props.groupId,
    (val) => {
      searchValue.value = '';
      openSearchVisible.value = false;
      getGroupInfo(val);
    },
    {
      immediate: true
    }
  );
  onMounted(() => {
    eventEmitter.on('updateGroupAnnouncement', handleUpdateGroupAnnouncement);
  });
  onBeforeUnmount(() => {
    eventEmitter.off('updateGroupAnnouncement');
  });
  defineExpose({
    getMemberList: (): GroupMember[] => groupMemberList.value,
    getGroupMemberList
  });
</script>
<style scoped lang="scss">
  @import '@/styles/base.scss';
  .model {
    position: fixed;
    z-index: 999;

    .inner {
      background-color: #ffffff;
      width: 250px;
      height: 300px;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #e4e7ed;
      box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
    }
  }
  :deep(.el-input) {
    .el-input__wrapper {
      padding-left: 5px;
    }
    .el-input__prefix-inner > :last-child {
      margin-right: 5px;
    }
  }
  .main {
    border-left: 1px solid #f4f5f9;
    height: 100%;
    display: flex;
    width: 180px;
    flex-direction: column;
    .groupmember-item {
      display: flex;
      align-items: center;
      height: 34px;
      cursor: pointer;
      margin-bottom: 5px;
      font-size: 14px;
      .name {
        margin-left: 10px;
      }
      img {
        width: 20px;
        height: 20px;
        margin-left: 10px;
      }
      .group-master {
        background-color: #ebcb7e;
        color: #6e4a1a;
        margin-left: 10px;
        font-size: 12px;
        padding: 0 3px;
        border-radius: 3px;
      }
    }
    .group-announcement {
      height: 175px;
      border-bottom: 1px solid #f4f5f9;
    }
    .groupmember-item:hover {
      background: rgba(89, 138, 202, 0.1);
      transition: all 0.3s;
    }
  }
</style>
