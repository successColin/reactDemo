import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { CMessage } from '@/components/common/BasicWidgets';
import { getValueFromGlobalVariables, matchGlobalVars, getTimeParamTypes } from '@/utils/common';
import {
  IGNORE_FORM_ITEM,
} from '@/constants/element';

/**
 *
 * @param prevListRowData 上一个面板中的数据
 * @param prevTabInfo 上一个面板信息
 * @param tabInfo 当前面板信息
 * @param elementMap 所有面板的控件信息
 * @param defaultValue 控件的默认值
 * @param type 控制返回值，1：name:0 :id
 */
export const reducePopData = (prevListRowData = {}, prevTabInfo = {}, tabInfo = {}, elementMap = [], asqlValue, type) => {
  if (JSON.stringify(prevListRowData) !== '{}' && JSON.stringify(prevTabInfo) !== '{}') {
    let currentEle = elementMap[prevTabInfo.id].find(item => item.parameter === asqlValue && asqlValue && asqlValue.indexOf('@@') > -1);
    if (!currentEle) return '';
    const { showType, id } = prevTabInfo;
    const preData = prevListRowData[id] || {};
    let value = showType === 2 ? JSON.parse(preData[`a${currentEle.id}`]).id : JSON.parse(preData[`${currentEle.id}`]).id;
    return value;
  } else {
    return asqlValue;
  }
};
/**
 *
 * @param prevListRowData 上一个面板中的数据
 * @param prevTabInfo 上一个面板信息
 * @param tabInfo 当前面板信息
 * @param elementMap 所有面板的控件信息
 * @param defaultValue 控件的默认值
 * @param type 控制返回值，1：name:0 :id
 */
export const reducePopData1 = (prevListRowData = {}, prevTabInfo = {}, tabInfo = {}, elementMap = [], asqlValue, type) => {

  if (JSON.stringify(prevListRowData) !== '{}' && JSON.stringify(prevTabInfo) !== '{}') {
    let currentEle = elementMap[prevTabInfo.id].find(item => item.parameter === asqlValue && asqlValue && asqlValue.indexOf('@@') > -1);
    if (!currentEle) return {};
    const { showType, id } = prevTabInfo;
    const preData = prevListRowData[id];
    let value = showType === 2 ? JSON.parse(preData[`a${currentEle.id}`]).id : JSON.parse(preData[`${currentEle.id}`]).id;
    return { data: value, currentEle };
  }
};
/**
 *
 * @param prevListRowData 上一个面板中的数据
 * @param prevTabInfo 上一个面板信息
 * @param tabInfo 当前面板信息
 * @param elementMap 所有面板的控件信息
 * @param defaultValue 控件的默认值
 * @param type 控制返回值，1：name:0 :id
 */
export const reducePopData2 = (prevListRowData = {}, prevTabInfo = {}, tabInfo = {}, elementMap = [], asqlValue, type, isList) => {
  if (JSON.stringify(prevListRowData) !== '{}' && JSON.stringify(prevTabInfo) !== '{}') {
    let currentEle = elementMap[prevTabInfo.id].find(item => item.parameter === asqlValue && asqlValue && asqlValue.indexOf('@@') > -1);
    let value = null;
    if (isList) {
      value = !!currentEle && (prevListRowData[`a${currentEle.id}`]) || '';
    } else {
      value = currentEle && (prevListRowData[prevTabInfo.id][`a${currentEle.id}`] || prevListRowData[currentEle.id]);
    }
    if (value && isJsonString(value)) {
      let data = value ? (type ? JSON.parse(value).name : JSON.parse(value).id) : asqlValue || '';
      return { data, currentEle };
    } else {
      return value || '';
    }
  } else {
    return '';
  }
};

// JS判断字符串是否为json数据
export const isJsonString = (str) => {
  try {
    if (typeof JSON.parse(str) === 'object') {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
};

/**
 * 按钮，数据选择框的前端触发器不参与页面初始化过程
 * @type {Array}
 */
export const filterTrigger = [3, 4, 5, 6, 7, 12, 17, 18, 23, 24, 25, 26, 28, 29];

/**
 * 时间计算，只有结束时间大于开始时间才行
 * @param startTime
 * @param endTime
 * @param langLib
 * @returns {number}
 */
export const timeDiff = (startTime, endTime, langLib, type) => {
  if (!startTime || !endTime) return;
  if (moment(startTime).isAfter(endTime)) { // 开始时间大于结束时间
    CMessage(langLib['message.error.startTimeAfterEndTime'], 'error');
    return;
  }
  const otherType = getTimeParamTypes(type);
  const value = moment(endTime).diff(startTime, otherType);
  return value;
};

/**
 * 数组数据重组
 * @param arr 传进来的数组
 * @param key 根据key将参数数组中相同的值分类，
 * @returns {[]} 返回对应的二维数组
 */
export const arrayClassify = (arr = [], key) => {
  if (!key && !arr.length) return [];
  let newArr = Object.values(arr.reduce((res, item) => {
    res[item[key]] ? res[item[key]].push(item) : res[item[key]] = [item];
    return res;
  }, {}));
  return newArr;
};

export const reduceArrObj = (arr, ...arg) => {
  let newArr = [];
  arr.forEach(item => {
    let firstData = item[0];
    let obj = {};
    arg.forEach(items => {
      obj[items] = firstData[items];
    });
    obj.list = item;
    newArr.push(obj);
  });
  return newArr;
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
export const JumpFileDate = (jumpFunctionId, data = {}, elementList = [], paramsArr = [], userInfo, getValueFromGlobalVariables, type) => {
  let result = {
    jumpTag: jumpFunctionId,
  };
  if (JSON.stringify(data) !== '{}') {
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
            result[key] = { value: data[`a${eleObj.id}`], type: relationColumnType };
            if (basetype === 3) {
              result[key] = {
                value: data[`a${eleObj.id}`],
                type: relationColumnType,
                data: JSON.stringify({
                  id: data[`a${eleObj.id}`],
                  name: data[`${IGNORE_FORM_ITEM}${eleObj.id}`],
                }),
                ...rest,
              };
            } else {
              result[key] = {
                value: data[`a${eleObj.id}`],
                type: relationColumnType,
                ...rest,
              };
            }
          } else if (!type) {
            if (basetype === 3) {
              result[key] = {
                value: JSON.parse(data[`${eleObj.id}`]).id,
                type: relationColumnType || itemType,
                data: data[`${eleObj.id}`],
                ...rest,
              };
            } else {
              result[key] = {
                value: JSON.parse(data[`${eleObj.id}`]).id,
                type: relationColumnType || itemType,
                ...rest,
              };
            }
          }
        }
      } else {
        result[key] = { value, type: itemType, ...rest };
      }
    });
  }
  return result;
};
/**
 * 返回面板过滤条件的参数值
 * @param advancedQueryMap  过滤条件集合
 * @param tabInfo  当前面板信息
 * @param BusinessID  主业务id
 * @param userInfo  用户信息
 * @param prevListRowData  上个面板数据
 * @param prevTabInfo  上个面板信息
 * @param elementMap  所有节点集合
 * @returns {{globalMap: {}, globalQueryMap: {}}}
 */
export const getFilterConditions = (advancedQueryMap, tabInfo, BusinessID, userInfo, prevListRowData, prevTabInfo, elementMap, isList) => {
  const globalMap = {}; // 面板组合条件
  const globalQueryMap = {}; // 面板过滤条件ASQL
  if (!tabInfo) return;
  const queryList = advancedQueryMap[tabInfo.id] || [];
  // 将过滤条件中的全局变量赋值
  queryList.forEach(item => {
    const { asqlValueType, asqlValue, queryType, apiSql } = item;
    if (queryType === 1) {
      // 值类型为【变量】时，需要将变量对应的值传给后台
      if (asqlValueType === 2) {
        // @@BusinessID 取左侧树的主业务数据（因为左侧树无法配置）
        if (asqlValue === '@@BusinessID') {
          globalMap[item.asqlValue] = BusinessID;
        } else {
          // 当前时间、当前用户
          const globalVar = getValueFromGlobalVariables({
            globalVar: asqlValue,
            userInfo,
          }) || reducePopData2(prevListRowData, prevTabInfo, tabInfo, elementMap, asqlValue, '', isList);
          // 或用户自定义的变量
          // (在关联新增按钮的弹出面板上，只有上一个面板为表单时，才可以获取自定义的变量)
          // （若上一个面板为列表，则无法定位到定义的变量具体哪条数据值）
          globalMap[item.asqlValue] = globalVar;
        }
      }
    } else if (queryType === 2) {
      if (!apiSql) return;
      const varNameList = matchGlobalVars(apiSql);
      varNameList.forEach(varName => {
          if (varName === '@@BusinessID') {
            globalQueryMap[varName] = { value: BusinessID, type: 2 };
          } else {
            // 当前时间、当前用户
            let globalVar = getValueFromGlobalVariables({
              globalVar: varName,
              userInfo,
              globalMapType: 'globalMapType',
            });
            // 或用户自定义的变量
            // (在关联新增按钮的弹出面板上，只有上一个面板为表单时，才可以获取自定义的变量)
            // （若上一个面板为列表，则无法定位到定义的变量具体哪条数据值）
            if (globalVar.value) {
              globalQueryMap[varName] = globalVar;
            } else {
              globalVar = reducePopData2(prevListRowData, prevTabInfo, tabInfo, elementMap, varName, '', isList) || {};
              if (JSON.stringify(globalVar) === '{}') return;
              const { data = '', currentEle = {} } = globalVar;
              const { relationColumnType } = currentEle;
              globalQueryMap[varName] = { value: data, type: relationColumnType };
            }
          }
        },
      );
    }
  });
  return {
    globalMap,
    globalQueryMap,
  };
};
// 根据默认值在本面板上找到对应的参数名控件，然后给默认值控件赋值,返回一个全新的数据集合
export const getDefaultValueFromCurrentTab = ({ currentTabData = {}, elementMap, tabInfo }) => {
  const { id: tabId } = tabInfo;
  const elementList = elementMap[tabId] || [];
  let newData = { ...currentTabData };
  elementList.forEach(item => {
    const { defaultValue, parameter, id } = item;
    if (defaultValue && defaultValue.indexOf('@@') > -1) {
      let orgEleObj = elementList.find(items => items.parameter === defaultValue);
      if (orgEleObj) {
        const { id: orgEleObjId } = orgEleObj;
        const itemData = newData[`a${id}`] && JSON.parse(newData[`a${id}`]) || {};
        if (!itemData.id) newData[`a${id}`] = newData[`a${orgEleObjId}`];
      }
    }
  });
  return newData;
};
