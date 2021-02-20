/*
 * @Author: Yzj
 * @Date:   2020年5月8日10:20:07
 * @Last Modified by: Yzj
 * @Last Modified time: 2020年5月8日10:20:24
 * @Desc: 图形导航状态管理
 */

export default {
  state: {
    controlStatus: null,
    canvasState: 'default',
    visualLoading: false,
    canvasZoom: 1,
    visualMapGroupID: 0,
    visualMapID: 0,
    visualMapRootID: 0,
    userDesignerId: 0,
    fullScreenState: false,
    isShowUpBackground: false,
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
