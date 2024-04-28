<!--
 * @Description: 表情
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div class="emote">
      <!-- system Emoji -->
      <ul class="options" v-if="activeTab === 2">
        <li v-for="(elImg, key, index) in emojiList.imgEmoji" :key="index" @click="chooseEmoji(key, elImg)">
          <div class="emoji" v-html="elImg" />
        </li>
      </ul>
      <!-- 添加的表情 -->
      <ul class="options" v-if="activeTab === 3">
        <el-upload :http-request="customUploadEmote" ref="uploadRef" action="" :show-file-list="false" title="添加表情">
          <template #trigger>
            <li class="add">
              <span class="i-icon-park-outline:plus"></span>
            </li>
          </template>
        </el-upload>

        <el-image
          fit="contain"
          :src="elImg.src"
          class="emoji-like like-emote cursor-pointer"
          v-for="(elImg, index) in likeList"
          :key="index"
          @click="chooseLikeEmote(elImg)"
        />
      </ul>
    </div>
    <div class="menu">
      <div
        ref="menuItems"
        :class="['menu-items mr5px', item.id === activeTab ? 'active' : '']"
        v-for="(item, index) in [
          { id: 1, title: '添加分组', iconName: 'i-icon-park-outline:plus' },
          { id: 2, title: 'Emoji', iconName: 'i-mdi:emoticon-outline' },
          { id: 3, title: '添加的表情', iconName: 'i-icon-park-twotone:like' }
        ]"
        :key="index"
        @click="() => (activeTab = item.id)"
      >
        <div class="icon">
          <span :class="['text-lg ', item.iconName]" :title="item.title" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import evEmitter from '@/utils/eventEmitter';
  import { uploadFileToCos, getEmoteListApi, addEmoteApi } from '@/api';
  import { emojiList } from '@/utils/emojis';

  // TODO attrs的类型需要定义
  const attrs: any = useAttrs();
  const emits = defineEmits(['close']);

  const activeTab = ref(2);
  const likeList = ref();
  /**
   * @description 上传表情
   */
  const customUploadEmote = async (options: any) => {
    const { file } = options;
    const formData = new FormData();
    formData.append('file', file);
    const res = await uploadFileToCos(formData);
    console.log('res', res.data);
    // 创建图片对象
    const img = new Image();
    // 改变图片的src
    img.src = res.data.fileUrl;
    img.onload = () => {
      const payload = {
        width: img.width,
        height: img.height,
        src: res.data.fileUrl
      };
      addEmote(payload);
    };
  };
  /**
   * @description 添加表情
   */
  const addEmote = (payload: Pick<Emote, 'height' | 'width' | 'src'>) => {
    addEmoteApi(payload).then((res) => {
      console.log('res', res);
      getEmoteList();
      ElMessage({
        type: 'success',
        message: '添加成功!'
      });
    });
  };
  /**
   * @description 选择上传的表情
   */
  const chooseLikeEmote = (item: Emote) => {
    attrs.onSendByOther({
      messageType: 5,
      content: item.src,
      extra: {
        width: item.width,
        height: item.height
      }
    });
    emits('close');
  };
  /**
   * @description 选择系统表情
   */
  const chooseEmoji = (item: string | number, elImg?: any) => {
    if (elImg) {
      const imgSrcReg = /<img.*?src='(.*?)'/g;
      let match = imgSrcReg.exec(elImg);
      if (match) {
        attrs.onSendByOther({ messageType: 1, content: item, elImg: match[1] });
      }
    } else {
      attrs.onSendByOther({ messageType: 1, content: item });
    }
    emits('close');
  };
  /**
   * @description 重置表情tab
   */
  const resetActiveTab = () => {
    activeTab.value = 2;
  };
  /**
   * @description 获取上传的表情列表
   */
  const getEmoteList = () => {
    getEmoteListApi().then((res) => {
      likeList.value = res.data;
    });
  };
  getEmoteList();
  defineExpose({
    resetActiveTab
  });
  onMounted(() => {
    evEmitter.on('addEmote', (payload) => addEmote(payload));
  });
  onUnmounted(() => {
    evEmitter.off('addEmote');
  });
</script>
<style scoped lang="scss">
  @import '@/styles/base.scss';
  .options {
    display: flex;
    flex-wrap: wrap;
    li {
      height: 30px;
      width: 30px;
      margin: 2px;
      // border: 1px dashed #ccc;
      font-size: 22px;
      cursor: pointer;
    }
    .emoji {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s; /* 定义过渡效果的属性和时间 */
    }
    .emoji:hover {
      transform: scale(1.2); /* 鼠标移入时的变换效果 */
    }
    .add {
      width: 70px;
      height: 70px;
      border: 1px solid #ccc;
      line-height: 70px;
      text-align: center;
      font-size: large;
      cursor: pointer;
      margin: 0 10px 10px 0;
      box-sizing: border-box;
    }
    .like-emote {
      width: 70px;
      height: 70px;
      margin: 0 10px 10px 0;
    }
    .emoji-like {
      transition: transform 0.2s; /* 定义过渡效果的属性和时间 */
    }
    .emoji-like:hover {
      transform: scale(1.2); /* 鼠标移入时的变换效果 */
    }
  }
  .emote {
    height: 300px;
    overflow: auto;
    padding: 10px;
  }
  .menu {
    display: flex;
    align-items: center;
    background-color: $primary-color8;
  }
  .active {
    background-color: #fff;
    font-weight: 600;
  }
  .menu-items {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    cursor: pointer;
    .icon {
      padding: 2px;
      border-radius: 4px;
    }
    .icon:hover {
      background-color: $primary-color7;
      font-weight: 600;
    }
  }
</style>
