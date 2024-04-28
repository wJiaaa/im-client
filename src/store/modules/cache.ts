/*
 * @Description: 缓存
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import { defineStore } from 'pinia';
import localforage from '@/utils/localforage';
import { getGroupMember } from '@/api';
const useCacheStore = defineStore('cache', {
  state: (): {
    currentGroup: GroupMember[];
  } => ({
    currentGroup: []
  }),
  actions: {
    async getGroupMemberList(groupId: number) {
      // TODO 判断本地indexDb是否有该群的成员列表
      // let list = await localforage.getItem<GroupMember[]>(`groupMembers_${groupId}`);
      let list = undefined;
      if (!list) {
        const res = await getGroupMember({ groupId });
        list = res.data;
      }
      this.currentGroup = list;
      // localforage.setItem<GroupMember[]>(`groupMembers_${groupId}`, list);
      return list;
    },
    /**
     * @description 设置群成员信息
     * @param
     */
    setGroupMemberByUserId(payload: GroupMember) {
      const { userId } = payload;
      const list = this.currentGroup.map((item) => {
        if (item.userId === userId) {
          item = {
            ...item,
            ...payload
          };
        }
        return item;
      });
      this.currentGroup = list;
    }
  }
});
export default useCacheStore;
