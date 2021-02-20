/*
 * @Author: Fus
 * @Date:   2020-02-29 10:13:08
 * @Desc: 首页图表配置及展示接口
 */

import fetch from '../utils/fetch';
import query from '../constants/query';

// 新增修改图表数据行
export function updateChartLine(params) {
  return fetch(query.INSERT_CHART_LINE, {
    method: 'post',
    params,
  });
}

// 删除图表数据行
export function deleteChartLine(params) {
  return fetch(query.DELETE_CHART_LINE, {
    method: 'delete',
    params,
  });
}

// 查询图表的筛选关系
export function getChartFilterList({ id }) {
  return fetch(`${query.GET_CHART_FILTER_LIST}${id}`, {
    method: 'get',
  });
}

// 保存图表的筛选关系
export function updateChartFilter(params) {
  return fetch(query.UPDATE_CHART_FILTER, {
    method: 'post',
    params,
  });
}

// 删除图表过滤条件
export function deleteChartFilter(params) {
  return fetch(query.DELETE_CHART_FILTER, {
    method: 'delete',
    params,
  });
}

// 获取首页汇总控件数据
export function getHomeSummaryData(params) {
  return fetch(query.GET_HOME_SUMMARY_DATA, {
    method: 'post',
    params,
  });
}
// 获取首页图表控件数据
export function getHomeChartData(params) {
  return fetch(query.GET_HOME_CHART_DATA, {
    method: 'post',
    params,
  });
}