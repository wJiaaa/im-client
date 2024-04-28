/*
 * @Description: 常量
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:29:55
 */
/** 右侧页面展示类型 */
export const PAGE_SHOW_TYPE = {
  welcome: 1, // 欢迎页面
  chat: 2, //聊天页面
  friendInfo: 3, // 好友信息
  groupInfo: 4, //群聊信息
  friendNotice: 5, //好友通知
  groupNotice: 6, //群聊通知
  systemNotice: 7 //系统通知
  // 使用了 TypeScript 的 as const 断言，将 PAGE_SHOW_TYPE 对象的属性值设为只读。这样做可以保留属性值的字面量类型而不是默认的数字类型
} as const;
/** pageshow的类型 */
export type ShowPageType = ValuesOf<typeof PAGE_SHOW_TYPE>;

/** 会话类型 */
export const SESSION_TYPE = {
  friend: 1, // 好友
  group: 2 // 群聊
};
/** 文本 */
export const MESSAGE_TYPE_TEXT = 1;
/** 图片 */
export const MESSAGE_TYPE_IMAGE = 2;
/** 文件 */
export const MESSAGE_TYPE_FILE = 3;
/** 视频 */
export const MESSAGE_TYPE_VIDEO = 4;
/** 系统消息 */
export const MESSAGE_TYPE_SYSTEM = 99;
/** 撤回消息 */
export const MESSAGE_TYPE_REVOKE = 100;
/** 置顶/取消置顶消息  */
export const MESSAGE_TYPE_TOP = 101;
/** 表情消息 */
export const MESSAGE_TYPE_EMOTE = 5;
/** 引用消息展示类型 */
export const MESSAGE_SHOW_CONTENT: { [key: number]: string } = {
  [MESSAGE_TYPE_TEXT]: '[文本]',
  [MESSAGE_TYPE_IMAGE]: '[图片]',
  [MESSAGE_TYPE_FILE]: '[文件]',
  [MESSAGE_TYPE_VIDEO]: '[视频]',
  [MESSAGE_TYPE_SYSTEM]: '[系统消息]',
  [MESSAGE_TYPE_REVOKE]: '[撤回消息]',
  [MESSAGE_TYPE_EMOTE]: '[表情]'
};
export const SELECT_USER_TYPE = {
  createGroup: 1, //创建群聊
  inviteUserToGroup: 2, // 选择好友进群
  forwardMessage: 3
};
