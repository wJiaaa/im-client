/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 20:47:03
 */
import { defineStore } from 'pinia';
import { userLogin, getUserInfo, logOut, userRegist } from '@/api';
import { setToken, removeToken } from '@/utils/auth';
import useSocketStore from './socket';
import useChatStore from './chat';
import useFriendStore from './friend';
import useSystemStore from './system';
interface UserStore {
  token: string;
  userId: string;
  userInfo: UserInfo;
}
const useUserStore = defineStore('user', {
  state: (): UserStore => ({
    token: '',
    userId: '',
    userInfo: {} as UserInfo
  }),
  actions: {
    getInfo() {
      return new Promise<UserInfo>((resolve, reject) => {
        getUserInfo()
          .then(async (res) => {
            resolve(res.data);
            this.userInfo = res.data;
            this.userId = res.data.userId;
            const socketStore = useSocketStore();
            socketStore.createSocket(this.userId);
            useFriendStore().getAllFriendAdd();
            useChatStore().getFriendGather();
            useChatStore().getSessionList();
            useChatStore().getGroupGather();
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    login(
      userInfo: Pick<User, 'tel' | 'password'> & {
        code: number;
      }
    ) {
      return new Promise<void>((resolve, reject) => {
        userLogin(userInfo)
          .then((res) => {
            this.token = res.data;
            setToken(this.token);
            if (!this.token) {
              reject();
            }
            resolve();
          })
          .catch(() => {
            reject();
          });
      });
    },
    logOut() {
      return new Promise<void>((resolve, reject) => {
        logOut()
          .then(() => {
            this.token = '';
            useUserStore().$reset();
            useSocketStore().$reset();
            useChatStore().$reset();
            useFriendStore().$reset();
            useSystemStore().setActiveTab(1);
            useSystemStore().setShowPageType(1);
            removeToken();
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    register(userInfo: Pick<User, 'username' | 'password' | 'tel'>) {
      return new Promise<void>((resolve, reject) => {
        userRegist(userInfo)
          .then((res) => {
            this.token = res.data;
            setToken(this.token);
            if (!this.token) {
              reject();
            }
            resolve();
          })
          .catch(() => {
            reject();
          });
      });
    }
  }
});
export default useUserStore;
