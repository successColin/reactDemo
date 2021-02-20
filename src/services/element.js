/*
 * @Author: Fus
 * @Date:   2019-06-20 11:13:38
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-06 09:07:44
 * @Desc: 元素管理的接口请求
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取元素树
export function getTree(params) {
  return fetch(query.GET_ELEMENT_TREE, {
    method: 'post',
    params,
  });
}

// 根据树节点id获取组详情
export function getGroupDetail({ id }) {
  return fetch(`${query.GET_GROUP_DETAIL}/${id}`, {
    method: 'get',
    // params,
  });
}

// 删除组
export function doDelGroup(params) {
  return fetch(query.DEL_GROUP, {
    method: 'delete',
    params,
  });
}

// 新增组
export function doAddGroup(params) {
  return fetch(query.ADD_GROUP, {
    method: 'post',
    params,
  });
}

// 修改组
export function doEditGroup(params) {
  return fetch(query.EDIT_GROUP, {
    method: 'put',
    params,
  });
}

// 新增元素
export function doAddElement(params) {
  return fetch(query.ADD_ELEMENT, {
    method: 'post',
    params,
  });
}

// 删除元素
export function doDelElement(params) {
  return fetch(query.DEL_ELEMENT, {
    method: 'delete',
    params,
  });
}

// 修改元素
export function doEditElement(params) {
  return fetch(query.EDIT_ELEMENT, {
    method: 'put',
    params,
  });
}

// 获取元素详情
export function getElementDetail({ id }) {
  return fetch(`${query.GET_ELEMENT_DETAIL}/${id}`, {
    method: 'get',
    // params,
  });
}

// 获取元素类型
export function getElementTypeList(params) {
  return fetch(query.GET_ELEMENT_TYPElIST, {
    method: 'post',
    params,
  });
}

// 获取元素库
export function getElementLib(params) {
  return fetch(query.GET_ELEMENT_LIB, {
    method: 'post',
    params,
  });
}