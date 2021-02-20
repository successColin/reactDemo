/*
 * @Author: Fus
 * @Date:   2019-08-13 15:01:49
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-30 10:32:00
 * @Desc: 框架模块（设计组菜单）
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取页面配置
export function getExplorerPageConfig(params) {
  return fetch(query.GET_EXPLORER_PAGE_CONFIG, {
    method: 'post',
    params,
  });
}

// 获取整棵树
export function getExplorerFullTree(params) {
  return fetch(query.GET_EXPLORER_FULL_TREE, {
    method: 'post',
    params,
  });
}

// 获取树单个节点
export function getExplorerSingleTreeNode(params) {
  return fetch(query.GET_EXPLORER_SINGLE_TREE_NODE, {
    method: 'post',
    params,
  });
}

// 获取页面数据
export function getExplorerPageData(params) {
  return fetch(query.GET_EXPLORER_PAGE_DATA, {
    method: 'post',
    params,
  });
}

// 获取列表页面数据
export function getExplorerListData(params) {
  return fetch(query.GET_EXPLORER_LIST_DATA, {
    method: 'post',
    params,
  });
}

// 获取主面板列表页面数据
export function getExplorerMainListData(params) {
  return fetch(query.GET_EXPLORER_MAIN_LIST_DATA, {
    method: 'post',
    params,
  });
}