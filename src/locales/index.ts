/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 20:46:37
 */
// index.js
import { createI18n } from 'vue-i18n';
import zh from './zh';
import en from './en';

const i18n = createI18n({
  locale: localStorage.getItem('lang') || 'zh',
  fallbackLocale: 'zh',
  legacy: false,
  messages: {
    zh,
    en
  }
});

export default i18n;
