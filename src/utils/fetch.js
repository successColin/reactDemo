/*
 * @Author: Fus
 * @Date:   2019-06-17 16:44:49
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-04-08 10:54:18
 * @Desc: 请求工具
 */
import axios from 'axios';
import { message } from 'antd';
import qs from 'qs';
import router from 'umi/router';
import { CMessage } from '@/components/common/BasicWidgets';
import { getCookie, RemoveCookie, GetCookieDomain, setCookie } from '@/utils/common';
import { getVariableValue } from '@/services/globalcenter';
import { URL_PREFIX } from '@/constants/global';
import { logout } from '@/services/userCenter';

axios.defaults.withCredentials = true;
const initMsg = '请求错误';
const codeMessage = {
  // 200: '服务器成功返回请求的数据。',
  // 201: '新建或修改数据成功。',
  // 202: '一个请求已经进入后台排队（异步任务）。',
  // 204: '删除数据成功。',
  400: '请求错误(400)',
  401: '未授权，请重新登录(401)',
  403: '拒绝访问(403)',
  404: '请求出错(404)',
  406: '格式出错(406)',
  408: '请求超时(408)',
  410: '资源已被删除(410)',
  422: '验证错误(422)',
  500: '服务器错误(500)',
  501: '服务未实现(501)',
  502: '网络错误(502)',
  503: '服务不可用(503)',
  504: '网络超时(504)',
};

// let token = localStorage.getItem('token') || '';
let token = getCookie('token');
let defaultHeaders = {
  token,
  'content-type': 'application/x-www-form-urlencoded', // 转换为key=value的格式必须增加content-type
  'Access-Control-Allow-Origin': 'http://localhost:8000',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'X-Requested-width, Content-type',
  'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
};
let service = axios.create({
  // baseURL: 'http://rap2api.taobao.org/app/mock/167573',
  baseURL: '/',
  timeout: 30000,
  headers: defaultHeaders,
  // transformRequest: [data => {
  //   return qs.stringify(data);
  // }],
});
let cancel, promiseArr = {};
const CancelToken = axios.CancelToken;

// http-请求拦截
service.interceptors.request.use(
  config => {
    if (config.cancelRepeat) {
      if (promiseArr[config.url]) { // 发起请求时，取消掉当前正在进行的相同请求
        promiseArr[config.url]('cancel 操作取消');
        promiseArr[config.url] = cancel;
      } else {
        promiseArr[config.url] = cancel;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// http-响应拦截
service.interceptors.response.use(
  response => {
    // if (response.data.code === 2) { // 返回code码为2的时候,代表登录失效
    //   window.location.href = '/login';
    // }
    return response;
  },
  error => {
    const errStr = JSON.stringify(error);
    const errMsg = error.message || '';
    console.log(error, errStr, error.message, error.code, 'aaa error');
    if (errMsg.indexOf(401) !== -1) {
      getVariableValue({ variableName: 'LoginOUTURL' }).then(res => {
        if (res) {
          window.location.href = res;
        } else {
          // window.location.href = `${URL_PREFIX}/login`;
          router.push(`${URL_PREFIX}/login`);
        }
      });
      setCookie('token', null, 0);
      setCookie('eaminfo', null, 0);
      document.cookie = `token=null; max-age=0; domain=${GetCookieDomain()};path=/`;
      document.cookie = `eaminfo=null; max-age=0; domain=${GetCookieDomain()};path=/`;
      // CMessage(codeMessage[401]);
      token = '';
      // message.error(codeMessage[401]);
      return;
    }
    if (errMsg.indexOf('timeout of') !== -1) {
      message.error('请求超时');
      return;
    }
    if (errMsg === 'Network Error') {
      // if (errStr.indexOf('timeout') !== -1) {
      message.error('网络异常');
      return;
    } else if (errMsg.indexOf('cancel') !== -1) {
      console.log('aaa 操作取消');
      return;
    }
    message.error('请求错误');
    console.log(error, 'aaa error');
    return Promise.reject(error);
  },
);

// 异常处理

// 返回错误处理
const onError = (res) => {
  if (res) {
    const errortext = codeMessage[res.status];
    message.error((res.data && res.data.msg) || errortext || initMsg);
  } else {
    console.log(res, 'error 操作取消');
  }
};

export default function fetch (url, {
  method,
  params,
  contentType = 'json',
  cancelRepeat = false,
  headers = {},
}) {
  return new Promise((resolve, reject) => {
    const configs = {
      method,
      url,
      cancelRepeat,
      cancelToken: new CancelToken(c => {
        cancel = c;
      })
    };
    const token = getCookie('token');
    defaultHeaders.token = token;
    if (method === 'get') {
      configs.params = params;
      configs.headers = {
        ...defaultHeaders,
        token,
      };
    } else {
      if (contentType === 'text') {
        configs.headers = {
          ...defaultHeaders,
          'content-type': 'text/plain;charset=UTF-8',
        };
        configs.data = params;
      } else if (contentType === 'json') {
        configs.headers = {
          ...defaultHeaders,
          token,
          'content-type': 'application/json;charset=UTF-8',
        };
        configs.data = params;
      } else if (contentType === 'form') {
        configs.headers = {
          ...defaultHeaders,
          'content-type': 'application/form-data',
        };
      } else if (contentType === 'excel') {
        configs.headers = {
          ...defaultHeaders,
          'content-type': 'application/vnd.ms-excel;charset=UTF-8',
        };
      } else if (contentType === 'login') {
        configs.headers = {
          ...defaultHeaders,
          'content-type': 'application/x-www-form-urlencoded',
        };
        delete configs.headers.token;
        configs.data = qs.stringify(params);
      } else {
        configs.data = qs.stringify(params);
      }
    }
    const c = getCookie('token')
    console.log(c)
    configs.headers = { ...configs.headers, ...headers }
    service(configs).then(res => {
      if (res) {
        if (res.data && (res.data.success || res.data.isError === false)) {
          resolve(res.data.data);
          return;
        }
        onError(res);
      }
      reject(res);
    });
  });
};
