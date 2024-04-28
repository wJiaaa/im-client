<!--
 * @Description: 单个消息
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:45:48
-->
<template>
  <div
    @click.right="($event) => showContextMenu($event, props.msgItem)"
    v-intersection-observer="[(e) => onIntersectionObserver(e, props.msgItem), { messageRef } as UseIntersectionObserverOptions]"
    class="message-item"
    :class="isCurrentUser(props.msgItem.senderId) ? 'reverse' : ''"
    @mouseover="props.msgItem.showMsgTime = true"
    @mouseleave="props.msgItem.showMsgTime = false"
  >
    <template v-if="!isCurrentUser(props.msgItem.senderId)">
      <!-- 好友头像 -->
      <img class="avatar" v-if="!isGroupChat(activeSession?.sessionType)" :src="activeSession.avatar" alt="" />
      <!-- 群成员头像 -->
      <img class="avatar" v-else :src="userInfo.avatar" alt="" />
    </template>
    <!-- 我自己的头像 -->
    <img class="avatar" v-else :src="useUserStore().userInfo.avatar" alt="" />
    <div class="main-content">
      <div
        v-if="!isCurrentUser(props.msgItem.senderId) && isGroupChat(activeSession?.sessionType)"
        class="group-user-name cursor-default"
      >
        <span class="inoneline max-w-180px mr5px" :title="userInfo.nickName">
          {{ userInfo.nickName }}
        </span>
        <span
          class="cursor-default"
          v-if="props.msgItem.showMsgTime"
          :title="dayjs(props.msgItem.updatedAt).format('YYYY-MM-DD HH:mm:ss')"
        >
          {{ formatTime(props.msgItem.updatedAt) }}
        </span>
      </div>
      <div v-else :class="['msg-time', !isCurrentUser(props.msgItem.senderId) ? 'left-45px' : 'right-45px']">
        <span
          class="cursor-default"
          v-if="props.msgItem.showMsgTime"
          :title="dayjs(props.msgItem.updatedAt).format('YYYY-MM-DD HH:mm:ss')"
        >
          {{ formatTime(props.msgItem.updatedAt) }}
        </span>
      </div>
      <div class="message-area">
        <div
          class="content"
          :class="
            isCurrentUser(props.msgItem.senderId)
              ? [
                  'content-out',
                  [MESSAGE_TYPE_TEXT, MESSAGE_TYPE_FILE].includes(props.msgItem.messageType as 1 | 3) && 'bg-#e0f1ff'
                ]
              : [
                  'content-in',
                  [MESSAGE_TYPE_TEXT, MESSAGE_TYPE_FILE].includes(props.msgItem.messageType as 1 | 3) && 'bg-#f3f3f3'
                ]
          "
        >
          <!-- 文本消息 -->
          <TextMessage v-if="props.msgItem.messageType === MESSAGE_TYPE_TEXT" :msgItem="props.msgItem" />
          <!-- 图片消息 -->
          <ImageMessage v-else-if="props.msgItem.messageType === MESSAGE_TYPE_IMAGE" :msgItem="props.msgItem" />
          <!-- 文件消息 -->
          <FileMessage v-else-if="props.msgItem.messageType === MESSAGE_TYPE_FILE" :msgItem="props.msgItem" />
          <!-- 表情消息 -->
          <EmoteMessage v-else-if="props.msgItem.messageType === MESSAGE_TYPE_EMOTE" :msgItem="props.msgItem" />
          <!-- 视频消息 -->
          <VideoMessage :key="props.msgItem.msgId" v-else :msgItem="props.msgItem" />
        </div>
      </div>
    </div>
    <template v-if="isCurrentUser(props.msgItem.senderId)">
      <!-- 消息状态 正在发送 -->
      <span
        class="i-eos-icons:bubble-loading text-18px my-auto"
        v-if="props.msgItem.status === 1 || props.msgItem.loading"
      />
      <!-- 消息状态 发送失败 -->
      <span class="i-icon-park-solid:attention text-red text-18px my-auto" v-else-if="props.msgItem.status === 3" />
      <!-- 消息状态 发送成功  已读未读 status===3 -->
      <span v-else class="message-read-status" v-show="!isGroupChat(activeSession?.sessionType)">
        <span v-if="!props.msgItem.read" class="i-mdi:checkbox-blank-circle-outline unread" />
        <span v-else class="i-mdi:check-circle-outline read" />
      </span>
    </template>
  </div>
  <SelectUserOrGroup
    v-model:visible="forwardMessagepDialog"
    :type="SELECT_USER_TYPE.forwardMessage"
    title="转发"
    @confim="confimForwardMessage"
  />
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import useUserStore from '@/store/modules/user';
  import { UseIntersectionObserverOptions } from '@vueuse/core';
  import { throttle } from 'lodash';
  import { isCurrentUser, isGroupChat, formatTime } from '@/utils/common';
  import { useUserInfo } from '@/Hooks/useUserInfo';
  import useChatStore from '@/store/modules/chat';
  import useSocketStore from '@/store/modules/socket';
  import { vIntersectionObserver } from '@vueuse/components';
  import createContextMenu, { MenusOption } from '@/components/ContextMenu';
  import dayjs from 'dayjs';
  import evEmitter from '@/utils/eventEmitter';
  import { deleteMessageApi, revokeMessageApi, topMessageApi } from '@/api';
  import {
    MESSAGE_TYPE_EMOTE,
    MESSAGE_TYPE_FILE,
    MESSAGE_TYPE_IMAGE,
    MESSAGE_TYPE_SYSTEM,
    MESSAGE_TYPE_TEXT,
    MESSAGE_TYPE_VIDEO,
    SELECT_USER_TYPE,
    SESSION_TYPE
  } from '@/utils/constant';
  import useMessageStore from '@/store/modules/message';
  import { useSessionOperate } from '@/Hooks';
  const { removeTopMessage } = useSessionOperate();
  // 获取实例
  const { t } = useI18n();
  const socketStore = useSocketStore();
  const messageStore = useMessageStore();
  const props = defineProps({
    msgItem: {
      type: Object as PropType<Message>,
      default: () => {}
    }
  });

  const activeSession = computed(() => useChatStore().activeSession);
  const { userInfo } = useUserInfo(props.msgItem.senderId);
  const messageRef = ref();
  /** 转发消息选择用户弹窗 */
  const forwardMessagepDialog = ref(false);
  // 消息已读数组
  let updateMsgIds: string[] = [];
  const showContextMenu = (e: MouseEvent, msgItem: FriendMessage) => {
    if (msgItem.messageType === MESSAGE_TYPE_SYSTEM) {
      return;
    }
    console.log('msgItem', msgItem, activeSession.value);

    e.preventDefault();
    const menu = [
      {
        label: t('menu.addEmote'),
        hidden: msgItem.messageType !== 5,
        icon: 'i-mdi:emoticon-plus-outline',
        menuAction: () => {
          const payload = {
            width: msgItem.extra?.width || 150,
            height: msgItem.extra?.height || 110,
            src: msgItem.content
          };
          evEmitter.emit('addEmote', payload);
        }
      },
      {
        label: t('menu.forward'),
        icon: 'i-icon-park-outline:efferent-three',
        menuAction: () => {
          // forwardMsg(msgItem);
          forwardMessagepDialog.value = true;
        }
      },
      {
        label: t('menu.reply'),
        icon: 'i-icon-park-outline:comment',
        menuAction: () => {
          onQuoteMessage(msgItem);
        }
      },
      {
        label: t('menu.revoke'),
        hidden: !isCurrentUser(msgItem.senderId) || dayjs().diff(dayjs(msgItem.updatedAt), 'minute') > 2,
        icon: 'i-icon-park-outline:back',
        menuAction: () => {
          revokeMessage(msgItem);
        }
      },
      {
        label: t('menu.delete'),
        icon: 'i-icon-park-outline:delete',
        menuAction: () => {
          // revokeMessage(msgItem);
          deleteMessage(msgItem);
        }
      },
      {
        label: t('menu.multiple'),
        icon: 'i-icon-park-outline:list',
        menuAction: () => {}
      },
      {
        label: t('menu.star'),
        icon: 'i-icon-park-outline:star',
        menuAction: () => {}
      },
      {
        label: t('menu.pinTop'),
        hidden:
          activeSession.value.sessionType === SESSION_TYPE.group || activeSession.value.topMsgId === msgItem.msgId,
        icon: 'i-icon-park-outline:to-top',
        menuAction: () => {
          topMessage(msgItem);
        }
      },
      {
        label: t('menu.removeTop'),
        hidden: activeSession.value.topMsgId !== msgItem.msgId,
        icon: 'i-icon-park-outline:to-bottom',
        menuAction: () => {
          removeTopMessage();
        }
      }
    ];
    createContextMenu(e, menu);
  };
  /**
   * @description 检测消息是否已读 消息进入浏览器视图视口后才会设置成已读
   */
  const onIntersectionObserver = ([{ isIntersecting }]: any, item: Message) => {
    // 不是自己发的消息、消息未读、进入了视图视口、不是群聊消息
    if (
      !(item.senderId === useUserStore().userId) &&
      !item.read &&
      isIntersecting &&
      !isGroupChat(activeSession.value?.sessionType)
    ) {
      item.read = true;
      updateMsgIds.push(item.msgId);
      throttledFunction();
    }
  };
  /**
   * 置顶消息
   */
  const topMessage = (data: Pick<Message, 'msgId'>) => {
    topMessageApi({ msgId: data.msgId, receiverId: activeSession?.value.receiverId }).then(() => {});
  };
  const onQuoteMessage = (data: any) => {
    console.log('data', data);

    let sendName;
    if (data.senderId === useUserStore().userId) {
      sendName = useUserStore().userInfo.username;
    } else {
      sendName = useChatStore().friendGather[data.senderId].username;
    }
    let item = {
      id: data.msgId,
      title: sendName,
      describe: ''
    };
    switch (data.messageType) {
      case MESSAGE_TYPE_TEXT:
        item.describe = data?.content;
        break; // 文本消息
      case MESSAGE_TYPE_IMAGE:
        item.describe = '[图片]';
        break; // 图片文件
      case MESSAGE_TYPE_VIDEO:
        item.describe = '[视频]';
        break; // 视频文件
      case MESSAGE_TYPE_FILE:
        item.describe = '[文件]';
        break; // 其它文件
      case 12:
        item.describe = '[图文消息]';
        break; // 图文消息
    }
    evEmitter.emit('onSubscribeQuote', item);
  };
  /**
   *  撤回消息
   */
  const revokeMessage = (data: { msgId: string }) => {
    revokeMessageApi({ msgId: data.msgId }).then(() => {});
  };
  /**
   * @description 删除消息
   */
  const deleteMessage = (data: { msgId: string; loading: boolean }) => {
    const payload = {
      msgId: data.msgId,
      sessionId: activeSession.value.sessionId,
      previousMsgId: ''
    };
    // 当删除的消息是最后一条消息的时候 需要更新最近会话列表的数据
    if (activeSession.value.lastMsgId === data.msgId) {
      const index = messageStore.messageList.findIndex((k) => k.msgId === data.msgId);
      const previousMessage = messageStore.messageList[index - 1];
      // TODO 需要判断上一条消息是否有 如果没有则置为空即可
      payload.previousMsgId = previousMessage.msgId;
    }
    data.loading = true;
    deleteMessageApi(payload).then(() => {});
  };
  /**
   * @description 确认转发消息
   */
  const confimForwardMessage = (
    item: {
      selectUser: (Friend & Group)[];
    },
    callback: Function
  ) => {
    // TODO 将userId和groupId统一
    const { content, messageType, extra } = props.msgItem;
    // 给选择的用户发送消息
    item.selectUser.forEach((user) => {
      messageStore.sendMsg({
        content,
        messageType,
        extra,
        receiveUserId: user.userId || user.groupId,
        sessionType: user.sessionType,
        sessionId: user.sessionId
      });
    });
    callback && callback();
    forwardMessagepDialog.value = false;
  };
  /**
   * @description 延迟执行消息已读，并且收集该段时间已读的消息Id 统一更新
   */
  const throttledFunction = throttle(
    () => {
      if (updateMsgIds.length) {
        socketStore.socketIo?.emit(
          'readMessage',
          {
            idList: updateMsgIds,
            receiverId:
              activeSession.value?.receiverId !== useUserStore().userId
                ? activeSession.value?.receiverId
                : activeSession.value?.senderId
          },
          () => {
            updateMsgIds = [];
          }
        );
      }
    },
    500,
    { leading: false, trailing: true }
  );
</script>
<style scoped lang="scss">
  .reverse {
    flex-direction: row-reverse;
    justify-content: flex-start;
  }
  .message-item {
    width: 100%;
    position: relative;
    display: flex;
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 5px;
    }
    .group-user-name {
      font-size: 12px;
      margin-top: -5px;
      margin-left: 8px;
      height: 18px;
      align-items: center;
      color: #979da5;
      margin-bottom: 5px;
      display: flex;
    }
    .message-read-status {
      font-family: PingFangSC-Regular;
      font-weight: 400;
      font-size: 15px;
      word-break: keep-all;
      display: flex;
      align-items: end;
      margin-right: -5px;
      .read {
        color: rgb(10, 193, 168);
      }
      .unread {
        color: grey;
      }
    }
    .main-content {
      max-width: 70%;
      .msg-time {
        position: absolute;
        top: -15px;
        font-size: 12px;
        color: #979da5;
      }
    }
    .message-area {
      display: flex;
      flex-direction: column;
      padding: 0 8px;
      .content {
        display: flex;
        width: fit-content;
        font-weight: 400;
        font-size: 14px;
        color: #000;
        letter-spacing: 1px;
      }
      .content-in {
        border-radius: 0 10px 10px 10px;
      }

      .content-out {
        border-radius: 10px 0 10px 10px;
      }
    }
  }
</style>
