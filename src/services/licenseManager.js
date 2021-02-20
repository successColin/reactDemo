/*
 * @Author: tjf
 * @Date:   2019-11-04 09:07:24
 * @Last Modified by: tjf
 * @Last Modified time: 2019-11-04 09:07:24
 * @Desc: 状态管理
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取左侧列表
export function getCompanyList(params) {
  return fetch(query.GET_COMPANY_LIST, {
    method: 'post',
    params,
  });
}
// 生成lic文件
export function createLicFile(params) {
  return fetch(query.CREATE_LIC_FILE, {
    method: 'post',
    params,
  });
}
// 上传lic文件
export function uploadLicFile(params) {
  return fetch(query.UPLOAD_LIC_FILE, {
    method: 'post',
    params,
  });
}
// 校验lic文件
export function checkLicFile(params) {
  return fetch(query.CHECK_LIC_FILE, {
    method: 'post',
    params,
  });
}
// 获取lic文件详情
export function getLicFileDetail(params) {
  return fetch(query.GET_LIC_FILE_DETAIL, {
    method: 'post',
    params,
  });
}
