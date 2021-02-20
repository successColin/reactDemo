/*
 * @Author: Fus
 * @Date:   2019-08-07 15:03:40
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-10-22 10:48:19
 * @Desc: 界面配置常量
 */
// 数据响应类型
export const DATA_RESPONSE_TYPE = {
  1: 'dataResponseType.1',
  // 2: 'dataResponseType.2',
  3: 'dataResponseType.3',
};

// 面板类型
export const PAGE_TAB_TYPE = {
  1: 'tab.type.normal',
  2: 'tab.type.dialog',
  3: 'tab.type.group',
  4: 'tab.type.report',
  5: 'tab.type.flowApprove',
  6: 'tab.type.explorer',
  7: 'tab.type.searchSelectList',
  8: 'tab.type.outlook',
};
// 面板展示类型
export const PAGE_TAB_SHOW_TYPE = {
  1: 'tab.showType.list',
  2: 'tab.showType.form',
  3: 'tab.common.left',
  4: 'tab.showType.busRelRecord',
  5: 'tab.showType.searchSelect',
  6: 'tab.showType.batch',
  7: 'tab.showType.file',
  8: 'tab.showType.msgPreview',
  9: 'tab.showType.progress.panel',
  10: 'tab.showType.bpmn.panel',
  11: 'tab.showType.jumpurl.panel',
  12: 'tab.showType.equipment.inventory',
};

// 属于列表的展示类型
export const LIST_TAB_SHOW_TYPES = [1, 4, 5];
// 属于列表的类型
export const LIST_TAB_TYPES = [7];
// 属于表单的展示类型
export const FORM_TAB_SHOW_TYPES = [2, 6];

// 不需要数据源的面板
export const NOT_NEED_DATASOURCE_TYPES = [6, 7];

// 不需要数据源的展示类型
export const NOT_NEED_DATASOURCE_SHOW_TYPES = [11];

// 节点格式
export const NODE_FORMAT_TYPE = {
  1: 'nodeFormat.1',
  2: 'nodeFormat.2',
  3: 'nodeFormat.3',
};

// 图表及汇总控件行宽
export const HOME_CHART_COLSPAN_TYPE = {
  4: 'colSpan.6',
  6: 'colSpan.4',
  16: 'colSpan.2/3',
  8: 'colSpan.3',
  12: 'colSpan.2',
  24: 'colSpan.1',
};

// 行宽类型
export const COLSPAN_TYPE = {
  8: 'colSpan.3',
  12: 'colSpan.2',
  24: 'colSpan.1',
  105: 'colSpan.105',
  110: 'colSpan.110',
  115: 'colSpan.115',
  120: 'colSpan.120',
};
// 移动端行宽类型
export const MOBILE_COLSPAN_TYPE = {
  0: 'colSpan.0',
  8: 'colSpan.3',
  12: 'colSpan.2',
  24: 'colSpan.1',
  105: 'colSpan.105',
  110: 'colSpan.110',
  115: 'colSpan.115',
  120: 'colSpan.120',
};
// 大屏看板布局类型
export const BOARD_COLSPAN_TYPE = {
  1: 'board.colSpan.left',
  2: 'board.colSpan.center',
  3: 'board.colSpan.right',
};

// 大屏看板的控件展示类型
export const BOARD_SHOW_TYPE = {
  1: 'board.showType.number',
  2: 'board.showType.iconText',
  3: 'board.showType.chart',
};


// 框架类型
export const FRAME_PAGE_TYPE = {
  1: 'framePageConfig.frameType.1',
  2: 'framePageConfig.frameType.2',
  3: 'framePageConfig.frameType.3',
  4: 'framePageConfig.frameType.4',
};


// 面板过滤条件-值类型
export const TAB_FILTER_VALUE_TYPE = {
  1: 'global.value',
  2: 'global.variate',
};
// 面板过滤条件-关系类型
export const TAB_FILTER_COND_TYPES = ['and', 'or'];

// 排序类型
export const ORDER_BY_TYPE = {
  1: 'order.esc',
  2: 'order.desc',
};

// SQL编辑器应用于类型（小水滴）
export const SQLEDITOR_APPLY_TO_TABLE_TYPE = {
  1: 'sqlEditor.applyToTable.group',
  2: 'sqlEditor.applyToTable.data',
  3: 'sqlEditor.applyToTable.all',
  4: 'sqlEditor.applyToTable.none',
};

// 选择框展示类型
export const SEARCH_SELECT_SHOW_TYPE = {
  1: 'searchSelect.type.tree',
  2: 'searchSelect.type.list',
  3: 'searchSelect.type.both',
};


// 过滤器值类型
export const FILTER_CONFIG_VALUE_TYPE = {
  1: 'global.value',
  2: 'global.variate',
  3: 'filterConfig.valueType.sql',
};

// label取值字段类型
export const LABEL_VALUE_FIELD_TYPE = {
  1: 'settingForm.relationColumnName',
  2: 'settingForm.mainColumnName',
};

// 数据格式
export const DATA_FORMAT_TYPE = {
  0: 'global.null',
  1: 'dataFormat.type.dateRange',
};
// 数据格式
export const EXPORT_DATA_FORMAT_TYPE = {
  0: 'global.no',
  2: 'global.yes',
};
// 数据格式
export const SELECT_OF_NORMALBTN_TYPE = {
  0: 'global.null',
  1: 'select.type.one',
  2: 'select.type.more',
};

// app分组的风格类型
export const APP_GROUP_STYLE = {
  1: 'appHomeConfig.groupTitle.1',
  2: 'appHomeConfig.groupTitle.2',
  3: 'appHomeConfig.groupTitle.3',
  4: 'appHomeConfig.groupTitle.4',
};
// app个人中心分组的风格类型
export const APP_USERCENTER_GROUP_STYLE = {
  1: 'appHomeConfig.groupTitle.1',
};

// app个人中心固定模块显示与否状态
export const APP_SHOW_TYPE = ['global.show', 'global.notShow'];
export const APP_SHOW_TYPE_MAP = {
  'global.show': 1,
  'global.notShow': 0,
};
