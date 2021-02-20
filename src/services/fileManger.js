import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 * 获取菜单树
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getTree(params) {
  return fetch(query.GET_FILEMANGER_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 根据树节点id获取详情
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getDetialById(params) {
  return fetch(`${query.GET_FILEDETIAL_BYID}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 修改菜单
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateMenu(params) {
  return fetch(query.UPDATE_FILE_DETIAL, {
    method: 'put',
    params,
  });
}

/**
 * 删除菜单管理
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function delFileTreeNode(params) {
  return fetch(query.DEL_MENU_TREElIST, {
    params,
    method: 'delete',
  });
}

/**
 *关联新增菜单
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function addFileTreeNode(params) {
  return fetch(query.ADD_FILE_TREE, {
    method: 'post',
    params,
  });
}

// 业务关联文件
export function fileRelationBusiness(params) {
  return fetch(query.FILE_RELATION_BUSINESS, {
    method: 'post',
    params,
    contentType: 'login',
  });
}

// 获取关联文件
export function getFileRelation(params) {
  return fetch(query.GET_FILE_RELATION, {
    method: 'post',
    params,
  });
}

// 删除关联文件
export function deleteFileRelation({ id }) {
  return fetch(`${query.DELETE_FILE_RELATION}/${id}`, {
    method: 'delete',
  });
}

// 删除关联文件
export function deleteFile(params) {
  return fetch(query.DELETE_FILE, {
    method: 'delete',
    params,
    // contentType: 'text',
  });
}
