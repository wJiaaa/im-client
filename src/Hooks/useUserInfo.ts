/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 20:46:21
 */

import useCacheStore from '@/store/modules/cache';

/**
 * 统一获取用户信息 hook
 * @param userId 用户 ID
 * @description 引入该Hook后，可响应式获取用户信息
 */
export const useUserInfo = (userId: string) => {
  const userInfo = computed(
    () => (userId && useCacheStore().currentGroup.find((item) => item.userId === userId)) || {}
  );
  return { userInfo };
};
