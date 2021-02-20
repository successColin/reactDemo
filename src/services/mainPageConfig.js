/*
 * @Author: Fus
 * @Date:   2020-02-04 14:54:54
 * @Desc: 主页配置接口请求
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 新增、更新主页配置基本信息
export function saveHomePageConfig(params) {
  return fetch(query.UPDATE_HOME_PAGE_CONFIG, {
    method: 'post',
    params,
  });
}

/**
 * 清除系统缓存
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function clearNetworkCache(params) {
  return fetch(query.CLEAR_SISYTEM_CACHE, {
    method: 'post',
    params,
  });
}

// 获取主页配置基本信息
export function getHomePageConfig(params) {
  return fetch(query.GET_HOME_PAGE_CONFIG, {
    method: 'post',
    params,
  });
}

// 获取主页配置 三方链接
export function getThirdLinkList(params) {
  return fetch(query.GET_THIRD_LINK_LIST, {
    method: 'post',
    params,
  });
}

// 新增、更新主页配置 三方链接
export function saveThirdLink(params) {
  return fetch(query.SAVE_THIRD_LINK, {
    method: 'post',
    params,
  });
}

// 删除主页配置 三方链接
export function deleteThirdLink(params) {
  return fetch(query.DELETE_THIRD_LINK, {
    method: 'delete',
    params,
  });
}

// 切换序号主页配置 三方链接
export function saveThirdLinkSno(params) {
  return fetch(query.SAVE_THIRD_LINK_SNO, {
    method: 'post',
    params,
  });
}


// 获取帮助文档列表
export function getHelpDocList(params) {
  return fetch(query.GET_HELP_DOC_LIST, {
    method: 'post',
    params,
  });
}

// 切换序号主页配置 帮助文档
export function saveHelpDocSno(params) {
  return fetch(query.SAVE_HELP_DOC_SNO, {
    method: 'post',
    params,
  });
}

// 根据keycode查询类型id 帮助文档
export function getHelpDocTypeId(params) {
  return fetch(query.GET_HELP_DOC_TYPEID, {
    method: 'post',
    params,
  });
}

/**
 * 获取app二维码列表
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getQBList(params) {
  return fetch(query.GET_QB_LIST, {
    method: 'post',
    params,
  });
}

