/*
 * @Author: Fus
 * @Date:   2019-06-17 16:38:02
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-12-31 17:01:24
 * @Desc: 全站通用方法
 */
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import _ from 'lodash';
import { CMessage } from '@/components/common/BasicWidgets';
import { TRIGGER_CONDITION } from '@/constants/triggerState';
import { getNormalSearchDetail, getCheckBoxSearchDetail } from '@/services/frame';
import {
  IGNORE_FORM_ITEM,
  EMPTY_ITEM,
  TIME_FORMATE_TYPES,
  TIME_DEFAULT_VALUES,
  SELECT_ELEMETN_TYPE,
  SEARCH_SELECT_TYPE,
  NUMBER_COLUMN_TYPE,
  STRING_COLUMN_TYPE,
  FILTER_ELEMENT_TYPE,
  BTN_ELEMENT_TYPE,
} from '../constants/element';
import { NEED_CLEAR_SATATE_TABS } from '@/constants/global';

/**
 /**
 * 计算时长
 * @param {moment|string} startTime 开始时间
 * @param {moment|string} endTime 结束时间
 */
export const getDuration = (langLib, startTime, endTime, otherType) => {
  if (!startTime || !endTime) return;
  if (moment(startTime).isAfter(endTime)) { // 开始时间大于结束时间
    CMessage(langLib['message.error.startTimeAfterEndTime'], 'error');
    return;
  }
  const type = getTimeParamTypes(otherType);
  const diff = moment(endTime).diff(startTime, type);
  return diff;
};

/**
 * 根据参进来的变量返回对应的类型
 * @param type
 * @returns {string}
 */
export const getTimeParamTypes = (type) => {
  if (!type) return 'minutes';
  if (type === '@@StaticYears') return 'years';
  if (type === '@@StaticMonths') return 'months';
  if (type === '@@StaticWeeks') return 'weeks';
  if (type === '@@StaticDays') return 'days';
  if (type === '@@StaticHours') return 'hours';
  if (type === '@@StaticMinutes') return 'minutes';
  if (type === '@@StaticSeconds') return 'seconds';
  return 'minutes';
};

/**
 * 验证是否为全局变量  规则：全局变量以 @@ 开头
 * @param {string} str 值
 */
export const isGlobalOrCustomVar = (str) => {
  if (!str) return false;
  const regExp = /^@@.*/;
  return str.toString().match(regExp);
};

/**
 * 根据穿进来的属性值key对数组进行去重
 * @param arr1 数组
 * @param key 属性
 * @returns {Int32Array | * | Uint32Array | any[] | Int8Array | Float64Array | BigUint64Array | Uint8Array | Int16Array | BigInt64Array | Float32Array | Uint8ClampedArray | Uint16Array}
 */
export const unique = (arr1, key) => { // 去重
  const res = new Map();
  return arr1.filter((a) => !res.has(a[key]) && res.set(a[key], 1));
};
/**
 * 获取一段字符串中所有的全局变量
 * @param {string} str 待匹配字符串
 */
export const matchGlobalVars = (str) => {
  if (!str) return [];
  const matchArr = str.match(/(?=\{).*?(?=\})/g) || [];
  return matchArr.map(item => item.substr(1));
};

// 匹配全局变量函数，获取传入参数
export const matchGlobalFunctionParam = (globalVar) => {
  // const result = globalVar.match(/\((\S*)\)/);
  if (!globalVar) return null;
  let result = globalVar.match(/^@@ParamKey\((\S*)*\)/);
  if (!result) return null;
  return result[1];
};

/**
 * 匹配获取时间区间其实结束值的配置信息
 * @param {string} varName 变量名
 */
export const matchGlobalDateRange = (varName) => {
  if (!varName) return null;
  let matchArr = varName.match(/^@@DateRange\((\S*)*\)/);
  if (!matchArr) return null;
  const resultStr = matchArr[1];
  const resultArr = resultStr.split(',');
  const originTimeVarName = resultArr[0].trim();
  const type = +(resultArr[1].trim());
  return {
    originTimeVarName,
    rangeType: type === 2 ? 'end' : 'start',
  };
};

/**
 * 获取表单内数据序列化
 * @param {object} formData 表单数据
 * @param {array}  eleList  控件列表
 */
export const getStringifyFormData = ({
                                       formData = {},
                                       eleList = [],
                                     }) => {
  const keys = Object.keys(formData);
  const result = {
    total: keys.length,
  };
  keys.forEach((key, index) => {
    const eleObj = eleList.find(item => item.id === +key);
    if (!eleObj) return;
    const { relationColumnName, relationColumnType } = eleObj;
    result[`key${index + 1}`] = {
      name: relationColumnName,
      value: formData[key].id,
      type: relationColumnType,
    };
  });
  return JSON.stringify(result);
};

/**
 * 通过全局变量名获取真实的值
 */
export const getValueFromGlobalVariables = ({
                                              globalVar, // 全局变量名
                                              eleObj = {}, // 控件对象
                                              userInfo, // 当前用户对象
                                              isRealValue = true, // 为真实的值还是表现的内容
                                              treeNodeData = {}, // 树节点修改
                                              explorerMainListRow = {}, // 资源管理器中行数据
                                              globalMapType = 'globalMap', // 需要返回的格式类型（globalMap为变量名对应值，globalQueryMap为变量名对应值及字段类型）
                                              curFormData = {}, // 当前表单数据
                                              curEleList = [], // 当前面板控件列表
                                              originData = {}, // 原始值
                                              isReturnObj = false, // 返回为对象还是单值（对象：{id: 1, name: '位置'}, 单值：1）
                                            }) => {
  const isOnlyValue = globalMapType === 'globalMap';
  let value = '';
  let type = '';
  let valueObj = null;
  if (globalVar && globalVar.indexOf('@@GetUserProperties') > -1) {
    return getUserInfo(globalVar, userInfo, isOnlyValue);
  }
  switch (globalVar) {
    // 当前时间
    case '@@CurrentDateTime': {
      value = isRealValue ? formatTime(new Date(), eleObj.elementFormat || 1) : formatDatePickerValue(new Date());
      type = 3;
    }
      ;
      break;
    // 当前日期
    case '@@CurrentDate': {
      value = isRealValue ? formatTime(new Date(), eleObj.elementFormat || 2) : formatDatePickerValue(new Date());
      type = 3;
    }
      ;
      break;
    // 当前用户
    case '@@CurrentUserID': {
      value = isRealValue ? userInfo.id : userInfo.username;
      type = 2;
    }
      ;
      break;
    // 主业务数据id
    case '@@BusinessID': {
      value = treeNodeData.id || '';
      type = 2;
    }
      ;
      break;
    // 资源管理器的弹出面板使用主列表数据id
    case '@@ExplorerID': {
      value = explorerMainListRow.id || '';
      type = 2;
    }
      ;
      break;
    // 资源管理器的弹出面板使用主列表数据keycode
    case '@@ExplorerKeycode': {
      value = explorerMainListRow.keycode || '';
      type = 1;
    }
      ;
      break;
    // 资源管理器的弹出面板使用主列表数据name
    case '@@ExplorerName': {
      value = explorerMainListRow.name || '';
      type = 1;
    }
      ;
      break;
    // 空值
    case '@@Null': {
      value = '';
      type = 1;
    }
      ;
      break;
    // 时间流水号
    case '@@DateSerialnumber': {
      value = moment(new Date()).format('YYYYMMDDHHmmssSSS');
      type = 1;
    }
      ;
      break;
    // 表单数据序列化
    case '@@StringifyFormData': {
      return getStringifyFormData({
        formData: curFormData,
        eleList: curEleList,
      });
    }
      ;
    case '@@InitValue': {
      const { id, relationColumnType } = eleObj;
      valueObj = originData[id] || {};
      value = valueObj.id || '';
      type = relationColumnType;
    }
      ;
    case '@@tablename': {
      const { id, relationColumnType } = eleObj;
      // valueObj = originData[id] || {};
      // value = valueObj.id || '';
      type = relationColumnType;
      value = curEleList[0].relationTableName;
    }
      ;
      break;
    default: {
    }
  }
  const valueResultObj = valueObj ? valueObj : { id: value, name: value };
  const result = isReturnObj ? valueResultObj : value;
  return isOnlyValue ? result : { value, type };
};

/**
 * 控件的默认值为变量时，或筛选条件的值为自定义变量时，根据上一个面板中的变量取值
 *  @param  {object}   prevListRowData     上一个面板中的数据
 *  @param  {array}   prevElementList 上一个面板的控件列表
 *  @param  {object}  curTabData      当前面板中的数据
 *  @param  {array}   curElementList  当前面板的控件列表
 *  @param  {boolean} isRealValue     是否取真实值
 *  @param  {string}  varName         变量名
 *  @param  {string}   globalMapType   需要返回的格式类型（globalMap为变量名对应值，globalQueryMap为变量名对应值及字段类型）
 */
export const getValueFromCustomVariables = ({
                                              curElementList = [],
                                              curTabData = {},
                                              prevElementList = [],
                                              prevListRowData = {},
                                              varName = '',
                                              isRealValue = true,
                                              globalMapType = 'globalMap',
                                              langLib,
                                              isReturnObj = false, // 返回为对象还是单值（对象：{id: 1, name: '位置'}, 单值：1）
                                            }) => {
  let ele = curElementList.find(item => item.parameter === varName);
  const isOnlyValue = globalMapType === 'globalMap';
  let value = '';
  let type = '';
  let valueObj = null;
  let data = curTabData;
  // 默认取当前面板中的参数名，若当前面板没有定义，再取上一个面板中的参数名
  if (!ele) {
    ele = prevElementList.find(item => item.parameter === varName);
    data = prevListRowData;
  }
  // 返回结果
  const doReturn = () => {
    const valueResultObj = valueObj ? valueObj : { id: value, name: value };
    const result = isReturnObj ? valueResultObj : value;
    return isOnlyValue ? result : { value, type: ele ? ele.relationColumnType : '' };
  };
  // 非全局变量直接返回
  if (!isGlobalOrCustomVar(varName || '')) {
    value = varName;
    return doReturn();
  }
  // 计算时长
  const durationMatch = varName.match(/(?=@@GetDuration\().+(?=\))/);
  if (durationMatch) {
    const str = durationMatch[0];
    const paramNameArr = str.substr(str.indexOf('(') + 1).split(',');
    const resultArr = [];
    const _prevProps = {
      curElementList,
      curTabData,
      prevElementList,
      prevListRowData,
      isRealValue,
      globalMapType,
      langLib,
    };
    paramNameArr.forEach(varName => {
      const value = getValueFromCustomVariables({
        ..._prevProps,
        varName,
      });
      resultArr.push(value);
    });
    value = getDuration(langLib, resultArr[0], resultArr[1], paramNameArr[2]);
    return doReturn();
  }
  if (!ele || !varName) {
    value = null;
    return doReturn();
  }
  const { basetype, valueFieldType } = ele;
  const result = data[ele.id] || {};
  if (basetype === 17) {
    // label需要根据属性判断取的是id还是name
    value = (valueFieldType === 2 ? result.name : result.id) || '';
    return doReturn();
  }

  value = (isRealValue ? result.id : result.name) || '';
  return doReturn();
};

/**
 * 后台触发器中有变量时，需要将变量转为实际值
 * @param {object} param
 *                {object} curEle   当前控件
 *                {array}  curEleTriggerList 当前控件的触发器列表
 *                {array}  prevTabEleList 上一个面板的控件列表
 *                {object} prevTabData    上一个面板的数据（上一个面板若为列表，则取列表行数据，上一个面板若为表单，则取表单数据）
 */
export const getTriggerMapFromEle = ({
                                       curEle = {},
                                       curEleTriggerList = [],
                                       curTabEleList = [],
                                       curTabData = {},
                                       prevTabEleList = [],
                                       prevTabData = {},
                                       userInfo = {},
                                       treeNodeData = {},
                                       globalIds = '',
                                     }) => {
  const result = {};
  // 全局变量转成真实值
  const globalVarToValue = (varName) => {
    // 定义变量的控件
    let tabData = curTabData || {};
    let parameterEle = curTabEleList.find(ele => ele.parameter === varName);
    if (!parameterEle) {
      parameterEle = prevTabEleList.find(ele => ele.parameter === varName) || {};
      tabData = prevTabData || {};
    }
    const { id, basetype, valueFieldType } = parameterEle;
    const globalVarValue = getValueFromGlobalVariables({
      userInfo,
      treeNodeData,
      globalVar: varName,
      curFormData: curTabData,
      curEleList: curTabEleList,
    });
    const data = tabData[id] || {};
    let pageFieldData = data.id;
    if (basetype === 17) {
      pageFieldData = valueFieldType === 2 ? data.name : data.id;
    }
    if (varName === '@@GlobalIds') {
      result[varName] = globalIds;
    } else {
      result[varName] = pageFieldData || globalVarValue || '';
    }
  };
  curEleTriggerList.forEach(item => {
    const { relationColumnValue, valueType, triggerType, procedureMap } = item;
    // 值类型为【变量】
    if (valueType === 2 || isGlobalOrCustomVar(relationColumnValue)) {
      globalVarToValue(relationColumnValue);
    } else if (triggerType === 3 && procedureMap) {
      // 存储过程类型触发器需要从额外的字段中查找变量
      Object.keys(procedureMap).forEach(item => {
        globalVarToValue(procedureMap[item]);
      });
    }
  });
  return result;
};

// 数据选择框根据id获取详情
export const getSelectSearchInfoById = (eleObj, value, callback) => {
  if (!value) return {};
  const { mainTableName: tabSource, mainColumnName, basetype } = eleObj;
  return new Promise((resolve, reject) => {
    if (!(tabSource && value)) {
      resolve();
      return;
    }
    const api = basetype === 45 ? getCheckBoxSearchDetail : getNormalSearchDetail;
    const params = {
      [basetype === 45 ? 'tableName' : 'tabSource']: tabSource,
      [basetype === 45 ? 'ids' : 'id']: value,
    };
    api(params).then(res => {
      const param = {
        detailInfo: res,
        valueObj: {
          id: basetype === 45 ? res.map(item => item.id).join(',') : value,
          name: basetype === 45 ? res.map(item => item[mainColumnName]).join(',') : res[mainColumnName],
        },
      };
      resolve(param);
      callback && callback(param);
    });
  });
};

export const prevSetFormData = ({
                                  elementList = [],
                                  getGlobalVarValues,
                                }) => {
  let formData = {};
  elementList.forEach(eleObj => {
    const { defaultValue, id } = eleObj;
    if (defaultValue) {
      let valueObj = { id: defaultValue, name: defaultValue };
      if (isGlobalOrCustomVar(defaultValue)) {
        const value = getGlobalVarValues({ varName: defaultValue });
        valueObj = { id: value, name: value };
      }
      formData[id] = valueObj;
    }
  });
  return formData;
};

/**
 * 将表单数据json字符串数据改为对象，并做默认值处理
 * @param {object} param
 *                {object} formData   表单数据
 *                [array]  elementList 控件列表
 */
export async function parseFormData({
                                      elementList = [],
                                      formData = {},
                                      getGlobalVarValues,
                                    }) {
  const result = { ...formData };
  // 数据选择框走过getById的实体表+id数据的详情
  let infosObj = {};
  for (let key in formData) {
    const eleObj = elementList.find(ele => ele.id === +key) || {};
    const { defaultValue, basetype, mainTableName, relationColumnType, mainColumnName } = eleObj;
    const parsedData = jsonParse(formData[key]);
    const resumeDefaultValue = resetDefaultValue(eleObj, parsedData, true);
    let valueObj = resumeDefaultValue;
    // 有值且数字型 抹0
    if (relationColumnType === 4 && valueObj.id) {
      const value = parseDecimal(valueObj.id);
      valueObj = { id: value, name: value };
    }
    // 空值，
    if (isEmptyValue(eleObj, resumeDefaultValue)) {
      // 且配了默认值
      valueObj = { id: defaultValue, name: defaultValue };
      // 且配了默认值为全局变量
      if (isGlobalOrCustomVar(defaultValue)) {
        const globalValue = getGlobalVarValues({ varName: defaultValue });
        valueObj = { id: globalValue, name: globalValue };
      }
    }
    result[key] = valueObj;
    // 数据选择框有默认值时需要获取详情接口
    if (SEARCH_SELECT_TYPE.concat([17]).includes(basetype) && mainTableName && mainColumnName && !isNaN(Number(valueObj.id))) {
      const detailKey = `${mainTableName}_${valueObj.id}`;
      if (infosObj[detailKey] && JSON.stringify(infosObj[detailKey].detailInfo) !== '{}') {
        let data = infosObj[detailKey].detailInfo;
        result[key] = {
          id: basetype === 45 ? data.map(item => item.id).join(',') : data.id,
          name: basetype === 45 ? data.map(item => item[mainColumnName]).join(',') : data[mainColumnName],
        };
      } else {
        await getSelectSearchInfoById(eleObj, valueObj.id, (res) => {
          infosObj[detailKey] = res;
          result[key] = res.valueObj;
        });
      }
    }
    if (eleObj.relationColumnName === 'id') {
      result.id = parsedData;
    }
  }
  return result;
};

/**
 * 将列表数据json字符串数据改为对象，并做默认值处理
 * @param {object} param
 *                {array} listDataObj  列表数据
 *                [array]  elementList 控件列表
 */
export const parseListData = ({
                                elementList = [],
                                listDataObj = {},
                              }) => {

  let data = JSON.parse(JSON.stringify(listDataObj));
  const { datalist = [] } = data;
  const listData = [...datalist];
  listData.forEach(item => {
    Object.keys(item).forEach(key => {
      const parsedData = jsonParse(item[key]);
      const eleObj = elementList.find(ele => ele.id === +key) || {};
      item[key] = resetDefaultValue(eleObj, parsedData, true);
      if (eleObj.relationColumnName === 'id') {
        item.id = parsedData;
      }
    });
  });
  return {
    ...listDataObj,
    datalist: listData,
  };
};

/**
 * 转时间格式
 * @param {moment} timeMoment 控件中的时间值
 * @param {number} type 时间格式类型（1-YYYY-MM-DD HH:mm:ss, 2-YYYY-MM-DD)
 */
export const formatTime = (timeMoment, type = 1) => moment(timeMoment).format(TIME_FORMATE_TYPES[type]);

/**
 * 获取confirm 基本属性
 * @param {Object} langLib 本地站点语言包
 */
export const getDefaultConfirmProps = (langLib) => ({
  okText: langLib['confirm.ok'],
  cancelText: langLib['confirm.cancel'],
  title: langLib['confirm.del.default'],
  content: '',
});

/**
 * 获取表单校验信息（默认必填）
 * @param {string} ruleType 校验类型
 *                    - required  必填
 *                    - telphone  手机号
 *                    - email     邮箱
 */
export const getValidateMessage = (ruleType = 'required') => {
  const validMsg = (
    <div className="cusstom-valid-message">
      <span className="iconfont icon-warn"/>
      <FormattedMessage id={`form.valid.${ruleType}`}/>
    </div>
  );
  return validMsg;
};
/**
 * 根据树的nodeKey和treeData找出对应树数据
 * @param {string} targetNodeKey 目标树节点nodeKey
 * @param {array} treeData 树数据
 */
export const getNodeDataFromTreeData = (targetNodeKey = '', treeData = []) => {
  let activeTreeNodeDetail = {};
  const doLoop = data => {
    data.forEach(item => {
      if (item.nodeKey === targetNodeKey) {
        activeTreeNodeDetail = item;
        return;
      }
      item.children && doLoop(item.children);
    });
  };
  doLoop(treeData);
  return activeTreeNodeDetail;
};

/**
 * 根据已有操作类型修改为对应类型
 * @param {string} oldActionType 树的操作类型（旧类型）
 */
export const setNewActionType = (oldActionType) => {
  switch (oldActionType) {
    case 'addGroup':
      return 'editGroup';
    case 'addElement':
      return 'editElement';
    default:
      return oldActionType;
  }
};

const formatDatePickerValue = valStr => {
  try {
    return moment(valStr);
  } catch {
    return null;
  }
};

/**
 * 控件值转接口接受的值类型
 * @param {object} eleObj 控件的数据对象
 * @param {*} value 控件值
 */
export const setElementToValue = (eleObj, value) => {
  const { basetype, elementFormat } = eleObj;
  switch (basetype) {
    case 9:
      return value ? formatTime(value, elementFormat) : '';
    default:
      return value;
  }
};
/**
 * 接口返回的值转控件接受的值类型
 * @param {object} eleObj 控件的数据对象
 * @param {*} value 控件值
 */
export const setValueToElement = (eleObj, value) => {
  const { basetype } = eleObj;
  switch (basetype) {
    case 1:
      return value ? value : '';
    case 9:
      return value ? formatDatePickerValue(value) : null;
    default:
      return value === null ? '' : value;
  }
};

/**
 *
 * @param {object} eleObj 控件对象
 * @param {string || object} value 值 / 值{id、name}
 * @param {true} isFromDB 是否来自接口的数据
 */
export const resetDefaultValue = (eleObj, value, isFromDB) => {
  const { basetype, relationColumnName, relationColumnType } = eleObj;
  // 从接口获取后，进行默认值转换
  if (isFromDB) {
    if (
      (basetype === 9 && TIME_DEFAULT_VALUES.includes(value.id)) || // 时间选择器1970-01-01时为无值
      (SELECT_ELEMETN_TYPE.includes(basetype) && !value.id) || // 下拉框无值时为''
      (SEARCH_SELECT_TYPE.includes(basetype) && !value.id) // 选择框无值时为''
    ) {
      return { id: '', name: '' };
    } else if (basetype === 36 && (!value || !value.id)) {
      return { id: 0, name: 0 };
    }
    return value;
  } else { // 传给接口时，进行空值转默认值
    if (!value) { // 为空
      if (relationColumnName === 'orgid') { // 组织为空默认传-1
        return -1;
      } else if (basetype === 9) { // 时间选择器无值时为1970-01-01默认值
        // return TIME_DEFAULT_VALUES[0];
        return '';
      } else if (
        (SELECT_ELEMETN_TYPE.includes(basetype)) ||  // 下拉框无值时为0
        (SEARCH_SELECT_TYPE.includes(basetype))
        // (SEARCH_SELECT_TYPE.includes(basetype)) || // 选择框无值时为''
        // (basetype === 1 && NUMBER_COLUMN_TYPE.includes(relationColumnType)) // 数字输入框无值时
      ) {
        return '';
      }
    }
    return value;
  }
};

// 是否为空值
export const isEmptyValue = (eleObj, value = {}) => {
  const { basetype, relationColumnType, relationColumnName } = eleObj;
  const valueText = value.id;
  let resultIsEmpty = false;
  if (valueText === null) resultIsEmpty = true;
  // 字段值类型为数字，且值为0；
  const isEmptyNumber = valueText === 0 && NUMBER_COLUMN_TYPE.includes(relationColumnType);
  // 属于字符串，且值为''
  const isEmptyString = valueText === '' && STRING_COLUMN_TYPE.includes(relationColumnType);
  // const isEmpty = isEmptyNumber || isEmptyString || valueText === null || valueText === '';
  const isEmpty = isEmptyString || valueText === null || valueText === '';
  if (
    (basetype === 9 && (isEmpty || TIME_DEFAULT_VALUES.includes(valueText))) || // 时间无值或为1970时为无值
    (isEmpty && FILTER_ELEMENT_TYPE.includes(basetype)) || // 下拉框无值
    (isEmpty && SEARCH_SELECT_TYPE.includes(basetype)) || // 选择框无值
    (basetype === 36 && isEmpty) || // 星级评价无值
    (relationColumnName === 'orgId' && valueText === -1) // 组织id为-1时表示无值
  ) {
    resultIsEmpty = true;
  }
  return resultIsEmpty;
};


/**
 * 表单提交校验后将有隐藏项的字段去除
 * @param {object} formData
 * @return {object} 过滤后的数据
 */
export const filterHiddenFormData = (formData = {}) => {
  const filterKeys = Object.keys(formData).filter(key => key.indexOf(IGNORE_FORM_ITEM) === -1 && key.indexOf(EMPTY_ITEM) === -1) || [];
  const filterData = {};
  filterKeys.forEach(key => filterData[key] = formData[key]);
  return filterData;
};


/**
 * 验证是否匹配触发条件
 * @param {object} triggerObj 触发器详情
 * @param {string} actualVal 实际需要比对的值
 * @param {string} matchVal 匹配值
 */
export const validTriggerMatch = (triggerObj, actualVal = '', matchVal = '', getGlobalVarValues) => {
  const { endTriggerNum = '', conditionType } = triggerObj;
  const matchValData = matchVal || endTriggerNum || '';
  const normalValNum = isNaN(Number(matchValData)) ? NaN : +matchValData;
  const actualValNum = isNaN(Number(actualVal)) ? NaN : +actualVal;
  if (!conditionType) return true; // 未选条件，默认符合
  const NUMBER_COMPARE_TYPE = [1, 2, 4, 5]; // >、 <、>=、<=四种属于数值类型比较
  // 数值类型
  if (NUMBER_COMPARE_TYPE.includes(conditionType) && !isNaN(normalValNum) && !isNaN(actualValNum)) {
    if (conditionType === 1 && actualValNum > normalValNum) return true;
    if (conditionType === 2 && actualValNum < normalValNum) return true;
    if (conditionType === 4 && actualValNum >= normalValNum) return true;
    if (conditionType === 5 && actualValNum <= normalValNum) return true;
    return false;
  }
  switch (conditionType) {
    case 3:
      return `${matchValData}` === `${actualVal}`; // 等于
    case 6:
      return `${matchValData}` !== `${actualVal}`; // 不等于
    case 7:
      return !!!actualVal; // 为空
    case 8:
      return !!actualVal;// 不为空
    case 9:
      return validMatchMultiTrigger(triggerObj, getGlobalVarValues);
    default:
      return false;
  }
};

// 多条件匹配验证
export const validMatchMultiTrigger = (triggerObj, getGlobalVarValues) => {
  const { methodType, endTriggerNum } = triggerObj;
  const condArr = jsonParse(endTriggerNum, 'array');
  const resultArr = [];
  condArr.forEach(item => {
    const { key, cond, value } = item;
    const keyText = getGlobalVarValues({ varName: key });
    let valueText = value;
    if (isGlobalOrCustomVar(value)) {
      valueText = getGlobalVarValues({ varName: value });
    }
    const conditionTypeKey = _.findKey(TRIGGER_CONDITION, (val) => val === cond);
    const likeObj = {
      conditionType: +conditionTypeKey,
    };
    const result = validTriggerMatch(likeObj, keyText, valueText);
    resultArr.push(result);
  });
  switch (methodType) {
    case 1: { // AND
      const result = resultArr.filter(item => !item);
      return !result.length;
    }
      ;
    case 2: { // OR
      const result = resultArr.filter(item => item);
      return !!result.length;
    }
      ;
    default:
      return false;
  }
};

// 匹配数据是否正确
export const matchingValueCorrect = () => {

};

/**
 * json字符串转json格式
 * @param {string} jsonStr json字符串
 * @param {string} defaultType 默认返回类型
 */
export const jsonParse = (jsonStr, defaultType = 'object') => {
  if (typeof jsonStr === 'object') {
    return jsonStr;
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    switch (defaultType) {
      case 'object':
        return {};
      case 'array':
        return [];
      default:
        return {};
    }
  }
};

/**
 * 小数后几位抹0
 * @param {string} str 值
 */
export const parseDecimal = (str = '') => {
  if (!str || str === 'undefined') return '';
  str = `${str}`;
  const regexp = /(?:\.0*|(\.\d+?)0+)$/;
  const result = str.replace(regexp, '$1');
  return result;
};

/**
 * 获取cookie
 * @param key
 * @returns {string}
 */
export const getCookie = (key) => {
  // if (document.cookie.length > 0) {
  //   let start = document.cookie.indexOf(key + '=');
  //   if (start !== -1) {
  //     start = start + key.length + 1;
  //     let end = document.cookie.indexOf(';', start);
  //     if (end === -1) end = document.cookie.length;
  //     return document.cookie.substring(start, end);
  //   }
  // }
  // return '';
  if (document.cookie.length > 0) {
    const cookies = document.cookie.split(';');
    let value = [];
    cookies.forEach(item => {
      const k = item.split('=')[0].trim();
      if (k == key) {
        value.push(item);
      }
    });
    if (value.length > 0) {
      const name = value[0].split('=')[1];
      return value[0].split('=')[1];
    } else {
      return '';
    }
  }
};

/**
 * 用javascript删除某一个cookie的方法，该方法传入要删除cookie的名称
 * @param cookieName
 * @constructor
 */
export const RemoveCookie = (cookieName) => {
  let cookies = document.cookie.split(';');// 将所有cookie键值对通过分号分割为数组

  // 循环遍历所有cookie键值对
  for (let i = 0; i < cookies.length; i++) {
    // 有些cookie键值对前面会莫名其妙产生一个空格，将空格去掉
    if (cookies[i].indexOf(' ') == 0) {
      cookies[i] = cookies[i].substring(1);
    }

    // 比较每个cookie的名称，找到要删除的那个cookie键值对
    if (cookies[i].indexOf(cookieName) == 0) {
      let exp = new Date();// 获取客户端本地当前系统时间
      exp.setTime(exp.getTime() - 60 * 1000);// 将exp设置为客户端本地时间1分钟以前，将exp赋值给cookie作为过期时间后，就表示该cookie已经过期了, 那么浏览器就会将其立刻删除掉

      document.cookie = cookies[i] + ';expires=' + exp.toUTCString();// 设置要删除的cookie的过期时间，即在该cookie的键值对后面再添加一个expires键值对，并将上面的exp赋给expires作为值(注意expires的值必须为UTC或者GMT时间，不能用本地时间），那么浏览器就会将该cookie立刻删除掉
      // 注意document.cookie的用法很巧妙，在对其进行赋值的时候是设置单个cookie的信息，但是获取document.cookie的值的时候是返回所有cookie的信息

      break;// 要删除的cookie已经在客户端被删除掉，跳出循环
    }
  }
};
// 保存cookie
export const setCookie = (cName, value, expiredays) => {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = cName + '=' + decodeURIComponent(value) +
    ((expiredays == null) ? '' : ';expires=' + exdate.toGMTString());
};

// 获取顶级域名
export const GetCookieDomain = () => {
  var host = window.location.hostname;
  var ip = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
  if (ip.test(host) === true || host === 'localhost') return host;
  var regex = /([^]*).*/;
  var match = host.match(regex);
  if (typeof match !== 'undefined' && null !== match) host = match[1];
  if (typeof host !== 'undefined' && null !== host) {
    var strAry = host.split('.');
    if (strAry.length > 1) {
      host = strAry[strAry.length - 2] + '.' + strAry[strAry.length - 1];
    }
  }
  return '.' + host;
};

/**
 * 根据菜单对象获取框架组件信息
 * @param {object} functionItem 菜单对象
 */
export const getFunctionComDetail = (functionItem) => {
  const { id, frameBaseType, url, name } = functionItem;
  console.log(id, frameBaseType, url, name);
  // if (url) {
  //   return {
  //     tabKey: `${url}_${id}`,
  //     comKey: url,
  //     title: name,
  //   };
  // }
  switch (frameBaseType) { // 配置出来的页面
    case 1:
      return { tabKey: `TreeFrame_${id}`, comKey: 'TreeFrame', title: name };
    case 3:
      return { tabKey: `ListFrame_${id}`, comKey: 'ListFrame', title: name };
    case 2:
      return { tabKey: `FullListFrame_${id}`, comKey: 'FullListFrame', title: name };
    case 4: {
      if (url) { // 管理员可见模块
        return {
          tabKey: `${url}_${id}`,
          comKey: url,
          title: name,
        };
      }
      return {};
    }
    case 5:
      return { tabKey: `ReportFrame_${id}`, comKey: 'ReportFrame', title: name }; // 报表框架
    case 6:
      return { tabKey: `ExplorerFrame_${id}`, comKey: 'ExplorerFrame', title: name }; // 资源管理器框架
    case 8:
      return { tabKey: `HomeChartFrame_${id}`, comKey: 'HomeChartFrame', title: name }; // 图形图表框架
    case 9:
      return { tabKey: `BoardFrame_${id}`, comKey: 'BoardFrame', title: name }; // 大屏看板框架
    case 10:
      return { tabKey: `VisualMap_${id}`, comKey: 'VisualMap', title: name }; // 图形导航框架
    case 11:
      return { tabKey: `OutlookFrame_${id}`, comKey: 'OutlookFrame', title: name }; // 工单展望框架
    default:
      return {};
  }
};

// 可上传文件的类型
export const getFileAcceptType = (type = 'image') => {
  switch (type) {
    case 'image':
      return '.jpg,.jpeg,.png,.gif';
    case 'file':
      return '.jpg,.jpeg,.png,.gif,.pdf,.doc,.ppt,.pptx,.xls,.xlsx,.docx,.mp3,.mp4';
    default:
      return '*';
  }
};

// 获取图片base64
export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * 递归找到对应的菜单，如果能找到，返回的数组是带菜单的
 * @param fileArr
 * @param functionId
 * @returns {[]}
 */
export const controlAuthority = (fileArr = [], functionId) => {
  if (!functionId) return [];
  let result = [];
  let n = fileArr.length;
  for (let i = 0; i < n; i++) {
    const { canview } = fileArr[i].attributes;
    if (fileArr[i].id === functionId && canview) {
      result.push(fileArr[i]);
    } else if (Array.isArray(fileArr[i].children) && fileArr[i].children.length) {
      result = result.concat(controlAuthority(fileArr[i].children, functionId));
    }
  }
  return result;
};
/**
 * 返回调转菜单带过去的数据格式是{'@@deviceid':2}这样子
 * @param data
 * @param elementList
 * @param paramsArr
 * @param type 区分是表单中的还是列表中的普通按钮
 * @returns {*}
 * @constructor
 */
export const returnJumpMenuData = (jumpFunctionId, data = {}, elementList = [], paramsArr = [], userInfo, getValueFromGlobalVariables, type) => {
  let result = {
    jumpTag: jumpFunctionId,
  };
  paramsArr.forEach(item => {
    const { key, value, type: itemType, ...rest } = item;
    let eleObj = elementList.find(items => {
      return items.parameter === value;
    });
    let eleValue = null;
    if (String(value).indexOf('@@') > -1) {
      eleValue = getValueFromGlobalVariables({
        userInfo,
        globalVar: value,
        globalMapType: 'globalMapType',
      });
      if (eleValue.value) {
        result[key] = eleValue;
      } else if (eleObj) {
        const { relationColumnType, basetype } = eleObj;
        if (type) {
          result[key] = { ...rest, value: data[`${eleObj.id}`].id, type: relationColumnType };
          if (basetype === 3) {
            result[key] = {
              ...rest,
              value: data[`${eleObj.id}`].id,
              type: relationColumnType,
              data: JSON.stringify({
                id: data[`${eleObj.id}`],
                name: data[`${IGNORE_FORM_ITEM}_${eleObj.id}`],
              }),
            };
          } else {
            result[key] = {
              ...rest,
              value: data[`${eleObj.id}`].id,
              type: relationColumnType,
            };
          }
        } else if (!type) {
          data[`${eleObj.id}`] = JSON.stringify(data[`${eleObj.id}`]) || '{}';
          if (basetype === 3) {
            result[key] = {
              ...rest,
              value: JSON.parse(data[`${eleObj.id}`]).id,
              type: relationColumnType,
              data: data[`${eleObj.id}`],
            };
          } else {
            result[key] = { ...rest, value: JSON.parse(data[`${eleObj.id}`]).id || '', type: relationColumnType };
          }
        }
      }
    } else {
      result[key] = { ...rest, value, type: itemType };
    }
  });
  return result;
};

/**
 * 返回面板中的过滤条件
 * @param tabInfo
 * @param advancedQueryMap
 * @param getGlobalVarValues
 * @returns {{globalMap: {}, globalQueryMap: {}}}
 */
export const getGlobalMapOrGlobalQueryMap = (tabInfo, advancedQueryMap, getGlobalVarValues) => {
  let globalMap = {}, globalQueryMap = {};
  const { id: tabId, relationTableName: tabSource, showType, relationColumn } = tabInfo;
  const queryList = advancedQueryMap[tabId] || [];
  // 将过滤条件中的全局变量赋值
  queryList.forEach(item => {
    const { asqlValueType, asqlValue, queryType, basetype, apiSql } = item;
    // 面板过滤条件为组合条件方式
    if (queryType === 1 && basetype === 1) {
      // 值类型为【变量】时，需要将变量对应的值传给后台
      if (asqlValueType === 2 || isGlobalOrCustomVar(asqlValue)) {
        globalMap[item.asqlValue] = getGlobalVarValues({ varName: asqlValue });
      }
    } else if (queryType === 2 && basetype === 2) { // SQL过滤条件方式
      const varArr = matchGlobalVars(apiSql);
      varArr.forEach(varName => {
        globalQueryMap[varName] = getGlobalVarValues({ varName, globalMapType: 'globalQueryMap' });
      });
    }
  });
  return {
    globalMap,
    globalQueryMap,
  };
};


/**
 * 根据global
 * @param globalVar
 * @param state
 * @returns {string|null|number|*}
 */
export const getParamsValueFromState = (globalVar, state = {}) => {
  const { userInfo, treeNodeData } = state;
  if (!globalVar) return null;
  // 获取用户属性
  if (globalVar.indexOf('@@GetUserProperties') > -1) {
    return getUserInfo(globalVar, userInfo);
  }
  switch (globalVar) {
    // 当前时间
    case '@@CurrentDateTime':
      return formatTime(new Date(), 1);
    // 当前日期
    case '@@CurrentDate':
      return formatTime(new Date(), 1);
    // 当前用户
    case '@@CurrentUserID':
      return userInfo.id;
    // 主业务数据id
    case '@@BusinessID':
      return treeNodeData.id;
    // 空值
    case '@@Null':
      return '';
    // 时间流水号
    case '@@DateSerialnumber':
      return moment(new Date()).format('YYYYMMDDHHmmssSSS');
    case '@@pageIndex':
      return state.pageIndex || 1;
    case '@@pageSize':
      return state.pageSize || 10;
    default:
      return '';
  }
};

/**
 * 获取用户属性
 * @param key
 * @param userInfo
 * @returns {null|*}
 */
export const getUserInfo = (key, userInfo, isOnlyValue) => {
  if (!key) return null;
  let result = key.match(/^@@GetUserProperties\((\S*)*\)/);
  if (!result) return null;
  let arr = result[1].split(',');
  let value = userInfo[arr[0]];
  return arr.length === 1 ? value : { value, type: arr[1] };
};

/**
 * 列表数据
 * 将控件和数据整合成一个jsonString ,返回一个数组
 * @param elementList
 * @param resData
 * @returns {[]}
 */
export const reduceDataToJsonString = (elementList = [], resData = []) => {
  let list = [];
  resData.forEach(obj => {
    let data = {};
    elementList.forEach(item => {
      const { id, relationColumnName } = item;
      let value = obj[relationColumnName];
      data[id] = JSON.stringify({ id: `${value}`, name: `${value}` });
    });
    list.push(data);
  });
  return list;
};

/**
 * 将表单中的数据转换成{id:xxx,name:xxx}这种格式
 * @param elementList
 * @param resData
 * @returns {{}}
 */
export const reduceSourceToFormData = (elementList = [], resData = {}) => {
  let lastData = {};
  elementList.filter(items => !BTN_ELEMENT_TYPE.includes(items.basetype)).forEach(item => {
    const { id, relationColumnName } = item;
    lastData[id] = JSON.stringify({ id: resData[relationColumnName] || '', name: resData[relationColumnName] || '' });
  });
  return lastData;
};

/**
 * 将含变量的数据处理成正常的数据，然后数组
 * @param source
 * @param record
 * @param elementList
 * @param type 值默认是空值，空值是由通用业务框架和全列表框架传参数，type如果是tree，由树形框架和资源管理器传参
 * @returns {[]}
 */
export const reducerVariableToArray = (source = [], record = {}, elementList = {}, type = '') => {
  let list = [];
  source.forEach(item => {
    let obj = {};
    Object.keys(item).forEach(items => {
      let parameter = item[items];
      if (parameter.indexOf('@@') > -1) {
        let eleObj = elementList.find(data => data.parameter === parameter);
        if (eleObj) {
          const { id } = eleObj;
          if (type) {
            obj[items] = record[`${id}`].id;
          } else {
            obj[items] = JSON.parse(record[`${id}`]).id;
          }
        } else {
          obj[items] = item[items];
        }
      } else {
        obj[items] = item[items];
      }
    });
    list.push(obj);
  });
  return list;
};

// 多条数据比较
export const multiDataComparison = (arr = []) => {
  const resultArr = [];
  arr.forEach(item => {
    let resultIsTrue = conditionalJudgment(item);
    resultArr.push(resultIsTrue);
  });
  const result = resultArr.filter(item => !item);
  return !result.length;
};

// 数据比较
export const conditionalJudgment = (obj = {}) => {
  const { key = '', cond, value = '' } = obj;
  const normalValNum = isNaN(Number(key)) ? NaN : +key;
  const actualValNum = isNaN(Number(value)) ? NaN : +value;
  if (!cond) return true; // 未选条件，默认符合
  const NUMBER_COMPARE_TYPE = ['>', '<', '>=', '<=']; // >、 <、>=、<=四种属于数值类型比较
  // 数值类型
  if (NUMBER_COMPARE_TYPE.includes(cond) && !isNaN(normalValNum) && !isNaN(actualValNum)) {
    if (cond === '>' && normalValNum > actualValNum) return true;
    if (cond === '<' && normalValNum < actualValNum) return true;
    if (cond === '>=' && normalValNum >= actualValNum) return true;
    if (cond === '<=' && normalValNum <= actualValNum) return true;
    return false;
  }
  switch (cond) {
    case '=':
      return `${key}` === `${value}`; // 等于
    case '!=':
      return `${key}` !== `${value}`; // 不等于
    default:
      return false;
  }
};

/**
 * 将数据整理成[{id:1,name:'a'},{id:2,name:'b'}]
 * @param str1 '1,2,3'
 * @param str2  'a,b,c'
 * @returns {[]}
 */
export const stringToArrayObject = (str1 = '', str2 = '') => {
  let stringArr1 = str1.split(',');
  let stringArr2 = str2.split(',');
  return stringArr1.map((item, index) => {
    return { id: item, name: stringArr2[index] };
  });
};

/**
 * 图片压缩
 * @param option
 * @param callback
 * @constructor
 * file 图片源文件
 * quality 压缩程度，值为0-1
 */
export const ImageCompression = (option = {}, callback) => {
  const { file, quality } = option;
  let reader = new FileReader(), img = new Image();
  reader.readAsDataURL(file);
  reader.onload = function(e) {
    img.src = e.target.result;
  };
  img.onload = function() {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    let originWidth = this.width;
    let originHeight = this.height;

    canvas.width = originWidth;
    canvas.height = originHeight;

    context.clearRect(0, 0, originWidth, originHeight);
    context.drawImage(img, 0, 0, originWidth, originHeight);

    canvas.toBlob((blob) => {
      let imgFile = new File([blob], file.name, { type: file.type }); // 将blob对象转化为图片文件
      imgFile.uid = file.uid;
      callback && callback(imgFile);
    }, file.type, quality); // file压缩的图片类型
  };
};

/**
 * 用于行编辑
 * 获取变量的值
 * @param userInfo
 * @param treeNodeData
 * @param varName
 * @param elementList
 * @param formValues
 * @returns {*|string|null|{name: string, id: string}|string|{type: string, value: string}}
 */
export const getVariableValueByTree = ({ userInfo, treeNodeData, varName, elementList, formValues }) => {
  if (getValueFromGlobalVariables({
    userInfo,
    treeNodeData,
    globalVar: varName,
  })) {
    return getValueFromGlobalVariables({
      userInfo,
      treeNodeData,
      globalVar: varName,
    });
  } else {
    let parameterEle = elementList.find(ele => ele.parameter === varName);
    return parameterEle ? formValues[parameterEle.relationColumnName] : '';
  }
};

/**
 * 通用跳转菜单
 * @param tabKey
 * @param comKey
 * @param title
 * @param tabs
 * @param fileData
 * @param functionData
 * @param dispatch
 */
export const jumpFileOfCommon = ({ tabKey, comKey, title, tabs, fileData, functionData, dispatch }) => {

  const { openedTabs } = tabs;
  let openedTab = openedTabs.find(item => {
    return item.tabKey === tabKey;
  });
  if (openedTab) { // 如果目标菜单已经存在，则关闭目标菜单再打开
    dispatch({
      type: 'tabs/removeTab',
      payload: {
        tabKey,
      },
    });
    // 若有对应绑定model数据，则清空model里的状态数据
    const comName = tabKey.split('_')[0];
    const modelName = NEED_CLEAR_SATATE_TABS[comName];
    modelName && dispatch({
      type: `${modelName}/clearState`,
    });
    setTimeout(() => {
      dispatch({
        type: 'tabs/addTab',
        payload: {
          tabKey,
          comKey,
          title,
          fileData,
          functionData,
        },
      });
    }, 0);
  } else {
    dispatch({
      type: 'tabs/addTab',
      payload: {
        tabKey,
        comKey,
        title,
        fileData,
        functionData,
      },
    });
  }
};

/**
 * 逆波兰表达式求值----------加减乘除混合运算
 */
export class Calculate {
  constructor(options = {}) {
    this.weight = options.weight || {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
    };
    // 小数位精度
    this.decimal = options.decimal || 5;
    this.operatorStack = [];    // 运算符栈
    this.outputQueue = [];      // 逆波兰表达式队列
  }

  /**
   * @desc 四则运算，浮点数处理
   */
  operate(left, right, operator) {
    const factor = +'1000000000000'.slice(0, this.decimal + 1);
    if (operator === '+') {
      return Math.round(left * factor + right * factor) / factor;
    } else if (operator === '-') {
      return Math.round(left * factor - right * factor) / factor;
    } else if (operator === '*') {
      return Math.round(left * factor * right * factor) / Math.pow(factor, 2);
    } else if (operator === '/') {
      if (right === 0) throw new Error('被除数不能为0或者是空值');
      return Math.round(left / right * factor) / factor;
    }
  };

  /**
   * @desc 调度场算法
   */
  shuntingYard(token) {
    if (!isNaN(+token)) {
      this.outputQueue.push(+token);
    } else if (token === '(') {
      this.operatorStack.push(token);
    } else if (token === ')') {
      let top = this.operatorStack.pop();
      while (top && top !== '(') {
        this.outputQueue.push(top);
        top = this.operatorStack.pop();
      }
      if (!top) throw new Error('表达式格式错误：括号不闭合');
    } else {
      let top = this.operatorStack.pop();
      while (top && top !== '(' && this.weight[token] <= this.weight[top]) {
        this.outputQueue.push(top);
        top = this.operatorStack.pop();
      }
      top ? this.operatorStack.push(top, token) : this.operatorStack.push(token);
    }
  };

  /**
   * @desc 逆波兰表达式求值
   */
  calRpn() {
    const stack = [];
    while (this.outputQueue.length) {
      let token = this.outputQueue.shift();
      if (typeof token === 'number') {
        stack.push(token);
      } else {
        const right = stack.pop();
        const left = stack.pop();
        if (right === null || right === undefined || right === '' || right === 'underfined' || left === null || left === undefined || left === '' || left === 'underfined') throw new Error('请检查数据是否正确！');
        stack.push(this.operate(left, right, token));
      }
    }
    if (stack.length !== 1) throw new Error('计算错误');
    return stack[0];
  };

  /**
   * @desc 校验表达式合法性，预处理等
   * @todo 更详细的格式校验
   */
  preValid(expStr) {
    return expStr;
  };

  run(expStr) {
    this.operatorStack = [];
    this.outputQueue = [];

    let chars;
    const str = this.preValid(expStr);
    const reg = /([\d\.]+|[\(\)\+\-\*\/])/g;
    while ((chars = reg.exec(str)) !== null) {
      this.shuntingYard(chars[0]);
    }
    while (this.operatorStack.length) {
      this.outputQueue.push(this.operatorStack.pop());
    }
    return this.calRpn();
  }
}

/**
 * 加减乘除四则混合运算
 * @param asqValue
 * @param getValueFromCurrentTabData
 * @param CMessage
 * @returns {number}
 */
export const compoundArithmetic = ({ asqValue, getValueFromCurrentTabData, CMessage, otherParams = '' }) => {
  let str = asqValue;
  const varArr = matchGlobalVars(str);
  if (!varArr.length) return 0;
  varArr.forEach(item => {
    let value = 0;
    if (otherParams && otherParams.type === 'listEidt') { // 兼容全列表，通用业务框架中的行编辑
      value = getValueFromCurrentTabData(item, otherParams.record) || 0;
    } else if (otherParams && otherParams.type === 'tree') { // 树形框架中的表单触发器
      value = getValueFromCurrentTabData({ varName: item }) || 0;
    } else { // 兼容全列表，通用业务框架中的表单触发器
      value = getValueFromCurrentTabData(item) || 0;
    }
    str = str.replace(`{${item}}`, value);
  });
  let initString = str.substring(21, str.length - 1);
  let algorithmArr = initString.split(',');
  let algorithmString = algorithmArr[0];
  let resultMethod = new Calculate();
  let dividendArr = algorithmString.split('/');
  dividendArr.splice(0, 1);
  let result = '0';
  if (dividendArr.length) {
    for (let item of dividendArr) {
      let value = resultMethod.run(item);
      if (value === 0) {
        CMessage('被除数不能为0！', 'warn');
        return result;
      }
    }
  }

  try {
    let value = resultMethod.run(algorithmString);
    const params2 = algorithmArr[1];
    result = params2 ? value.toFixed(params2) : value.toFixed(2);
  } catch (e) {
    CMessage('请检查运算法则配置是否正确,值类型是否是数字！', 'error');
  } finally {
    return result;
  }
};

/**
 * 将毫秒装换成时分秒的时长
 * @param s
 * @returns {string}
 */
export const getSeconds = (s = 0) => {
  let sTime = parseInt(s) || 0;// 秒
  let mTime = 0;// 分
  let hTime = 0;// 时
  if (sTime > 60) {// 如果秒数大于60，将秒数转换成整数
    // 获取分钟，除以60取整数，得到整数分钟
    mTime = parseInt(sTime / 60);
    // 获取秒数，秒数取佘，得到整数秒数
    sTime = parseInt(sTime % 60);
    //  如果分钟大于60，将分钟转换成小时
    if (mTime > 60) {
      // 获取小时，获取分钟除以60，得到整数小时
      hTime = parseInt(mTime / 60);
      // 获取小时后取佘的分，获取分钟除以60取佘的分
      mTime = parseInt(mTime % 60);
    }
  }
  var result = '';
  if (sTime >= 0 && sTime < 10) {
    result = '0' + parseInt(sTime) + '';
  } else {
    result = '' + parseInt(sTime) + '';
  }
  if (mTime >= 0 && mTime < 10) {
    result = '0' + parseInt(mTime) + ':' + result;
  } else {
    result = '' + parseInt(mTime) + ':' + result;
  }
  if (hTime >= 0 && hTime < 10) {
    result = '0' + parseInt(hTime) + ':' + result;
  } else {
    result = '' + parseInt(hTime) + ':' + result;
  }
  return result;

};


