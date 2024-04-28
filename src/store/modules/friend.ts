/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import { defineStore } from 'pinia';
import { getAllFriendAddReq } from '@/api';
const useFriendStore = defineStore('friend', {
  state: () => ({
    // 当前点击的好友或者群聊
    activeContact: {} as Nullable<Friend | Group>,
    addReqUserList: [] as FriendAddRequest[] // 好友请求列表
  }),
  actions: {
    setActiveContat(payload: Nullable<Friend | Group>) {
      this.activeContact = payload;
    },
    getAllFriendAdd() {
      getAllFriendAddReq()
        .then(async (res) => {
          this.addReqUserList = res.data;
        })
        .catch(() => {});
    },
    setAddReqUserList(addFriendInfo: FriendAddRequest) {
      this.addReqUserList.unshift(addFriendInfo);
    },
    updateReqUserList(params: Pick<FriendAddRequest, 'id' | 'status'>) {
      const reqItem = this.addReqUserList.find((o) => o.id === params.id);
      if (reqItem) {
        reqItem.status = params.status;
      }
    }
  }
});
export default useFriendStore;
