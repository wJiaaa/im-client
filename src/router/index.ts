/*
 * @Description: 路由
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 20:46:46
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import useUserStore from '@/store/modules/user';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { isEmpty } from '@/utils/is';
NProgress.configure({ showSpinner: false });
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'login' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login/index.vue'),
    meta: {
      title: '登录页',
      key: 'login'
    }
  },
  {
    path: '/home',
    name: 'home',
    redirect: '/home/chat',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: '/home/chat',
        name: 'chat',
        component: () => import('@/views/chat/index.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/home/friend',
        name: 'friend',
        component: () => import('@/views/friend/index.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/home/group',
        name: 'group',
        component: () => import('@/views/group/index.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/home/setting',
        name: 'setting',
        component: () => import('@/views/setting/index.vue'),
        meta: {
          requiresAuth: true
        }
      }
    ]
  }
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  strict: false,
  // 切换页面，滚动到最顶部
  scrollBehavior: () => ({ left: 0, top: 0 })
});
router.beforeEach((to, from, next) => {
  NProgress.start();
  if (to.path === '/login') {
    next();
    NProgress.done();
  } else {
    if (isEmpty(useUserStore().userInfo)) {
      useUserStore()
        .getInfo()
        .then((res) => {
          useUserStore().userInfo = res;
          useUserStore().userId = res.userId;
          next();
        });
    } else {
      next();
    }
  }
});
router.afterEach(() => {
  NProgress.done();
});
export default router;
