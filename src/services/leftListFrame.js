/**
 *@author jwk
 *@2019/9/11 0011
 *@Description 左侧列表
 */

import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 * 通用查询PC页面元素（左侧列表框架）
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getPcPageConfig(params) {
  return fetch(query.GET_PC_PAGE, {
    method: 'POST',
    params,
  });
}

/**
 *  通用查询PC列表页面数据（左侧列表框架）
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getList(params) {
  return fetch(query.GET_LIST_DATA, {
    method: 'POST',
    params,
  });
}

/**
 * 通用获取PC下拉数据（左侧列表框架）
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getDropDown(params) {
  return fetch(query.GET_DROP_DOWN_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 通用查询PC页面数据（左侧列表框架）
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getFormDetial(params) {
  return fetch(query.GET_PC_LIST_DATA, {
    method: 'post',
    params,
  });
}

/**
 * 通用处理PC标准选择框触发器（左侧列表框架）
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function eventTrigger(params) {
  return fetch(query.PCList_TRIGGER, {
    method: 'post',
    params,
  });
}

/**
 * 通用新增修改PC数据（左侧列表框架）
 * @param params
 * @returns {Promise<unknown>}
 */
export function handleSave(params) {
  return fetch(query.HANDLE_SAVE, {
    method: 'post',
    params,
  });
}

/**
 * 多选功能
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function filedRelationInsert(params) {
  return fetch(query.HANDLE_MULTI_INSERT, {
    method: 'post',
    params,
  });
}

/**
 * 通用删除PC数据（左侧列表框架）
 * @param params
 * @returns {Promise<unknown>}
 */
export function delList(params) {
  return fetch(query.DELETE_LIST, {
    method: 'post',
    params,
  });
}

/**
 * INSERT_OR_UPDATE
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateMore(params) {
  return fetch(query.INSERT_OR_UPDATE, {
    method: 'post',
    params,
  });
}

/**
 * DELETE_SELECT
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function del(params) {
  return fetch(query.DELETE_SELECT, {
    method: 'post',
    params,
  });
}

/**
 * 全列表删除
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function delFullList(params) {
  return fetch(query.FULL_DELETE_SELECT, {
    method: 'post',
    params,
  });
}

/**
 * 全列表框架批量新增修改
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateOrInsertFull(params) {
  return fetch(query.FULL_UPDATE_INSERT, {
    method: 'post',
    params,
  });
}

/**
 * 普通按钮
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function normalButton(params) {
  return fetch(query.INSERT_OR_UPDATE_BY_TRIGGERS_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 通用根据id批量修改
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function fullBatchUpdate(params) {
  return fetch(query.FULL_UPDATE_BATCH_LIST, {
    method: 'post',
    params,
  });
}

/**
 *通用根据id批量修改(左边)
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function leftListBatchUpdate(params) {
  return fetch(query.UPDATE_LEFT_LIST_BATCH, {
    method: 'post',
    params,
  });
}

/**
 * 普通按钮上的后端触发器
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function fullLsitTriggerUpdate(params) {
  return fetch(query.FULL_TRIGGER_UPDATE_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 全列表导出全部
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function fullListExportToExcel(params) {
  return fetch(query.FULL_EXPORT_ALL_TO_EXCEL, {
    method: 'post',
    params,
  });
}

/**
 * 获取高级筛选配置
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getSeniorFilterConfig(params) {
  return fetch(query.GET_ADVANCED_SCREENING_ELE, {
    method: 'post',
    params,
  });
}

/**
 * 批量修改
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function doUpdate(params) {
  return fetch(query.DO_BATCH_UPDATE, {
    method: 'post',
    params,
  });
}

/**
 * 获取消息实例的详情
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getMessageDetial(params) {
  return fetch(query.MESSAGE_INSTANCE_PARAM_RESULT, {
    method: 'get',
    params,
  });
}
