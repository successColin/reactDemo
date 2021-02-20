/**
 *@author jwk
 *@2019/8/30 0030
 *@Description 档案管理接口
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 *获取模板树
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getImportTree(params) {
  return fetch(query.GET_IMPORT_TREE, {
    method: 'post',
    params,
  });
}

/**
 *单条获取导入模板分组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getImprotGroupDetial(params) {
  return fetch(`${query.GET_IMPORT_GROUP + '/' + params.importmodelId}`, {
    method: 'GET',
  });
}

/**
 * 新增导入模板分组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertImportGroup(params) {
  return fetch(query.INSERT_IMPORT_GROUP, {
    method: 'post',
    params,
  });
}

/**
 *删除导入模板分组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function delImportGroup(params) {
  return fetch(query.DEL_IMPORT_GROUP, {
    method: 'delete',
    params,
  });
}

/**
 *修改导入模板分组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateImportGroup(params) {
  return fetch(query.UPDATE_IMPORT_GROUP, {
    method: 'put',
    params,
  });
}

/**
 *单条获取导入模板
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getImportDetial(params) {
  return fetch(`${query.GET_IMPORT_DETIAL + '/' + params.importmodelId}`, {
    method: 'get',
  });
}

/**
 * 新增导入模板
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertImport(params) {
  return fetch(query.INSERT_CODE_IMPORT, {
    method: 'post',
    params,
  });
}

/**
 * 删除导入模板以及模板明细
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteImport(params) {
  return fetch(`${query.DELETE_IMPORT + params.id}`, {
    method: 'DELETE',
    // params,
  });
}

/**
 *修改导入模板
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateImport(params) {
  return fetch(query.UPDATE_IMPORT, {
    method: 'PUT',
    params,
  });
}

/**
 * 获取模板所有明细
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getImportAllDetial(params) {
  return fetch(`${query.GET_IMPORT_ALL + '/' + params}`, {
    method: 'get',
  });
}

/**
 * 删除表字段
 * @param ids
 * @returns {*|Promise|Promise<unknown>}
 */
export function delDetial(ids) {
  return fetch(`${query.DEL_DETIAL_ONE + '/' + ids}`, {
    method: 'DELETE',
  });
}

/**
 *新增导入模板明细
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertDetial(params) {
  return fetch(query.INSERT_DETIAL_ONE, {
    method: 'POST',
    params,
  });
}

/**
 *修改导入模板明细
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateDetial(params) {
  return fetch(query.UPDATE_DETIAL_ONE, {
    method: 'PUT',
    params,
  });
}

/**
 * 修改导入模板顺序
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function updateSno(params) {
  return fetch(query.UPDATE_TEMPLATE_SNO, {
    method: 'PUT',
    params,
  });
}


