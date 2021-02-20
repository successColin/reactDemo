const initState = {
  useInfo: {}, // 当前用的视频信息
};

export default {
  state: {
    ...initState,
  },
  subscriptions: {},
  effects: {},
  reducers: {
    // 通用性更新
    updateState(state, { payload }) {
      return { ...state, ...payload };
    },
    // 清除数据
    clearState(state) {
      return { ...initState };
    },
  },
};
