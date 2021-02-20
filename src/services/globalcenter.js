/**
 *@author jwk
 *@2019/9/9 0009
 *@Description  全局配置中心
 */

import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 * 获取全局配置中心树
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getGlobalCenter(params) {
  return fetch(query.GET_GlobalCenter_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 新增全局配置中心
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertGlobalCenter(params) {
  return fetch(query.INSERT_GLOBAL_CENTER, {
    method: 'POST',
    params,
  });
}

/**
 * 修改全局配置中心
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateGlobalCenter(params) {
  return fetch(query.UPDATE_GLOBAL_CENTER, {
    method: 'PUT',
    params,
  });
}

/**
 * 根据id获取全局配置中心
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getGlobalCenterDetialById(params) {
  return fetch(`${query.GET_GLOBAL_DETIAL + params.id}`, {
    method: 'get',
  });
}

/**
 * 删除全局配置中心
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteGlobalcenter(params) {
  return fetch(`${query.DELETE_GLOBAL_CENTER + '/' + params.id}`, {
    method: 'DELETE',
  });
}

/**
 *  新增全局配置中心组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertGlobalCenterGroup(params) {
  return fetch(query.INSERT_GLOBAL_CENTER_GROUP, {
    method: 'post',
    params,
  });
}

/**
 *  修改全局配置中心组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateGlobalCenterGroup(params) {
  return fetch(query.UPDATE_GLOBAL_CENTER_GROUP, {
    method: 'put',
    params,
  });
}

/**
 * 根据id获取全局配置中心组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getGlobalCenterGroup(params) {
  return fetch(`${query.GET_GLOBAL_DETIAL_GROUP + params.id}`, {
    method: 'get',
  });
}

/**
 * 删除组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteGlobalCenterGroup(params) {
  return fetch(`${query.DELETE_GLOBAL_CENTER_GROUP + '/' + params.id}`, {
    method: 'delete',
  });
}


// 根据参数名获取参数值
export function getVariableValue(params) {
  return fetch(query.GET_VARIABLE_VALUE, {
    method: 'get',
    params,
  });
}

