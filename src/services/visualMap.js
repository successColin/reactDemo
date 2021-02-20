/*
 * @Author: Yzj
 * @Date:   2020年5月9日16:06:42
 * @Desc: 图形导航
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取版本列表数据
export function getVisualGroupList(params = {}) {
  return fetch(query.GET_VISUAL_GROUP_LIST, {
    method: 'post',
    params,
  });
}

// 根据分组ID获取json数据
export function getVisulaMap(params = {}) {
  return fetch(query.GET_VISUAL_MAP, {
    method: 'post',
    params,
  });
}

// 新增图层
export function insertVisualMap(params = {}) {
  return fetch(query.INSERT_VISUAL_MAP, {
    method: 'post',
    params,
  });
}

// 修改图层
export function updateVisualMap(params = {}) {
  return fetch(query.UPDATE_VISUAL_MAP, {
    method: 'put',
    params,
  });
}

export function deleteVisualMap(id) {
  return fetch(`${query.DELETE_VISUAL_MAP}/${id}`, {
    method: 'delete',
  });
}

// 新增区块配置
export function insertVisualConfig(params = {}) {
  return fetch(query.INSERT_VISUAL_CONFIG, {
    method: 'post',
    params,
  });
}

// 修改区块配置
export function updateVisualConfig(params = {}) {
  return fetch(query.UPDATE_VISUAL_CONFIG, {
    method: 'put',
    params,
  });
}

// 删除区块配置
export function deleteVisualConfig(id) {
  return fetch(`${query.DELETE_VISUAL_CONFIG}/${id}`, {
    method: 'delete',
  });
}

// 获取区块配置
export function getVisualConfig(id) {
  return fetch(`${query.GET_VISUAL_CONFIG}/${id}`, {
    method: 'get',
  });
}

// 根据表名获取数据
export function getTableLine(params = {}) {
  return fetch(query.GET_TABLELINE, {
    method: 'post',
    params,
  });
}

// 获取工单状态
export function getStates(params) {
  return fetch(query.GET_STATE_LIST, {
    method: 'get',
  });
}
