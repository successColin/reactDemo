/*
 * @Author: Fus
 * @Date:   2020-02-07 10:32:15
 * @Desc: 版本管理
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取版本列表数据
export function getSystemVersionList(params) {
  return fetch(query.GET_SYSTEM_VERSION_LIST, {
    method: 'post',
    params,
  });
}

// 保存版本数据
export function saveSystemVersion(params) {
  return fetch(query.SAVE_SYSTEM_VERSION, {
    method: 'post',
    params,
  });
}

// 获取版本信息
export function getSystemVersionDetail({ id }) {
  return fetch(`${query.GET_SYSTEM_VERSION_DETAIL}${id}`, {
    method: 'get',
  });
}

// 删除版本数据
export function deleteSystemVersion(params) {
  return fetch(query.DELETE_SYSTEM_VERSION, {
    method: 'delete',
    params,
  });
}