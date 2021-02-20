/*
 * @Author: Yzj
 * @Date:   2020年5月8日10:20:07
 * @Last Modified by: Yzj
 * @Last Modified time: 2020年5月8日10:20:24
 * @Desc: 图形导航配置状态管理
 */
const initState = {
  controlStatus: null,
  canvasState: 'default',
  visualLoading: false,
  drawType: '',
  canvasZoom: 1,
  visualMapGroupID: 0,
  visualMapID: 0,
  visualMapRootID: 0,
  userDesignerId: 0,
  fullScreenState: false,
  isShowUpBackground: false,
  imgUrl: '',
  isSave: true,
  isDeleteVisual: false,
  isZoomConfigVisible: false, // 控制图层配置是否显示
  zoomConfig: {}, // 图层配置信息
};
export default {
  state: initState,
  subscriptions: {},
  effects: {},
  reducers: {
    // 通用性更新
    updateState(state, { payload }) {
      return { ...state, ...payload };
    },
    // 重置数据
    clearState() {
      return initState;
    },
  },
};
