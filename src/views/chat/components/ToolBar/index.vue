<!--
 * @Description: 聊天框操作tab
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="edit-bar">
    <ul class="w100%">
      <li>
        <span title="表情" class="i-carbon:face-wink" ref="popoverEmoticon" />
      </li>
      <li>
        <span title="图片" class="i-carbon:image" @click="proxy?.$refs.fileRef?.click()" />
      </li>
      <li>
        <span title="附件" class="i-carbon:volume-file-storage" @click="proxy?.$refs.fileRef?.click()" />
      </li>
      <li>
        <span title="语音消息" class="i-icon-park-outline:voice" />
      </li>
      <li>
        <span title="截图" class="i-icon-park-outline:cutting-one" />
      </li>
      <li>
        <span title="语音通话" class="i-icon-park-outline:phone-telephone" />
      </li>
      <li>
        <span title="视频通话" class="i-icon-park-outline:video-one" />
      </li>
      <li style="margin: 0 0 0 auto">
        <span title="聊天记录" class="i-icon-park-outline:history" />
      </li>
    </ul>
    <!-- 表情弹出层 -->
    <el-popover
      popper-style="padding:0"
      ref="popoverRef"
      :virtual-ref="popoverEmoticon"
      virtual-triggering
      placement="top-start"
      width="442"
      trigger="click"
      @hide="hide"
    >
      <!-- 
          这里使用v-bind 是为了将父元素传过来的获取发送消息的文本传给Emoticons组件 实现透传
          需要注意的是 子组件使用的方法 在该组件不能用props和emits接收 否则子组件无法拿到透传的方法
        -->
      <!-- TODO  close 命名规范化  -->
      <Emoticons ref="emoticonsRef" v-bind="$attrs" @close="close" />
    </el-popover>
    <!-- 上传文件 -->
    <form ref="fileFrom" enctype="multipart/form-data" style="display: none">
      <input ref="fileRef" type="file" @change="uploadFileChange" />
    </form>
    <FilePreview ref="previewRef" v-bind="$attrs" @confirmUpload="confirmUpload" />
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus';
  import { uploadFileSlice, mergeFile } from '@/api/upload';
  import { asyncTaskController } from '@/utils/asyncPool';
  import SparkMD5 from 'spark-md5';

  const popoverEmoticon = ref();
  const popoverRef = ref();
  const { proxy } = getCurrentInstance() as any;
  const chunkSize = 1024 * 1024;
  const emoticonsRef = ref();
  const previewRef = ref();
  // 上传文件
  const uploadFileChange = async (e) => {
    const maxsize = 20 * 1024 * 1024;
    if (e.target.files.length == 0) {
      return false;
    }
    const file = e.target.files[0];
    if (file.size > maxsize) {
      ElMessage({
        message: '上传文件不能大于20M',
        type: 'error',
        offset: 150
      });
      proxy.$refs.fileRef.value = null;
      return;
    }
    previewRef.value.loadFile(file);
    proxy.$refs.fileRef.value = null;
  };
  // 上传函数
  const uploadChunk = (chunkData: FormData) => {
    return new Promise((resolve, reject) => {
      uploadFileSlice(chunkData).then((res) => {
        resolve(res);
      });
    });
  };

  const uploadLargeFile = (file: File, chunkSize: number, fileMd5: string) => {
    const fileSize = file.size; // 文件大小
    const chunks = typeof chunkSize === 'number' ? Math.ceil(fileSize / chunkSize) : 1;
    console.log(`Uploading file with ${chunks} chunks`);
    const pool = new asyncTaskController(3, mergeF({ file, fileMd5 })); // 最大并发数为 3
    for (let index = 0; index < chunks; index++) {
      const start = index * chunkSize;
      let end = index + 1 == chunks ? fileSize : (index + 1) * chunkSize;
      const chunkFile = file.slice(start, end); // 对文件进行切割
      const formData = new FormData();
      formData.append('fileMd5', fileMd5);
      formData.append('fileSize', file.size.toString());
      formData.append('file', chunkFile, fileMd5 + '-' + index);
      const task = () => uploadChunk(formData);
      pool.add(task);
    }
  };

  /**
   *  确认发送图片
   */
  // TODO 修改函数名字
  const confirmUpload = async (file: File) => {
    // const fileMd5 = (await calcFileMD5(file)) as string; // 计算文件的MD5
    // 兼容大文件上传
    // uploadLargeFile(file, chunkSize, fileMd5);
    // const formData = new FormData();
    // formData.append('file', file);
    // const res = await uploadFileToCos(formData);
    // console.log('res', res);
  };

  const mergeF = (options: { file: File; fileMd5: string }) => {
    // 合并文件
    return () => {
      // 使用闭包传递参数
      let fileName = options.file.name;
      let fileMd5 = options.fileMd5;
      mergeFile({
        fileMd5,
        fileName
      }).then((res) => {});
    };
  };

  // 计算文件的MD5（数字指纹）
  const calcFileMD5 = (file: File, chunkSize = 2097152) => {
    return new Promise((resolve, reject) => {
      let chunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;
      let spark = new SparkMD5.ArrayBuffer();
      let fileReader = new FileReader();

      fileReader.onload = (e) => {
        spark.append(e?.target?.result);
        currentChunk++;
        if (currentChunk < chunks) {
          loadNext();
        } else {
          resolve(spark.end());
        }
      };

      fileReader.onerror = (e) => {
        reject(fileReader.error);
      };

      function loadNext() {
        let start = currentChunk * chunkSize,
          end = start + chunkSize >= file.size ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(file.slice(start, end));
      }
      loadNext();
    });
  };
  const hide = () => {
    console.log(432, emoticonsRef.value);
    emoticonsRef.value.resetActiveTab();
  };
  const close = () => {
    console.log('432');

    popoverRef.value.hide();
  };
  defineExpose({ uploadFileChange });
</script>
<style scoped lang="scss">
  .edit-bar {
    height: 36px;
    border-bottom: 1px solid #f4f5f9;
    display: flex;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    ul {
      display: flex;
    }
    ul > li {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      list-style: none;
      margin-right: 15px;
      font-size: 20px;
    }
  }
</style>
