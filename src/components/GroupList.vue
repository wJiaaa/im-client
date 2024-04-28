<!--
 * @Description: 群聊列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="group-list">
    <div class="pl30px pr30px">
      <!-- <el-divider>
        <span class="text-gray text-[12px] tracking-[3px] font-semibold"
          >{{ Object.keys(useChatStore().groupGather || {}).length }}个群聊</span
        >
      </el-divider> -->
    </div>
    <el-scrollbar max-height="100%">
      <div v-for="(char, index) in groupList" :key="index">
        <div class="char">{{ index }}</div>
        <ul>
          <li
            @click="changeActiveContact(groupItem)"
            v-for="groupItem in char"
            :key="groupItem.groupId"
            :class="['groupItem', activeGroup?.groupId === groupItem.groupId ? 'active' : '']"
          >
            <!-- 群聊头像 -->
            <el-image class="w40px h40px" :src="groupItem.avatar" />
            <span class="groupItem-name">{{ groupItem.groupName }}</span>
          </li>
        </ul>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
  import { uniq, toArray } from 'lodash';
  import cnchar from 'cnchar';
  import useChatStore from '@/store/modules/chat';
  import { PAGE_SHOW_TYPE } from '@/utils/constant';
  import useFriendStore from '@/store/modules/friend';
  import useSystemStore from '@/store/modules/system';

  const activeGroup = ref<Nullable<Group>>(null);

  // key = 首字母 value=首字母为key的群聊列表
  const groupList = computed(() => {
    return transformUserListToObj(toArray(useChatStore().groupGather));
  });

  /**
   * @Description 转换群聊列表  按A-Z字母排序
   */
  const transformUserListToObj = (arr: Group[]) => {
    const newObj = {} as { [key: string]: Group[] };
    const charList = arr.map((k) => getInitial(k.groupName)).sort();
    uniq(charList).forEach((char) => {
      newObj[char] = arr.filter((k) => getInitial(k.groupName) === char);
    });
    return newObj;
  };

  const changeActiveContact = (item: Group) => {
    activeGroup.value = item;
    useFriendStore().setActiveContat(item);
    useSystemStore().setShowPageType(PAGE_SHOW_TYPE['groupInfo']);
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
  .group-list {
    height: calc(100% - 140px);
  }
  .char {
    height: 20px;
    line-height: 20px;
    margin: 5px 10px;
    padding-bottom: 5px;
    font-size: 14px;
    color: rgb(158, 151, 151);
    border-bottom: 1px solid #ccc;
  }
  .groupItem {
    height: 60px;
    padding: 10px;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    cursor: pointer;
  }
  .groupItem-avatar {
    height: 40px;
    width: 40px;
    border-radius: 5px;
  }
  .groupItem-name {
    margin-left: 15px;
    font-size: 15px;
    flex: 1;
  }
  .active {
    background: #edeff3;
  }
  .search {
    padding: 0px 10px;
    display: flex;
    align-items: center;
    height: 50px;
  }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 5px;
  }
  .search-result {
    display: flex;
    justify-content: space-between;
    align-items: center;
    div {
      display: flex;
      align-items: center;
    }
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
    @extend .groupItem;
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
