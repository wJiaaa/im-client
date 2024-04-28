/*
 * @Description: 公共函数
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 00:10:51
 */

import useUserStore from '@/store/modules/user';
import { SESSION_TYPE, MESSAGE_TYPE_IMAGE } from './constant';
import useSocketStore from '@/store/modules/socket';
import useChatStore from '@/store/modules/chat';
import { uploadFileToCos } from '@/api/upload';
import dayjs from 'dayjs';
/**
 * 定义用于 Vue 组件属性类型的辅助函数。
 * @param {any} val - 属性类型的值或验证函数。
 * @type {T} - 泛型参数，表示属性类型的具体类型。
 * @returns 属性类型的定义。
 */
export const definePropType = <T>(val: any): PropType<T> => val;

/**
 *  判断userId是否是当前登录的用户userId
 * @param userId 需要判断的userId
 * @return
 */
export const isCurrentUser = (userId: string): boolean => {
  return userId === useUserStore().userId;
};

/**
 *  判断是否是群聊
 */
export const isGroupChat = (sessionType: SessionType): boolean => {
  return sessionType === SESSION_TYPE['group'];
};

/**
 * 删除未读消息数
 * @param sessionId 会话id
 */
export const clearMessageUnread = (sessionId: number) => {
  useSocketStore().socketIo?.emit('clearMessageUnread', {
    sessionId,
    userId: useUserStore().userId
  });
  if (useChatStore().sessionGather[sessionId]) {
    // 删除会话列表中的未读消息数
    useChatStore().sessionGather[sessionId].unReadNum = 0;
  }
  // 删除未读消息数
  useChatStore().unReadGather[sessionId] = 0;
};

/**
 * 生成消息内容
 * @param body 消息体
 */
export const generateMsgExtra = (body: any) => {
  console.log('body', body);
  return body;
};

/**
 * 获取视频第一帧
 * @param file 视频文件
 */
export const getVideoCover = (file: File) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const tempUrl = URL.createObjectURL(file);
    video.src = tempUrl;
    video.crossOrigin = 'anonymous'; // 视频跨域
    video.currentTime = 2; // 第2帧
    video.oncanplay = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 将canvas转为图片file
      canvas.toBlob((blob) => {
        if (!blob) return;
        // 时间戳生成唯一文件名
        const name = Date.now() + 'thumb.jpg';
        const thumbFile = new File([blob], name, { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('file', thumbFile);
        uploadFileToCos(formData).then((res) => {
          resolve({
            tempUrl,
            thumbWidth: canvas.width,
            thumbHeight: canvas.height,
            thumbUrl: res.data.fileUrl,
            thumbSize: thumbFile.size
          });
        });
      });
    };
    video.onerror = function () {
      URL.revokeObjectURL(tempUrl); // 释放临时URL资源
      reject({ width: 0, height: 0, url: null });
    };
  });
};
/**
 *  获取图片信息
 * @param src 文件路径
 */
export const getImageInfo = (src) => {
  return new Promise<any>((resolve, reject) => {
    let image = new Image();
    image.src = src;
    image.onload = () => {
      resolve({
        width: image.width,
        height: image.height,
        fileType: MESSAGE_TYPE_IMAGE
      });
    };
  });
};
/**
 * @description 获取文件类型
 * @param
 */
export const getFileType = (fileName = '') => {
  /* 根据后缀判断文件类型 */
  let suffix = ''; // 后缀获取
  let result = ''; // 获取类型结果
  if (fileName) {
    const flieArr = fileName.split('.'); // 根据.分割数组
    suffix = flieArr[flieArr.length - 1]; // 取最后一个
  }
  if (!suffix) return false; // fileName无后缀返回false
  suffix = suffix.toLocaleLowerCase(); // 将后缀所有字母改为小写方便操作
  // 匹配图片
  const imgList = ['png', 'jpg', 'jpeg', 'bmp', 'gif']; // 图片格式
  result = imgList.find((item) => item === suffix);
  if (result) return 'image';
  // 匹配txt
  const txtList = ['txt'];
  result = txtList.find((item) => item === suffix);
  if (result) return 'txt';
  // 匹配excel
  const excelList = ['xls', 'xlsx'];
  result = excelList.find((item) => item === suffix);
  if (result) return 'excel';
  // 匹配word
  const wordList = ['doc', 'docx'];
  result = wordList.find((item) => item === suffix);
  if (result) return 'word';
  // 匹配pdf
  const pdfList = ['pdf'];
  result = pdfList.find((item) => item === suffix);
  if (result) return 'pdf';
  // 匹配ppt
  const pptList = ['ppt', 'pptx'];
  result = pptList.find((item) => item === suffix);
  if (result) return 'ppt';
  // 匹配zip
  const zipList = ['rar', 'zip', '7z'];
  result = zipList.find((item) => item === suffix);
  if (result) return 'zip';
  // 匹配视频
  const videoList = ['mp4', 'm2v', 'mkv', 'rmvb', 'wmv', 'avi', 'flv', 'mov', 'm4v'];
  result = videoList.find((item) => item === suffix);
  if (result) return 'video';
  // 匹配音频
  const radioList = ['mp3', 'wav', 'wmv'];
  result = radioList.find((item) => item === suffix);
  if (result) return 'radio';
  // 其他文件类型
  return 'other';
};
/**
 * @description 加载图片的异步函数
 */
const loadImage = (url: string): Promise<CanvasImageSource> => {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      resolve(img);
    };
    img.onerror = function () {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};
/**
 * @description 获取图片在canvas中的xy坐标
 */
const getImageXy = (size: number) => {
  const s = new Array(size);
  let _x = 0;
  let _y = 0;
  if (size == 1) {
    _x = _y = 6;
    s[0] = '6,6';
  }
  if (size == 2) {
    _x = _y = 4;
    s[0] = '4,' + (132 / 2 - 60 / 2);
    s[1] = 60 + 2 * _x + ',' + (132 / 2 - 60 / 2);
  }
  if (size == 3) {
    _x = _y = 4;
    s[0] = 132 / 2 - 60 / 2 + ',' + _y;
    s[1] = _x + ',' + (60 + 2 * _y);
    s[2] = 60 + 2 * _y + ',' + (60 + 2 * _y);
  }
  if (size == 4) {
    _x = _y = 4;
    s[0] = _x + ',' + _y;
    s[1] = _x * 2 + 60 + ',' + _y;
    s[2] = _x + ',' + (60 + 2 * _y);
    s[3] = 60 + 2 * _y + ',' + (60 + 2 * _y);
  }
  if (size == 5) {
    _x = _y = 3;
    s[0] = (132 - 40 * 2 - _x) / 2 + ',' + (132 - 40 * 2 - _y) / 2;
    s[1] = (132 - 40 * 2 - _x) / 2 + 40 + _x + ',' + (132 - 40 * 2 - _y) / 2;
    s[2] = _x + ',' + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
    s[3] = _x * 2 + 40 + ',' + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
    s[4] = _x * 3 + 40 * 2 + ',' + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
  }
  if (size == 6) {
    _x = _y = 3;
    s[0] = _x + ',' + (132 - 40 * 2 - _x) / 2;
    s[1] = _x * 2 + 40 + ',' + (132 - 40 * 2 - _x) / 2;
    s[2] = _x * 3 + 40 * 2 + ',' + (132 - 40 * 2 - _x) / 2;
    s[3] = _x + ',' + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
    s[4] = _x * 2 + 40 + ',' + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
    s[5] = _x * 3 + 40 * 2 + ',' + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
  }
  if (size == 7) {
    _x = _y = 3;
    s[0] = (132 - 40) / 2 + ',' + _y;
    s[1] = _x + ',' + (_y * 2 + 40);
    s[2] = _x * 2 + 40 + ',' + (_y * 2 + 40);
    s[3] = _x * 3 + 40 * 2 + ',' + (_y * 2 + 40);
    s[4] = _x + ',' + (_y * 3 + 40 * 2);
    s[5] = _x * 2 + 40 + ',' + (_y * 3 + 40 * 2);
    s[6] = _x * 3 + 40 * 2 + ',' + (_y * 3 + 40 * 2);
  }
  if (size == 8) {
    _x = _y = 3;
    s[0] = (132 - 80 - _x) / 2 + ',' + _y;
    s[1] = (132 - 80 - _x) / 2 + _x + 40 + ',' + _y;
    s[2] = _x + ',' + (_y * 2 + 40);
    s[3] = _x * 2 + 40 + ',' + (_y * 2 + 40);
    s[4] = _x * 3 + 40 * 2 + ',' + (_y * 2 + 40);
    s[5] = _x + ',' + (_y * 3 + 40 * 2);
    s[6] = _x * 2 + 40 + ',' + (_y * 3 + 40 * 2);
    s[7] = _x * 3 + 40 * 2 + ',' + (_y * 3 + 40 * 2);
  }
  if (size == 9) {
    _x = _y = 3;
    s[0] = _x + ',' + _y;
    s[1] = _x * 2 + 40 + ',' + _y;
    s[2] = _x * 3 + 40 * 2 + ',' + _y;
    s[3] = _x + ',' + (_y * 2 + 40);
    s[4] = _x * 2 + 40 + ',' + (_y * 2 + 40);
    s[5] = _x * 3 + 40 * 2 + ',' + (_y * 2 + 40);
    s[6] = _x + ',' + (_y * 3 + 40 * 2);
    s[7] = _x * 2 + 40 + ',' + (_y * 3 + 40 * 2);
    s[8] = _x * 3 + 40 * 2 + ',' + (_y * 3 + 40 * 2);
  }
  return s;
};
/**
 * @description 获取图片在canvas中的宽度
 */
const getImageWidth = (size: number) => {
  let width = 0;
  if (size == 1) {
    width = 120;
  }
  if (size > 1 && size <= 4) {
    width = 60;
  }
  if (size >= 5) {
    width = 40;
  }
  return width;
};
/**
 * @description 生成群聊头像
 * @param list 前几位成员头像url列表
 */
export const generateGroupAvatar = (
  list: string[],
  fileName: string
): Promise<{
  fileUrl: string;
  fileName: string;
  thumbUrl: string;
  fileType: string;
}> => {
  return new Promise(async (resolve) => {
    const fourSidedPixels = 134;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = fourSidedPixels;
    canvas.height = fourSidedPixels;
    // 制作透明背景图
    ctx.clearRect(0, 0, fourSidedPixels, fourSidedPixels); // 清除画布上的内容
    ctx.fillStyle = 'rgba(255, 255, 255, 0)'; // 设置透明背景
    ctx.fillRect(0, 0, fourSidedPixels, fourSidedPixels); // 填充透明背景
    const cwidth = getImageWidth(list.length);
    const xy = getImageXy(list.length);
    for (let index = 0; index < xy.length; index++) {
      var element = xy[index];
      var sizeArr = element.split(',');
      var x = Number(sizeArr[0]);
      var y = Number(sizeArr[1]);
      const cvs = document.createElement('canvas');
      const ct = cvs.getContext('2d')!;
      cvs.width = cwidth;
      cvs.height = cwidth;

      // 使用 await 等待图片加载完成
      await loadImage(list[index])
        .then((img: CanvasImageSource) => {
          ct.drawImage(img, 0, 0, cwidth, cwidth);
          ctx.drawImage(cvs, x, y, cwidth, cwidth);
        })
        .catch(function (error) {
          console.error('Failed to load image: ', error);
        });
    }
    const formData = new FormData();
    formData.append('file', canvasToFile(canvas, fileName));
    uploadFileToCos(formData).then((res) => {
      resolve(res.data);
    });
  });
};
/**
 * @description canvas转换成file上传
 * @param canvas
 */
const canvasToFile = (canvas: HTMLCanvasElement, fileName: string) => {
  const bytes = atob(canvas.toDataURL('image/png').split(',')[1]);
  const arrayBuffer = new ArrayBuffer(bytes.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.length; i++) {
    uint8Array[i] = bytes.charCodeAt(i);
  }
  const blob = new Blob([uint8Array], { type: 'image/png' });
  const file = new File([blob], fileName + '.png', { type: 'image/png', lastModified: Date.now() }) as File;
  return file;
};

/**
 * @description 消息时间显示格式
 * @param time 消息时间
 */
export const formatTime = (time) => {
  // 判断是否是今天 xx:xx
  // 判断是否是昨天 昨天 XX：xx
  // 大于昨天 xX月xx日 xx:xx
  const currentTime = dayjs();
  const messageTime = dayjs(time);

  if (currentTime.isSame(messageTime, 'day')) {
    // 如果消息时间与当前时间是同一天
    return messageTime.format('HH:mm'); // 返回格式为 xx:xx
  } else if (currentTime.subtract(1, 'day').isSame(messageTime, 'day')) {
    // 如果消息时间是昨天
    return `昨天 ${messageTime.format('HH:mm')}`; // 返回格式为 昨天 xx:xx
  } else {
    // 如果消息时间不是今天也不是昨天
    return messageTime.format('MM月DD日 HH:mm'); // 返回格式为 xx月xx日 xx:xx
  }
};
