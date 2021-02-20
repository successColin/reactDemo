/*
 * @Author: Fus
 * @Date:   2019-08-17 11:16:41
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-09 11:03:51
 * @Desc: 触发器配置
 */
const initState = {
  triggerType: 1, // 触发器类型
  triggerEventConfig: {}, // 触发器配置项（由表单项传入）
  eventData: [], // 触发器及事件列表（包括触发的字段等新信息）
  activeEventId: 0, // 当前触发器事件id
  selectedElement: [], // 当前触发器事件下已选的控件列表（用于新增选择控件）
  tabElementList: [], // 面板下的控件列表
  selectConfig: {}, // 选择控件配置
  procedureDetail: {}, // 存储过程详情
  procedureTypeList: [], // 存储过程类型
  httpRequestInfo: {}, // http触发器详情
  jsFunctionInfo: {}, // js触发器详情
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
    resetTriggers(state, { payload }) {
      return {
        ...state,
        eventData: [],
        activeEventId: 0,
        selectedElement: [],
      };
    },
    // 重置所有数据
    clearState() {
      return { ...initState };
    },
  },
};
