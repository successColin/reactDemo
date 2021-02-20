/*
 * @Author: Fus
 * @Date:   2019-09-23 15:27:23
 * @Desc: 个人中心
 */

import fetch from '../utils/fetch';
import query from '../constants/query';

// 登出
export function logout(params) {
  return fetch(query.LOGOUT, {
    method: 'post',
    params,
  });
}