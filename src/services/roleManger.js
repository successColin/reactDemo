/**
 *@author jwk
 *@2019/8/15 0015
 *@Description
 */

import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 * 获取角色树
 * @param params
 */
export function getRoleTree(params) {
  return fetch(query.GET_ROLE_TREE, {
    method: 'post',
    params,
    // contentType: 'json',
  });
}

/**
 * 修改角色组
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateRoleTreeOfGroup(params) {
  return fetch(query.EDIT_ROLE_GROUP, {
    method: 'put',
    params,
  });
}

/**
 * 修改角色
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateRoleTreeOfRole(params) {
  return fetch(query.EDIT_ROLE_ROLE, {
    method: 'put',
    params,
  });
}

/**
 * 获取角色组详情
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getRoleGroupDetial(params) {
  return fetch(`${query.GET_ROLEGROUP_TREE}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 获取角色详情
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getRoleDetial(params) {
  return fetch(`${query.GET_ROLETREE_ROLE}/${params.id}`, {
    method: 'get',
  });
}

/**
 * 删除角色
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function delRoleDetial(params) {
  return fetch(query.DEL_ROLE_TREE, {
    method: 'DELETE',
    params,
  });
}

/**
 * 删除角色组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function delRoleGroupDetial(params) {
  return fetch(query.DEL_ROLEGROUP_TREE, {
    method: 'DELETE',
    params,
  });
}

/**
 * 新增角色组
 * @param
 * @returns {*|Promise|Promise<unknown>}
 */
export function addRoleGroup(params) {
  return fetch(query.ADD_ROLE_GROUP, {
    method: 'post',
    params,
  });
}

/**
 * 新增角色
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function addRole(params) {
  return fetch(query.ADD_ROLE_ROLE, {
    method: 'post',
    params,
  });
}

/**
 * 根据角色id查看角色菜单权限树
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getAuthorityById(params) {
  return fetch(query.GET_PC_AUTHORITY, {
    method: 'post',
    params,
  });
}

/**
 * 根据id修改角色菜单权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateFunctionPermission(params) {
  return fetch(query.EDIT_PC_FUNCTIONPERMISSION, {
    method: 'put',
    params,
  });
}

/**
 * 单条新增
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertFunctionPermission(params) {
  return fetch(query.INSERT_ROLE_FUNCTION, {
    method: 'post',
    params,
  });
}

/**
 *角色菜单权限列全选
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateRowFunctionPermission(params) {
  return fetch(query.UPDAT_ROW_FUNCTIONPERMISSION, {
    method: 'post',
    params,
  });
}

/**
 * 获取app权限树
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getAPPTree(params) {
  return fetch(query.GET_APP_AUTHORITY, {
    method: 'post',
    params,
  });
}

/**
 *根据id修改角色组件权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function roleBundlePermissionUpdate(params) {
  return fetch(query.UPDATE_BUNDLEPERMISSIIN, {
    method: 'put',
    params,
  });
}

/**
 *角色组件权限行全选
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function rowCheckAll(params) {
  return fetch(query.UPDATE_ROW_CHECKALL, {
    method: 'post',
    params,
  });
}

/**
 *角色组件权限列全选
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function columnCheckAll(params) {
  return fetch(query.UPDATE_COLUMN_CHECKALL, {
    method: 'post',
    params,
  });
}

/**
 *单条新增角色APP权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertAppPermission(params) {
  return fetch(query.INSERT_ROLE_APPPERMISSION, {
    method: 'post',
    params,
  });
}

/**
 *单条修改角色APP权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateAppPermisson(params) {
  return fetch(query.UPDATE_ROLE_APPPERMISSION, {
    method: 'PUT',
    params,
  });
}

/**
 * 获取数据权限树接口
 * @param params
 * @returns {Promise<unknown>}
 */
export function getRoleDataTree(params) {
  return fetch(query.GET_ROLE_DATA_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 获取角色关联过的组织机构
 * @param params
 * @returns {Promise<unknown>}
 */
export function getRoleOrgData(params) {
  return fetch(query.GET_ROLE_ORG, {
    method: 'post',
    params,
  });
}

/**
 * 新增用户的数据权限
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function insertOrgData(params) {
  return fetch(query.UPDATE_ROLE_DATA, {
    method: 'post',
    params,
  });
}

/**
 * 删除组织机构
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteOrgData(params) {
  return fetch(query.DELETE_ROLE_ORGID, {
    method: 'post',
    params,
  });
}

/**
 * 获取公司树
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getComponenyTree(params) {
  return fetch(query.GET_COMPONENY_TREE, {
    method: 'post',
    params,
  });
}


