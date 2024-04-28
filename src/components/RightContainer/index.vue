<!--
 * @Description: 右侧布局
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 15:58:26
-->
<template>
  <split-pane :min-percent="25" :default-percent="25" split="vertical" :max-percent="40">
    <template v-slot:paneL>
      <aside class="aside">
        <!-- 头部搜索栏 -->
        <Search v-model:activeTab="activeTab" @changeActiveSession="changeActiveSession" />
        <!-- 会话列表 -->
        <SessionList v-if="activeTab === 1" ref="sessionListRef" />
        <!-- 好友列表 -->
        <FriendList v-if="activeTab === 2" />
        <!-- 群列表 -->
        <GroupList v-if="activeTab === 3" />
      </aside>
    </template>
    <template v-slot:paneR>
      <main class="main">
        <!-- 展示欢迎界面 -->
        <Welcome v-if="showPageType === PAGE_SHOW_TYPE['welcome']" />
        <!-- 展示系统通知 -->
        <SystemNotice v-else-if="showPageType === PAGE_SHOW_TYPE['systemNotice']" />
        <slot v-else />
        <!-- 视频播放页面 -->
        <div v-if="systemStore.isPlaying" class="video-play" style="pointer-events: none">
          <Xgplayer :url="systemStore.previewUrl" style="pointer-events: auto" />
        </div>
      </main>
    </template>
  </split-pane>
</template>

<script lang="ts" setup>
  import useSystemStore from '@/store/modules/system';
  import { PAGE_SHOW_TYPE } from '@/utils/constant';
  import sessionList from '@/components/SessionList.vue';
  import SplitPane from '@/components/SplitPane/index.vue';
  import 'xgplayer/dist/index.min.css';
  const sessionListRef = ref<InstanceType<typeof sessionList>>();
  const systemStore = useSystemStore();
  const showPageType = computed(() => useSystemStore().showPageType);

  const activeTab = computed(() => systemStore.activeTab);
  const changeActiveSession = (sessionInfo: Session) => {
    sessionListRef.value!.clickSession(sessionInfo, true);
  };
</script>
<style scoped lang="scss">
  .aside {
    // width: 260px;
    height: 100%;
    border-right: 1px solid #f4f5f9;
  }
  .main {
    height: 100%;
  }
  .video-play {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #fff;
    text-align: right;
    .xgplayer {
      .xgplayer-controls {
        width: auto !important;
      }
    }
  }
</style>
