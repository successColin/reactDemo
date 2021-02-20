/*
 * @Author: Fus
 * @Date:   2019-08-21 15:38:31
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-21 15:38:57
 * @Desc: 面板配置数据中心
 */

export default {
  state: {
  },
  subscriptions: {},
  effects: {},
  reducers: {
    // 通用性更新
    updateState(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};