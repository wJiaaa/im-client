/*
 * @Description: vue main
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import { createApp } from 'vue';
import store from './store';
import router from './router';
import './style.scss';
import 'uno.css';
import 'webrtc-adapter';
import App from './App.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import 'element-plus/theme-chalk/el-message.css';
import 'element-plus/theme-chalk/el-message-box.css';
import 'virtual:svg-icons-register';
import directive from './directive';
import './styles/hightlight.scss';
import i18n from './locales/index.js';
const app = createApp(App);

// 全局配置
app.config.globalProperties.$ELEMENT = {};

directive(app);

app.use(ElMessage);
app.use(ElMessageBox);

app.use(store).use(router).use(i18n);
app.mount('#app');
