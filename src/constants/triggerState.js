/*
 * @Author: Fus
 * @Date:   2019-08-27 09:45:59
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-04-03 10:00:14
 * @Desc: 触发器的常量
 */


// 触发器事件类型
export const TRIGGER_EVENT_TYPE = {
  1: 'triggerEvent.event.click',
  2: 'triggerEvent.event.dataChange',
  3: 'triggerEvent.event.assignValue',
  4: 'triggerEvent.event.onLoad',
  5: 'triggerEvent.event.props',
};

// 值类型
export const TRIGGER_VALUE_TYPE = {
  1: 'global.value',
  2: 'global.variate',
};

// 后台触发器选择类型
export const DATA_TRIGGER_TYPE = {
  1: 'global.add',
  2: 'global.edit',
  3: 'global.del',
  4: 'global.archive',
  5: 'global.addEdit',
};

// 方法 下拉选项
export const METHOD_TYPE = {
  0: 'global.null',
  1: 'triggerEvent.method.add',
  2: 'triggerEvent.method.minus',
};

// 比较符
export const TRIGGER_CONDITION = {
  1: '>',
  2: '<',
  3: '=',
  4: '>=',
  5: '<=',
  6: '!=',
  7: 'null',
  8: '!null',
  9: 'triggerEvent.customFunction',
};

// 自定义方法类型
export const CUSTOM_FUNCTION_TYPE = {
  1: 'AND',
  2: 'OR',
};

// 自定义方法的json串模板
export const JSON_TEMPLATE = JSON.stringify([{
  key: '@@moId',
  cond: '>',
  value: '100',
}, {
  key: '@@count',
  cond: '=',
  value: '@@totalNumber',
}]);

// 跳转菜单参数
export const JSON_TEMPLATE_FILE = JSON.stringify([{ key: '@@deviceid', value: '@@deviceid' }, {
  key: '@@stateid',
  value: '@@stateid',
}, {
  key: '@@type',
  value: 1,
  type: 2,
  tableName: 'device',
}]);
// 跳转菜单参数
export const JSON_EXECUTECONDITION_TEMPLATE_FILE = JSON.stringify({
    formula: [{
      key: '@@moId',
      cond: '>',
      value: 100,
    }, { key: '@@count', cond: '=', value: '@@totalNumber' }], fortype: 'or', isTrue: '', isFalse: '请先选择一行',
  },
);

// 高级筛选中比较符
export const FILTER_CONDITION = {
  1: '>',
  2: '<',
  3: '=',
  4: '>=',
  5: '<=',
  6: '!=',
};


// 请求方式
export const QUERY_METHOD_TYPES = {
  1: 'GET',
  2: 'POST',
  3: 'PUT',
  4: 'DELETE',
};
