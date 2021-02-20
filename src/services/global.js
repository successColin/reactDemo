/*
 * @Author: Fus
 * @Date:   2019-06-25 19:55:57
 * @Last Modified by: Fus
 * @Last Modified time: 2019-06-25 20:07:43
 * @Desc: 全站通用的接口请求
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取关联表列表
export function getGlobalTables(params) {
  return fetch(query.GET_GLOBAL_TABLES, {
    method: 'post',
    params,
  });
}


// 按表名获取字段
export function getGlobalTableCols(params) {
  return fetch(query.GET_GLOBAL_TABLE_COLS, {
    method: 'post',
    params,
  });
}

/**
 * 获取功能库菜单
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getMenuList(params) {
  return fetch(query.GET_MENU_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 根据实体表名获取表字段
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getRelationTablbeDetial(params) {
  return fetch(query.GET_DETIAL_BYID, {
    method: 'post',
    params,
  });
}

/**
 * 获取水印模板
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getWatermarkList(params) {
  return fetch(query.GET_WATERMARK_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 获取注册接口的入参和出参
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getCurrencyList(params) {
  return fetch(query.GET_CURRENCY_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 根据面板id返回入参列表
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getParams(params) {
  return fetch(query.GET_PARAMS_FROM_TAB, {
    method: 'post',
    params,
  });
}

/**
 * 调用bpm综合处理接口
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function setBpmData(params) {
  return fetch(query.SET_BPM_DATA_BY_BUSINESS, {
    method: 'post',
    params,
  });
}
