/*
 * @Author: Fus
 * @Date:   2019-11-06 17:01:53
 * @Desc: 全列表框架
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取界面配置
export function getFullListPageConfig(params) {
  return fetch(query.GET_FULL_LIST_PAGE_CONFIG, {
    method: 'post',
    params,
  });
}

// 获取表单数据
export function getFullListPageData(params) {
  return fetch(query.GET_FULL_LIST_PAGE_DATA, {
    method: 'post',
    params,
  });
}

// 获取列表数据
export function getFullListPageList(params) {
  return fetch(query.GET_FULL_LIST_PAGE_LIST, {
    method: 'post',
    params,
  });
}


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
