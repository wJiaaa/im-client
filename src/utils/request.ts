/*
 * @Description: axios请求封装
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-23 20:00:02
 */
import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import router from '@/router';
import { getToken, removeToken } from '@/utils/auth';

/** axios实例  */
const service: AxiosInstance = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_API,
  // 超时
  // timeout: ResultEnum.TIMEOUT as number
  timeout: 20000
});
/** 请求拦截器  */
service.interceptors.request.use(
  // @ts-ignore
  (config: InternalAxiosRequestConfig) => {
    const token: string = getToken();
    return {
      ...config,
      headers: { ...config.headers, Authorization: `Bearer ${token}` }
    };
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/** 响应拦截器  */
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg, data } = response.data;
    // if (data.code == ResultEnum.OVERDUE) {
    //   ElMessage.error(data.msg);
    //   globalStore.setToken('');
    //   router.replace({
    //     path: '/login'
    //   });
    //   return Promise.reject(data);
    // }
    // // * 全局错误信息拦截（防止下载文件得时候返回数据流，没有code，直接报错）
    // if (data.code && data.code !== ResultEnum.SUCCESS) {
    //   ElMessage.error(data.msg);
    //   return Promise.reject(data);
    // }
    if (code === 401) {
      removeToken();
      router.replace({
        path: '/login'
      });
    }
    if (code === 500) {
      ElMessage.error(msg);
      return Promise.reject(data);
    }
    // TODO 修改 只暴露出data 如果code小于200大于400 抛错 修改成功请求
    return response.data;
  },
  (error: AxiosError) => {
    // 处理 HTTP 网络错误
    // 状态码
    const status = error.response?.status;
    // // 根据响应的错误状态码，做不同的处理
    // if (response) return checkStatus(response.status);
    // // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
    // if (!window.navigator.onLine) return router.replace({ path: '/500' });
    return Promise.reject(error);
  }
);

type RequestOptions = {
  url: string;
  data?: object;
  config?: AxiosRequestConfig;
  params?: AxiosRequestConfig['params'];
};
type HttpMethod = {
  post: <T = any>(options: Omit<RequestOptions, 'params'>) => Promise<HttpResult<T>>;
  put: <T = any>(options: Omit<RequestOptions, 'params'>) => Promise<HttpResult<T>>;
  // Omit 可以从RequestOptions中排除data属性
  get: <T = any>(options: Omit<RequestOptions, 'data'>) => Promise<HttpResult<T>>;
  delete: <T = any>(options: Omit<RequestOptions, 'data'>) => Promise<HttpResult<T>>;
};

const http: HttpMethod = {
  get(options) {
    const { url, config, params } = options;
    return service.get(url, { params, ...config });
  },

  post(options) {
    const { url, data, config } = options;
    return service.post(url, data, config);
  },

  put(options) {
    const { url, data, config } = options;
    return service.put(url, data, config);
  },

  delete(options) {
    const { url, config, params } = options;
    return service.delete(url, { params, ...config });
  }
};
export default http;
/* 导出封装的请求方法 */
