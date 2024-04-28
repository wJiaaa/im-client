/*
 * @Description: 用户相关操作接口
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 15:42:39
 */
import http from '@/utils/request';
const service = '/user';
/**
 * @description: 用户注册
 * @return {*}
 */
export async function userRegist(data: Pick<User, 'username' | 'password' | 'tel'>) {
  return http.post({
    url: service + '/register',
    data
  });
}

/**
 * @description: 用户登录
 * @return {*}
 */
export async function userLogin(
  data: Pick<User, 'tel' | 'password'> & {
    code: number | undefined;
  }
) {
  return http.post({
    url: service + '/login',
    data
  });
}

/**
 * @Description 获取登录二维码
 */
export async function getQrCode() {
  return http.get({
    url: service + '/getQrCode'
  });
}

/**
 * @description: 获取用户信息
 * @return {*}
 */
export async function getUserInfo() {
  return http.get<UserInfo>({
    url: service + '/getUserInfo'
  });
}

/**
 * @description: 退出登录
 */
export async function logOut() {
  return http.post({
    url: service + '/logOut'
  });
}

/**
 * @description: 更新用户信息
 */
export async function updateUserInfo(data: Omit<User, 'password' | 'userId'>) {
  return http.post<UserInfo>({
    url: service + '/updateUserInfo',
    data
  });
}
/**
 * @description: 获取表情列表
 */
export async function getEmoteListApi() {
  return http.get<Emote[]>({
    url: service + '/getEmoteList'
  });
}
/**
 * @description: 获取表情列表
 */
export async function addEmoteApi(data: Pick<Emote, 'height' | 'width' | 'src'>) {
  return http.post({
    url: service + '/addEmote',
    data
  });
}
