/*
 * @Author: Fus
 * @Date:   2019-06-20 19:40:47
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-12-25 14:19:41
 * @Desc: 元素的常量
 */
export const ELEMENT_TYPE = {
  1: 'element.type.input',
  2: 'element.type.select',
  3: 'element.type.searchSelect',
  4: 'element.type.addBtn',
  5: 'element.type.editBtn',
  6: 'element.type.delBtn',
  7: 'element.type.saveBtn',
  8: 'element.type.upload',
  9: 'element.type.datePicker',
  10: 'element.type.textArea',
  11: 'element.type.splitLine',
  12: 'element.type.scanSearchSelect',
  13: 'element.type.imageText',
  14: 'element.type.inputSearch',
  15: 'element.type.radio',
  16: 'element.type.step',
  17: 'element.type.label',
  18: 'element.type.relationAddBtn',
  19: 'element.type.comboBox',
  20: 'element.type.stateSelect',
  21: 'element.type.prioritySelect',
  22: 'element.type.typeSelect',
  23: 'element.type.searchBtn',
  24: 'element.type.normalBtn',
  25: 'element.type.scan',
  26: 'element.type.archiveBtn',
  27: 'element.type.sqlEditor',
  28: 'element.type.normalArchiveBtn',
  // 29: 'element.type.batchSaveBtn',
  30: 'element.type.exportBtn',
  31: 'element.type.dateRangePicker',
  32: 'element.type.image',
  33: 'element.type.seniorFilter',
  34: 'element.type.batchArchiveBtn',
  35: 'element.type.batchNormalArchiveBtn',
  36: 'element.type.rate',
  37: 'element.type.summary',
  38: 'element.type.chart',
  39: 'element.type.textEditor',
  40: 'element.type.printBtn',
  41: 'element.type.boardChart',
  42: 'element.type.subTab',
  43: 'element.type.multiJumpBtn',
  44: 'element.type.multiTabBtn',
  45: 'element.type.checkmore',
  46: 'element.type.map',
  47: 'element.type.compositeControl',
  48: 'element.type.deviceScanningControl',
  49: 'element.type.prospectFrameGenerateBtn',
  // 50: 'element.type.qrCode',
};

// 不展示在首页报表的筛选条件中的控件
export const NOT_HOME_CHART_FILTER_ELEMENTS = [33, 37, 38];

// 配置界面中根据控件类型显示不同内容
export const ELEMENT_DETAIL_CONFIG = {
  hasMainTable: [2, 3, 12, 15, 17, 20, 21, 22, 25, 45], // 需要实体表和实体表字段的
  noRelationColumnName: [4, 5, 6, 8, 11, 13, 19, 23, 24, 26, 27, 28, 29, 30, 40, 50], // 不需要业务表字段的
  hasRelationTab: [3, 4, 5, 12, 17, 18, 19, 20, 21, 22, 23, 24, 25, 49], // 可以配置弹出面板的
  hasMultiRelation: [3, 12, 17, 45], // 可以配置多级实体表的
  hasJumpTypes: [1, 2, 3, 9, 10, 12, 15, 17, 20, 21, 22, 25, 27, 36, 45], // 可以配置跳转类型的控件
  hasRelationTabInList: [1, 2, 3, 4, 5, 9, 12, 17, 18, 19, 20, 21, 22, 23, 24, 25, 45, 49], // 可以配置跳转类型的控件
};

// 子面板能关联的面板
export const TAB_IN_SUBPANEL = [1, 9, 12];

// 属于下拉的控件
export const SELECT_ELEMETN_TYPE = [2, 20, 21, 22];

// 属于文件上传类的控件
export const UPLOAD_ELEMENT_TYPE = [8, 13];

// 需要实体过滤器的控件
export const FILTER_ELEMENT_TYPE = [
  ...SELECT_ELEMETN_TYPE, 15,
];

// 属于按钮的控件
export const BTN_ELEMENT_TYPE = [4, 5, 6, 7, 18, 23, 24, 26, 28, 29, 30, 34, 35, 40, 43, 44, 49];

// 在列表中展示的按钮
export const BTN_ELEMENT_IN_LIST = [4, 5, 6, 7, 18, 23, 24, 26, 28, 29, 30, 34, 35, 40, 49];

// 属于选择框的控件
export const SEARCH_SELECT_TYPE = [3, 12, 25, 45];

// 不需要便捷查询的控件
export const NOT_NEED_SEARCH_BTN = [4, 5, 6, 7, 8, 11, 13, 14, 16, 18, 19, 23, 24, 26, 27, 28, 29, 30, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

// 高级筛选中不显示的控件
export const ELEMENT_TYPE_NOT_IN_FILTER = [8, 10, 15, 17, 11, 13, 16, 19, 27, 31, 32, 33, 36, 37, 38, 39, 41, 42, 46];

// 在列表中不显示的控件
export const HIDE_IN_LIST_ELEMENT_TYPE = [
  ...BTN_ELEMENT_TYPE,
  11, 12, 14, 16, 19, 25, 27, 33, 37, 38, 39, 40, 49];

// 下拉框格式类型
export const SELECT_FORMAT_TYPE = {
  1: 'select.format.normal',
  2: 'select.format.cascade',
};

// 需要数据格式类型的控件
export const NEED_DATAFORMAT_TYPE = [9, 30];

// 选择框格式类型
export const SEARCH_SELECT_FORMAT_TYPE = {
  1: 'searchSelect.format.normal',
  2: 'searchSelect.format.errorCodeCascade',
};

// 普通按钮刷新类型
export const NORMAL_BTN_FORMAT_TYPE = {
  0: 'global.null',
  1: 'normalBtn.refresh.activeTab',
  2: 'normalBtn.refresh.prevTab',
  3: 'normalBtn.refresh.frame',
  4: 'normalBtn.refresh.layerByBayer',
};
// 需要跳转菜单的控件
export const HASE_JUMP_TO_FILE_TYPE = [24, 27, 37];

// 输入框格式类型
export const INPUT_FORMAT_TYPE = {
  0: 'global.null',
  1: 'input.format.nfc',
  2: 'input.format.code',
  // 3: 'input.format.scan',
};

// 导出按钮导出类型
export const EXPORT_BTN_FORMAT_TYPE = {
  // 0: 'global.null',
  1: 'normalBtn.exportType.all',
  2: 'normalBtn.exportType.part',
};

// 导出按钮导出类型
export const QR_FORMAT_TYPE = {
  1: 'code.qr.all',
  2: 'code.bar.part',
};

// 图片上传格式类型
export const UPLOAD_ELEMENT_FORMAT = {
  1: 'upload.format.businessImg',
  2: 'upload.format.unBusinessImg',
};

// 日期选择框格式
export const TIME_FORMATE_TYPES = {
  1: 'YYYY-MM-DD HH:mm:ss',
  2: 'YYYY-MM-DD',
  3: 'DD-MM-YYYY HH:mm:ss',
};

// 时间无值时对应默认值
export const TIME_DEFAULT_VALUES = ['1970-01-01 00:00:00', '1970-01-01'];

// 列表column中不需要显示的控件类型
export const LIST_COLUMN_IGNORE_TYPE = [
  ...BTN_ELEMENT_TYPE,
  14,
];

// 有前端触发器【数据变化】类型的控件
export const TRIGGER_ELEMENT_TYPE = {
  dataChange: [...FILTER_ELEMENT_TYPE, 1, 9],
  assignValue: SEARCH_SELECT_TYPE,
  click: BTN_ELEMENT_TYPE,
  calculateProps: [1, 9], // 计算属性
};

// 需要生成隐藏项的控件
export const HIDDEN_ELEMENT_TYPE = [3, 8, 9, 17, 45];

// 有隐藏项的显示项控件前缀/或空字段名控件前缀
export const IGNORE_FORM_ITEM = 'IGNORE_FORM_ITEM_';
// 空字段名的控件
export const EMPTY_ITEM = 'EMPTY_ITEM';

// 不允许提交数据的控件
export const NO_SUBMIT_ELEMENT_TYPE = [4, 5, 6, 7, 11, 14, 16, 17, 18, 24, 26, 28, 29, 30, 33, 34, 35, 40, 43, 44, 46];

// 相同数据属性的控件类型
export const ELEMENT_CONFIG_TYPE = {
  hasIcon: [4, 5, 6, 7, 11], // 基础信息中有图标的控件
  full: [3, 2, 12, 20, 21, 22], // 包含关联表、字段id、字段编码、字段名称、描述的控件
  tableAndMemo: [4, 5, 6], // 关联表和描述的控件
  onlyMemo: [1, 10, 9, 7, 8, 11], // 只有描述的控件
};

// APP中需要在控件上添加二维码值的控件集合
export const ELEMENT_NEED_QR_TYPE = [12, 25, 45];

// 元素控件的图标颜色
export const ELEMENT_COLOR = ['#E55C61', '#9278B9', '#60B0A7', '#F57D50', '#FAB71C', '#7081B2', '#d26c70', '#6625F5'];


// 字段值类型
export const RELATION_COLUMN_TYPE = {
  1: 'varchar',
  2: 'int',
  3: 'datetime',
  4: 'decimal',
  5: 'text',
  6: 'blob',
  7: 'tinyint',
};

// 属于数字的字段类型
export const NUMBER_COLUMN_TYPE = [2, 4, 7];

// 属于字符串的字段类型
export const STRING_COLUMN_TYPE = [1, 3, 5, 6];

// 行编辑中的下拉框
export const SELECT_IN_LIST = [2, 20, 21, 22];
// 在行编辑中可以数据变化的控件
export const BTN_IN_LIST_COL = [1, 9, 10, ...SELECT_IN_LIST];
// 行编辑中的控件
export const BASETYPE_IN_EDIT_COL = [1, 3, 9, 10, ...SELECT_IN_LIST];

// 在行编辑中存在的按钮
export const BTN_IN_EDIT_LIST = [7, 43, 44];


