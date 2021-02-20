/*
 * @Author: Fus
 * @Date:   2019-08-12 09:07:24
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-26 09:55:06
 * @Desc: 用户设计组模块
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取用户设计组树
export function getUserDesignerTree(params) {
  return fetch(query.GET_USER_DESIGNER_TREE, {
    method: 'post',
    params,
  });
}
// 新增组
export function insertUserDesignerGroup(params) {
  return fetch(query.INSERT_USER_DESIGNER_GROUP, {
    method: 'post',
    params,
  });
}
// 新增用户设计组
export function insertUserDesigner(params) {
  return fetch(query.INSERT_USER_DESIGNER, {
    method: 'post',
    params,
  });
}
// 修改组
export function updateUserDesignerGroup(params) {
  return fetch(query.UPDATE_USER_DESIGNER_GROUP, {
    method: 'put',
    params,
  });
}
// 修改用户设计组
export function updateUserDesigner(params) {
  return fetch(query.UPDATE_USER_DESIGNER, {
    method: 'put',
    params,
  });
}

// 删除组
export function deleteUserDesignerGroup(params) {
  return fetch(query.DELETE_USER_DESIGNER_GROUP, {
    method: 'delete',
    params,
  });
}
// 删除用户设计组
export function deleteUserDesigner(params) {
  return fetch(query.DELETE_USER_DESIGNER, {
    method: 'delete',
    params,
  });
}

// 获取用户设计组分组详情
export function getUserDesignerGroupDetail({ id }) {
  return fetch(`${query.GET_USER_DESIGNER_GROUP_DETAIL}/${id}`, {
    method: 'get',
  });
}

// 获取用户设计组详情
export function getUserDesignerDetail({ id }) {
  return fetch(`${query.GET_USER_DESIGNER_DETAIL}/${id}`, {
    method: 'get',
  });
}

