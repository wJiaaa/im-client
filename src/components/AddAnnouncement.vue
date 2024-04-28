<!--
 * @Description: 新增群公告
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:16:50
-->
<!-- TODO 调整dialog body的padding -->
<!-- TODO 上传附件 -->
<template>
  <el-dialog class="bg-#F2F2F2!" v-model="addGroupAnnouncementDialog" title="发布新公告" width="500px" destroy-on-close>
    <div class="content">
      <div
        contenteditable
        :class="[
          'outline-none',
          'overflow-auto',
          'break-all',
          'cursor-text',
          'input',
          imageUrl ? 'max-h180px' : 'max-h280px'
        ]"
        placeholder="填写公告，1-300字"
        @input="changeInput"
      ></div>
      <div class="appendix">
        <el-upload
          :http-request="customReq"
          class="avatar-uploader"
          action=""
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
        >
          <img v-if="imageUrl" :src="imageUrl" class="img" />
          <span v-else class="i-icon-park-outline:pic text-24px" />
        </el-upload>
      </div>
    </div>
    <template #footer>
      <el-checkbox class="float-left bottom-5px" v-model="isTop" label="置顶公告" size="large" />
      <span class="dialog-footer">
        <el-button @click="addGroupAnnouncementDialog = false">取消</el-button>
        <el-button type="primary" @click="release">发布</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
  import { createAnnouncement } from '@/api';
  const emit = defineEmits(['closeGroupAnnouncement']);
  const props = defineProps({
    groupId: {
      type: Number,
      default: 0
    }
  });
  const addGroupAnnouncementDialog = ref(false);
  const release = () => {
    createAnnouncement({
      belongGroupId: props.groupId,
      content: content.value
    }).then(() => {
      content.value = '';
      addGroupAnnouncementDialog.value = false;
      emit('closeGroupAnnouncement');
    });
  };
  const content = ref();
  const isTop = ref();
  const imageUrl = ref('');
  const handleAvatarSuccess = (_: any, uploadFile: any) => {
    // imageUrl.value = URL.createObjectURL(uploadFile.raw!);
    console.log('uploadFile', uploadFile);
    loadFile(uploadFile.raw!);
  };
  const loadFile = (file: File) => {
    let reader = new FileReader();
    reader.onload = () => {
      imageUrl.value = reader.result as string;
      console.log('imageUrl', imageUrl.value);
    };
    reader.readAsDataURL(file);
  };
  const changeInput = (e: Event) => {
    let { textContent } = e.target as HTMLInputElement | HTMLTextAreaElement;
    console.log('textContent', textContent?.length);

    if (textContent!.length <= 300) {
      content.value = textContent;
    } else {
      textContent = content.value;
    }
  };
  const customReq = (e: any): XMLHttpRequest | Promise<unknown> => {
    loadFile(e.file!);
    return new Promise((resolve) => {});
  };
  defineExpose({
    /** 向父组件暴露打开弹窗的方法 */
    openDialog: () => {
      addGroupAnnouncementDialog.value = true;
    }
  });
</script>
<style scoped lang="scss">
  .content {
    position: relative;
    height: 320px;
    .appendix {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding-left: 10px;
      .img {
        width: auto;
        height: 120px;
      }
    }
    .input:empty::before {
      content: attr(placeholder);
    }
  }
</style>
