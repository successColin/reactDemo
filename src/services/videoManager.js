/*
 * @Author: jwk
 * @Date:   2020-12-08 09:53:28
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-09-23 18:48:50
 * @Desc: 用户信息接口
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 * 获取设备列表
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getVideoList(params) {
  return fetch(query.GET_VIDEO_LIST, {
    method: 'GET',
    params,
  });
}

/**
 * 获取专家列表
 * @param params
 */
export function getExportList(params) {
  return fetch(query.GET_EXPORT_LIST, {
    method: 'get',
    params,
  });
}

/**
 * 接受邀请
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function invite(params) {
  return fetch(query.ACCEPT_INVITATION, {
    method: 'post',
    params,
  });
}

/**
 * 获取用户的头像名称
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getUserInfo(params) {
  return fetch(query.GET_USER_INFO, {
    method: 'get',
    params,
  });
}

/**
 * 获取设备列表
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getDevices(params) {
  return fetch(query.GET_DEVICE_LIST, {
    method: 'get',
    params,
  });
}

/**
 * 获取设备详情
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getInfo(params) {
  return fetch(query.GET_DEVICE_DETAILS + params.id, { method: 'get' });
}

/**
 * 获取工单列表
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getWorkOrder(params) {
  return fetch(query.GET_WORKDER_LIST_BY_DEVICE, {
    method: 'get',
    params,
  });
}

/**
 * 获取工单详情
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getWorkOrderData(params) {
  return fetch(query.GET_WORKDER_DATAS + params.id, {
    method: 'get',
  });
}

/**
 * 获取资料列表
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getDevicesData(params) {
  return fetch(query.GET_DEVICE_DATAS, {
    method: 'get',
    params,
  });
}

/**
 * 获取会议历史
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getVideoHistory(params) {
  return fetch(query.GET_VIDEO_HISTORY, {
    method: 'get',
    params,
  });
}

/**
 * 退出会议
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function leaveMeetting(params) {
  return fetch(query.LEAVE_VIDEO_MEETTING + `${params.id}`, {
    method: 'post',
  });
}

/**
 * 获取ar
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getUserSig(params) {
  return fetch(query.GET_VOUCHER, {
    method: 'get',
    params,
  });
}

