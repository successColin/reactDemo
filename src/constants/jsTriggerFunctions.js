/*
 * @Author: Fus
 * @Date:   2019-12-09 14:21:27
 * @Desc: js触发器可选函数
 */
import moment from 'moment';
import { NUMBER_COLUMN_TYPE } from '@/constants/element';
import { isEmptyValue, formatTime } from '@/utils/common';

// js函数
export const JS_FUNCTION_MAP = {
  1: { // 获取时间区间
    key: 'dateRange',
    params: [{
      paramName: 'startTime',
      desc: 'jsFunction.paramDesc.dateRange.startTime',
    }, {
      paramName: 'endTime',
      desc: 'jsFunction.paramDesc.dateRange.endTime',
    }],
  },
  2: { // 获取数字区间
    key: 'numberRange',
    params: [{
      paramName: 'min',
      desc: 'jsFunction.paramDesc.numberRange.min',
    }, {
      paramName: 'max',
      desc: 'jsFunction.paramDesc.numberRange.max',
    }],
  },
};

// js触发器函数
export const jsFunctions = {
  // 获取时间可选区间
  getDatePickerRange: (current, paramObj = {}, eleObj) => {
    let { startTime, endTime } = paramObj;
    startTime = startTime === '1970-01-01 00:00:00' ? '' : startTime;
    endTime = endTime === '1970-01-01 00:00:00' ? '' : endTime;
    if (!startTime && !endTime) return false;
    if (startTime && !endTime) {
      return current && current < moment(startTime).endOf('second');
    } else if (!startTime && endTime) {
      return current && current > moment(endTime).endOf('second');
    } else if (startTime && endTime) {
      return current && (current < moment(startTime).endOf('second') || current > moment(endTime).endOf('second'));
    } else {
      return false;
    }
  },
};

/**
 * js触发器校验规则
 * @param {object} params js触发器函数参数
 * @param {object} eleObj 控件对象
 * @param {moment} value 当前值
 * @param {function} callback 校验回调函数
 * @param {object} langLib 本地语言包
 */
export const validJsFunctions = ({
                                   params,
                                   eleObj,
                                   langLib,
                                   // rule,
                                   value,
                                   callback,
                                 }) => {
  const { basetype, relationColumnType } = eleObj;
  const baseProps = { params, value, callback, langLib, eleObj };
  if (basetype === 9) { // 时间校验
    validTimeRange(baseProps);
    // } else if (NUMBER_COLUMN_TYPE.includes(relationColumnType)) { // 数字校验
    //   validNumberRange(baseProps);
  }
};

/**
 * js触发器校验规则-时间区间
 * @param {object} params js触发器函数参数
 * @param {moment} value 当前值
 * @param {function} callback 校验回调函数
 * @param {object} langLib 本地语言包
 * @param {object} eleObj 控件对象
 */
const validTimeRange = ({ params, value, callback, langLib, eleObj }) => {
  let { startTime, endTime } = params;
  startTime = startTime === '1970-01-01 00:00:00' ? '' : startTime;
  endTime = endTime === '1970-01-01 00:00:00' ? '' : endTime;
  const { requisite, basetype } = eleObj;
  const valText = value ? formatTime(value, basetype) : '';
  // 非必填，且无值时不校验
  if (!requisite && isEmptyValue(eleObj, {
    id: valText,
    name: valText,
  })) {
    callback();
    return;
  }
  if (startTime && !endTime && value < moment(startTime)) { // 只小于开始时间
    callback(langLib['validator.time.startTime'](startTime));
    return;
  } else if (!startTime && endTime && value > moment(endTime)) { // 只大于结束时间
    callback(langLib['validator.time.endTime'](endTime));
    return;
  } else if (startTime && endTime && (value < moment(startTime) || value > moment(endTime))) { // 未在区间范围内
    callback(langLib['validator.time.outTime'](startTime, endTime));
    return;
  }
  callback();
};
