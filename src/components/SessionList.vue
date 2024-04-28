<!--
 * @Description: 最近会话列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="session-list">
    <TopChatList @clickSession="clickSession" />
    <el-scrollbar ref="scrollBar">
      <div
        v-element-visibility="(visible) => onElementVisibility(visible, sessionItem)"
        @click="clickSession(sessionItem)"
        v-for="sessionItem in sessionList"
        :key="sessionItem.sessionId"
        :class="[
          'conversation-content',
          useChatStore().activeSession?.sessionId === sessionItem.sessionId ? 'selected' : ''
        ]"
        :session-Id="sessionItem.sessionId"
        @click.right="($event) => showContextMenu($event, sessionItem)"
      >
        <div class="sessionItem">
          <aside class="left relative">
            <div class="board"></div>
            <img
              :class="[
                useChatStore().activeSession?.sessionId === sessionItem.sessionId &&
                !isGroupChat(sessionItem.sessionType)
                  ? 'sessionItem-round-avatar'
                  : 'sessionItem-avatar',
                isGroupChat(sessionItem.sessionType) ? 'border-1 border-#ccc' : ''
              ]"
              alt=""
              :src="!isGroupChat(sessionItem.sessionType) ? sessionItem.avatar : sessionItem.avatar"
            />
            <!-- 免打扰时在头像右上方显示 . -->
            <div
              v-if="sessionItem.isDisturb && sessionItem.unReadNum"
              class="w-8px h-8px bg-red rounded-full absolute right--4px top-0"
            />
          </aside>
          <div class="content">
            <div class="content-main">
              <!-- TODO 所有地方优先显示备注 代码重写 -->
              <div class="content-header">
                <span class="name inoneline">
                  {{
                    !isGroupChat(sessionItem.sessionType)
                      ? sessionItem.remark || sessionItem.username
                      : sessionItem.remark || sessionItem.groupName
                  }}
                </span>
                <div class="session-status">
                  <span
                    v-show="sessionItem.isTop"
                    class="session-top text-#3076f6 mr-2px text-15px i-icon-park-outline:to-top"
                  />
                  <!-- <span class="session-top"> 群组</span> -->
                  <span
                    v-show="sessionItem.isDisturb"
                    class="text-#3076f6 mr-2px text-14px i-icon-park-outline:close-remind"
                  />
                </div>
                <span class="time" v-if="sessionItem.updatedAt">
                  {{ formatTime(sessionItem.updatedAt) }}
                </span>
              </div>
              <div class="recent-msg mt3px">
                <span class="msg-content inoneline">
                  <span class="text-13px text-#999" v-if="sessionItem.isDisturb && sessionItem.unReadNum">
                    {{ `[${sessionItem.unReadNum}条]` }}
                  </span>
                  <SessionContent :sessionItem="sessionItem" />
                </span>
                <div v-if="sessionItem.unReadNum && !sessionItem.isDisturb" class="self-end content-footer">
                  <div class="read-num-tips-circle" v-if="sessionItem.unReadNum < 10">{{ sessionItem.unReadNum }}</div>
                  <div class="read-num-tips" v-else-if="sessionItem.unReadNum < 100">{{ sessionItem.unReadNum }}</div>
                  <div v-else class="read-num-tips">99+</div>
                  <!-- <div class="read-num-tips">{{ sessionItem.unReadNum }}</div> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>
<!-- https://dribbble.com/shots/6105883-YUNI-Desktop -->
<!-- https://www.behance.net/gallery/79329787/YUNI-APP-User-Interface-Design -->
<script setup lang="ts">
  import dayjs from 'dayjs';
  import useChatStore from '@/store/modules/chat';
  import { PAGE_SHOW_TYPE } from '@/utils/constant';
  import { toArray } from 'lodash';
  import { changeSessionStatus, delSession } from '@/api';
  import { vElementVisibility } from '@vueuse/components';
  import createContextMenu, { MenusOption } from '@/components/ContextMenu';
  import useSystemStore from '@/store/modules/system';
  import { isGroupChat, clearMessageUnread } from '@/utils/common';
  import eventEmitter from '@/utils/eventEmitter';

  const scrollBar = ref();
  /**
   * @Description 元素是否可见
   */
  const onElementVisibility = (visible: boolean, sessionItem: any) => {
    sessionItem.visible = visible;
  };
  watch(
    () => useChatStore().activeSession?.sessionId,
    (val) => {
      if (val) {
        clearMessageUnread(val);
      }
    },
    {
      deep: true
    }
  );
  /**
   * @description 点击会话
   */
  const clickSession = (sessionInfo: Session & { visible?: boolean }, top = false) => {
    if (sessionInfo.isRobot && sessionInfo.receiverId === 'robot_2') {
      useSystemStore().setShowPageType(PAGE_SHOW_TYPE['systemNotice']);
      useChatStore().setActiveSession(sessionInfo);
      return;
    }
    useChatStore().setActiveSession(sessionInfo);
    useSystemStore().setShowPageType(PAGE_SHOW_TYPE['chat']);
    console.log('top', top, sessionInfo);

    // top 是否将会话放到第一个
    if (top) {
      const sessionIndex = sessionList.value.findIndex((o) => o.sessionId === sessionInfo.sessionId);
      const removeItem = sessionList.value.splice(sessionIndex, 1);
      sessionList.value.unshift(removeItem[0]);
      scrollBar.value.setScrollTop(0);
      return;
    }
    // 当会话不在当前可视范围内才会将列表滚动
    if (!sessionInfo.visible) {
      handleScroll(sessionInfo.sessionId);
    }
  };
  /**
   * @Description 会话列表滚动到当前会话
   */
  const handleScroll = (sessionId: number, isTop = false) => {
    if (isTop) {
      setTimeout(() => {
        scrollBar.value.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }, 150);
      return;
    }
    // TODO 优化
    const sessionItem: NodeListOf<HTMLElement> = scrollBar.value.wrapRef.querySelectorAll(
      `[session-Id="${sessionId}"]`
    );
    setTimeout(() => {
      scrollBar.value.scrollTo({
        top: sessionItem[0].offsetTop,
        left: 0,
        behavior: 'smooth'
      });
    }, 150);
  };

  const sessionList = computed(() => {
    return toArray(useChatStore().sessionGather).sort((a, b) => {
      if (a.updatedAt === b.updatedAt) {
        return +b.lastMsgId - +a.lastMsgId;
      } else {
        // @ts-ignore
        return new Date(b.updatedAt) - new Date(a.updatedAt);
        // return b.sendTime - a.sendTime;
      }
    });
  });
  /**
   * @description 美化时间
   * @param time 消息时间
   */
  const formatTime = (time: Date) => {
    const currentTime = dayjs();
    const messageTime = dayjs(time);
    const weekDays: {
      [key: number]: string;
    } = { 7: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };
    // 计算消息时间与当前时间的差值（以秒为单位）
    const diffSeconds = currentTime.diff(messageTime, 'second');
    if (diffSeconds < 30) {
      // 如果是30s内的消息
      return '刚刚';
    } else if (diffSeconds >= 30 && diffSeconds < 180) {
      // 如果是30s-3分钟内的消息
      const diffMinutes = Math.ceil(diffSeconds / 60); // 向上取整，确保不会显示为0分钟
      return `${diffMinutes}分钟前`;
    } else if (currentTime.isSame(messageTime, 'day')) {
      // 如果消息时间与当前时间是同一天
      return messageTime.format('HH:mm'); // 返回格式为 xx:xx
    } else if (currentTime.subtract(1, 'day').isSame(messageTime, 'day')) {
      // 如果消息时间是昨天
      return `昨天 ${messageTime.format('HH:mm')}`; // 返回格式为 昨天 xx:xx
    } else if (currentTime.isSame(messageTime, 'week')) {
      // 如果消息时间是本周
      const weekDay = weekDays[messageTime.day()];
      return `周${weekDay}}`; // 返回格式为 周X
    } else {
      // 如果消息时间不是今天也不是昨天且不是本周
      return messageTime.format('MM月DD日'); // 返回格式为 xx月xx日
    }
  };
  /**
   * @description
   */
  const showContextMenu = (e: MouseEvent, sessionItem: Session) => {
    e.preventDefault();
    const menu = createMenu(sessionItem);
    createContextMenu(e, menu);
  };
  const createMenu = (sessionItem: Session): MenusOption[] => {
    return [
      {
        label: sessionItem.isTop ? '取消置顶' : '置顶',
        icon: sessionItem.isTop ? 'i-icon-park-outline:to-bottom' : 'i-icon-park-outline:to-top',
        menuAction: () => {
          const { sessionId, isTop } = sessionItem;
          changeSessionStatus({ sessionId, flag: !isTop, type: 1 }).then((res) => {
            sessionItem.isTop = res.data.isTop;
          });
        }
      },
      {
        label: '修改备注',
        icon: 'i-icon-park-outline:edit-two',
        menuAction: () => {}
      },
      {
        label: sessionItem.isDisturb ? '关闭免打扰' : '开启免打扰',
        icon: sessionItem.isDisturb ? 'i-icon-park-outline:remind' : 'i-icon-park-outline:close-remind',
        menuAction: () => {
          const { sessionId, isDisturb } = sessionItem;
          changeSessionStatus({ sessionId, flag: !isDisturb, type: 2 }).then((res) => {
            sessionItem.isDisturb = res.data.isDisturb;
          });
        }
      },
      {
        label: '移除会话',
        icon: 'i-icon-park-outline:clear',
        menuAction: () => {
          const { sessionId } = sessionItem;
          delSession({ sessionId }).then(() => {
            useChatStore().removeSession(sessionId);
          });
        }
      }
    ];
  };
  const receiveRevokeMessage = (data) => {
    // 设置最近会话列表
    if (data.msgId === useChatStore().activeSession.lastMsgId) {
      useChatStore().setSingleRecentMsgGather({ ...data, isRevoke: true });
    }
  };
  onMounted(() => {
    eventEmitter.on('receiveRevokeMessage', (data) => receiveRevokeMessage(data));
    eventEmitter.on('handleSessionScroll', ({ sessionId, isTop }) => handleScroll(sessionId, isTop));
  });
  onBeforeUnmount(() => {
    eventEmitter.off('handleSessionScroll');
    eventEmitter.off('receiveRevokeMessage');
  });
  defineExpose({
    clickSession
  });
</script>
<style scoped lang="scss">
  @import '@/styles/base.scss';
  .session-list {
    display: flex;
    flex-direction: column;
    height: calc(100% - 50px);
    .el-scrollbar {
      flex: 1;
    }
  }
  .selected {
    background: $primary-color4 !important;
    .board {
      height: 45px;
      position: absolute;
      border-left: 3px solid $primary-color2;
      left: 0px;
    }
  }
  .conversation-content:hover {
    background: rgba(89, 138, 202, 0.1);
    transition: all 0.5s;
    cursor: pointer;
  }
  .conversation-content {
    height: 64px;
    border-radius: 7px;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
  }
  .sessionItem-round-avatar {
    height: 35px;
    width: 35px;
    border-radius: 50%;
    transition: all 0.5s;
  }
  .sessionItem {
    display: flex;
    width: 100%;
    padding: 12px 0px;
    .left {
      position: relative;
      padding-left: 12px;
      display: flex;
      align-items: center;
      height: 40px;
      .sessionItem-avatar {
        height: 35px;
        width: 35px;
        border-radius: 5px;
        transition: all 0.5s;
      }
    }
    .content {
      width: calc(100% - 57px);
      padding-left: 10px;
      .content-main {
        display: flex;
        flex: 1;
        flex-direction: column;
        .content-header {
          width: 100%;
          color: #1f2329;
          font-size: 14px;
          display: flex;
          .time {
            font-size: 12px;
            line-height: 21px;
            display: inline-block;
            max-width: 75px;
            white-space: nowrap;
            color: #bbb;
            text-align: right;
            margin: 0 5px;
          }
          .name {
            flex: 1;
            letter-spacing: 0;
            font-size: 14px;
            overflow: hidden;
            font-weight: 400;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .session-status {
            display: flex;
            align-items: center;
            & > span {
              margin-left: 5px;
            }
          }
        }

        .recent-msg {
          display: flex;
          align-items: center;
          .msg-content {
            font-size: 13px;
            font-weight: 400;
            color: #999;
            letter-spacing: 0;
            flex: 1;
            line-height: 16px;
          }
          .content-footer {
            line-height: 16px;
            display: flex;
            flex-direction: column;
            padding: 0 5px;
            .base-tips {
              background-color: red;
              color: #fff;
              font-size: 12px;
              text-align: center;
            }
            .read-num-tips {
              @extend .base-tips;
              height: 12px;
              line-height: 12px;
              border-radius: 15px;
              padding: 2px 3px;
            }
            .read-num-tips-circle {
              @extend .base-tips;
              width: 10px;
              height: 10px;
              line-height: 10px;
              border-radius: 50%;
              padding: 3px;
            }
          }
        }
      }
    }
  }
</style>
