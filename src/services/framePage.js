/*
 * @Author: Fus
 * @Date:   2019-08-22 10:18:35
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-11-26 09:39:24
 * @Desc: 设计组菜单
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取框架信息
export function getFrameDetail(params) {
  return fetch(query.GET_FRAME_DETAIL, {
    method: 'post',
    params,
    cancelRepeat: false,
  });
}

// 删除面板
export function deleteUserDesignerTab(params) {
  return fetch(query.DELETE_TAB, {
    method: 'delete',
    params,
  });
}

// 保存面板基本信息
export function doUpdateTabBasicData(params) {
  return fetch(query.UPDATE_TAB_BASIC_DATA, {
    method: 'post',
    params,
    cancelRepeat: false,
  });
}

// 单条控件数据加入面板中
export function addElementToTab(params) {
  return fetch(query.ADD_ELEMENT_TO_TAB, {
    method: 'post',
    params,
    cancelRepeat: false,
  });
}


// 保存面板内控件信息
export function doUpdateTabElementData(params) {
  return fetch(query.UPDATE_TAB_ELEMENT_DATA, {
    method: 'post',
    params,
    cancelRepeat: false,
  });
}

// 获取面板内控件列表
export function getUserDesignerTabElementList(params) {
  return fetch(query.GET_USER_DESIGNER_TAB_ELEMENT_LIST, {
    method: 'post',
    params,
  });
}

// 删除面板内的控件
export function deleteUserDesignerTabElement(params) {
  return fetch(query.DELETE_USER_DESIGNER_TAB_ELEMENT, {
    method: 'delete',
    params,
  });
}

// 获取面板的筛选条件
export function getUserDesignerFilterCond(params) {
  return fetch(query.GET_USER_DESIGNER_FILTER_COND, {
    method: 'post',
    params,
  });
}

// 更新面板的筛选条件
export function updateUserDesignerFilterCond(params) {
  return fetch(query.UPDATE_USER_DESIGNER_FILTER_COND, {
    method: 'post',
    params,
  });
}

// 复制配置面板
export function copyTabData(params) {
  return fetch(query.COPY_TAB_DATA, {
    method: 'post',
    params,
  });
}

// 复制用户设计组数据
export function copyUserDesignerData(params) {
  return fetch(query.COPY_USER_DESIGNER_DATA, {
    method: 'post',
    params,
  });
}


// 获取面板高级筛选数据
export function getTabSeniorFilter(params) {
  return fetch(query.GET_TAB_SENIOR_FILTER, {
    method: 'post',
    params,
  });
}

// 获取面板高级筛选数据
export function insertOrUpdateTabSeniorFilter(params) {
  return fetch(query.INSERT_OR_UPDATE_TAB_SENIOR_FILTER, {
    method: 'post',
    params,
  });
}

// 删除设计组菜单
export function deleteUserDesignerFunction(params) {
  return fetch(query.DELETE_USER_DESIGNER_FUNCTION, {
    method: 'delete',
    params,
  });
}

// 获取设计组菜单的菜单输入参数
export function getParamList(params) {
  return fetch(query.GET_FILE_PARAM_LIST, {
    method: 'post',
    params,
  });
}

// 修改新增设计组菜单的菜单输入参数
export function updateParamList(params) {
  return fetch(query.UPDATE_FRAME_PARAM_LISY, {
    method: 'post',
    params,
  });
}

// 获取第三方接口
export function getThirdinterface(params) {
  return fetch(query.GET_THIRD_PARTY_INTERFACE, {
    method: 'post',
    params,
  });
}

// 获取到第三方数据
export function getThirdData(params) {
  return fetch(query.GET_THIRD_PARTY_DATA, {
    method: 'post',
    params,
  });
}

/**
 * 新增修改入参列表
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function insertOrUpdateParams(params) {
  return fetch(query.INSERT_OR_UPDATE_IN_PARAMS, {
    method: 'post',
    params,
  });
}
