/**
 *@author jwk
 *@2019/8/26 0019
 *@Description
 * 设置编码规则接口
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 *查询编码分组组合树接口
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getRulesTree(params) {
  return fetch(query.GET_CODE_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 新增编码分组接口
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertCodeGroup(params) {
  return fetch(query.INSER_CODE_GROUP, {
    method: 'post',
    params,
  });
}

/**
 *根据id修改编码分组接口
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateCodeGroup(params) {
  return fetch(query.UPDATE_CODE_GROUP, {
    method: 'put',
    params,
  });
}

/**
 * 根据id删除编码分组接口
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteCodeGroup(params) {
  return fetch(query.DELETE_CODE_GROUP, {
    method: 'delete',
    params,
  });
}

/**
 *根据id获取编码分组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getCodeGroupDetial(params) {
  return fetch(`${query.GET_CODEGROUP + '/' + params.id}`, {
    method: 'get',
  });
}

/**
 *根据id获取编码规则
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getCodeDetial(params) {
  return fetch(`${query.GET_CODERULE + '/' + params.id}`, {
    method: 'get',
  });
}

/**
 *根据id修改编码规则接口
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateCodeRule(params) {
  return fetch(query.UPDATE_CODE_RULE, {
    method: 'put',
    params,
  });
}

/**
 *新增编码规则接口
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertCodeRule(params) {
  return fetch(query.INSER_CODE_RULE, {
    method: 'post',
    params,
  });
}

/**
 *根据id删除编码规则
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteCodeRule(params) {
  return fetch(query.DELETE_CODE_RULE, {
    method: 'delete',
    params,
  });
}
