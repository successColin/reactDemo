import fetch from '../utils/fetch';
import query from '../constants/query';


/**
 * 获取菜单库管理列表
 * @param data
 */
export function getMenuList(params) {
  return fetch(query.GET_MENU_LIST, {
    method: 'post',
    params,
    // contentType: 'json',
  });
}

/**
 * 单条插入菜单库
 * @param data
 */
export function insertMenu(params) {
  return fetch(query.INSERT_MENU, {
    method: 'post',
    params,
  });
}

/**
 * 根据id删除菜单库
 * @param data
 */
export function deleteMenu(params) {
  return fetch(query.DELETE_MENU_LIST, {
    method: 'DELETE',
    params,
  });
}
/**
 * 根据id删除菜单库
 * @param data
 */
export function deleteIds(params) {
  return fetch(query.DELETE_MENU_LISTS, {
    method: 'DELETE',
    params,
  });
}

/**
 * 根据id修改菜单库
 * @param data
 */
export function updateRecord(params) {
  return fetch(query.UPDATE_RECORD_BYID, {
    method: 'PUT',
    params,
  });
}

/**
 * 获取界面类型
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getFrameTypeList(params) {
  return fetch(query.FRAME_TYPE_LIST, {
    method: 'post',
    params,
  });
}



