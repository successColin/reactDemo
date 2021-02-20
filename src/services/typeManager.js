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
export function getTypeTree(params) {
  return fetch(query.GET_TYPE_TREE, {
    method: 'post',
    params,
  });
}

// 获取状态列表
export function getTypeList(params) {
  return fetch(query.SELECT_TYPE, {
    method: 'post',
    params,
  });
}
// 新增状态
export function addType(params) {
  return fetch(query.INSERT_TYPE, {
    method: 'post',
    params,
  });
}
// 修改状态
export function updateType(params) {
  return fetch(query.UPDATE_TYPE, {
    method: 'put',
    params,
  });
}
/**
 * 获取状态详情
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getTypeDetial(params) {
  return fetch(`${query.GET_TYPE}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 删除状态
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteType(params) {
  return fetch(query.DELETE_TYPE, {
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
export function getTypeGroupDetial(params) {
  return fetch(`${query.GET_TYPE_GROUP}/${params.id}`, {
    method: 'get',
  });
}
/**
 * 新建状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function addTypeGroup(params) {
  return fetch(query.INSERT_TYPE_GROUP, {
    method: 'post',
    params,
  });
}
/**
 * 修改状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateTypeGroup(params) {
  return fetch(query.UPDATE_TYPE_GROUP, {
    method: 'put',
    params,
  });
}
/**
 * 删除状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteTypeGroup(params) {
  return fetch(query.DELETE_TYPE_GROUP, {
    method: 'delete',
    params,
  });
}
