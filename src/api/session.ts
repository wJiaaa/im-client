/*
 * @Description: 会话相关接口
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-25 20:39:11
 */
import http from '@/utils/request';
const service = '/session';
/**
 * @Description 获取会话列表
 */
export async function sessionList() {
  return http.get<Session[]>({
    url: service + '/getSessionList'
  });
}

/**
 * @description 创建会话
 * @param sessionId 当前 好友会话Id
 */
export async function createSession(data: Pick<Session, 'sessionId'>) {
  return http.post<Session>({
    url: service + '/create',
    data
  });
}

/**
 * @description 修改会话置顶状态
 */
export async function changeSessionStatus(data: {
  /** 状态 */
  flag: boolean;
  /** 类型 */
  type: number;
  /** 会话Id */
  sessionId: number;
}) {
  return http.put<Session>({
    url: service + '/changeSessionStatus',
    data
  });
}

/**
 * @description 移除会话
 * @param sessionId 当前 好友会话Id
 */
export async function delSession(params: Pick<Session, 'sessionId'>) {
  return http.delete<Session>({
    url: service + '/delete',
    params
  });
}
