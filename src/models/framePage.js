/*
 * @Author: Fus
 * @Date:   2019-08-17 09:26:11
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-25 16:40:09
 * @Desc: 配置界面数据（设计组菜单模块）
 */
import { doUpdateTabBasicData, doUpdateTabElementData } from '@/services/framePage';

 // 初始状态数据
const initState = {
  // seniorFilterList: [], // 高级筛选数据
  frame: {}, // 框架信息
  frameTypeDto: {}, // 框架类型信息
  tabList: [], // 面板信息
  functionId: -1, // 当前菜单id
  tabBasicData: {}, // 当前面板基本信息
  tabElementList: [], // 当前面板的控件列表
  tabFilterCond: {}, // 当前面板的过滤条件
  tabEditStatus: { // 面板中各模块的编辑状态,示例如下：
    // [tabId]: {
    //   basicProps: false,
    //   elementList: false,
    //   filterCond: false,
    // }
  },
  apiList: [], // 第三方接口
  addTabDetail: {}, // 需要增加的tab信息（从预设界面、当前菜单选择后的数据）
  userDesignerId: -1, // 设计组id
  selectedUserDesignerDetail: {}, // 已选择的用户组数据
  activeTreeNodeDetail: {}, // 树节点信息
};

export default {
  state: initState,
  subscriptions: {},
  effects: {
    // // 保存面板基本信息
    // * jsonTabBasicData(_, { select }) {
    //   const { tabBasicData } = yield select(({ framePage }) => framePage);
    //   const params = { ...tabBasicData };
    //   doUpdateTabBasicData(params);
    // },
    // // 保存面板的控件列表
    // * jsonTabElementList(_, { select }) {
    //   const { tabElementList, tabBasicData } = yield select(({ framePage }) => framePage);
    //   const params = { elementList: tabElementList, id: tabBasicData.id };
    //   doUpdateTabElementData(params);
    // },
  },
  reducers: {
    // 通用性更新
    updateState(state, { payload }) {
      return { ...state, ...payload };
    },
    // 重置数据
    clearState() {
      return initState;
    },
    // 更新整体框架及面板信息
    updateMainData(state, { payload }) {
      const { mainData } = payload;
      return { ...state, mainData };
    },
    // 更新面板信息
    updateTabList(state, { payload }) {
      const { tabList } = payload;
      return { ...state, tabList };
    },
    // 仅更新框架信息
    updateFrameData(state, { payload }) {
      const { frame } = state;
      return {
        ...state,
        frame: {
          ...frame,
          ...payload,
        },
      };
    },
  },
};
