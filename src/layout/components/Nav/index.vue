<template>
  <el-aside class="menu">
    <!-- 顶部头像区域 -->
    <div class="menu-header">
      <el-avatar class="avatar" :src="useUserStore().userInfo.avatar"></el-avatar>
    </div>
    <div class="menu-main">
      <div class="active-bar" :style="activeBarStyle" />
      <div
        ref="menuItems"
        :class="['menu-items', item.id === activeTab ? 'active' : '', showTipsDot(item) && 'tips']"
        v-for="(item, index) in navList"
        :key="index"
        @click="clickNav(item)"
      >
        <span :class="['mb5px', 'text-lg', item.iconName]" />
        <span class="text-[13px]">{{ $t(item.label) }}</span>
      </div>
    </div>
    <div class="menu-footer">
      <p class="cursor-pointer text-#24a0ff" @click="quit">退出</p>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus';
  import useChatStore from '@/store/modules/chat';
  import useSystemStore from '@/store/modules/system';
  import { PAGE_SHOW_TYPE } from '@/utils/constant';
  import type { CSSProperties } from 'vue';
  import { RouteLocationRaw } from 'vue-router';
  import useFriendStore from '@/store/modules/friend';
  import { isCurrentUser } from '@/utils/common';
  import useUserStore from '@/store/modules/user';
  const router = useRouter();

  const instance = getCurrentInstance()!;
  const activeBarStyle = ref<CSSProperties>();
  // 未读数
  const unReadNums = computed(() => {
    let flag = false;
    for (const key in useChatStore().unReadGather) {
      if (useChatStore().unReadGather[key]) {
        flag = true;
        break;
      }
    }
    return flag;
  });
  const activeTab = computed(() => {
    return useSystemStore().activeTab;
  });
  const requestUser = computed(() => {
    return useFriendStore().addReqUserList || [];
  });
  const showTipsDot = (item: NavItem) => {
    // 遍历好友请求列表 判断是否有未处理的请求
    if (item.id === 1) {
      return unReadNums.value;
    }
    if (item.id === 2 && requestUser.value.length) {
      const hasUnDealReq = requestUser.value.some((o) => {
        if (!isCurrentUser(o.applicantId) && o.status === 0) {
          return true;
        }
      });
      if (hasUnDealReq) {
        return true;
      }
    }
  };
  const getActiveBarStyle = () => {
    const $el = instance.refs?.['menuItems'] as HTMLElement[];
    if (!$el) {
      return;
    }
    // getBoundingClientRect 元素离视口的距离
    return {
      transform: `translateY(${
        $el[activeTab.value - 1].getBoundingClientRect().top - $el[0].getBoundingClientRect().top + 'px'
      })`
    };
  };

  watch(
    () => activeTab.value,
    async (newVal) => {
      await nextTick();
      activeBarStyle.value = getActiveBarStyle();
      router.push(navList.find((o) => o.id === newVal)!.path);
    },
    { immediate: true }
  );
  type NavItem = {
    id: 1 | 2 | 3 | 4;
    label: string;
    iconName: string;
    path: RouteLocationRaw;
  };
  const navList: NavItem[] = [
    { id: 1, label: 'tab.chat', iconName: 'i-mdi:message-processing-outline', path: '/home/chat' },
    { id: 2, label: 'tab.friend', iconName: 'i-mdi:account-outline', path: '/home/friend' },
    { id: 3, label: 'tab.group', iconName: 'i-mdi:account-group', path: '/home/group' },
    { id: 4, label: 'tab.setting', iconName: 'i-mdi:cog', path: '/home/setting' }
  ];
  const clickNav = (item: NavItem) => {
    useSystemStore().setActiveTab(item.id);
    useChatStore().setActiveSession({});
    useSystemStore().setShowPageType(PAGE_SHOW_TYPE['welcome']);
  };
  const quit = () => {
    useUserStore()
      .logOut()
      .then(() => {
        router.push('/login');
        ElMessage({
          message: '退出成功',
          type: 'success'
        });
      });
  };
</script>
<style scoped lang="scss">
  @import '@/styles/base.scss';
  .menu {
    height: 100%;
    width: 100%;
    background-color: $primary-color8;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  .menu-header {
    height: 90px;
    margin-top: 20px;
    width: 100%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-top: 18px;
    box-sizing: border-box;
    cursor: pointer;
    .online {
      color: #65c468;
      margin-top: 5px;
      font-size: 13px;
      font-weight: 300;
    }
  }
  .menu-main {
    flex: auto;
    width: 100%;
    overflow: hidden;
    margin-top: 20px;
    .active {
      color: $primary-color2 !important;
      font-weight: 600;
    }
    .active-bar {
      height: 54px;
      position: absolute;
      background-color: $primary-color2;
      width: 3px;
      transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      list-style: none;
    }
    .menu-items {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      list-style: none;
      padding-top: 5px;
      padding-bottom: 10px;
      cursor: pointer;
      font-weight: 500;
      color: $primary-color6;
      position: relative;
    }
    .menu-items:hover {
      @extend .active;
    }
    @keyframes notifymove {
      0% {
        background: #ff1e1e;
      }

      25% {
        background-color: #ffffff26;
      }

      50% {
        background: #ff1e1e;
      }

      75% {
        background-color: #ffffff26;
      }

      to {
        background: #ff1e1e;
      }
    }
    .tips::after {
      content: ' ';
      position: absolute;
      width: 5px;
      height: 5px;
      color: red;
      right: 5px;
      display: inline-block;
      background: #ff1e1e;
      border-radius: 5px;
      top: 5px;
      animation: notifymove 3s infinite;
    }
  }
  .menu-footer {
    height: 100px;
    width: 100%;
    flex-shrink: 0;
    font-size: 15px;
    color: #cfcfcf;
    font-weight: 300;
    p {
      height: 20px;
      line-height: 20px;
      text-align: center;
    }
  }
</style>
