/*
 * @Description: 全局枚举文件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2023-07-02 21:02:38
 */
import { MESSAGE_TYPE_TEXT } from '@/utils/constant';
/**
 * 消息类型
 */
export enum MsgTypeEnum {
  /** 文本 */
  TEXT = 1,
  /** 图片 */
  IMAGE,
  /** 文件 */
  FILE,
  /** 视频 */
  VIDEO,
  /** 语音 */
  VOICE
}
