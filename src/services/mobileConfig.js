/*
 * @Author: Fus
 * @Date:   2019-09-05 09:47:06
 * @Last Modified by: Fus
 * @Last Modified time: 2019-09-06 15:30:27
 * @Desc: 移动端配置
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取移动端tab树
export function getMobileTabTree(params) {
  return fetch(query.GET_MOBILE_TAB_TREE, {
    method: 'post',
    params,
  });
}

// 新增面板组
export function insertMobileTabGroup(params) {
  return fetch(query.INSERT_MOBILE_TAB_GROUP, {
    method: 'post',
    params,
  });
}
// 删除面板组
export function deleteMobileTabGroup(params) {
  return fetch(query.DELETE_MOBILE_TAB_GROUP, {
    method: 'delete',
    params,
  });
}
// 修改面板组
export function updateMobileTabGroup(params) {
  return fetch(query.UPDATE_MOBILE_TAB_GROUP, {
    method: 'put',
    params,
  });
}
// 查看面板组
export function getMobileTabGroupDetail({ id }) {
  return fetch(`${query.GET_MOBILE_TAB_GROUP_DETAIL}/${id}`, {
    method: 'get',
  });
}
// 新增移动端tab
export function insertMobileTab(params) {
  return fetch(query.INSERT_MOBILE_TAB, {
    method: 'post',
    params,
  });
}

// 删除移动端tab
export function deleteMobileTab(params) {
  return fetch(query.DELETE_MOBILE_TAB, {
    method: 'delete',
    params,
  });
}
// 修改移动端tab
export function updateMobileTab(params) {
  return fetch(query.UPDATE_MOBILE_TAB, {
    method: 'put',
    params,
  });
}

// 获取移动端tab详情
export function getMobileTabDetail({ id }) {
  return fetch(`${query.GET_MOBILE_TAB_DETAIL}/${id}`, {
    method: 'get',
  });
}

// // 复制已有bundle面板
// export function copyUserDesignerMobileTab(params) {
//   return fetch(query.COPY_USER_DESIGNER_MOBILE_TAB, {
//     method: 'post',
//     params,
//   });
// }

// 查询bundle面板树
export function getUserDesignerMobileTabTree(params) {
  return fetch(query.GET_USER_DESIGNER_MOBILE_TAB_TREE, {
    method: 'post',
    params,
  });
}