/*
 * @Author: Fus
 * @Date:   2019-08-07 09:50:14
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-07 09:54:14
 * @Desc: 图标管理模块
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取图标组列表
export function getIconGroupTree(params) {
  return fetch(query.GET_ICON_GROUP_TREE, {
    method: 'post',
    params,
  });
}

// 获取图标列表
export function getIconList(params) {
  return fetch(query.GET_ICON_LIST, {
    method: 'post',
    params,
  });
}