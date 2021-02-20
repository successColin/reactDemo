/*
 * @Author: jwk
 * @Date:   2020-06-01 14:07:24
 * @Last Modified by: jwk
 * @Desc: 定时任务配置
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 * 获取分页
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getTasksList(params) {
  return fetch(query.GET_JOB_PAGE, {
    method: 'post',
    params,
  });
}

/**
 * 新增任务
 * @param params
 */
export function addTask(params) {
  return fetch(query.ADD_JOB, {
    method: 'post',
    params,
  });
}

/**
 * 编辑任务
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function editTask(params) {
  return fetch(query.UPDATE_JOB, {
    method: 'put',
    params,
  });
}

/**
 * 删除任务
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function deleteTasks(params) {
  return fetch(query.BATCHDEL_JOB, {
    method: 'DELETE',
    params,
  });
}

/**
 * 立即执行定时任务
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function runJob(params) {
  return fetch(query.RUN_JOB_FAST, {
    method: 'post',
    params,
  });
}

/**
 * 恢复定时任务
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function resume(params) {
  return fetch(query.RESUME_JOB, {
    method: 'post',
    params,
  });
}

/**
 * 暂停定时任务
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function pause(params) {
  return fetch(query.PAUSE_JOB, {
    method: 'post',
    params,
  });
}

/**
 * 获取定时任务日志
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getJobLogList(params) {
  return fetch(query.GET_JOB_LOG_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 新增或修改存储过程任务
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function updateOrInsertData(params) {
  return fetch(query.UPDATE_INSERT_JOB_DATA, {
    method: 'post',
    params,
  });
}

/**
 * 获取存储过程任务详情
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function getJobData(params) {
  return fetch(query.GET_JOB_DATA + params.id, {
    method: 'get',
  });
}

/**
 * 删除存储过程任务详情
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function deleteJobData(params) {
  return fetch(query.DELETE_JOB_DATA, {
    method: 'DELETE',
    params,
  });
}
