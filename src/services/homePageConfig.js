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

// 获取主页配置基本信息
export function getHomePageConfig(params) {
  return fetch(query.GET_HOME_PAGE_CONFIG, {
    method: 'post',
    params,
  });
}
