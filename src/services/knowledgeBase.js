/*
 * @Author: Fus
 * @Date:   2019-08-12 09:07:24
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-26 09:55:06
 * @Desc: 用户设计组模块
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取文件夹树列表
export function getFilesTree(params) {
  return fetch(query.GET_FILES_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 获取文件夹详情
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function getFilesDetails(params) {
  return fetch(query.GET_FILES, {
    method: 'post',
    params,
  });
}
/**
 * 文件下载
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function downloadFile(params) {
  return fetch(`${query.DOWNLOAD}/${params.id}`, {
    method: 'get',
  });
}
/**
 * 新建文件分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function createFileGroup(params) {
  return fetch(query.CREATE_FILE_GROUP, {
    method: 'post',
    params,
  });
}
/**
 * 修改文件分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function updateFileGroup(params) {
  return fetch(query.UPDATE_FILE_GROUP, {
    method: 'put',
    params,
  });
}
/**
 * 删除文件分组
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteFileGroup(params) {
  return fetch(query.DELETE_FILE_GROUP, {
    method: 'delete',
    params,
  });
}
/**
 * 删除文件
 * @param id
 * @returns {*|Promise|Promise<unknown>}
 */
export function deleteFile(params) {
  return fetch(query.DELETE_FILE, {
    method: 'delete',
    params,
  });
}
