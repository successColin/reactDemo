/*
 * @Author: Fus
 * @Date:   2019-11-21 13:56:01
 * @Desc: 触发器
 */

import fetch from '../utils/fetch';
import query from '../constants/query';

// 获取所有存储过程类型
export function getProceduresType(params) {
  return fetch(query.GET_PROCEDURES_TYPE, {
    method: 'post',
    params,
  });
}
// 保存JS触发器
export function insertOrUpdateJsTrigger(params) {
  return fetch(query.INSERT_OR_UPDATE_JS_FUNCTION, {
    method: 'post',
    params,
  });
}

// 获取JS触发器详情
export function getJsTriggerDetail(params) {
  return fetch(query.GET_JS_FUNCTION_DETAIL, {
    method: 'post',
    params,
  });
}

// 保存http触发器
export function insertOrUpdateHttpTrigger(params) {
  return fetch(query.INSERT_OR_UPDATE_HTTP_REQUEST_TRIGGER, {
    method: 'post',
    params,
  });
}

// 获取http触发器详情
export function getHttpRequestTriggerDetail(params) {
  return fetch(query.GET_HTTP_REQUEST_TRIGGER_DETAIL, {
    method: 'post',
    params,
  });
}


// 修改存储过程类型
export function insertOrUpdateProcedure(params) {
  return fetch(query.INSERT_OR_UPDATE_PROCEDURE, {
    method: 'post',
    params,
  });
}

// 获取存储过程详情
export function getProcedureDetail(params) {
  return fetch(query.GET_PROCEDURE_DETAIL, {
    method: 'post',
    params,
  });
}

// 删除存储过程详情
export function deleteProcedure(params) {
  return fetch(query.DELETE_PROCEDURE, {
    method: 'post',
    params,
  });
}

