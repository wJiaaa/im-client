/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import { defineStore } from 'pinia';
import { PAGE_SHOW_TYPE, ShowPageType } from '@/utils/constant';
export type UserState = {
  activeTab: 1 | 2 | 3 | 4;
  showPageType: ShowPageType;
  theme: 'white' | 'dark';
  previewUrl: string;
  isPlaying: boolean;
};

const useSystemStore = defineStore('system', {
  state: (): UserState => ({
    activeTab: 1, // 当前所在nav类型 1.聊天  2.好友 3.群聊
    showPageType: PAGE_SHOW_TYPE['welcome'], // 当前右侧页面展示内容
    theme: 'white', // 当前主题
    previewUrl: '',
    isPlaying: false
  }),
  actions: {
    setActiveTab(payload: UserState['activeTab']) {
      this.activeTab = payload;
    },
    setShowPageType(payload: UserState['showPageType']) {
      this.showPageType = payload;
    },
    setTheme(payload: UserState['theme']) {
      this.theme = payload;
    },
    // 开启视频预览
    open(url: string) {
      this.previewUrl = url;
      this.isPlaying = true;
    },
    // 关闭视频预览
    close() {
      this.previewUrl = '';
      this.isPlaying = false;
    }
  }
});
export default useSystemStore;
