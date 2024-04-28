<!--
 * @Description: 头像裁剪
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 16:01:15
-->
<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import 'vue-cropper/dist/index.css';
  import { VueCropper } from 'vue-cropper';
  import { uploadFileToCos } from '@/api/upload';
  const emit = defineEmits(['close', 'success']);
  const state = reactive({
    show: true,
    src: ''
  });
  const cropper = ref('cropper');
  const option = reactive({
    img: '',
    size: 1,
    full: false,
    outputType: 'png',
    canMove: true,
    fixedBox: true,
    original: false,
    canMoveBox: true,
    autoCrop: true,
    autoCropWidth: 250,
    autoCropHeight: 250,
    centerBox: false,
    high: true,
    preview: ''
  });
  const onMaskClick = () => {
    emit('close');
  };
  function onTriggerUpload() {
    document.getElementById('upload-avatar').click();
  }
  const onUpload = (e) => {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
      let data;
      if (typeof e.target.result === 'object') {
        // 把Array Buffer转化为blob 如果是base64不需要
        data = window.URL.createObjectURL(new Blob([e.target.result]));
        console.log(data, e.target.result);
      } else {
        data = e.target.result;
      }
      option.img = data;
    };
    reader.readAsArrayBuffer(file);
  };
  const realTime = (data) => {
    cropper.value.getCropData((img) => {
      option.preview = img;
    });
  };
  const rotateLeft = () => {
    cropper.value.rotateLeft();
  };
  const rotateRight = () => {
    cropper.value.rotateRight();
  };
  const refreshCrop = () => {
    cropper.value.refresh();
  };
  const onSubmit = () => {
    cropper.value.getCropBlob((blob) => {
      let file = new File([blob], 'avatar.png', {
        type: blob.type,
        lastModified: Date.now()
      });
      const form = new FormData();
      form.append('file', file);
      form.append('type', 'avatar');
      uploadFileToCos(form).then((res) => {
        emit('success', res.data.fileUrl);
      });
    });
  };
</script>

<template>
  <input id="upload-avatar" type="file" accept="image/png, image/jpeg, image/jpg, image/webp" @change="onUpload" />
  <el-dialog class="upload-avatar" v-model="state.show" @close="onMaskClick" title="选择头像" width="800">
    <div class="content">
      <div class="canvas">
        <vue-cropper
          ref="cropper"
          :img="option.img"
          :output-size="option.size"
          :output-type="option.outputType"
          :info="true"
          :full="option.full"
          :can-move="option.canMove"
          :can-move-box="option.canMoveBox"
          :fixed-box="option.fixedBox"
          :original="option.original"
          :auto-crop="option.autoCrop"
          :auto-crop-width="option.autoCropWidth"
          :auto-crop-height="option.autoCropHeight"
          :center-box="option.centerBox"
          @real-time="realTime"
        />
      </div>
      <div class="view">
        <div class="preview">
          <img :src="option.preview" v-show="option.preview" />
        </div>
      </div>
    </div>
    <template #footer>
      <div>
        <el-button @click="onTriggerUpload" type="primary">
          <template #icon>
            <span class="i-icon-park-outline:upload-one" />
          </template>
          上传图片
        </el-button>
        <el-button @click="refreshCrop">
          <template #icon>
            <span class="i-icon-park-outline:refresh-one" />
          </template>
          重置
        </el-button>
        <el-button @click="rotateLeft">
          <template #icon>
            <span class="i-icon-park-outline:undo" />
          </template>
          左转
        </el-button>
        <el-button @click="rotateRight">
          <template #icon>
            <span class="i-icon-park-outline:redo" />
          </template>
          右转
        </el-button>
      </div>
      <el-button type="primary" @click="onSubmit">保存头像</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss">
  .upload-avatar {
    .el-dialog__footer {
      display: flex;
      justify-content: space-between;
      &:last-child {
        margin-right: 125px;
      }
    }
  }
</style>
<style lang="scss" scoped>
  #upload-avatar {
    display: none;
  }

  .content {
    width: 100%;
    height: 400px;
    display: flex;

    .canvas {
      width: 400px;
      height: 400px;
      padding: 5px;
    }

    .view {
      flex: auto;
      display: flex;
      align-items: center;
      justify-content: center;

      .preview {
        width: 180px;
        height: 180px;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid var(--border-color);
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
</style>
