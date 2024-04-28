<!--
 * @Description: 群公告
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2023-12-22 19:06:24
-->
<template>
  <el-dialog destroy-on-close class="bg-#F2F2F2!" v-model="groupAnnouncementDialog" title="群公告列表" width="500px">
    <el-button @click="emit('addAnnouncement')" type="primary" class="add-new">发布新公告</el-button>
    <div v-if="groupAnnouncement.length" class="mt5 overflow-auto max-h400px">
      <div class="announcement-item" v-for="item in props.groupAnnouncement" :key="item.id">
        <span class="announcement-user">{{ item.createUser.nickName }}</span>
        <span class="announcement-createdAt">{{ dayjs(item.createdAt).format('YYYY-MM-DD HH:mm') }}</span>
        <!-- TODO 置顶 -->
        <span class="top-text" v-if="item.isTop">置顶</span>
        <div class="content break-all">
          {{ item.content }}
        </div>
      </div>
    </div>
    <div v-else><el-empty description="暂无公告" /></div>
  </el-dialog>
</template>

<script lang="ts" setup>
  import dayjs from 'dayjs';
  import { definePropType } from '@/utils/common';
  const emit = defineEmits(['addAnnouncement']);
  const props = defineProps({
    groupAnnouncement: {
      type: definePropType<GroupAnnouncement[]>(Array),
      default: () => []
    }
  });
  const groupAnnouncementDialog = ref(false);
  defineExpose({
    /** 向父组件暴露弹窗的方法 */
    openDialog: () => {
      groupAnnouncementDialog.value = true;
    },
    close: () => {
      groupAnnouncementDialog.value = false;
    }
  });
</script>
<style scoped lang="scss">
  .add-new {
    margin-top: -20px;
    float: right;
  }
  .announcement-item {
    margin-bottom: 10px;
    border: 1px solid #f4f5f9;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 5px;
    .announcement-user {
      font-size: 13px;
      color: #9c9c9c;
    }
    .announcement-createdAt {
      font-size: 13px;
      color: #9c9c9c;
      margin-left: 10px;
    }
    .top-text {
      background-color: #d5ebff;
      color: #0099ff;
      margin-left: 10px;
      font-size: 12px;
      padding: 2px 5px;
      border-radius: 3px;
    }
    .content {
      margin-top: 10px;
      font-size: 15px;
      color: #000000;
      font-weight: 500;
    }
  }
</style>
