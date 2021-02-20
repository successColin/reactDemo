/*
 * @Author: tjf
 * @Date:   2019-11-04 09:07:24
 * @Last Modified by: tjf
 * @Last Modified time: 2019-11-04 09:07:24
 * @Desc: 状态管理
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取页面元素
export function getBoardPage(params) {
  return fetch(query.GET_BOARD_PAGE, {
    method: 'post',
    params,
  });
}

// 查询列表页数据
export function getListData(params) {
  return fetch(query.GET_BOARD_LIST_DATA, {
    method: 'post',
    params,
  });
}
// 根据控件id查询sql返回结果
export function getDataByElementId(params) {
  return fetch(query.GET_BOARD_ELEMENT, {
    method: 'post',
    params,
  });
}
// 根据控件id查询sql返回结果
export function getFunctionPermission(params) {
  return fetch(query.GET_FUNCTION_PERMISSION, {
    method: 'post',
    params,
  });
}