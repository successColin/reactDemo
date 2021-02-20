/*
 * @Author: tjf
 * @Date:   2019-11-04 09:07:24
 * @Last Modified by: tjf
 * @Last Modified time: 2019-11-04 09:07:24
 * @Desc: 状态管理
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取状态树列表
export function getPriorityTree(params) {
  return fetch(query.GET_PRIORITY_TREE, {
    method: 'post',
    params,
  });
}
// 获取状态列表
export function getPriorityList(params) {
  return fetch(query.SELECT_PRIORITY, {
    method: 'post',
    params,
  });
}
// 新增状态
export function addPriority(params) {
  return fetch(query.INSERT_PRIORITY, {
    method: 'post',
    params,
  });
}
// 修改状态
export function updatePriority(params) {
  return fetch(query.UPDATE_PRIORITY, {
    method: 'put',
    params,
  });
}
/**
 * 获取状态详情
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getPriorityDetial(params) {
  return fetch(`${query.GET_PRIORITY}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 删除状态
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deletePriority(params) {
  return fetch(query.DELETE_PRIORITY, {
    method: 'delete',
    params,
    contentType: 'json',
  });
}
/**
 * 获取状态分组详情
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getPriorityGroupDetial(params) {
  return fetch(`${query.GET_PRIORITY_GROUP}/${params.id}`, {
    method: 'get',
  });
}
/**
 * 新建状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function addPriorityGroup(params) {
  return fetch(query.INSERT_PRIORITY_GROUP, {
    method: 'post',
    params,
  });
}
/**
 * 修改状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function updatePriorityGroup(params) {
  return fetch(query.UPDATE_PRIORITY_GROUP, {
    method: 'put',
    params,
  });
}
/**
 * 删除状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deletePriorityGroup(params) {
  return fetch(query.DELETE_PRIORITY_GROUP, {
    method: 'delete',
    params,
  });
}
