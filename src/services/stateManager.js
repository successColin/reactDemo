/*
 * @Author: tjf
 * @Date:   2019-11-04 09:07:24
 * @Last Modified by: tjf
 * @Last Modified time: 2019-11-04 09:07:24
 * @Desc: 状态管理
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取状态树
export function getStateTree(params) {
  return fetch(query.GET_STATE_TREE, {
    method: 'post',
    params,
  });
}
// 获取状态列表
export function getStateList(params) {
  return fetch(query.SELECT_STATE, {
    method: 'post',
    params,
  });
}
// 新增状态
export function addState(params) {
  return fetch(query.INSERT_STATE, {
    method: 'post',
    params,
  });
}
// 修改状态
export function updateState(params) {
  return fetch(query.UPDATE_STATE, {
    method: 'put',
    params,
  });
}

/**
 * 获取状态详情
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getStateDetial(params) {
  return fetch(`${query.GET_STATE}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 删除状态
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteState(params) {
  return fetch(query.DELETE_STATE, {
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
export function getStateGroupDetial(params) {
  return fetch(`${query.GET_STATE_GROUP}/${params.id}`, {
    method: 'get',
  });
}
/**
 * 新建状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function addStateGroup(params) {
  return fetch(query.INSERT_STATE_GROUP, {
    method: 'post',
    params,
  });
}
/**
 * 修改状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateStateGroup(params) {
  return fetch(query.UPDATE_STATE_GROUP, {
    method: 'put',
    params,
  });
}
/**
 * 删除状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteStateGroup(params) {
  return fetch(query.DELETE_STATE_GROUP, {
    method: 'delete',
    params,
  });
}
