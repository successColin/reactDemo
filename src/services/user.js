/*
 * @Author: Fus
 * @Date:   2019-06-12 09:53:28
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-09-23 18:48:50
 * @Desc: 用户信息接口
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取用户列表
export function getUserPage(params) {
  return fetch(query.GET_USER_PAGE, {
    method: 'get',
    params,
  });
}

// 修改密码
export function updatePassword(params) {
  return fetch(query.UPDATE_PASSWORD, {
    method: 'post',
    params,
  });
}

// 切换语言
export function switchLanguage(params) {
  return fetch(query.SWITCH_LANGUAGE, {
    method: 'post',
    params,
  });
}
