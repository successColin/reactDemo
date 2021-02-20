/*
 * @Author: Fus
 * @Date:   2019-06-12 09:53:28
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-11-07 14:29:59
 * @Desc: 界面配置接口
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取界面树
export function getTabTree(params) {
  return fetch(query.GET_TAB_TREE, {
    method: 'post',
    params,
  });
}

// 获取界面组数据
export function getTabGroupDetail(params) {
  return fetch(`${query.GET_TAB_GROUP_DETAIL}/${params.id}`, {
    method: 'get',
    params,
  });
}

// 新增tab组
export function insertTabGroup(params) {
  return fetch(query.INSERT_TAB_GROUP, {
    method: 'post',
    params,
  });
}

// 修改tab组
export function updateTabGroup(params) {
  return fetch(query.UPDATE_TAB_GROUP, {
    method: 'put',
    params,
  });
}

// 删除tab组
export function deleteTabGroup(params) {
  return fetch(query.DELETE_TAB_GROUP, {
    method: 'delete',
    params,
  });
}

// 获取tab详情
export function getTabDetail(params) {
  return fetch(`${query.GET_TAB_DETAIL}/${params.id}`, {
    method: 'get',
    // params,
  });
}

// 新增tab
export function insertTab(params) {
  return fetch(query.INSERT_TAB, {
    method: 'post',
    params,
  });
}

// 修改tab
export function updateTab(params) {
  return fetch(query.UPDATE_TAB, {
    method: 'put',
    params,
  });
}

// 删除tab
export function deleteTab(params) {
  return fetch(query.DELETE_TAB, {
    method: 'delete',
    params,
  });
}

// 获取触发器信息
export function getTriggerEventData(params) {
  return fetch(query.GET_TRIGGEREVENT_DATA, {
    method: 'post',
    params,
  });
}

// 新增触发器事件
export function insertTriggerEvent(params) {
  return fetch(query.INSERT_TRIGGER_EVENT, {
    method: 'post',
    params,
  });
}

// 删除触发器事件DEL_TRIGGER
export function delTriggerEvent(params) {
  return fetch(query.DEL_TRIGGER_EVENT, {
    method: 'delete',
    params,
  });
}

// 保存触发器内容
export function updateTriggerEvent(params) {
  return fetch(query.UPDATE_TRIGGER_EVENT, {
    method: 'post',
    params,
  });
}

// 获取面板内的控件列表
export function getTabElementList(params) {
  return fetch(query.GET_TAB_ELEMENT_LIST, {
    method: 'post',
    params,
  });
}

// 删除触发器事件
export function delTrigger(params) {
  return fetch(query.DEL_TRIGGER, {
    method: 'delete',
    params,
  });
}

// 查询多级关联条件
export function getElementMultiRelation(params) {
  return fetch(query.GET_ELEMENT_MULTI_RELATION, {
    method: 'post',
    params,
  });
}

// 更新多级关联条件
export function insertOrUpdateElementMultiRelation(params) {
  return fetch(query.INSERT_OR_UPDATE_MULTI_RELATION, {
    method: 'post',
    params,
  });
}

// 更新控件配置basetype=47
export function insertOrUpdateConfig(params) {
  return fetch(query.INSERT_OR_UPDATE_CONFIG, {
    method: 'post',
    params,
  });
}

// 更新字段的关联关系
export function insertOrUpdateElementFiledRelation(params) {
  return fetch(query.INSERT_OR_UPDATE_FILED_RELATION, {
    method: 'post',
    params,
  });
}

// 获取字段的关联关系
export function getFiledRelation(params) {
  return fetch(query.GET_ELEMENT_FILED_RELATION, {
    method: 'post',
    params,
  });
}

// 获取过滤器信息
export function getElementFilterCond(params) {
  return fetch(query.GET_ELEMENT_FILTER_COND, {
    method: 'post',
    params,
  });
}

// 更新过滤器信息
export function insertOrUpdateElementFilterCond(params) {
  return fetch(query.INSERT_OR_UPDATE_ELEMENT_FILTER_COND, {
    method: 'post',
    params,
  });
}

// 获取面板排序数据
export function getTabSortConfig(params) {
  return fetch(query.GET_TAB_SORT_CONFIG, {
    method: 'post',
    params,
  });
}

// 更新面板排序数据
export function insertOrUpdateTabSort(params) {
  return fetch(query.INSERT_OR_UPDATE_TAB_SORT, {
    method: 'post',
    params,
  });
}

// 获取菜单面板树
export function getMenuTabTree(params) {
  return fetch(query.GET_ACTIVE_USER_DESIGNER_TREE, {
    method: 'post',
    params,
  });
}

// 模糊查找语言模板
export function searchLanguageTempalteByLikeName(params) {
  return fetch(query.GET_LANGUAGETEMPLATE_LIKE_NAME, {
    method: 'get',
    params,
  });
}

// 根据id获取控件的菜单配置信息
export function getMoreFileList(params) {
  return fetch(query.GET_JUMP_FILE_LIST, {
    method: 'post',
    params,
  });
}

// 新增修改多菜单配置
export function insertOrUpdateMenuConfig(params) {
  return fetch(query.INSERT_OR_UPDATE_JUMP_MENU, {
    method: 'post',
    params,
  });
}

// 获取basetype=47控件类型的属性
export function combinationInfo(params) {
  return fetch(query.GET_COMBINATION_INFO, {
    method: 'post',
    params,
  });
}
