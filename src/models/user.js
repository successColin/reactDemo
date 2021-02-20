/*
 * @Author: Fus
 * @Date:   2019-08-31 09:27:16
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-02-18 16:15:54
 * @Desc: 用户的状态数据
 */
import { getFunctionCenter, doSearchFunction } from '../services/function';
import { getFileRelation } from '@/services/fileManger';
import { getUserDetial } from '@/services/userManager';
import avatar from '@/assets/avatar.png';

// 已收藏的菜单列表
let collectedFunctionList = [];
export default {
  state: {
    functionList: [], // 菜单数据
    searchFunctionList: [], // 菜单数据，用于模糊查询
    userInfo: {}, // 用户信息
    personalPuaList: [], // 个人资质文件列表
    avatarInfo: avatar, // 头像
  },
  subscriptions: {
    // setup: (({ location, dispatch }) => {
    //   dispatch({
    //     type: 'getFunctionList',
    //   });
    // }),
  },
  effects: {
    // 获取用户信息
    // *getUserInfo(_, { put, select }) {
    //   const id = yield select(({ userInfo }) => userInfo.id);
    //   const userInfo = getUserDetial({ id });
    //   yield put({
    //     type: 'updateState',
    //     payload: { userInfo },
    //   })
    // },
    // 获取菜单数据
    * getFunctionList({ callback }, { put }) {
      const functionList = yield getFunctionCenter({}) || [];
      callback && callback(functionList);
      yield put({
        type: 'updateState',
        payload: {
          functionList,
          searchFunctionList: functionList,
        },
      });
    },
    * getFunctionListBySearch({ payload, callback }, { put }) {
      const list = yield doSearchFunction(payload) || [];
      callback && callback();
      yield put({
        type: 'updateState',
        payload: {
          searchFunctionList: list,
        },
      });
    },
    // 获取用户头像
    * getUserAvatar({ payload }, { put }) {
      const params = {
        relationId: payload.userId,
        relationTableName: 'user',
        relationTypeId: 1,
      };
      const avatarList = yield getFileRelation(params);
      const avatarInfo = avatarList.length ? avatarList[avatarList.length - 1].url : avatar;
      yield put({
        type: 'updateState',
        payload: { avatarInfo },
      });
    },
    // 获取用户个人资质
    * getPersonalPua({ payload }, { put }) {
      const params = {
        relationId: payload.userId,
        relationTableName: 'user',
        relationTypeId: 2,
      };
      const personalPuaList = yield getFileRelation(params);
      yield put({
        type: 'updateState',
        payload: { personalPuaList },
      });
    },
  },
  reducers: {
    // 通用性更新
    updateState(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
