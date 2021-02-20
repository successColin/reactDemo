/*
 * @Author: Fus
 * @Date:   2019-04-24 14:13:11
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-03-19 10:31:21
 * @Desc: 全局通用
 *  包括：主题、国际化等
 */
import pathToRegexp from 'path-to-regexp';
import locales from '../locales/index';
import { THEME_COLOR } from '@/constants/global';
import { getVariableValue } from '@/services/globalcenter';
import {
  getHomePageConfig,
  getThirdLinkList,
  getHelpDocList,
  getHelpDocTypeId,
  getQBList,
} from '@/services/mainPageConfig';
import { getSystemVersionList } from '@/services/versionConfig';

const { langLib } = locales;

export default {
  state: {
    lang: 'zh', // 本地站点的国际化， zh-中文，en-英文
    langLib: langLib.zh, // 本地语言包内容
    theme: 'blue', // 主题
    showSidebar: false, // 是否显示sidebar
    showMenuCenter: false, // 是否显示菜单中心（用于样式管理）
    reportDomain: '', // 报表域名
    mainPageConfig: {// 主页配置
      basicData: {}, // 基本信息
      thirdLink: [], // 三方链接
      helpDoc: [], // 帮助文档
      helpDocTypeId: null, // 帮助文档的文件类型id
      userCenterActiveTab: '', // 用户中心当前面板
    },
    systemVersion: {}, // 版本信息
    QBList: [], // 二维码数组
    vedioVisible: false, // 视频弹框
    vedioUserList: [], // 正在视频的用户
  },
  subscriptions: {
    setup: (({ history, dispatch }) => {
      history.listen(location => {
        const matchMainPage = pathToRegexp('/').exec(location.pathname);
        if (matchMainPage) {
          // dispatch({ type: 'getReportDomain' }); // 报表域名
          // dispatch({ type: 'getMainPageBasicConfig' }); // 主页配置基本信息
          // dispatch({ type: 'getMainPageThirdLink' }); // 三方链接
          // dispatch({ type: 'getMainPageHelpDoc' }); // 帮助文档
          // dispatch({ type: 'getSystemVersion' }); // 版本信息
          // dispatch({ type: 'getQBlists' }); // app二维码
        }
      });
    }),
  },
  effects: {
    // 获取版本信息
    * getSystemVersion({ payload }, { put, call }) {
      const result = yield getSystemVersionList({ pageSize: 1, pageNum: 1, basetype: 1 });
      const { list = [] } = result;
      const systemVersion = list.length ? list[0] : {};
      yield put({
        type: 'updateState',
        payload: {
          systemVersion,
        },
      });
    },
    // 获取报表域名
    * getReportDomain({ payload }, { put, call }) {
      const reportDomain = yield getVariableValue({ variableName: 'ReportDoMain' });
      yield put({
        type: 'updateState',
        payload: {
          reportDomain,
        },
      });
    },
    // 获取主页配置基本信息
    * getMainPageBasicConfig({ payload }, { put, call }) {
      const basicData = yield getHomePageConfig({});
      const { enabledAccountInformation, enabledPersonalQualification, enabledAccountSecuritySettings } = basicData;
      let userCenterActiveTab = '';
      if (enabledAccountInformation) {
        userCenterActiveTab = 'basicInfo';
      } else if (enabledPersonalQualification) {
        userCenterActiveTab = 'personalPua';
      } else if (enabledAccountSecuritySettings) {
        userCenterActiveTab = 'securitySetting';
      }
      document.title = basicData.companyName || 'APIoT EAM2.0';
      yield put({
        type: 'updateMainPageConfig',
        payload: {
          item: {
            basicData,
            userCenterActiveTab,
          },
        },
      });
      localStorage.setItem('topt', basicData.headerStyle);
      localStorage.setItem('hhh', basicData.systemLogoHeight || 25);
      let themeType = THEME_COLOR.find(item => item.id === basicData.themeColor);
      let theme = (themeType && themeType.type) || 'blue';
      yield put({
        type: 'updateTheme',
        payload: {
          theme,
        },
      });
    },
    // 获取主页配置三方链接
    * getMainPageThirdLink({ payload = {} }, { put, call }) {
      const { callback } = payload;
      const thirdLink = yield getThirdLinkList({});
      yield put({
        type: 'updateMainPageConfig',
        payload: {
          item: {
            thirdLink,
          },
        },
      });
      callback && callback(thirdLink);
    },
    // 获取主页配置帮助文档
    * getMainPageHelpDoc({ payload = {} }, { put, call, select }) {
      //   const id = yield select(({ userInfo }) => userInfo.id);
      let typeId = yield select(({ global }) => global.mainPageConfig.helpDocTypeId);
      if (!typeId) {
        const typeIdObj = yield getHelpDocTypeId({ keycode: 'HELPDOCUMENT' }) || {};
        typeId = typeIdObj.id;
      }
      const { callback } = payload;
      if (!typeId) return;
      const helpDoc = yield getHelpDocList({ typeId });
      yield put({
        type: 'updateMainPageConfig',
        payload: {
          item: {
            helpDoc,
            helpDocTypeId: typeId,
          },
        },
      });
      callback && callback(helpDoc);
    },
    * getQBlists({ payload = {} }, { put, call }) {
      const list = yield getQBList({});
      yield put({
        type: 'updateState',
        payload: {
          QBList: list,
        },
      });
    },
  },
  reducers: {
    // 主页配置
    updateMainPageConfig(state, { payload }) {
      const { item } = payload;
      const { mainPageConfig } = state;
      return {
        ...state,
        mainPageConfig: {
          ...mainPageConfig,
          ...item,
        },
      };
    },
    // 中英文切换
    updateLang(state, { payload }) {
      const { lang } = payload;
      return {
        ...state,
        lang,
        langLib: langLib[lang],
      };
    },
    // 更新主题
    updateTheme(state, { payload }) {
      const { theme } = payload;
      return { ...state, theme };
    },
    // 更新 是否显示sidebar
    updateShowSidebar(state, { payload }) {
      const { showSidebar } = payload;
      return { ...state, showSidebar };
    },
    // 通用性更新
    updateState(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
