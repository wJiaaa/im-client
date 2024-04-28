/*
 * @Description: 上传相关接口
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import http from '@/utils/request';
const service = '/upload';
export async function uploadFileSlice(data: FormData) {
  return http.post({
    url: service,
    config: {
      headers: { 'Content-Type': 'multipart/form-data' }
    },
    data
  });
}
export async function mergeFile(params: any) {
  return http.get({
    url: service + '/merge',
    params
  });
}
/**
 *  上传文件到cos
 */
export async function uploadFileToCos(data: FormData) {
  return http.post<{
    fileUrl: string;
    fileName: string;
    thumbUrl: string;
    fileType: string;
  }>({
    url: service + '/uploadToCos',
    config: {
      headers: { 'Content-Type': 'multipart/form-data' }
    },
    data
  });
}
