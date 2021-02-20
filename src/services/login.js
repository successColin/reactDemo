import fetch from '../utils/fetch';
import query from '../constants/query';

/**
 * 登入
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function login (params) {
  return fetch(query.LOGIN, {
    method: 'post',
    params,
    contentType: 'login',
  });
}

/**
 * 获取验证码图片
 * @returns {Promise | Promise<unknown>}
 */
export function getCode () {
  return fetch(query.GETCODE, {
    method: 'get',
  });
}

/**
 * 获取背景图片
 * @param params
 */
export function getUrl (params) {
  return fetch(query.LOGIN_SELECTLINE, {
    method: 'post',
    params,
  });
}
/**
 * IT资产单点登录
 * @param params
 */
export function ssoByAccount (params) {
  return fetch(query.SSO_BY_ACCOUNT, {
    method: 'post',
    params,
  });
}
/**
 * IT资产单点登录
 * @param params
 */
export function getLoginAccount (params) {
  return fetch('http://webqas02.shanghai-electric.com/NAUTHM/services/api/account/login', {
    method: 'post',
    params,
  });
}

/**
 * 发送短信验证码
 * @param telephone[String]
 */
export function getCodeByMsg (telephone) {
  return fetch(`${query.GET_CODEBYMSG}?telephone=${telephone}`, {
    method: 'get',
  });
}

/**
 * saas登入
 * @param params
 * @returns {*|Promise|Promise<unknown>}
 */
export function loginSaas (params) {
  return fetch(query.LOGIN_SAAS, {
    method: 'post',
    params,
  });
}

/**
 * 完善用户信息
 * @param params
 * @param token
 * @returns {*|Promise|Promise<unknown>}
 */
export function perfectPersonalInfo (params, token) {
  return fetch(query.PREFECT_USERINFO, {
    method: 'post',
    params,
    headers: { token }
  });
}