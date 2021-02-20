/*
 * @Author: tjf
 * @Date:   2019-11-04 09:07:24
 * @Last Modified by: tjf
 * @Last Modified time: 2019-11-04 09:07:24
 * @Desc: 组织档案
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取状态树列表
export function getOrgTree(params) {
  return fetch(query.GET_ORG_TREE, {
    method: 'post',
    params,
  });
}
// 新增状态
export function addOrg(params) {
  return fetch(query.INSERT_ORG, {
    method: 'post',
    params,
  });
}
// 修改状态
export function updateOrg(params) {
  return fetch(query.UPDATE_ORG, {
    method: 'put',
    params,
  });
}
/**
 * 获取状态详情
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getOrgDetial(params) {
  return fetch(`${query.GET_ORG}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 删除状态
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteOrg(params) {
  return fetch(query.DELETE_ORG, {
    method: 'delete',
    params,
    contentType:'json'
  });
}
/**
 * 获取状态分组详情
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getOrgGroupDetial(params) {
  return fetch(`${query.GET_ORG_GROUP}/${params.id}`, {
    method: 'get',
  });
}
/**
 * 新建状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function addOrgGroup(params) {
  return fetch(query.INSERT_ORG_GROUP, {
    method: 'post',
    params,
  });
}
/**
 * 修改状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateOrgGroup(params) {
  return fetch(query.UPDATE_ORG_GROUP, {
    method: 'put',
    params,
  });
}
/**
 * 删除状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteOrgGroup(params) {
  return fetch(query.DELETE_ORG_GROUP, {
    method: 'delete',
    params,
  });
}
