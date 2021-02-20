/*
 * @Author: tjf
 * @Date:   2019-11-04 09:07:24
 * @Last Modified by: tjf
 * @Last Modified time: 2019-11-04 09:07:24
 * @Desc: 故障库
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取状态树列表
export function getErrorCodeTree(params) {
  return fetch(query.GET_ERRORCODE_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 获取状态分组详情
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getErrorCodeGroupDetial(params) {
  return fetch(`${query.GET_ERRORCODE_GROUP}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 新建状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function addErrorCodeGroup(params) {
  return fetch(query.INSERT_ERRORCODE_GROUP, {
    method: 'post',
    params,
  });
}

/**
 * 修改状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateErrorCodeGroup(params) {
  return fetch(query.UPDATE_ERRORCODE_GROUP, {
    method: 'put',
    params,
  });
}

/**
 * 删除状态分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteErrorCodeGroup(params) {
  return fetch(query.DELETE_ERRORCODE_GROUP, {
    method: 'delete',
    params,
  });
}

// 新增故障关联关系
// export function addErrorCode(params) {
//   return fetch(query.DELETE_ERRORCODE_RELATIONS, {
//     method: 'post',
//     params,
//   });
// }
// 修改故障关联关系
// export function updateErrorCode(params) {
//   return fetch(query.DELETE_ERRORCODE_RELATIONS, {
//     method: 'put',
//     params,
//   });
// }

/**
 * 获取故障关联关系详情
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
// export function getErrorCodeDetial(params) {
//   return fetch(`${query.DELETE_ERRORCODE_RELATIONS}/${params.id}`, {
//     method: 'get',
//   });
// }

/**
 * 删除故障关联关系
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteErrorCode(params) {
  return fetch(query.DELETE_ERRORCODE_RELATIONS, {
    method: 'delete',
    params,
    contentType: 'json',
  });
}

/**
 * 获取故障现象
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getErrorCodeI(params) {
  return fetch(`${query.GET_ERRORCODEI}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 获取故障原因
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getErrorCodeII(params) {
  return fetch(`${query.GET_ERRORCODEII}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 获取故障措施
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getErrorCodeIII(params) {
  return fetch(`${query.GET_ERRORCODEIII}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 获取故障列表
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getErrorCodeIList(params) {
  return fetch(query.GET_ERRORCODEI_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 获取原因列表
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getErrorCodeIIList(params) {
  return fetch(query.GET_ERRORCODEII_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 获取措施列表
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getErrorCodeIIIList(params) {
  return fetch(query.GET_ERRORCODEIII_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 新建故障关联关系
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function addErrorCodeRelations(params) {
  return fetch(query.INSERT_ERRORCODE_RELATIONS, {
    method: 'post',
    params,
  });
}

/**
 * 修改故障关联关系
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateErrorCodeRelations(params) {
  return fetch(query.UPDATE_ERRORCODE_RELATIONS, {
    method: 'put',
    params,
  });
}

/**
 * 删除故障关联关系
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteErrorCodeRelations(params) {
  return fetch(query.DELETE_ERRORCODE_RELATIONS, {
    method: 'delete',
    params,
  });
}

/**
 * 获取故障关联关系
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getErrorCodeRelations(params) {
  return fetch(`${query.GET_ERRORCODE_RELATIONS}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 获取异步树数据
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getTreeDataByAsync(params) {
  return fetch(query.GET_TREEDATA_BY_ASYNC, {
    method: 'post',
    params,
  });
}
