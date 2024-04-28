/*
 * @Description: 好友相关接口
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 15:25:55
 */
import http from '@/utils/request';
const service = '/friend';
/**
 * @description: 获取好友列表
 */
export async function getfriendList() {
  return http.get<Friend[]>({
    url: service + '/getMyFriendList'
  });
}
/**
 * @Description 搜索好友
 */
export async function search(params: Pick<User, 'tel'>) {
  return http.get<Omit<User, 'password'>>({
    url: service + '/search',
    params
  });
}
/**
 * @Description 请求添加好友
 */
export async function requestAddFriend(data: { friendId: string }) {
  return http.post({
    url: service + '/requestAddFriend',
    data
  });
}

/**
 * @Description 获取好友请求列表
 */
export async function getAllFriendAddReq() {
  return http.get<FriendAddRequest[]>({
    url: service + '/getAllFriendAddReq'
  });
}

/**
 * @Description 同意好友请求
 */
export async function agreeFriendAddReq(data: { requestUserId: string; id: number }) {
  return http.post({
    url: service + '/agree',
    data
  });
}

/**
 * @Description 拒绝好友请求
 */
export async function refuseFriendAddReq(data: Pick<FriendAddRequest, 'id'>) {
  return http.post({
    url: service + '/refuse',
    data
  });
}

/**
 * @Description 删除好友
 */
export async function delFriend(params: { friendId: string; sessionId: number }) {
  return http.delete({
    url: service + '/delete',
    params
  });
}
/**
 * @description: 获取联系人信息
 */
export async function getFriendInfo(params: { friendId: string }) {
  return http.get({
    url: service + '/getFriendInfo',
    params
  });
}
