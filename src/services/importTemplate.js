/**
 *@author jwk
 *@2019/9/3 0030
 *@Description 导入接口
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 *获取模板树
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function getImportTree(params) {
  return fetch(query.GET_IMPORT_TREE, {
    method: 'post',
    params,
  });
}

/**
 * 下载exc
 * @param params
 */
export function downLoadExcel(params) {
  return fetch(`${query.DOWNLOAD_EXCEL + params}`, {
    method: 'GET',
    params,
    contentType: 'excel',
  });
}

/**
 * 校验excle数据
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function doCheckExce(params) {
  return fetch(query.DOCHECK_EXCEL, {
    method: 'POST',
    params,
  });
}

/**
 * 上传
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function upload(params) {
  return fetch(query.UPLOAD, {
    method: 'POST',
    params,
    contentType: 'form',
  });
}

/**
 *
 * @param params
 * @returns {Promise<unknown>}
 */
export function getDoProcess(params) {
  return fetch(`${query.GET_PROCESS + params}`, {
    method: 'GET',
  });
}

/**
 * 导入数据库数据
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function doExcelToDB(params) {
  return fetch(query.DO_EXEL_T0_DB, {
    method: 'POST',
    params,
  });
}


