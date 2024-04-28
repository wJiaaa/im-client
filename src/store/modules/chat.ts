/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import { getGroupList, getfriendList, sessionList } from '@/api';
import { defineStore } from 'pinia';
import { keyBy } from 'lodash';
import { isEmpty } from '@/utils/is';
import useSystemStore from './system';
import { PAGE_SHOW_TYPE } from '@/utils/constant';
type ChatType = {
  activeSession: ActiveSession;
  friendGather: { [userId: string]: Friend };
  groupGather: { [groupId: string]: Group };
  unReadGather: { [sessionId: number]: number };
  sessionGather: { [sessionId: number]: Session };
};
const useChatStore = defineStore('chatState', {
  state: (): ChatType => ({
    friendGather: {}, // 好友列表
    groupGather: {}, // 群组列表
    unReadGather: {}, // 所有会话未读消息数集合
    sessionGather: {}, // 最近会话列表
    activeSession: {} as ActiveSession // 当前聊天对象
  }),
  actions: {
    /**
     * @description 获取好友列表
     */
    getFriendGather() {
      if (!isEmpty(this.friendGather)) {
        return;
      }
      getfriendList()
        .then((res) => {
          const newObj = keyBy(res.data || [], 'userId');
          this.friendGather = newObj;
        })
        .catch();
    },

    /**
     * @description 获取群聊列表
     */
    getGroupGather() {
      if (!isEmpty(this.friendGather)) {
        return;
      }
      getGroupList()
        .then((res) => {
          const newObj = keyBy(res.data || [], 'groupId');
          this.groupGather = newObj;
        })
        .catch();
    },
    /**
     * @description 获取最近会话列表
     */
    getSessionList() {
      if (!isEmpty(this.sessionGather)) {
        return;
      }
      sessionList()
        .then((res) => {
          const newObj = keyBy(res.data || [], 'sessionId');
          this.sessionGather = newObj;
          res.data?.forEach((item) => {
            this.unReadGather[item.sessionId] = item.unReadNum || 0;
          });
        })
        .catch();
    },

    /**
     * @description 设置单个最近会话的信息
     */
    setSingleRecentMsgGather(payload: { sessionId: number } & Partial<Session>) {
      this.sessionGather[payload.sessionId] = {
        ...this.sessionGather[payload.sessionId],
        ...payload
      };
      if (this.activeSession.sessionId === payload.sessionId) {
        this.setActiveSession(this.sessionGather[payload.sessionId]);
      }
    },
    /**
     * @description 移除会话
     * @param sessionId 会话id
     */
    removeSession(sessionId) {
      delete this.sessionGather[sessionId];
      delete this.unReadGather[sessionId];
      if (this.activeSession.sessionId === sessionId) {
        this.setActiveSession({});
        useSystemStore().setShowPageType(PAGE_SHOW_TYPE['welcome']);
      }
    },
    /**
     * @description 设置单个好友的信息
     */
    setSingleFriendGather(friendInfo: Friend) {
      this.friendGather[friendInfo.userId] = friendInfo;
    },

    /**
     * @description 设置单个群聊的信息
     */
    setSingleGroupGather(groupInfo: Group) {
      this.groupGather[groupInfo.groupId] = groupInfo;
    },

    /**
     * @description 设置当前聊天会话
     */
    setActiveSession(obj: ActiveSession) {
      this.activeSession = obj;
    }
  }
  // persist: piniaPersistConfig('chatState')
});
export default useChatStore;
