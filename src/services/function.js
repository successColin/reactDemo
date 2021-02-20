/*
 * @Author: Fus
 * @Date:   2019-08-12 10:07:08
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-09-23 15:38:47
 * @Desc: 菜单模块
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取菜单树
export function getFunctionTree(params) {
  return fetch(query.GET_FUNCTION_TREE, {
    method: 'post',
    params,
  });
}

// 获取菜单中心列表
export function getFunctionCenter(params) {
  return fetch(query.GET_FUNCTION_CENTER, {
    method: 'post',
    params,
  });
}

// 收藏菜单
export function updateCollectFunction(params) {
  return fetch(query.UPDATE_COLLECT_FUNCTION, {
    method: 'post',
    params,
  });
}

// 菜单查找
export function doSearchFunction(params) {
  return fetch(query.DO_SEARCH, {
    method: 'post',
    params,
  });
}
