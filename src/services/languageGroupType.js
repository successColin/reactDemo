/**
 *@author jwk
 *@2020/03/18 16:33
 *@Description 多语言分类组
 */

import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 * 获取多语言分组类别
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getLanguageGroupTree(params) {
  return fetch(query.GET_LANGUAGEGROUP_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 多语言分组类别新增修改数据
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function languageGroupInsertOrUpdate(params) {
  return fetch(query.DO_LANGUAGEGROUP_ACTION, {
    method: 'post',
    params,
  });
}

/**
 * 根据id查看分组类别信息
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getLangaugeGroupDetial(params) {
  return fetch(query.GET_LANGUAGEGROUP_DETIAL + params, {
    method: 'get',
  });
}

/**
 * 根据id删除分组类别
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function deleteLanguageGroup(params) {
  return fetch(query.DO_LANGUAGEGROUP_DELETE, {
    method: 'post',
    params,
  });
}

// 多语言模板
/**
 * 多语言树
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getLanguageTypeTree(params) {
  return fetch(query.GET_LANGUAGETYPE_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 获取详情
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getLanguageTypeDetial(params) {
  return fetch(query.GET_LANGUAGETYPE_DETIAL + params, {
    method: 'get',
  });
}

/**
 * 多语言新增修改数据
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function languageTypeAction(params) {
  return fetch(query.GET_LANGUAGETYPE_UPDATE_INSERT, {
    method: 'post',
    params,
  });
}

/**
 * 删除模板
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function doLanguageTypeDelete(params) {
  return fetch(query.GET_LANGUAGETYPE_DELETE, {
    method: 'post',
    params,
  });
}

/**
 * 切换节点
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function langaugeTypeSwitch(params) {
  return fetch(query.GET_LANGUAGETYPE_SWITCH, {
    method: 'post',
    params,
  });
}

// 根据语言模板id获取对应的分组
export function getLanguagePath(params) {
  return fetch(query.GET_LANGUAGEGROUP_PATH + params.id, {
    method: 'get',
  });
}



