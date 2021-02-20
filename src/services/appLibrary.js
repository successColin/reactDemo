/*
 * @Author: Fus
 * @Date:   2019-09-05 09:47:06
 * @Desc: APP档案
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 查询APP分组树
export function getAppGroupTree(params) {
  return fetch(query.GET_APP_GROUP_TREE, {
    method: 'post',
    params,
  });
}

// 新增或修改app组
export function insertOrUpdateAppGroup(params) {
  return fetch(query.INSERT_OR_UPDATE_APP_GROUP, {
    method: 'post',
    params,
  });
}
// 删除APP组
export function deleteAppGroup(params) {
  return fetch(query.DELETE_APP_GROUP, {
    method: 'delete',
    params,
  });
}
// 查看APP组
export function getAppGroupDetail({ id }) {
  return fetch(`${query.GET_APP_GROUP_DETAIL}/${id}`, {
    method: 'get',
  });
}

// 新增或修改APP
export function insertOrUpdateApp(params) {
  return fetch(query.INSERT_OR_UPDATE_APP, {
    method: 'post',
    params,
  });
}

// 删除APP
export function deleteAPP(params) {
  return fetch(query.DELETE_APP, {
    method: 'delete',
    params,
  });
}

// 获取APP详情
export function getAppDetail({ id }) {
  return fetch(`${query.GET_APP_DETAIL}/${id}`, {
    method: 'get',
  });
}

// 查询app列表
export function getAppList(params) {
  return fetch(query.GET_APP_LIST, {
    method: 'post',
    params,
  });
}

// 获取AppBundle工具树
export function getAppBundleTree(params) {
  return fetch(query.GET_APP_BUNDLE_TREE, {
    method: 'post',
    params,
  });
}

// 获取Bundle功能树
export function getBundleLibraryTree(params) {
  return fetch(query.GET_BUNDLE_LIBRARY_TREE, {
    method: 'post',
    params,
  });
}

/** APP主页配置 */
// 获取APP首页信息
export function getAppHomePage(params) {
  return fetch(query.GET_APP_HOME_PAGE, {
    method: 'post',
    params,
  });
}
// 主页新增bundle分组
export function insertOrUpdateAppHomePageBundleGroup(params) {
  return fetch(query.INSERT_OR_UPDATE_APP_HOME_PAGE_BUNDLE_GROUP, {
    method: 'post',
    params,
  });
}

// 主页新增bundle
export function insertAppHomePage(params) {
  return fetch(query.INSERT_APP_HOME_PAGE, {
    method: 'post',
    params,
  });
}
// 删除主页bundle
export function deleteAppHomePageBundle(params) {
  return fetch(query.DELETE_APP_HOME_PAGE_BUNDLE, {
    method: 'delete',
    params,
  });
}

// 替换组件
export function replaceAppHomePageBundle(params) {
  return fetch(query.REPLACE_APP_HOME_PAGE_BUNDLE, {
    method: 'post',
    params,
  });
}

// 修改组件
export function updateBundle(params) {
  return fetch(query.UPDATE_BUNDLE, {
    method: 'put',
    params,
  });
}

// 删除主页bundle分组
export function deleteAppHomePageBundleGroup(params) {
  return fetch(query.DELETE_APP_HOME_PAGE_BUNDLE_GROUP, {
    method: 'delete',
    params,
  });
}

// 修改主页bundle分组序号
export function updateAppHomePageBundleGroupSno(params) {
  return fetch(query.UPDATE_APP_HOME_PAGE_BUNDLE_GROUP_SNO, {
    method: 'put',
    params,
  });
}

// 获取bundle的可应用于日历字段
export function getBundleSelectFields(params) {
  return fetch(query.GET_BUNDLE_SELECT_FIELDS, {
    method: 'post',
    params,
  });
}

// 保存banner配置数据
export function saveAppBannerList(params) {
  return fetch(query.SAVE_APP_BANNER_LIST, {
    method: 'post',
    params,
  });
}
// 查询banner列表
export function getAppBannerList(params) {
  return fetch(query.GET_APP_BANNER_LIST, {
    method: 'post',
    params,
  });
}
// 查询app个人中心固定模块配置
export function getAppUserCenterStaticConfig(params) {
  return fetch(query.GET_APP_USER_CENTER_STATIC_CONFIG, {
    method: 'post',
    params,
  });
}

// 保存app个人中心固定模块配置
export function saveAppUserCenterStaticConfig(params) {
  return fetch(query.SAVE__APP_USER_CENTER_STATIC_CONFIG, {
    method: 'post',
    params,
  });
}

// 切换分组
export function switchGroup(params) {
  return fetch(query.SWITCH_GROUP, {
    method: 'post',
    params,
  });
}