/*
 * @Author: jwk
 * @Date:   2020-03-17 19:47:06
 * @Desc: 语言批量配置
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
