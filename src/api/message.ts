/*
 * @Description: 消息相关接口
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:33:20
 */
import http from '@/utils/request';
const service = '/message';
/**
 * @description 发送消息
 */
export async function sendMessage(data: SendMessagePayload) {
  return http.post<{
    /** 消息ID */
    msgId: string;
    /** 消息标识token */
    msgToken: string;
  }>({
    url: service,
    data
  });
}

/**
 * @Description 获取消息列表
 */
export async function getMessage(params: {
  /** 会话Id */
  sessionId: number;
  /** 页码  */
  pageNum: number;
  /** 项数  */
  pageSize: number;
  /** 接收人 */
  receiverId: string;
  /** 会话类型 */
  sessionType: SessionType;
}) {
  return http.get<{ messageList: Message[]; total: number }>({
    url: service,
    params
  });
}
/**
 * @description: 撤回消息
 */
export async function revokeMessageApi(data: Pick<Message, 'msgId'>) {
  return http.put<Pick<Message, 'msgId'>>({
    url: service + '/revokeMessage',
    data
  });
}
/**
 * @description: 删除消息
 */
export async function deleteMessageApi(
  data: Pick<Message, 'msgId' | 'sessionId'> & { previousMsgId: string | undefined }
) {
  return http.put<{ msgId: string }>({
    url: service + '/deleteMessage',
    data
  });
}
/**
 * @description: 置顶消息
 */
export async function topMessageApi(data: { topFlag?: boolean; msgId?: string; receiverId: string }) {
  return http.put<{ msgId: string }>({
    url: service + '/topMessage',
    data
  });
}

/**
 * @Description 根据消息id获取消息详情
 */
export async function getMessageByMsgId(params: Pick<Message, 'msgId'> & Pick<Session, 'sessionType'>) {
  return http.get<Message>({
    url: service + '/getMessageByMsgId',
    params
  });
}
