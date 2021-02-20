/**
 *@author jwk
 *@2019/8/24 0019
 *@Description
 * 默认编码规则接口
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 * 获取列表
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getTableList(params) {
  return fetch(query.GET_TABLE_LIST, {
    method: 'POST',
    params,
  });
}

/**
 *根据id获取编码规则
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getCodeDetial(params) {
  return fetch(`${query.GET_CODEDETIAL_BYID + '/' + params}`, {
    method: 'GET',
  });
}

/**
 * 修改默认规则
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function update(params) {
  return fetch(query.UPDATE_CODERULES, {
    params,
    method: 'put',
  });
}

/**
 * 新增
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insert(params) {
  return fetch(query.INSER_CODE_RULE, {
    params,
    method: 'post',
  });
}
