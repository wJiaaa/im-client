<!--
 * @Description: 好友列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="max-h-600px overflow-auto">
    <div class="px10px">
      <!-- <el-divider>
        <span class="text-gray text-[12px] tracking-[3px] font-semibold min-w-75px">
          {{ Object.keys(useChatStore().friendGather || {}).length }}位联系人
        </span>
      </el-divider> -->
    </div>
    <div v-for="(char, index) in userList" :key="index">
      <div class="char">{{ index }}</div>
      <ul>
        <li
          @click="changeActiveContact(userItem)"
          v-for="userItem in char"
          :key="userItem.userId"
          :class="['userItem', activeUser?.userId === userItem.userId ? 'active' : '']"
        >
          <img class="userItem-avatar" :src="userItem.avatar" />
          <span :title="userItem.username" class="userItem-name inoneline">{{ userItem.username }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { uniq, toArray } from 'lodash';
  import cnchar from 'cnchar';
  import useFriendStore from '@/store/modules/friend';
  import useChatStore from '@/store/modules/chat';
  import { PAGE_SHOW_TYPE } from '@/utils/constant';
  import useSystemStore from '@/store/modules/system';
  const activeUser = ref<Nullable<Friend>>(null);
  // key = 首字母 value=首字母为key的用户列表
  const userList = computed(() => {
    return transformUserListToObj(toArray(useChatStore().friendGather));
  });

  /**
   * @Description 转换联系人列表  按A-Z字母排序
   */
  const transformUserListToObj = (arr: Friend[]) => {
    const newObj = {} as { [key: string]: Friend[] };
    const charList = arr.map((k) => getInitial(k.username)).sort();

    uniq(charList).forEach((char) => {
      newObj[char] = arr.filter((k) => getInitial(k.username) === char);
    });
    return newObj;
  };

  const changeActiveContact = (item: Friend) => {
    activeUser.value = item;
    useFriendStore().setActiveContat(item);
    useSystemStore().setShowPageType(PAGE_SHOW_TYPE['friendInfo']);
  };

  /**
   * @description 获取首字母
   * @param value 需要获取的值
   */
  const getInitial = (value: string) => {
    return cnchar.spell(value).toString().charAt(0).toUpperCase();
  };
</script>
<style scoped lang="scss">
  .char {
    height: 20px;
    line-height: 20px;
    margin: 5px 10px;
    padding-bottom: 5px;
    font-size: 14px;
    color: rgb(158, 151, 151);
    border-bottom: 1px solid #ccc;
  }
  .userItem {
    height: 60px;
    padding: 10px;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    cursor: pointer;
  }
  .userItem-avatar {
    height: 40px;
    width: 40px;
    border-radius: 5px;
  }
  .userItem-name {
    margin-left: 15px;
    font-size: 15px;
    flex: 1;
  }
  .active {
    background: #edeff3;
  }

  .el-collapse {
    border: none;
    :deep(.el-collapse-item) {
      .el-collapse-item__wrap {
        border: none;
      }
      .el-collapse-item__content {
        border: none;
        padding: 0;
      }
      .el-collapse-item__header {
        border: none;
      }
    }
  }
  .friend-request {
    @extend .userItem;
    .friend-avatar {
      border-radius: 15px;
      background-color: rgb(255, 139, 56);
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        width: 25px;
        height: 25px;
        color: #fff;
      }
    }
  }
</style>
