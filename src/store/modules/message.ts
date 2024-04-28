/*
 * @Description: 消息store
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:36:15
 */
import { getMessage, sendMessage } from '@/api';
import { defineStore } from 'pinia';
import useChatStore from './chat';
import useUserStore from './user';
import { isCurrentUser } from '@/utils/common';
import eventEmitter from '@/utils/eventEmitter';

const useMessageStore = defineStore('message', () => {
  const chatListToBottomAction = ref<() => void>(); // 外部提供消息列表滚动到底部事件
  const loadMsgFlag = ref(false); // 是否正在加载
  const searchValue = ref({
    pageNum: 1,
    pageSize: 20
  });
  const loading = ref(false);
  const total = ref(0);
  const messageList = ref<Message[]>([]);
  const activeSession = computed(() => useChatStore().activeSession);
  /**
   *  获取消息列表
   * @param Pick<Session, 'sessionId' | 'receiverId' | 'sessionType'> 发送消息再提
   * @param callback 发送消息回调
   */
  const getMessageList = (
    params: Pick<Session, 'sessionId' | 'receiverId' | 'sessionType'> = activeSession.value,
    callback = () => {}
  ) => {
    const { sessionId, receiverId, sessionType } = params;
    loadMsgFlag.value = true;
    loading.value = true;
    getMessage({
      sessionId,
      receiverId,
      sessionType,
      ...searchValue.value
    })
      .then((res) => {
        messageList.value.unshift(...(res.data.messageList || []));
        total.value = res.data.total;
        nextTick(() => {
          // BUG 有问题 需要判断有没有拉取完最后一条消息
          if (searchValue.value.pageNum === 1) {
            chatListToBottomAction.value?.();
          } else {
            callback && callback();
          }
        });
      })
      .finally(() => {
        loadMsgFlag.value = false;
        loading.value = false;
      });
  };
  /**
   *  发送消息
   * @param payload 消息内容
   * @typeparam
   * @returns
   */
  const sendMsg = (
    payload: Pick<SendMessagePayload, 'content' | 'messageType' | 'extra' | 'sessionType'> & {
      receiveUserId: string | number;
      sessionId: number;
      atUserIdList?: string[];
    }
  ) => {
    console.log('payload', payload);
    const {
      content,
      messageType = 1,
      extra = void 0,
      atUserIdList,
      receiveUserId,
      sessionType,
      sessionId = activeSession.value.sessionId
    } = payload;
    let text = content.replace(/<br>/g, '/n').trim();
    if (!text) {
      return;
    }
    let random = Math.round(Math.random() * 1000);
    const msgToken = new Date().getTime().toString() + random.toString();
    if (sessionId === activeSession.value.sessionId) {
      // @ts-ignore
      messageList.value.push({
        content,
        messageType,
        senderId: useUserStore().userId,
        read: false,
        msgToken,
        status: 1,
        extra
      });
    }
    nextTick(() => {
      chatListToBottomAction.value?.();
    });
    /**
     * senderId:当前会话第一条消息的创建人 receiverId:当前会话第一条消息的接收人
     */
    const receiverId =
      receiveUserId ||
      (isCurrentUser(activeSession.value?.senderId as string)
        ? activeSession.value?.receiverId
        : activeSession.value?.senderId);
    console.log('receiverId', activeSession.value);

    sendMessage({
      content,
      receiverId,
      messageType,
      sessionType: sessionType || activeSession.value?.sessionType,
      msgToken,
      extra,
      atUserIdList,
      isRobot: receiverId.toString().includes('robot')
    }).then(() => {});
    eventEmitter.emit('handleSessionScroll', { sessionId: activeSession.value.sessionId, isTop: true });
  };

  return {
    chatListToBottomAction,
    messageList,
    loadMsgFlag,
    total,
    searchValue,
    getMessageList,
    loading,
    sendMsg
  };
});
export default useMessageStore;
