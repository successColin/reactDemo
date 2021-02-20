/*
 * @Author: jwk
 * @Date:   2020-03-17 11:47:06
 * @Desc: 多语言配置
 */
import fetch from '../utils/fetch';
import query from '../constants/query';

// 多语言分页
export function getLanguagesPage(params) {
  return fetch(query.GET_LANGUAGE_LIST, {
    method: 'post',
    params,
  });
}

// 多语言修改
export function doUpdateOrAdd(params) {
  return fetch(query.D0_LANGUAGE_ACTION, {
    method: 'post',
    params,
  });
}

// 批量删除
export function doBatchDelete(params) {
  return fetch(query.DO_LANGUAGE_DELETE, {
    method: 'post',
    params,
  });
}

// 配置多语言的列表接口
export function getDoBatchList(params) {
  return fetch(query.GET_BATCHLANGUAGE_LIST, {
    method: 'post',
    params,
  });
}

/**
 * 批量修改控件的语言
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function doBatchElement(params) {
  return fetch(query.DO_BATCHELEMENT_LANGUAGE, {
    method: 'post',
    params,
  });
}

/**
 * 切换语言
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function switchLangauge(params) {
  return fetch(query.SWITCH_LANGAUGE + params.keycode, {
    method: 'post',
  });
}
