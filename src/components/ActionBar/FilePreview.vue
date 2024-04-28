<!--
 * @Description: 文件预览
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <el-dialog
    v-model="isShow"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    title="图片预览"
    width="480px"
    destroy-on-close
  >
    <div v-if="fileType === MESSAGE_TYPE_FILE" class="file-preview">
      <div>
        <span class="i-icon-park-solid:file-excel w-3em h-3em" style="color: #a11212"></span>
        <!-- <svg-icon icon-class="文件夹" style="width: 50px; height: 50px" /> -->
      </div>
      <div class="file-info">
        <div>
          {{ fileName }}
        </div>
        <div class="file-fileSize">{{ fileSize }}M</div>
      </div>
    </div>
    <div class="preview" v-else>
      <el-image v-if="fileType === MESSAGE_TYPE_IMAGE" class="image" :src="src" fit="contain" />
      <video v-else="fileType === MESSAGE_TYPE_VIDEO" class="image" controls>
        <source :src="src" type="video/mp4" />
      </video>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="isShow = false">取消</el-button>
        <el-button :loading="loading" type="primary" @click="send">发送</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { MESSAGE_TYPE_IMAGE, MESSAGE_TYPE_FILE, MESSAGE_TYPE_VIDEO } from '@/utils/constant';
  import { uploadFileToCos } from '@/api/upload';
  import { getFileType, getVideoCover } from '@/utils/common';
  // TODO 需要定义attrs的event
  // TODO 优化代码
  const attrs: any = useAttrs();
  const isShow = ref(false);
  const emits = defineEmits(['update:show', 'confirmUpload']);
  const src = ref();
  const fileSize = ref();
  const fileName = ref();
  const loading = ref();
  const uploadFile = ref();
  const fileInfo = ref(); // 文件信息
  const fileType = ref(); // 文件类型
  const suffix = ref('');
  watch(
    () => isShow.value,
    (val) => {
      if (!val) src.value = '';
    }
  );
  // suffix 文件前缀
  const loadFile = async (file: File) => {
    uploadFile.value = file;
    let reader = new FileReader();
    // 单位 M
    fileSize.value = Math.ceil(file.size / 1024 / 1024);
    fileName.value = file.name;
    reader.onload = () => {
      src.value = reader.result;
      if (file.type.includes('image')) {
        // 创建图片对象
        const img = new Image();
        // 改变图片的src
        img.src = src.value;
        img.onload = () => {
          fileInfo.value = {
            width: img.width,
            height: img.height,
            size: fileSize.value
          };
          fileType.value = MESSAGE_TYPE_IMAGE;
          isShow.value = true;
        };
      }
      if (file.type.includes('video')) {
        fileType.value = MESSAGE_TYPE_VIDEO;
        getVideoCover(file).then((res: any) => {
          fileInfo.value = {
            size: fileSize.value,
            ...res
          };
          isShow.value = true;
        });
      } else {
        fileType.value = MESSAGE_TYPE_FILE;
        suffix.value = getFileType(fileName.value);
        console.log('suffix', suffix.value);
        fileInfo.value = {
          size: fileSize.value,
          suffix: suffix.value,
          fileName: fileName.value
        };
        isShow.value = true;
      }
    };
    reader.readAsDataURL(file);
  };

  const send = async () => {
    const formData = new FormData();
    formData.append('file', uploadFile.value);
    loading.value = true;
    try {
      const res = await uploadFileToCos(formData);
      isShow.value = false;
      loading.value = false;
      attrs.onSendByOther({ messageType: fileType.value, content: res.data.fileUrl, extra: fileInfo.value });
    } catch (error) {
      loading.value = false;
    }
  };
  defineExpose({
    loadFile
  });
</script>
<style scoped lang="scss">
  .preview {
    display: flex;
    justify-content: center;
  }
  .file-preview {
    display: flex;
    align-items: center;
    .file-info {
      margin-left: 10px;
      font-size: 16px;
      .file-fileSize {
        font-size: 14px;
        margin-top: 5px;
      }
    }
  }
  .image {
    max-width: 460px;
    max-height: 460px;
  }
</style>
