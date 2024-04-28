/*
 * @Description: 类型定义
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 20:43:23
 */
/* 服务器返回数据的的类型*/
interface HttpResult<T = any> {
  code: number;
  msg: string;
  data: T;
}
/** 会话类型 */
type SessionType = 1 | 2;
/** 发送消息传参 */
interface SendMessagePayload {
  /** 消息内容 */
  content: string;
  /** 消息接收人 */
  receiverId: string;
  /** 消息类型 */
  messageType: number;
  /** 会话类型 */
  sessionType: SessionType;
  /** 消息标识 */
  msgToken: string;
  /** 艾特的用户 */
  atUserIdList: [];
  /** 是否是机器人 */
  isRobot: boolean;
  /** 消息额外参数 */
  extra?: {
    /** 不确定有哪些 */
    [key: string]: any;
  };
}
/** 消息类型基础字段 */
interface BaseMessage {
  /** 消息Id */
  msgId: string;
  /** 消息内容 */
  content: string;
  /** 消息发送时间 */
  createdAt: number;
  /** 消息发送人 */
  senderId: string;
  /** 消息类型 */
  messageType: number;
  /** 额外参数 */
  extra?: {
    [key: string]: any;
  };
  /** 消息加载状态 */
  loading: boolean;
  /** 消息更新时间 */
  updatedAt: number;
  /** 消息删除时间 */
  deletedAt: number;
  /** 是否删除 */
  isDelete: boolean;
  /** 是否撤回 */
  isRevoke: boolean;
  /** 发送消息生成的id */
  msgToken?: string;
  /** 是否显示消息时间 */
  showMsgTime?: boolean;
}
/** 群消息列表项  */
interface GroupMessage extends BaseMessage {
  /** 所属群Id receiverId */
  belongGroupId: number;
}
/** 好友消息列表项 */
interface FriendMessage extends BaseMessage {
  /** 消息接收人 */
  receiverId: string;
  /** 消息所属会话ID */
  sessionId: number;
  /** 是否已读 */
  read: boolean;
  /** 消息状态 1：正在发送 2 发送成功 3 发送失败 */
  status: 1 | 2 | 3;
}
type Message = FriendMessage & GroupMessage;
/** 会话类型 */
interface Session {
  /** 会话ID */
  sessionId: number;
  /** 会话发起人 */
  senderId: string;
  /** 会话接收人 */
  receiverId: string;
  /** 会话类型 */
  sessionType: SessionType;
  /** 会话是否是机器人 */
  isRobot: boolean;
  /** 会话是否置顶*/
  isTop: boolean;
  /** 会话是否免打扰 */
  isDisturb: boolean;
  /** 会话最后一条消息id */
  lastMsgId: string;
  /** 置顶的消息ID */
  topMsgId?: string;
  /** 置顶消息人的ID */
  topMsgUserId: string;
  /** 会话更新时间 */
  updatedAt: number;
  /** 会话接收人 名称 */
  username?: string;
  /** 会话头像 通常是 （好友头像、群名称组合的头像） */
  avatar: string;
  /** 会话最后一条消息内容 */
  content: string;
  /** 会话最后一条消息类型 */
  messageType: number;
  /** 会话最后一条消息是否撤回 */
  isRevoke?: boolean;
  /** 会话的备注 */
  remark?: any;
  /** 会话消息未读数 */
  unReadNum: number;
  /** 会话最后一条消息发送人 */
  lastMsgSendUserId?: string;
  /** 会话最后一条消息发送人名称 */
  lastMsgSendUserName?: string;
  /** 群会话的名称 */
  groupName?: string;
}
/** 当前聊天会话类型 */
interface ActiveSession extends Session {}
/** 群类型 */
interface Group {
  /** 群Id */
  groupId: number;
  /** 群名 */
  groupName: string;
  /** 群创建时间 */
  createdAt: Date;
  /** 群更新时间 */
  updatedAt: Date;
  /** 会话类型 */
  sessionType: 2;
  /** 群主userId */
  creatorId: string;
  /** 会话Id */
  sessionId: number;
  /** 群头像 */
  avatar: string;
  /** 群是否禁言 */
  isMute: boolean;
}
/** 群信息 */
interface GroupInfo extends Pick<Group, 'groupId' | 'creatorId' | 'groupName'> {
  /** 群公告 */
  groupAnnouncement: GroupAnnouncement[];
}
/** 公告 */
interface GroupAnnouncement {
  /** 公告id */
  id: number;
  /** 公告内容 */
  content: string;
  /** 公告创建时间 */
  createdAt: Date;
  /** 公告创建人 */
  createUser: {
    /** 用户在群中的昵称 */
    nickName: string;
  };
  /** 是否置顶 */
  isTop: boolean;
  /** 所属群 */
  belongGroupId: number;
}
/** 群成员 */
type GroupMember = Pick<User, 'userId' | 'avatar' | 'username', 'email', 'gender', 'signature'> & {
  /** 是否被禁言 */
  isMute: boolean;
  /** 该成员在该群里的备注 */
  nickName: string;
  /** 该成员对该群的备注 */
  remark: string;
  /** 该成员在该群的属性 是否是管理员、群主 */
  type: 0 | 1 | 2;
};
/** 用户 */
interface User {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 用户id */
  userId: string;
  /** 手机号 */
  tel: string;
  /** 性别 */
  gender: 0 | 1 | 2;
  /** 签名 */
  signature: string;
  /** 头像 */
  avatar: string;
  /** 生日 */
  birthday: string;
  /** 邮箱*/
  email: string;
}
/** 好友 */
interface Friend extends Omit<User, 'password'> {
  /** 会话Id */
  sessionId: number;
  /** 好友备注 */
  remark: string;
  /** 添加时间 */
  createdAt: number;
  /** 会话类型 */
  sessionType: SessionType;
}
/** 好友请求列表 */
interface FriendAddRequest {
  /** id标识 */
  id: number;
  /** 当前好友添加状态 */
  status: 0 | 1 | 2;
  /** 申请人id */
  applicantId: string;
  /** 被申请人id */
  friendId: string;
  /** 备注 */
  remark: string | null;
  /** 更新时间 */
  updatedAt: string;
  /** 申请人名称 */
  applicantUsername: string;
  /** 申请人头像 */
  applicantAvatar: string;
  /** 被申请人名称 */
  friendUsername: string;
  /** 被申请人头像 */
  friendAvatar: string;
  /** 更新时间 */
  upadtedAt: number;
}
/** 用户信息 */
type UserInfo = Omit<User, 'password'>;
/** 表情 */
interface Emote {
  /** 创建时间 */
  createdAt: string;
  /** 高度 */
  height: number;
  /** 宽度 */
  width: number;
  /** 所属人 */
  userId: string;
  /** id */
  id: number;
  /** 路径 */
  src: string;
}
