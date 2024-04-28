<!--
 * @Description: 消息列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 21:10:32
-->
<template>
  <main class="chat-main" v-loading="messageStore.loading">
    <div class="top-container" v-if="topMessageInfo.topMsgId">
      <div class="message-top">
        <div class="top-icon">
          <span class="i-icon-park-outline:to-top text-13px"></span>
        </div>
        <div class="flex-1 inoneline">
          <div class="text-14px inoneline">
            {{ topMessageInfo.messageSendUserName }}:
            {{ topMessageInfo.content }}
          </div>
          <div class="text-12px text-#ccc">
            由
            <span class="text-#3076f6">{{ topMessageInfo?.topMsgUserName }}</span>
            置顶
          </div>
        </div>
        <div class="text-16px ml10px mr10px flex items-center justify-center">
          <div class="mr20px flex items-center justify-center hover:bg-#ccc w20px h20px cursor-pointer">
            <span title="回到原文" class="i-icon-park-outline:efferent-three" />
          </div>
          <div class="flex items-center justify-center hover:bg-#ccc w20px h20px cursor-pointer">
            <span title="取消置顶" class="i-icon-park-outline:close" @click="removeTopMessage" />
          </div>
        </div>
      </div>
    </div>
    <el-scrollbar ref="scrollbarRef" v-if="!showEmpty" @scroll="handleScroll">
      <ul class="message-list" ref="messageRef">
        <!-- 数据加载状态栏 -->
        <div class="load-toolbar pointer">
          <span v-if="messageStore.loadMsgFlag">正在加载数据中 ...</span>
          <span v-else class="no-more">没有更多消息了</span>
        </div>
        <!-- 消息列表 -->
        <li v-for="(msgItem, index) in messageStore.messageList" :key="msgItem.msgToken" ref="item">
          <!-- 消息时间 -->
          <div class="msg-time" v-show="isShowMsgTime(index, msgItem)">
            {{ prettyTime(msgItem.updatedAt) }}
          </div>
          <!-- 系统消息 -->
          <SystemMessage
            v-if="msgItem.messageType === MESSAGE_TYPE_SYSTEM || msgItem.messageType === MESSAGE_TYPE_TOP"
            :msgItem="msgItem"
          />
          <!-- 撤回消息 -->
          <RevokeMessage :key="msgItem.msgId" v-else-if="msgItem.isRevoke" :msgItem="msgItem" />
          <MsgItem v-else :msgItem="msgItem" />
          <!-- 引用消息 -->
          <div class="w100%">
            <div
              v-if="msgItem.extra && msgItem.extra.quote && !msgItem.isRevoke"
              :class="['talk-reply', 'pointer', isCurrentUser(msgItem.senderId) ? 'float-right mr45px' : 'ml45px']"
            >
              <span class="ellipsis">
                {{
                  msgItem.extra?.quote.senderId === useUserStore().userId
                    ? useUserStore().userInfo.username
                    : useChatStore().friendGather[msgItem.extra?.quote.senderId].username
                }}:
                {{
                  msgItem.extra?.quote?.messageType === MESSAGE_TYPE_TEXT
                    ? msgItem.extra?.quote?.content
                    : MESSAGE_SHOW_CONTENT[msgItem.extra?.quote?.messageType]
                }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </el-scrollbar>
    <!-- 空状态 -->
    <div v-else class="empty-img">
      <img style="width: 350px" src="@/assets/svg/empty-icon.svg" alt="" />
      <span class="text-14px text-#a2a2a2">空空如也</span>
    </div>
    <transition name="el-fade-in">
      <div
        class="to-bottom"
        v-if="!skipBottom"
        @click="
          () => {
            scrollbarRef.scrollTo({
              top: messageRef.scrollHeight,
              left: 0,
              behavior: 'smooth'
            });
          }
        "
      >
        <span class="i-icon-park-outline:double-down"></span>
      </div>
    </transition>
  </main>
</template>

<script lang="ts" setup>
  import dayjs from 'dayjs';
  import MsgItem from './MsgItem/index.vue';
  import useUserStore from '@/store/modules/user';
  import { ElMessage } from 'element-plus';
  import useChatStore from '@/store/modules/chat';
  import { throttle, find } from 'lodash';
  import { isCurrentUser } from '@/utils/common';
  import evEmitter from '@/utils/eventEmitter';
  import { MESSAGE_TYPE_TEXT, MESSAGE_SHOW_CONTENT, MESSAGE_TYPE_SYSTEM, MESSAGE_TYPE_TOP } from '@/utils/constant';
  import useMessageStore from '@/store/modules/message';
  import { getMessageByMsgId } from '@/api';
  import { useSessionOperate } from '@/Hooks';
  const { removeTopMessage } = useSessionOperate();
  const messageStore = useMessageStore();
  const showEmpty = ref(false);
  // 置底按钮
  const skipBottom = ref(true);
  // 滚动条ref
  const scrollbarRef = ref();
  const messageRef = ref();
  // 消息加载前的滚动条位置
  const scrollOldHeight = ref(0);
  const topMessageInfo = ref({
    content: '',
    topMsgUserName: '',
    messageSendUserName: '',
    topMsgId: ''
  });
  const activeSession = computed(() => useChatStore().activeSession);

  // 是否显示消息时间
  const isShowMsgTime = (index: number, msgItem: Message) => {
    if (msgItem.isRevoke) {
      return false;
    }
    // 获取下一条消息
    const nextMessage = messageStore.messageList[index + 1];
    const currentTime = dayjs();
    const messageTime = dayjs(msgItem.updatedAt);
    // 如果消息时间是5分钟内 不显示
    // 如果下一条消息与该条消息间隔时间小于10分钟不显示
    // 如果消息时间是5分钟内，或者与下一条消息间隔时间小于10分钟，则不显示时间
    if (
      currentTime.diff(messageTime, 'minute') <= 5 ||
      (nextMessage && dayjs(nextMessage.updatedAt).diff(messageTime, 'minute') <= 10)
    ) {
      return false;
    }
    return true;
  };
  /**
   *  处理滚动条滚动事件 用来上拉加载消息
   */
  const handleScroll = (e: { scrollTop: number; scrollLeft: number }) => {
    const { total } = messageStore;
    if (messageStore.loadMsgFlag) {
      return;
    }
    skipBottom.value = e.scrollTop > scrollbarRef.value.wrapRef.scrollHeight - 600;
    if (e.scrollTop < 10 && messageStore.messageList.length < total) {
      messageStore.loadMsgFlag = true;
      messageStore.searchValue.pageNum += 1;
      scrollOldHeight.value = scrollbarRef.value.wrapRef.scrollHeight;
      messageStore.getMessageList(activeSession.value, () => {
        scrollbarRef.value.setScrollTop(messageRef.value.scrollHeight - scrollOldHeight.value);
        scrollOldHeight.value = 0;
      });
    }
  };
  /**
   *  处理收到消息
   */
  const handleReceiveMessage = (data: Message & { type: number }) => {
    if (data.type === 9001) {
      ElMessage({
        message: data.content,
        type: 'error'
      });
    }
    if (
      data.sessionId === activeSession.value?.sessionId ||
      // 群消息不通过sessionId来判断 不然服务端还要多去获取一次群会话信息
      data.receiverId.toString() == activeSession.value?.receiverId
    ) {
      if (data.senderId === useUserStore().userId) {
        // TODO 优化 单个更新
        messageStore.messageList = messageStore.messageList.map((item) => {
          if (item.msgToken === data.msgToken) {
            return { ...item, ...data };
          }
          return item;
        });
      } else {
        messageStore.messageList.push(data);
      }
      nextTick(() => {
        scrollbarRef.value.setScrollTop(messageRef.value.scrollHeight);
      });
    }
  };
  /**
   * @description 美化时间
   * @param time 消息时间
   */
  const prettyTime = (time: number) => {
    const currentTime = dayjs();
    const messageTime = dayjs(time);
    const weekDays: {
      [key: number]: string;
    } = { 7: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };
    if (currentTime.isSame(messageTime, 'day')) {
      // 如果消息时间与当前时间是同一天
      return messageTime.format('HH:mm'); // 返回格式为 xx:xx
    } else if (currentTime.subtract(1, 'day').isSame(messageTime, 'day')) {
      // 如果消息时间是昨天
      return `昨天 ${messageTime.format('HH:mm')}`; // 返回格式为 昨天 xx:xx
    } else if (currentTime.isSame(messageTime, 'week')) {
      // 如果消息时间是本周
      const weekDay = weekDays[messageTime.day()];
      return `周${weekDay} ${messageTime.format('HH:mm')}`; // 返回格式为 周X xx:xx
    } else {
      // 如果消息时间不是今天也不是昨天且不是本周
      return messageTime.format('MM月DD日 HH:mm'); // 返回格式为 xx月xx日 xx:xx
    }
  };
  const receiveReadMessage = (data: Message[]) => {
    messageStore.messageList = messageStore.messageList.map((item) => {
      const newItem = find(data, (k) => k.msgId === item.msgId);
      if (newItem) {
        return {
          ...item,
          read: newItem.read
        };
      }
      return item;
    });
  };
  const receiveRevokeMessage = (data: { msgId: string; sessionId: number }) => {
    messageStore.messageList = messageStore.messageList.map((item) => {
      if (item.msgId === data.msgId) {
        return {
          ...item,
          isRevoke: true
        };
      }
      return item;
    });
  };
  const receiveDeleteMessage = (data: { msgId: string; sessionId: number; previousMsgId: string }) => {
    console.log('receiveDeleteMessage', data);
    if (data.previousMsgId) {
      const index = messageStore.messageList.findIndex((k) => k.msgId === data.msgId);
      const previousMessage = messageStore.messageList[index - 1];
      // 设置最近会话列表
      useChatStore().setSingleRecentMsgGather({
        sessionId: data.sessionId,
        isRevoke: previousMessage.isRevoke,
        content: previousMessage.content,
        updatedAt: previousMessage.createdAt,
        messageType: previousMessage.messageType,
        lastMsgId: previousMessage.msgId,
        lastMsgSendUserId: previousMessage.senderId
      });
    }
    if (activeSession.value.sessionId === data.sessionId) {
      // 根据消息id找到消息
      const msgItem = messageStore.messageList.find((i) => i.msgId === data.msgId);
      if (msgItem) {
        msgItem.loading = false;
      }
      messageStore.messageList = messageStore.messageList.filter((item) => item.msgId !== data.msgId);
    }
  };
  const receiveTopMessage = (data: { topMsgId: string; sessionId: number; topMsgUserId: string }) => {
    console.log('data', data);
    // 设置最近会话列表
    if (!data.topMsgId) {
      topMessageInfo.value = {
        content: '',
        topMsgUserName: '',
        messageSendUserName: '',
        topMsgId: ''
      };
      return;
    }
    if (activeSession.value.sessionId === data.sessionId) {
      getMessageByMsgId({
        msgId: data.topMsgId,
        sessionType: activeSession.value.sessionType
      }).then((res) => {
        topMessageInfo.value = {
          topMsgId: data.topMsgId,
          content: res.data.content,
          topMsgUserName:
            data.topMsgUserId === useUserStore().userId
              ? useUserStore().userInfo.username
              : useChatStore().friendGather[data.topMsgUserId]?.username,
          messageSendUserName:
            res.data.senderId === useUserStore().userId
              ? useUserStore().userInfo.username
              : useChatStore().friendGather[res.data.senderId]?.username
        };
        scrollbarRef.value.update();
        nextTick(() => {
          goToBottom();
        });
      });
    }
  };
  const goToBottom = () => {
    scrollbarRef.value.setScrollTop(messageRef.value.scrollHeight);
  };
  /**
   * @description 延迟执行消息已读，并且收集该段时间已读的消息Id 统一更新
   */
  const updateResize = throttle(
    () => {
      scrollbarRef.value.update();
      goToBottom();
    },
    1000,
    { leading: false, trailing: true }
  );
  onMounted(() => {
    nextTick(() => {
      messageStore.chatListToBottomAction = () => {
        goToBottom();
      };
    });
    evEmitter.on('receiveMessage', (data) => handleReceiveMessage(data));
    evEmitter.on('receiveReadMessage', (data) => receiveReadMessage(data));
    evEmitter.on('receiveRevokeMessage', (data) => receiveRevokeMessage(data));
    evEmitter.on('receiveDeleteMessage', (data) => receiveDeleteMessage(data));
    evEmitter.on('receiveTopMessage', (data) => receiveTopMessage(data));
    // 尺寸变化回调
    evEmitter.on('resize', () => updateResize());
  });
  onUnmounted(() => {
    evEmitter.off('resize');
    evEmitter.off('receiveMessage');
    evEmitter.off('receiveReadMessage');
    evEmitter.off('receiveRevokeMessage');
    evEmitter.off('receiveDeleteMessage');
    evEmitter.off('receiveTopMessage');
  });
  watch(
    () => activeSession.value,
    (newVal, oldVal) => {
      console.log('newVal', newVal, oldVal);
      if (newVal?.sessionId && newVal?.sessionId !== oldVal?.sessionId) {
        messageStore.loading = true;
        messageStore.messageList = [];
        messageStore.searchValue.pageNum = 1;
        messageStore.loadMsgFlag = true;
        if (newVal.topMsgId) {
          receiveTopMessage({
            topMsgId: newVal.topMsgId,
            sessionId: newVal.sessionId,
            topMsgUserId: newVal.topMsgUserId
          });
        } else {
          topMessageInfo.value = {
            content: '',
            topMsgUserName: '',
            messageSendUserName: '',
            topMsgId: ''
          };
        }
        messageStore.getMessageList(newVal);
      }
    },
    {
      deep: true,
      immediate: true
    }
  );
</script>
<style scoped lang="scss">
  @import '@/styles/base.scss';
  .chat-main {
    display: flex;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    .top-container {
      box-sizing: border-box;
      border: 1px solid $primary-color7;
      border-radius: 6px;
      background-color: #fff;
      margin: 5px 5px 0 5px;
      padding: 10px 10px;
      .message-top {
        display: flex;
        align-items: center;
        .top-icon {
          align-self: flex-start;
          width: 20px;
          height: 20px;
          margin-right: 10px;
          border-radius: 50%;
          background-color: #dda522;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
      }
    }
    .talk-reply {
      display: flex;
      align-items: flex-start;
      align-items: center;
      width: fit-content;
      padding: 4px 6px;
      margin-top: 3px;
      // margin-right: auto;
      font-size: 12px;
      color: #8f8f8f;
      word-break: break-all;
      background-color: #eff0f1;
      border-radius: 5px;
      max-width: 300px;
      overflow: hidden;
      user-select: none;
      .ellipsis {
        display: -webkit-inline-box;
        text-overflow: ellipsis;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
    }
    .empty-img {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    .to-bottom {
      position: absolute;
      cursor: pointer;
      bottom: 20px;
      right: 20px;
      background-color: #1ebafc;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      height: 45px;
      width: 45px;
      font-size: 28px;
    }
    .message-list {
      height: 100%;
      padding-top: 10px;
      padding-right: 10px;
      overflow-y: auto;
      overflow-x: hidden;
      li {
        display: flex;
        position: relative;
        padding: 0 20px 20px;
        padding-right: 10px;
        flex-direction: column;
        .msg-time {
          font-size: 14px;
          text-align: center;
          margin: 0 auto;
          padding: 0 10px;
          line-height: 25px;
          color: $primary-color5;
          border-radius: 5px;
          max-width: 70%;
        }
      }

      .load-toolbar {
        height: 38px;
        color: #409eff;
        text-align: center;
        line-height: 38px;
        font-size: 13px;
        .no-more {
          color: #b9b3b3;
        }
      }
    }
  }
</style>
