import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 * 获取实体列表
 * @param params
 */
export function getList(params) {
  return fetch(query.GET_JAVABEAN_LIST, {
    method: 'post',
    params,
    // contentType: 'json',
  });
}

/**
 *
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getJavaBeanList(params) {
  return fetch(query.GET_JAVABEAN_TREE, {
    method: 'post',
    params,
  });
}


/**
 * 获取表中字段
 * @param params
 */
export function getJavaDetialById(params) {
  return fetch(query.GET_DETIAL_BYID, {
      method: 'POST',
      params,
    },
  );
}

/**
 * 新增实体类
 * @param params
 */
export function insertJavaBean(params) {
  return fetch(query.INSERT_JAVABEAN_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 修改表名
 * @param params
 */
export function updateJavaBean(params) {
  return fetch(query.UPDATE_JAVABEAN_LIST, {
    method: 'put',
    params,
  });
}

/**
 * 刪除表名
 * @param params
 */
export function delJavaBean(params) {
  return fetch(query.DELETE_JAVABEAN_LIST, {
    method: 'delete',
    params,
  });
}

/**
 * 增加表字段
 * @param params
 */
export function addJavaBeanFiled(params) {
  return fetch(query.ADD_JAVABEAN_FIELDS, {
    method: 'post',
    params,
  });
}

/**
 * 编辑表字段
 * @param params
 */
export function updateJavaBeanFiled(params) {
  return fetch(query.UPDATE_JAVABEAN_FIELDS, {
    method: 'PUT',
    params,
  });
}

/**
 * 删除表字段
 * @param params
 */
export function delJavaBeanFiled(params) {
  return fetch(query.DELETE_JAVABEAN_FIELDS, {
    method: 'DELETE',
    params,
  });
}

/**
 * 获取组详情
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getGroup(params) {
  return fetch(`${query.GET_JAVABEAN_GROUP + params.id}`, {
    method: 'get',
  });
}

/**
 * 更新分组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateGroup(params) {
  return fetch(query.UPDATE_JAVABEN_GROUP, {
    method: 'put',
    params,
  });
}

/**
 * 删除组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteGroup(params) {
  return fetch(`${query.DELETE_JAVABEN_GROUP + params.id}`, {
    method: 'delete',
  });
}

/**
 *  新增组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertGroup(params) {
  return fetch(query.INSERT_JAVABEN_GROUP, {
    method: 'post', params,
  });
}

/**
 * 获取表详情
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getTableDetial(params) {
  return fetch(`${query.GET_JAVABEN_ID + params.id}`, {
    method: 'get',
  });
}

/**
 * 更新是否操作日志
 * @param params
 * @returns {Promise<unknown>}
 */
export function updateLog(params) {
  return fetch(query.COLUMNS_UPDATE, {
    method: 'post',
    params,
  });
}
