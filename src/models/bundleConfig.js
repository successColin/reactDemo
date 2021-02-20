/*
 * @Author: Fus
 * @Date:   2019-08-17 09:26:11
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-26 11:00:27
 * @Desc: 移动端bundle配置界面数据
 */

 // 初始状态数据
const initState = {
  // seniorFilterList: [], // 高级筛选数据
  bundleData: {}, // bundle的详情数据
  activeTabKey: 'frameConfig', // 当前面板key
  elementListMap: {}, // 元素列表map（[tabId]: [array])
  mobileFrameList: [], // 框架列表信息
  mobileTabList: [], // 面板列表
  mobileFrameTypeDto: {}, // 框架类型信息
  queryListMap: {}, // 过滤条件map（[tabId]: [array]）
  frameDetail: {}, // 当前用户设计组框架详情
  systemParams: { // 系统层级参数
    planned: '',
    userDesignerId: '',
  },
  // tabList: [], // 面板信息
  // functionId: -1, // 当前菜单id
  tabBasicData: {}, // 当前面板基本信息
  // tabElementList: [], // 当前面板的控件列表
  // tabFilterCond: {}, // 当前面板的过滤条件
  tabEditStatus: { // 面板中各模块的编辑状态,示例如下：
    // [tabId]: {
    //   basicProps: false,
    //   elementList: false,
    //   filterCond: false,
    // }
  },
  addTabDetail: {}, // 需要增加的tab信息（从预设界面、当前菜单选择后的数据）
  // userDesignerId: -1, // 设计组id
  // selectedUserDesignerDetail: {}, // 已选择的用户组数据
  // activeTreeNodeDetail: {}, // 树节点信息
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
    clearState(state) {
      return { ...initState };
    },
  },
};
