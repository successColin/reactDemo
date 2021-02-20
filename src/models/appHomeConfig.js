/*
 * @Author: Fus
 * @Date:   2019-08-17 09:26:11
 * @Desc: APP主页配置
 */

// 初始状态数据
const initState = {
  mainTabKey: 1, // 主面板key（appHome-app主页配置，userCenter-个人中心配置）
  appData: {}, // APP数据
  activeBundle: {}, // 当前bundle数据
  areaCode: '', // 功能区块编码（前端自定义，根据该区块编码获得对应functionaltype， functionalsubtype
  groupData: {}, // 分组数据
  actionType: '', // 当前操作类型（addGroup-新增组  editGroup-编辑组）
  // bundleLibraryId: '', // bundle id
  // oldBundleId: '', // 原组件id
  leftList: [], // 顶部左侧功能
  rightList: [], // 顶部右侧功能
  apiList: [], // 第三方接口数据
  topCoreList: [], // 顶部核心功能
  workSpaceList: [], // 工作区功能
  myWorkSpaceList: [], // 个人中心的bundle分组
  bottomList: [], // 底部功能
  figureList: [], // 轮播图
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
    // 清除数据
    clearState() {
      return { ...initState };
    },
  },
};
