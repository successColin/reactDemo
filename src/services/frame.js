/*
 * @Author: Fus
 * @Date:   2019-08-13 15:01:49
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-11-13 23:30:27
 * @Desc: 框架模块（设计组菜单）
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 更新框架信息
export function updateFrameDetail(params) {
  return fetch(query.UPDATE_FRAME_DETAIL, {
    method: 'post',
    params,
  });
}

// 更新框架面板信息
export function updateFrameTabDetail(params) {
  return fetch(query.UPDATE_FRAME_TAB_DETAIL, {
    method: 'put',
    params,
  });
}

// 批量新增修改
export function batchUpdate(params) {
  return fetch(query.LEFT_FTREE_FRAME_BATCH_UPDATE, {
    method: 'post',
    params,
  });
}


// 归档按钮触发
export function doArchiveCycle(params) {
  return fetch(query.DO_ARCHIVE_CYCLE, {
    method: 'post',
    params,
  });
}

// 普通归档按钮触发
export function doArchiveNormal(params) {
  return fetch(query.DO_ARCHIVE_NORMAL, {
    method: 'post',
    params,
  });
}

// 批量归档按钮触发
export function doBatchArchiveCycle(params) {
  return fetch(query.DO_BATCH_ARCHIVE_CYCLE, {
    method: 'post',
    params,
  });
}

// 批量普通归档按钮触发
export function doBatchArchiveNormal(params) {
  return fetch(query.DO_BATCH_ARCHIVE_NORMAL, {
    method: 'post',
    params,
  });
}

// 普通按钮触发
export function insertOrUpdateByTriggers(params) {
  return fetch(query.INSERT_OR_UPDATE_BY_TRIGGERS, {
    method: 'post',
    params,
  });
}

/** 业务框架模型 */

// 获取页面配置
export function getPageConfig(params) {
  return fetch(query.GET_PAGE_CONFIG, {
    method: 'post',
    params,
  });
}

// 获取整棵树
export function getPageFullTree(params) {
  return fetch(query.GET_PAGE_FULL_TREE, {
    method: 'post',
    params,
  });
}

// 获取树单个节点
export function getPageSingleTreeNode(params) {
  return fetch(query.GET_PAGE_SINGLE_TREE_NODE, {
    method: 'post',
    params,
  });
}

// 删除树节点
export function deletePageTreeNode(params) {
  return fetch(query.DELETE_PAGE_TREE_NODE, {
    method: 'post',
    params,
  });
}

// 移动树节点
export function switchNode(params) {
  return fetch(query.SWITCH_NODE, {
    method: 'post',
    params,
  });
}

// 删除数据
export function batchDeletePageData(params) {
  return fetch(query.BATCH_DELETE_PAGE_DATA, {
    method: 'post',
    params,
  });
}

// 获取界面数据
export function getPageData(params) {
  return fetch(query.GET_PAGE_DATA, {
    method: 'post',
    params,
  });
}

// 更新界面数据
export function insertOrUpdatePageData(params) {
  return fetch(query.INSERT_OR_UPDATE_PAGE_DATA, {
    method: 'post',
    params,
  });
}

// 更新界面数据
export function insertOrUpdateRelationPageData(params) {
  return fetch(query.INSERT_OR_UPDATE_RELATION_PAGE_DATA, {
    method: 'post',
    params,
  });
}

// 批量更新界面数据
export function batchInsertOrUpdatePageData(params) {
  return fetch(query.BATCH_INSERT_OR_UPDATE_PAGE_DATA, {
    method: 'post',
    params,
  });
}

// 获取列表界面数据
export function getTreeFrameListData(params) {
  return fetch(query.GET_TREE_FRAME_LIST_DATA, {
    method: 'post',
    params,
  });
}

// 获取下拉选项数据
export function getPageSelectOptions(params) {
  return fetch(query.GET_PAGE_SELECT_OPTIONS, {
    method: 'post',
    params,
  });
}

// 触发器获取值
export function getTriggerResult(params) {
  return fetch(query.GET_TRIGGER_RESULT, {
    method: 'post',
    params,
  });
}

// 校验keycode唯一性
export function validKeycode(params) {
  return fetch(query.VALID_KEYCODE, {
    method: 'post',
    params,
  });
}

/** 标准数据选择框 */

// 标准选择框树单节点数据
export function getNormalSearchSingleTreeNode(params) {
  return fetch(query.GET_NORMAL_SEARCH_SELECT_SINGLE_TREE_NODE, {
    method: 'post',
    params,
  });
}

// 标准选择框树全节点数据
export function getNormalSearchFullTreeNode(params) {
  return fetch(query.GET_NORMAL_SEARCH_SELECT_FULL_TREE_NODE, {
    method: 'post',
    params,
  });
}

// 标准选择框列表数据
export function getNormalSearchList(params) {
  return fetch(query.GET_NORMAL_SEARCH_SELECT_LIST, {
    method: 'post',
    params,
  });
}

// 标准选择框获取该节点详情
export function getNormalSearchDetail(params) {
  return fetch(query.GET_NORMAL_SEARCH_SELECT_DETAIL, {
    method: 'post',
    params,
  });
}

/**
 * 多选框获取该节点详情
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getCheckBoxSearchDetail(params) {
  return fetch(query.GET_CHECKBOX_SEARCH_SELECT_DETAIL, {
    method: 'post',
    params,
  });
}

// 标准选择框获取该节点详情
export function httpRequest(params) {
  return fetch(query.HTTP_REQUEST, {
    method: 'post',
    params,
  });
}

// 标准选择框查询已选节点所有父节点
export function getNormalSearchRootNodes(params) {
  return fetch(query.GET_NORMAL_SEARCH_SELECT_TREE_ROOT_NODES, {
    method: 'post',
    params,
  });
}

// 获取高级筛选配置
export function getSeniorFilterConfig(params) {
  return fetch(query.GET_ADVANCED_SCREENING_ELE, {
    method: 'post',
    params,
  });
}

// 获取高级筛选中的最后一次数据
export function getSeniorFilterParams(params) {
  return fetch(query.DO_SEARCH_LAST_PARAMS, {
    method: 'post',
    params,
  });
}

// 新增查询条件
export function doInsertParams(params) {
  return fetch(query.DO_INSTER_SEARCH_PARAM, {
    method: 'post',
    params,
  });
}

// 获取查询记录
export function doGetParamsList(params) {
  return fetch(query.DO_GET_PARAMS_LIST, {
    method: 'post',
    params,
  });
}

// 获取子节点
export function getChildTreeData(params) {
  return fetch(query.GET_CHILD_TREE, {
    method: 'post',
    params,
  });
}

// 工单展望生成接口
export function insertCreateOutlook(params) {
  return fetch(query.INSERT_CREATE_OUTLOOK, {
    method: 'post',
    params,
  });
}

// 工单展望互获取列表
export function getSelectOutlook(params) {
  return fetch(query.GET_SELECT_OUTLOOK, {
    method: 'post',
    params,
  });
}

// 工单展望互获取列表
export function updateChangeTime(params) {
  return fetch(query.UPDATE_CHANGE_TIME, {
    method: 'post',
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