/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import notify from '@/utils/notify';
import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import useChatStore from './chat';
import useCacheStore from './cache';
import useFriendStore from './friend';
import useUserStore from './user';
import eventEmitter from '@/utils/eventEmitter';
import { useSessionOperate } from '@/Hooks';
interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  hello: (type: string, callback: () => void) => void;
  agreeFriend: (data: any) => void;
  receiveReadMessage: (data: any) => void;
  receiveRevokeMessage: (data: any) => void;
  receiveDeleteMessage: (data: any) => void;
  addGroup: (data: any) => void;
  addFriend: (data: any) => void;
  // 收到消息 自己的or好友的 用来在聊天框中显示
  receiveMessage: (data: any) => void;
}

interface ClientToServerEvents {
  hello: () => void;
  readMessage: (data: { idList: string[]; receiverId: string }, callBack: () => void) => any;
  clearMessageUnread: (data: { sessionId: number; userId: string }) => void;
  exitGroup: (data: any, callBack: () => void) => boolean;
}

type SocketType = {
  //   socketUrl: string;
  socketIo: Socket<ServerToClientEvents, ClientToServerEvents> | null;
};

const useSocketStore = defineStore('socket', {
  state: (): SocketType => ({
    socketIo: null
  }),
  actions: {
    createSocket(userId: string): Promise<void> {
      console.log('userId', userId);

      return new Promise((resolve, reject) => {
        try {
          const socketUrl = import.meta.env.VITE_WSURL;
          console.log('socketUrl', socketUrl);

          this.socketIo = io(socketUrl, {
            query: {
              userId
            }
          });
          resolve();
          monitorSocketEvent(this.socketIo);
        } catch (err) {
          console.error('====websocket创建失败', err);
          reject(err);
        }
      });
    }
  }
});

/**
 * @description 监听websocket事件
 */
function monitorSocketEvent(socketIo: any) {
  /** 同意添加好友 */
  socketIo?.on('agreeFriend', (data: { friendInfo: Friend; recentMsgInfo: Session }) => {
    console.log('agreeFriend', data);
    useChatStore().setSingleFriendGather(data.friendInfo);
    useChatStore().setSingleRecentMsgGather(data.recentMsgInfo);
    useChatStore().unReadGather[data.recentMsgInfo.sessionId] = data.recentMsgInfo.unReadNum;
  });
  /** 加群 */
  socketIo?.on('addGroup', (data: Group) => {
    console.log('addGroup', data);
    useChatStore().setSingleGroupGather(data);
    if (useChatStore().sessionGather[data.sessionId]) {
      useChatStore().setSingleRecentMsgGather({
        sessionId: data.sessionId,
        avatar: data.avatar
      });
    }
  });
  /** 收到添加好友请求 */
  socketIo?.on('addFriend', (data: FriendAddRequest) => {
    console.log('addFriend', data);
    useFriendStore().setAddReqUserList(data);
  });
  /** 添加好友结果 */
  socketIo?.on('addFriendResult', (data: Pick<FriendAddRequest, 'id' | 'status'>) => {
    useFriendStore().updateReqUserList(data);
  });
  /** 收到消息 */
  socketIo?.on('receiveMessage', (data: Message) => {
    console.log('receiveMessage', data);
    /** 收到消息判断data的sessionId是否在本地 如果不在本地则创建会话 */
    const session = useChatStore().sessionGather[data.sessionId];
    if (session) {
      // 当收到消息的时候在当前会话
      if (data.sessionId === useChatStore().activeSession?.sessionId) {
        session.unReadNum = 0;
        useSocketStore().socketIo?.emit('clearMessageUnread', {
          sessionId: data.sessionId,
          userId: useUserStore().userId
        });
      } else {
        useChatStore().unReadGather[data.sessionId]++;
        session.unReadNum = useChatStore().unReadGather[data.sessionId];
      }
      const payload = {
        ...session,
        isRevoke: 0,
        content: data.content,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        messageType: data.messageType,
        lastMsgId: data.msgId,
        lastMsgSendUserId: data.senderId
      };
      if (session.sessionType === 2) {
        payload.lastMsgSendUserName = data.lastMsgSendUserName;
      }
      useChatStore().setSingleRecentMsgGather(payload);
    } else {
      useSessionOperate().create(data.sessionId, false);
    }
    // if (document.visibilityState === 'hidden') {
    //   notify.setTitle('来新消息了');
    //   notify.notify({
    //     body: data.content
    //   });
    // }
    eventEmitter.emit('receiveMessage', data);
  });
  /** 收到已读未读消息 */
  socketIo?.on('receiveReadMessage', (data) => {
    eventEmitter.emit('receiveReadMessage', data);
  });
  /** 收到消息撤回通知 */
  socketIo?.on('receiveRevokeMessage', (data) => {
    eventEmitter.emit('receiveRevokeMessage', data);
  });
  /** 收到消息删除的回调通知 */
  socketIo?.on('receiveDeleteMessage', (data) => {
    eventEmitter.emit('receiveDeleteMessage', data);
  });
  /** 收到消息置顶/取消置顶的回调通知 */
  socketIo?.on('receiveTopMessage', (data) => {
    console.log('receiveTopMessage', data);
    useChatStore().setSingleRecentMsgGather({
      sessionId: data.sessionId,
      topMsgId: data.topMsgId,
      topMsgUserId: data.topMsgUserId
    });
    eventEmitter.emit('receiveTopMessage', data);
  });
  /** 收到群公告更新 */
  socketIo?.on('updateGroupAnnouncement', (data) => {
    console.log('updateGroupAnnouncement', data);
    eventEmitter.emit('updateGroupAnnouncement', data);
  });
  /** 收到群成员信息更新消息 */
  socketIo?.on('updateGroupMember', (data) => {
    console.log('updateGroupMember', data);
    // eventEmitter.emit('updateGroupMember', data);
    useCacheStore().setGroupMemberByUserId(data.groupId, data);
    // 找到当前群对应的sessionId
    const groupInfo = useChatStore().groupGather[data.groupId];
    useChatStore().setSingleRecentMsgGather({
      sessionId: groupInfo.sessionId,
      // 存一个lastMsgSendUserName 是因为群成员还没获取过的话需要及时更新群会话的发送人
      lastMsgSendUserName: data.nickName
    });
  });
}
export default useSocketStore;
