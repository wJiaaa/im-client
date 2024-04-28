/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 20:47:15
 */
import { PersistedStateOptions } from 'pinia-plugin-persistedstate';

/**
 * @description pinia持久化参数配置
 * @param {String} key 存储到持久化的 name
 * @return persist
 * */
const piniaPersistConfig = (key: string) => {
  const persist: PersistedStateOptions = {
    key,
    storage: window.sessionStorage
  };
  return persist;
};

export default piniaPersistConfig;
