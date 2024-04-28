/*
 * @Description: 会话相关操作
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-27 23:41:46
 */

import { createSession, topMessageApi } from '@/api';
import useChatStore from '@/store/modules/chat';
import { clearMessageUnread } from '@/utils/common';

export const useSessionOperate = () => {
  const activeSession = computed(() => useChatStore().activeSession);
  /**
   * @description 移除会话置顶内容
   */
  const removeTopMessage = () => {
    topMessageApi({
      topFlag: false,
      receiverId: activeSession.value.receiverId
    }).then(() => {});
  };
  /**
   * @description 创建新会话
   * @param sessionId 会话ID
   * @param clearFlag 是否需要清空未读数
   */
  const create = (sessionId: number, clearFlag = true) => {
    return new Promise<Session>((resolve) => {
      createSession({ sessionId }).then((res) => {
        resolve(res.data);
        useChatStore().setSingleRecentMsgGather(res.data);
        if (clearFlag) {
          useChatStore().setActiveSession(res.data);
          clearMessageUnread(sessionId);
        } else {
          useChatStore().unReadGather[sessionId] = res.data.unReadNum;
        }
      });
    });
  };
  return {
    removeTopMessage,
    create
  };
};
