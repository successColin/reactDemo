/**
 *@author jwk
 *@2019/8/19 0019
 *@Description
 * 用户管理接口
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 * 获取用户管理树
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getUserGroup(params) {
  return fetch(query.GET_USER_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 获取位置树
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getPosTree(params) {
  return fetch(query.GET_POSITION_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 获取图表数据
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getChartQuery(params) {
  return fetch('/report/query', {
    method: 'post',
    params,
  });
}

/**
 * 修改用户组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateUserGroup(params) {
  return fetch(query.UPDATE_USER_GROUP, {
    method: 'put',
    params,
  });
}

/**
 * 修改用户
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateUser(params) {
  return fetch(query.UPDATE_USER_USER, {
    method: 'post',
    params,
  });
}

/**
 *单条新增用户组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertUserGroup(params) {
  return fetch(query.INSERT_USER_GROUP, {
    method: 'post',
    params,
  });
}

/**
 * 新增用户
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertUser(params) {
  return fetch(query.INSERT_USER_USER, {
    method: 'post',
    params,
  });
}

/**
 * 获取用户组详情
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getUserGroupDetial(params) {
  return fetch(`${query.GET_USER_USERGROUP}/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 获取用户详情
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getUserDetial(params) {
  return fetch(`${query.GET_USER_DETIAL}/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 根据id删除用户组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function delUserGroup(params) {
  return fetch(query.DELETE_USER_USERGROUP, {
    method: 'DELETE',
    params,
  });
}

/**
 * 根据id删除用户
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function delUser(params) {
  return fetch(query.DEL_USER_USER, {
    method: 'DELETE',
    params,
  });
}

/**
 * 根据用户id获取菜单权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getUserPermissionTree(params) {
  return fetch(query.GET_USER_FUNCTION_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 根据用户id查看用户组件权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getUserAppree(params) {
  return fetch(query.GET_USER_APP_TREE, {
    method: 'post',
    params,
  });
}

/**
 *批量新增修改用户菜单权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateUserFunctionPerssion(params) {
  return fetch(query.UPDATE_USER_PERMISSION_UPDATE, {
    method: 'post',
    params,
  });
}

/**
 *用户菜单权限列全选
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateUserRowFunctionPerssion(params) {
  return fetch(query.UPDATE_USER_ROW_CHECK, {
    method: 'post',
    params,
  });
}

/**
 *批量新增修改用户组件权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateUserApp(params) {
  return fetch(query.UPDATE_USER_APP, {
    method: 'post',
    params,
  });
}

/**
 *用户组件权限列全选
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateRowUser(params) {
  return fetch(query.UPDATA_USER_ROW_APP, {
    method: 'post',
    params,
  });
}

/**
 * 根据用户id查询对应的角色权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getUserOfRoleTree(params) {
  return fetch(query.GET_USEROFROLE_TREE, {
    method: 'post',
    params,
  });
}

/**
 *新增用户角色权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function relationInsert(params) {
  return fetch(query.INSERT_RELATION_USER, {
    method: 'post',
    params,
  });
}

/**
 *单条新增用户APP权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function inserAppPermisson(params) {
  return fetch(query.INSERT_USER_APPPERMISSION, {
    method: 'POST',
    params,
  });
}

/**
 * app继承权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertApp(params) {
  return fetch(query.INSERT_USER_APPINSERT, {
    method: 'post',
    params,
  });
}

/**
 * 获取用户组树
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getUserGroupTree(params) {
  return fetch(query.GET_USER_GROUP_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 获取用户已经关联的组织
 * @param params
 * @returns {Promise<unknown>}
 */
export function getUserData(params) {
  return fetch(query.GET_USER_ORG_DATA, {
    method: 'post',
    params,
  });
}

/**
 * 修改用户已经关联的组织
 * @param params
 * @returns {Promise<unknown>}
 */
export function updateUserData(params) {
  return fetch(query.UPDATE_USER_DATA, {
    method: 'post',
    params,
  });
}

/**
 * 重置密码
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function restPassword(params) {
  return fetch(query.REST_USER_PASSWORD, {
    method: 'post',
    params,
  });
}

/**
 *查询用户列表（分页）
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getUserList(params) {
  return fetch(query.GET_USER_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 复制角色
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 * @constructor
 */
export function copyRoleRelationUser(params) {
  return fetch(query.COPY_ROLERELATION_USER, {
    method: 'post',
    params,
  });
}

/**
 * 用户解锁
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function updateUserLock(params) {
  return fetch(query.UPDATE_USER_LOCKED, {
    method: 'post',
    params,
  });
}


