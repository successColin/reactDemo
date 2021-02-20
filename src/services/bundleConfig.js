/*
 * @Author: Fus
 * @Date:   2019-09-05 09:47:06
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-09-10 11:46:48
 * @Desc: 移动端配置
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取bundle框架类型列表
export function getFrameBundleTypeList(params) {
  return fetch(query.GET_FRAME_BUNDLE_TYPE_LIST, {
    method: 'post',
    params,
  });
}

// 获取bundle树
export function getBundleLibraryJsonTree(params) {
  return fetch(query.GET_BUNDLE_LIBRARY_JSON_TREE, {
    method: 'post',
    params,
  });
}

// // bundle组
// export function insertBundleGroup(params) {
//   return fetch(query.INSERT_BUNDLE_GROUP, {
//     method: 'post',
//     params,
//   });
// }
// 删除bundle组
export function deleteBundleGroup(params) {
  return fetch(query.DELETE_BUNDLE_GROUP, {
    method: 'delete',
    params,
  });
}
// 新增修改bundle组
export function insertOrUpdateBundleGroup(params) {
  return fetch(query.INSERT_OR_UPDATE_BUNDLE_GROUP, {
    method: 'put',
    params,
  });
}
// 查看bundle组
export function getBundleGroupDetail({ id }) {
  return fetch(`${query.GET_BUNDLE_GROUP_DETAIL}/${id}`, {
    method: 'get',
  });
}

// 新增bundle
// export function insertBundle(params) {
//   return fetch(query.INSERT_BUNDLE, {
//     method: 'post',
//     params,
//   });
// }

// 删除bundle
export function deleteBundle(params) {
  return fetch(query.DELETE_BUNDLE, {
    method: 'delete',
    params,
  });
}
// 新增修改bundle
export function insertOrUpdateBundle(params) {
  return fetch(query.INSERT_OR_UPDATE_BUNDLE, {
    method: 'put',
    params,
  });
}

// 获取bundle详情
export function getBundleDetail({ id }) {
  return fetch(`${query.GET_BUNDLE_DETAIL}/${id}`, {
    method: 'get',
  });
}

/** bundle框架及面板接口 */

// 获取bundle框架及面板信息
export function getBundleFrameDetail(params) {
  return fetch(query.GET_BUNDLE_FRAME_DETAIL, {
    method: 'post',
    params,
  });
}

// 新增修改框架
export function insertOrUpdateMobileFrames(params) {
  return fetch(query.INSERT_OR_UPDATE_MOBILE_FRAMES, {
    method: 'post',
    params,
  });
}
// 删除框架
export function deleteMobileFrames(params) {
  return fetch(query.DELETE_MOBILE_FRAMES, {
    method: 'post',
    params,
  });
}

// 保存面板基本信息
export function insertOrUpdateUserDesignerMobileTab(params) {
  return fetch(query.INSERT_OR_UPDATE_USER_DESIGNER_MOBILE_TAB, {
    method: 'post',
    params,
  });
}

// 单个控件加入面板
export function addElementToMobileTab(params) {
  return fetch(query.ADD_ELEMENT_TO_MOBILE_TAB, {
    method: 'post',
    params,
  });
}

// 保存控件列表
export function insertOrUpdateUserDesignerMobileTabElement(params) {
  return fetch(query.INSERT_OR_UPDATE_USER_DESIGNER_MOBILE_TAB_ELEMENT, {
    method: 'post',
    params,
  });
}

// 删除面板
export function deleteUserDesignerMobileTab(params) {
  return fetch(query.DELETE_USER_DESIGNER_MOBILE_TAB, {
    method: 'delete',
    params,
  });
}

// 删除单个控件
export function deleteUserDesignerMobileTabElement(params) {
  return fetch(query.DELETE_USER_DESIGNER_MOBILE_TAB_ELEMENT, {
    method: 'delete',
    params,
  });
}
// 查询面板过滤条件
export function insertOrUpdateUserDesignerMobileTabAdvancedQuery(params) {
  return fetch(query.INSERT_OR_UPDATE_USER_DESIGNER_MOBILE_TAB_ADVANCED_QUERY, {
    method: 'post',
    params,
  });
}

// 获取用户设计组列表
export function getMobileFrameUserDesignerList(params) {
  return fetch(query.GET_MOBILE_FRAME_USER_DESIGNER_LIST, {
    method: 'post',
    params,
  });
}

// 获取bundle树
export function getBundleTree(params) {
  return fetch(query.GET_BUNDLE_TREE, {
    method: 'post',
    params,
  });
}