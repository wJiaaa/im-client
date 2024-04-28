/*
 * @Description: 群相关接口
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 15:32:19
 */
import http from '@/utils/request';
const service = '/group';
/**
 * @description 获取群列表
 */
// BUG: 无法获取到群列表
export async function getGroupList() {
  return http.get<Group[]>({
    url: service + '/getGroupList'
  });
}
/**
 * @description 创建群聊
 */
export async function createGroup(data: {
  /** 群名 */
  groupName: string;
  /** 群成员 */
  memberList: Pick<User, 'userId' | 'username'>[];
}) {
  return http.post<Group>({
    url: service + '/create',
    data
  });
}

/**
 * @Description 退出群聊
 */
export async function exitGroupApi(params: {
  /** 群Id */
  groupId: number;
  /** 会话id */
  sessionId: number;
}) {
  return http.delete({
    url: service + '/exitGroup',
    params
  });
}
/**
 * @description 获取群聊成员
 * @param groupId
 */
export async function getGroupMember(params: Pick<Group, 'groupId'>) {
  return http.get<GroupMember[]>({
    url: service + '/getGroupMember',
    params
  });
}
/**
 * @description 获取群聊信息
 * @param groupId 当前 群ID
 */
export async function getGroupInfoApi(params: Pick<Group, 'groupId'>) {
  return http.get<GroupInfo>({
    url: service + '/getGroupInfo',
    params
  });
}

/**
 * @description 创建群公告
 */
export async function createAnnouncement(data: Pick<GroupAnnouncement, 'belongGroupId' | 'content'>) {
  return http.post<GroupAnnouncement>({
    url: service + '/createGroupAnnouncement',
    data
  });
}

/**
 * @description 获取群公告
 */
export async function getGroupAnnouncementApi(params: Pick<Group, 'groupId'>) {
  return http.get<GroupAnnouncement[]>({
    url: service + '/getGroupAnnouncement',
    params
  });
}

/**
 * @description 邀请用户进入群聊
 */
export async function invite(data: any) {
  return http.post<any>({
    url: service + '/invite',
    data
  });
}
/**
 * @description 修改群成员信息
 */
export async function updateMemberInfo(data: any) {
  return http.post<any>({
    url: service + '/updateMemberInfo',
    data
  });
}
