/*
 * @Author: Fus
 * @Date:   2019-08-27 16:17:38
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-01-26 19:44:47
 * @Desc: 详情表单
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Col, Select, Tooltip, Row, Radio } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import _ from 'lodash';
import {
  CInput,
  CInputNumber,
  CTextArea,
  CSelect,
  SplitLine,
  NormalSearchSelect,
  CUpload,
  CDatePicker,
  CLabel,
  CRate,
  ImgUnRelation,
  CBraftEditor, CheckBoxSearchSelect, CQRCode,
  CMapInput,
} from '@/components/common/BasicWidgets';
import {
  BTN_ELEMENT_TYPE,
  HIDDEN_ELEMENT_TYPE,
  IGNORE_FORM_ITEM,
  TIME_FORMATE_TYPES,
  NUMBER_COLUMN_TYPE,
  SELECT_ELEMETN_TYPE,
  SEARCH_SELECT_TYPE,
  TRIGGER_ELEMENT_TYPE,
  FILTER_ELEMENT_TYPE,
} from '@/constants/element';
import { BaseContext } from '@/constants/global';
import {
  setElementToValue,
  setValueToElement,
  validTriggerMatch,
  matchGlobalFunctionParam,
  isGlobalOrCustomVar,
  formatTime,
  getGlobalMapOrGlobalQueryMap,
  unique,
} from '@/utils/common';
import { getCheckBoxSearchDetail, getNormalSearchDetail, getPageSelectOptions } from '@/services/frame';
import { jsFunctions, validJsFunctions } from '@/constants/jsTriggerFunctions';
import styles from '@/components/common/FormItems/FormItems.less';
import detailFormStyle from './DetailForm.less';
import FrameStepBar from '@/components/common/FrameStepBar/FrameStepBar';
import { getFilterConditions } from '@/components/Frames/LeftListFrame/method';

const { Option } = Select;

class DetailForm extends Component {
  static contextType = BaseContext;
  state = {
    originEleData: {},
    infosObj: {}, // 获取过详情接口的数据
  };
  // 自定义校验规则
  customValidRule = (params, eleObj, rule, value, callback) => {
    const { langLib } = this.context;
    if (!params) { // 无js触发器计算属性的不校验
      callback();
      return;
    }
    validJsFunctions({
      params,
      eleObj,
      langLib,
      value,
      callback,
    });
  };
  // 数据选择框 根据id获取详情
  fetchDetailById = (eleObj, id, needRetunValueObj = false) => {
    const { mainTableName: tabSource, mainColumnName, id: eleId, basetype } = eleObj;
    return new Promise((resolve, reject) => {
      if (!id || !tabSource) {
        resolve({});
        return;
      }
      const detailKey = `${tabSource}_${id}_${basetype}`;
      const { infosObj } = this.state;
      const newInfosObj = { ...infosObj };
      const setFormData = (valueObj, resData) => {
        if (needRetunValueObj) {
          resolve(valueObj);
          return;
        }
        const { formData, setContainerState } = this.props;
        setContainerState({
          formData: {
            ...formData,
            [eleId]: valueObj,
          },
        }, () => {
          // 该控件为选择框，则需要继续校验该控件的触发器
          if (SEARCH_SELECT_TYPE.includes(basetype)) {
            this.handleChangeSearchSelect(eleObj, resData);
          }
        });
        resolve();
      };
      const api = basetype === 45 ? getCheckBoxSearchDetail : getNormalSearchDetail;
      const params = {
        [basetype === 45 ? 'tableName' : 'tabSource']: tabSource,
        [basetype === 45 ? 'ids' : 'id']: id,
      };
      api(params).then(res => {
        const { formData, setContainerState } = this.props;
        newInfosObj[detailKey] = res;
        this.setState({ infosObj: newInfosObj });
        setFormData({
          id: basetype === 45 ? res.map(item => item.id).join(',') : res.id,
          name: basetype === 45 ? res.map(item => item[mainColumnName]).join(',') : res[mainColumnName],
        }, res);
      });
    });
  };
  // label修改后需要将隐藏的实际值也修改成显示的值
  handleChangeLabel = (eleObj, value) => {
    const { setContainerState, formData } = this.props;
    const { id } = eleObj;
    setContainerState({
      formData: {
        ...formData,
        [id]: {
          id: value,
          name: value,
        },
      },
    });
  };
  // js触发器转化参数名称及值
  getJsTriggerParmValues = eleObj => {
    const { triggerMap, getGlobalVarValues } = this.props;
    const { id: eleId, basetype: eleType } = eleObj;
    const triggerList = triggerMap[eleId] || [];
    const triggers = triggerList.filter(item => item.triggerType === 4 && item.basetype === 5);
    if (!triggers.length) return false;
    const result = {};
    triggers.forEach(trigger => {
      const { jsFunctionList } = trigger;
      if (!jsFunctionList || !jsFunctionList.length) return;
      jsFunctionList.forEach(jsFunObj => {
        const { valueType, param, paramValue } = jsFunObj;
        if (valueType === 2) {
          result[param] = getGlobalVarValues({ varName: paramValue, eleObj });
        } else {
          result[param] = paramValue;
        }
      });
    });
    return result;
  };
  // 根据控件类型生成对应控件
  setElementToWidget = (eleObj, jsTriggerParamObj) => {
    const { functionData = {}, form, formData, setContainerState, fileRelationList, filterMap, treeNodeData = {}, getGlobalVarValues, setFrameState, filePassList } = this.props;
    const { canmodify } = functionData.attributes;
    const { basetype, readonly, mainTableName, mainColumnName, relationTableName, elementFormat, placeholderText, relationColumnType, relationTabId, id: eleId, displayName } = eleObj;
    const baseProps = {
      key: `${treeNodeData.id}_${eleObj.id}`,
      // key: `${eleId}`,
      disabled: !!readonly || !canmodify,
      placeholder: placeholderText,
    };
    // 输入框控件
    const InputCom = (
      <CInput
        {...baseProps}
        onBlur={e => this.handleChangeInput(eleObj, e.target.value)}
      />
    );
    const setEleFormData = value => {
      setContainerState({
        formData: {
          ...formData,
          [eleId]: {
            id: value,
            name: value,
          },
        },
      });
    };
    if (basetype === 1) {
      // 数字输入框
      if (NUMBER_COLUMN_TYPE.includes(relationColumnType)) {
        // const jsTriggerParamObj = this.getJsTriggerParmValues(eleObj);
        const _props = {
          ...baseProps,
          // onChange: val => this.handleChangeInput(eleObj, val),
        };
        if (jsTriggerParamObj) { // 有js触发器的计算属性
          const { max, min } = jsTriggerParamObj;
          if (max !== '' && !isNaN(Number(max))) _props.max = max;
          if (min !== '' && !isNaN(Number(min))) _props.min = min;
        }
        return <CInputNumber {..._props} onBlur={e => this.handleChangeInput(eleObj, e.target.value)}/>;
        // return <CInputNumber {..._props} onBlur={e => setEleFormData(e.target.value)}/>;
      }
      return InputCom;
    } else if (SELECT_ELEMETN_TYPE.includes(basetype)) { // 下拉框
      return (
        <CSelect {...baseProps} onChange={val => this.handleChangeSelect(eleObj, `${val}`)}>
          {this.getOptions(eleObj.id)}
        </CSelect>
      );
    } else if (basetype === 45) {
      const { selectListTabId } = eleObj;
      const _props = {
        ...baseProps,
        eleObj,
        filterMap,
        form,
        multiple: true,
        valueObj: formData[eleId],
        handleClickValue: () => relationTabId && this.props.setPopupTabInfo({ eleObj, listRowData: formData }),
        getGlobalVarValues: varName => getGlobalVarValues({
          varName,
          type: 'defaultValue',
          eleObj,
        }),
        deleteTag: data => this.deletteSetChecBoxValue(data, eleObj),
        setSelected: selecteds => this.handleSetChecBoxValue(selecteds, eleObj),
      };
      // 自定义弹出列表
      if (selectListTabId) {
        _props.onOpen = () => this.props.setPopupTabInfo({
          eleObj,
          listRowData: formData,
          tabIdKey: 'selectListTabId',
          handleSetCustomSelectList: _props.setSelected,
          otherParamsInCustomList: { multiple: true },
        });
      }
      return (<CheckBoxSearchSelect {..._props}/>);
    } else if (basetype === 3) { // 数据选择框
      const { selectListTabId, jumpType, jumpMenuList } = eleObj;
      const hasColor = ((relationTabId && (jumpType === 1 || !jumpType)) || (jumpType === 2 && jumpMenuList.length));
      const _props = {
        ...baseProps,
        eleObj,
        valueObj: formData[eleId],
        form: form,
        filterMap: filterMap,
        multiple: false,
        setSelected: selecteds => this.handleChangeSearchSelect(eleObj, selecteds[0] || {}),
        handleClickValue: () => !!hasColor && this.props.setPopupTabInfo({ eleObj, listRowData: formData }),
        getGlobalVarValues: varName => getGlobalVarValues({
          varName,
          type: 'defaultValue',
          eleObj,
        }),
      };
      // 自定义弹出列表
      if (selectListTabId) {
        _props.onOpen = () => this.props.setPopupTabInfo({
          eleObj,
          listRowData: formData,
          tabIdKey: 'selectListTabId',
          handleSetCustomSelectList: _props.setSelected,
          otherParamsInCustomList: { multiple: false },
        });
      }
      return (
        <NormalSearchSelect {..._props} />
      );
    } else if (basetype === 8 || basetype === 13) { // 上传文件
      const { stateId, typeId, priorityId, elementFormat, defaultValue, parameter } = eleObj;
      const valueObj = formData[eleId] || {};
      if (elementFormat === 2) { // 单图片地址保存字段（无业务关联图片）
        return (
          <ImgUnRelation
            {...baseProps}
            eleObj={eleObj}
            setFileUrl={url => this.setFileUrl(url, eleObj)}
            urlVal={valueObj.id || ''}
          />
        );
      }
      return (
        <div>
          <CUpload
            {...baseProps}
            relationParams={{
              relationId: formData.id && formData.id.id,
              relationTableName,
              relationPriorityId: priorityId,
              relationStateId: stateId,
              relationTypeId: typeId,
              parameter,
              setFrameState,
              filePassList,
              defaultValue: defaultValue,
              updataState: setContainerState,
            }}
            eleObj={eleObj}
            relationFileObj={fileRelationList}
            setFileInfo={(fileId, fileObj) => this.handleFileChange(eleObj, fileId, fileObj)}
            onRemoveFile={removeId => this.handleRemoveFile(eleObj, removeId)}
          />
        </div>
      );
    } else if (basetype === 9) { // 日期选择框
      // const jsTriggerParamObj = this.getJsTriggerParmValues(eleObj);
      const _props = {
        ...baseProps,
        format: TIME_FORMATE_TYPES[elementFormat || 1],
        showTime: elementFormat !== 2,
        onChange: date => this.handleChangeDatePicker(eleObj, date),
      };
      if (jsTriggerParamObj) { // 有js触发器的计算属性
        _props.disabledDate = current => jsFunctions.getDatePickerRange(current, jsTriggerParamObj);
      }
      return (
        <CDatePicker {..._props} />
      );
    } else if (basetype === 10) { // 多行文本
      return <CTextArea {...baseProps} autoSize={true}/>;
    } else if (basetype === 15) {
      return ( // 多行文本
        <Radio.Group {...baseProps} onChange={e => this.handleChangeSelect(eleObj, e.target.value)}>
          {this.getRadioGroup(eleObj.id)}
        </Radio.Group>
      );
    } else if (basetype === 17) { // label
      return (
        <CLabel
          {...baseProps}
          onChange={val => this.handleChangeLabel(eleObj, val)}
          relationTabId={relationTabId}
          onClick={() => relationTabId && this.props.setPopupTabInfo({ eleObj, listRowData: formData })}
        />
      );
    } else if (basetype === 36) {
      return <CRate {...baseProps} onChange={val => setEleFormData(val)}/>;
    } else if (basetype === 39) {
      const valueObj = formData[eleId] || {};
      return (
        <CBraftEditor
          {...baseProps}
          eleObj={eleObj}
          textValue={valueObj.id || ''}
          ref={ref => this.textEditorRef = ref}
        />
      );
    } else if (basetype === 50) {
      return <CQRCode eleObj={eleObj}/>;
    } else if (basetype === 46) {
      return <CMapInput title={displayName} {...baseProps}/>;
    } else {
      return InputCom;
    }
  };
  // 保存图片路径
  setFileUrl = (url, eleObj) => {
    const { id } = eleObj;
    const { formData, form } = this.props;
    form.resetFields([
      `${id}`,
      `${IGNORE_FORM_ITEM}_${id}`,
    ]);
    this.props.setContainerState({
      formData: {
        ...formData,
        [id]: {
          id: url,
          name: url,
        },
      },
    });
  };
  // 删除文件
  handleRemoveFile = (eleObj, removeId) => {
    const { fileRelationList, setContainerState, form, filePassList, setFrameState } = this.props;
    const { id } = eleObj;
    const newFilesObj = _.cloneDeep(fileRelationList);
    const newFilesPassObj = _.cloneDeep(filePassList);
    Object.keys(fileRelationList).forEach(key => {
      if (+key === removeId) {
        delete newFilesObj[key];
      }
    });
    Object.keys(filePassList).forEach(key => {
      if (+key === removeId) {
        delete newFilesObj[key];
      }
    });
    form.resetFields([
      `${id}`,
      `${IGNORE_FORM_ITEM}_${id}`,
    ]);
    setContainerState({ fileRelationList: newFilesObj });
    setFrameState({ filePassList: newFilesPassObj });
  };
  // 更新关联文件
  handleFileChange = (eleObj, fileId, fileObj) => {
    const { stateId, typeId, priorityId, id: eleId, parameter } = eleObj;
    const { fileRelationList, setContainerState, formData, form, setFrameState, filePassList } = this.props;
    const newFiles = {
      [fileId]: {
        stateId,
        typeId,
        priorityId,
      },
    };
    form.resetFields([
      `${eleId}`,
      `${IGNORE_FORM_ITEM}_${eleId}`,
    ]);
    setContainerState({
      fileRelationList: {
        ...fileRelationList,
        ...newFiles,
      },
    });
    if (parameter) {
      const newFilePass = [{
        ...fileObj,
        stateId,
        typeId,
        priorityId,
      }];
      let files = filePassList[parameter] || [];
      files = [
        ...files,
        ...newFilePass,
      ];
      let newFilePassList = filePassList;
      newFilePassList[parameter] = files;
      setFrameState({
        filePassList: newFilePassList,
      });
    }
  };
  // 修改输入框值
  handleChangeInput = (eleObj, val) => {
    const { formData, setContainerState, form } = this.props;
    const { id } = eleObj;
    const activeEleValObj = {
      id: val,
      name: val,
    };
    this.beforeDoFrontTrigger({
      eleObj,
      activeEleValObj,
    });
  };
  // 修改时间控件时对应修改隐藏真实值的控件
  handleChangeDatePicker = (eleObj, eleValue) => {
    const { formData, setContainerState, form } = this.props;
    const { elementFormat, id } = eleObj;
    const value = eleValue ? formatTime(eleValue, elementFormat) : '';
    const activeEleValObj = {
      id: value,
      name: value,
    };
    this.beforeDoFrontTrigger({
      eleObj,
      activeEleValObj,
    });
  };
  // 修改下拉框
  handleChangeSelect = (eleObj, valStr) => {
    const { elementFormat, id } = eleObj;
    const { tabDropDownData, form } = this.props;
    const matchOption = tabDropDownData[id] && tabDropDownData[id].find(item => `${item.id}` === valStr) || {};
    const activeEleValObj = {
      id: valStr,
      name: matchOption.name || '',
    };
    this.beforeDoFrontTrigger({
      eleObj,
      activeEleValObj,
    });
  };
  // 直接删除多选便签
  deletteSetChecBoxValue = (selecteds, eleObj) => {
    const { mainTableName: tabSource } = eleObj;
    const activeEleValObj = {
      id: selecteds.id || '',
      name: selecteds.name || '',
    };
    if (!selecteds.id) {
      this.beforeDoFrontTrigger({
        eleObj,
        activeEleValObj,
        searchSelectedData: {},
      });
      return;
    }
    getCheckBoxSearchDetail({
      tableName: tabSource,
      ids: selecteds.id,
    }).then(res => {
      this.beforeDoFrontTrigger({
        eleObj,
        activeEleValObj,
        searchSelectedData: res,
      });
    });

  };
  // 设置多选框的数据
  handleSetChecBoxValue = (selecteds = [], eleObj) => {
    const { mainColumnName } = eleObj;
    const activeEleValObj = {
      id: selecteds.map(item => item.id).join(',') || '',
      name: selecteds.map(item => item[mainColumnName]).join(',') || '',
    };
    this.beforeDoFrontTrigger({
      eleObj,
      activeEleValObj,
      searchSelectedData: selecteds,
    });
  };
  // 修改选择框
  handleChangeSearchSelect = (eleObj, searchSelectedData) => {
    const { form } = this.props;
    const { mainColumnName, id } = eleObj;
    const activeEleValObj = {
      id: searchSelectedData.id || '',
      name: searchSelectedData[mainColumnName] || '',
    };
    this.beforeDoFrontTrigger({
      eleObj,
      activeEleValObj,
      searchSelectedData,
    });
  };
  // 触发触发器前逻辑
  beforeDoFrontTrigger = ({
                            eleObj,
                            activeEleValObj = {},
                            searchSelectedData = {},
                            shouldResetFields = true,
                          }) => {
    const { formData, setContainerState, form, triggerMap } = this.props;
    const { id, triggerSign } = eleObj;
    if (shouldResetFields) {
      form.resetFields([
        `${id}`,
        `${IGNORE_FORM_ITEM}_${id}`,
      ]);
    }
    // 先更新当前控件的值
    setContainerState({
      formData: {
        ...formData,
        [id]: activeEleValObj,
      },
    }, () => {
      const eleTriggers = triggerMap[id] || [];
      // 排除加载触发器外的其他事件类型
      const triggers = eleTriggers.filter(item => item.triggerType === 1 && item.basetype !== 4);
      let params = {
        eleObj,
        activeEleValObj,
        searchSelectedData,
        triggers,
      };
      if (triggerSign === 1) { // 新的触发器逻辑
        // 对应控件的同种触发器事件类型
        const filterTypeTriggers = this.filterTriggerEventByEleType(eleObj, triggers);
        params = { ...params, triggers: filterTypeTriggers };
      }
      this.doFrontTrigger(params);
    });
  };

  // 匹配规则后对应控件的触发效果
  async dealTargetEleByType({
                              eleObj, // 当前控件
                              activeEleValObj = {}, // 当前控件的值对象
                              trigger, // 触发器事件对象
                              cascadeSelectList = [], // 需要重新获取下拉数据的下拉框
                              searchSelectedData = {}, // 选择框选择数据后根据id获取的完整数据
                              unMatchCallback = null, // 不满足匹配条件时的回调函数
                            }) {
    const { getGlobalVarValues, elementMap, tabInfo } = this.props;
    const { relationElementValue, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible, canModifyValue, endTriggerNum } = trigger;
    const { basetype: originEleBaseType } = eleObj;
    const elementList = elementMap[tabInfo.id] || [];
    const targetEle = elementList.find(item => item.id === relationElementId);
    if (!targetEle) return false; // 没有目标控件
    const { basetype: targetEleType } = targetEle;
    let actualVal = activeEleValObj.id || '';
    let matchVal = endTriggerNum;
    if (isGlobalOrCustomVar(actualVal)) { // 控件值为全局变量
      actualVal = getGlobalVarValues({ varName: actualVal });
    }
    if (isGlobalOrCustomVar(endTriggerNum)) { // 匹配值为全局变量
      matchVal = getGlobalVarValues({ varName: endTriggerNum });
    }
    const validMatch = validTriggerMatch(trigger, actualVal, matchVal, getGlobalVarValues);
    if (!validMatch) { // 不满足匹配条件则返回
      unMatchCallback && unMatchCallback();
      return false;
    }
    let valueObj = { id: relationElementValue, name: relationElementValue };
    // // 有隐藏项的控件需要id和name不同
    // if (HIDDEN_ELEMENT_TYPE.includes(targetEleType)) {
    //   valueObj.name = '';
    // }
    // 值为变量
    if (isGlobalOrCustomVar(relationElementValue)) {
      valueObj = getGlobalVarValues({
        varName: relationElementValue,
        eleObj: targetEle,
        isReturnObj: true,
      });
    }
    // 源控件为下拉框
    if (SELECT_ELEMETN_TYPE.includes(originEleBaseType)) {
      const { id, basetype, elementFormat } = targetEle;
      // 级联下拉框
      if (canModifyValue && SELECT_ELEMETN_TYPE.includes(basetype) && elementFormat === 2) {
        cascadeSelectList.push(targetEle);
      }
    }
    // 源控件为选择框 或 目标控件为选择框
    if (SEARCH_SELECT_TYPE.includes(originEleBaseType) || SEARCH_SELECT_TYPE.concat([17]).includes(targetEle.basetype)) {
      // 全局函数入参
      const paramName = matchGlobalFunctionParam(relationElementValue);
      let value = valueObj.id;
      // 取当前数据选择框中选中的详情数据对应参数值
      if (paramName) {
        // 如果源控件是多选框，并且值是默认值，那就是是空数组
        if (Object.prototype.toString.call(searchSelectedData) === '[object Object]') value = searchSelectedData[paramName] || '';
        if (Object.prototype.toString.call(searchSelectedData) === '[object Array]') value = unique(searchSelectedData, paramName).filter(item => item[paramName]).map(item => item[paramName]).join(',');
        if (originEleBaseType === 45 && Object.prototype.toString.call(searchSelectedData) === '[object Object]') value = searchSelectedData.id;
        valueObj = { id: value, name: value };
      }
      // 目标控件属于选择框的需要单独调接口获取详情
      if (SEARCH_SELECT_TYPE.includes(targetEle.basetype) && (!isNaN(Number(value)) || !Number(value))) {
        valueObj = await this.fetchDetailById(targetEle, +value, true);
      }
      // 控件是多选框的，只要有值就单独调用接口
      if (targetEle.basetype === 45 && value) {
        valueObj = await this.fetchDetailById(targetEle, value, true);
      }
      if (targetEle.basetype === 17 && targetEle.valueFieldType !== 2) {
        valueObj = await this.fetchDetailById(targetEle, +value, true);
      }
    }
    return {
      targetEleValueObj: valueObj,
      selectEleList: cascadeSelectList,
    };
  };

  // 根据控件类型区分触发器事件
  filterTriggerEventByEleType = (eleObj, triggerList) => {
    const { basetype } = eleObj;
    let triggerBaseType = null;
    if (TRIGGER_ELEMENT_TYPE.assignValue.includes(basetype)) { // 选择框=赋值
      triggerBaseType = 3;
    } else if (TRIGGER_ELEMENT_TYPE.dataChange.includes(basetype)) { // 下拉框=数据变更
      triggerBaseType = 2;
    } else if (TRIGGER_ELEMENT_TYPE.click.includes(basetype)) { // 按钮=点击
      triggerBaseType = 1;
    }
    const matchTriggers = triggerList.filter(item => item.basetype === triggerBaseType);
    const result = _.orderBy(matchTriggers, ['eventBasepriority'], ['asc']);
    return result;
  };
  // 前端触发器
  doFrontTrigger = ({
                      eleObj,
                      activeEleValObj = {},
                      searchSelectedData = {},
                      triggers = [], // 触发器列表
                    }) => {
    const { triggerMap, getGlobalVarValues, elementMap = {}, tabInfo = {}, formData = {}, setContainerState, originFormData, originElementMap, form } = this.props;
    const { id: originEleId, basetype: originEleBaseType, triggerSign } = eleObj;
    const eleTriggers = triggerMap[originEleId] || [];
    const elementList = elementMap[tabInfo.id] || [];
    const unsetFormData = {
      [originEleId]: activeEleValObj, // 源控件
    };
    const targetEleList = []; // 需要修改的目标控件列表
    const cascadeSelectList = []; // 需要重新获取下拉数据的控件
    triggers.forEach(trigger => {
      const { relationElementValue, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible, canModifyValue, endTriggerNum } = trigger;
      const targetEle = elementList.find(item => item.id === relationElementId);
      // 不满足条件的回调函数
      const unMatchCallback = () => {
        // 属性恢复原始状态
        const eleList = originElementMap[tabInfo.id] || [];
        const originTargetEle = eleList.find(item => item.id === relationElementId);
        const originData = originFormData[relationElementId] || {};
        originTargetEle && targetEleList.push(originTargetEle);
        // 值恢复原始数据
        unsetFormData[relationElementId] = originData;
        const showValue = setValueToElement(targetEle, originData.name);
        form.setFieldsValue({
          [`${relationElementId}`]: originData.id,
          [`${IGNORE_FORM_ITEM}_${relationElementId}`]: showValue,
        });
        if (SEARCH_SELECT_TYPE.includes(targetEle.basetype) && originData.id) {
          this.fetchDetailById(targetEle, originData.id);
        }
      };
      this.dealTargetEleByType({
        eleObj,
        activeEleValObj,
        trigger,
        cascadeSelectList,
        searchSelectedData,
        unMatchCallback: triggerSign === 1 ? null : unMatchCallback,
      }).then(validResult => {
        if (!validResult) return;
        const { targetEleValueObj, selectEleList } = validResult;
        // 需要重新调用的级联下拉框
        // cascadeSelectList.push(...selectEleList);
        unsetFormData[relationElementId] = targetEleValueObj;
        // 属性的改变-改变对应属性数据
        targetEleList.push({
          ...targetEle,
          requisite: relationElementRequisite,
          readonly: relationElementReadonly,
          visiabled: relationElementVisible,
        });
        form.resetFields([
          `${relationElementId}`,
          `${IGNORE_FORM_ITEM}_${relationElementId}`,
        ]);
        // 更新元素属性
        const newElementList = [...elementList];
        targetEleList.length && targetEleList.forEach(changedItem => {
          const targetIndex = newElementList.findIndex(item => changedItem.id === item.id);
          newElementList.splice(targetIndex, 1, changedItem);
        });
        setContainerState({
          elementMap: {
            ...elementMap,
            [tabInfo.id]: newElementList,
          },
          formData: {
            ...formData,
            ...unsetFormData,
          },
        }, () => {
          // 动态获取下拉数据
          // cascadeSelectList.length && this.fetchCascadeOptions(cascadeSelectList);
        });
      });
    });
    setTimeout(() => {
      // 动态获取下拉数据
      cascadeSelectList.length && this.fetchCascadeOptions(cascadeSelectList);
    }, 0);
  };
  // 动态获取级联下拉数据
  fetchCascadeOptions = (cascadeSelectList) => {
    const { setContainerState, filterMap, formData, tabDropDownData, getGlobalVarValues } = this.props;
    // 下拉框控件列表
    const dropDownList = cascadeSelectList.filter(item => SELECT_ELEMETN_TYPE.includes(item.basetype) && !!item.mainTableName && item.elementFormat === 2)
      .map(item => ({ dataSource: item.mainTableName, elementId: item.id, columnName: item.mainColumnName }));
    if (!dropDownList.length) return;
    const globalMap = {};
    Object.keys(filterMap).map(key => {
      filterMap[key].forEach(item => {
        const { asqlValue, asqlValueType } = item;
        if (asqlValueType === 2 || isGlobalOrCustomVar(asqlValue)) {
          globalMap[item.asqlValue] = getGlobalVarValues({ varName: asqlValue });
        }
      });
    });
    getPageSelectOptions({ dropDownList, globalMap }).then(res => {
      // 更新级联下拉数据需要保存普通下拉数据
      setContainerState({
        tabDropDownData: {
          ...tabDropDownData,
          ...res,
        },
      });
    });
  };
  // 获取下拉框数据
  getOptions = (id) => {
    const { tabDropDownData = {} } = this.props;
    const optionData = tabDropDownData[id] || [];
    // 只显示下拉数据有id和name的项，否则不显示
    return optionData.filter(item => (item.name && item.id)).map(item => <Option value={`${item.id}`}
                                                                                 key={`select_option_${item.id}`}
    >{item.name}</Option>);
  };
  // 单选框
  getRadioGroup = (id) => {
    let { tabDropDownData = {} } = this.props;
    const optionData = tabDropDownData[id] || [];
    // 只显示数据有id和name的项，否则不显示
    return optionData.filter(item => (item.name)).map(item => <Radio value={`${item.id}`}
                                                                     key={`Radio_${item.id}`}>{item.name}</Radio>);
  };
  // 生成隐藏表单项
  setHiddenItem = (eleObj, jsTriggerParamObj) => {
    const { form, formData, getGlobalVarValues } = this.props;
    const { getFieldDecorator } = form;
    const { mainTableName, displayName, requisite, id, defaultValue, tooltipText } = eleObj;
    const valueObj = formData[id] || {};
    let showInitialValue = setValueToElement(eleObj, valueObj.name);
    let hiddenInitialValue = valueObj.id;
    if (!hiddenInitialValue && isGlobalOrCustomVar(defaultValue)) {
      showInitialValue = getGlobalVarValues({
        varName: defaultValue,
        type: 'defaultValue',
        eleObj,
        isRealValue: false,
      });
      hiddenInitialValue = getGlobalVarValues({
        varName: defaultValue,
        type: 'defaultValue',
        eleObj,
      });
    }
    const label = tooltipText ? (
      <Tooltip title={tooltipText}>
        {displayName}
      </Tooltip>
    ) : displayName;
    return (
      <Fragment>
        <Form.Item // 显示的控件
          label={label}
        >
          {getFieldDecorator(`${IGNORE_FORM_ITEM}_${id}`, {
            initialValue: showInitialValue,
            rules: [{
              required: !!requisite,
              message: <FormattedMessage id="global.required"/>,
            }, {
              validator: (...args) => this.customValidRule(jsTriggerParamObj, eleObj, ...args),
            }],
          })(this.setElementToWidget(eleObj, jsTriggerParamObj))}
        </Form.Item>
        <div className="hide">
          {/* <div> */}
          <Form.Item // 隐藏的实际值控件
            label={displayName}
          >
            {getFieldDecorator(`${id}`, {
              initialValue: hiddenInitialValue,
              rules: [{
                required: !!requisite,
                message: <FormattedMessage id="global.required"/>,
              }],
            })(<CInput/>)}
          </Form.Item>
        </div>
      </Fragment>
    );
  };
  // 根据类型生成表单项
  setItem = (eleObj) => {
    const { form, formData = {}, userInfo, elementMap, prevTabInfo, treeNodeData, tabInfo, getGlobalVarValues } = this.props;
    const { langLib } = this.context;
    const { getFieldDecorator } = form;
    const { displayName, columnSpan, requisite, basetype, id, visiabled, defaultValue, tooltipText, relationColumnType } = eleObj;
    const valueObj = formData[id] || {};
    const jsTriggerParamObj = this.getJsTriggerParmValues(eleObj);
    let SingleItem = null;
    if (basetype === 11) { // 分割线
      SingleItem = <SplitLine title={displayName}/>;
    } else if (HIDDEN_ELEMENT_TYPE.includes(basetype)) { // 需要生成隐藏表单项的控件
      SingleItem = this.setHiddenItem(eleObj, jsTriggerParamObj);
    } else {
      // 悬浮提示
      const label = tooltipText ? (
        <Tooltip title={tooltipText}>
          {displayName}
        </Tooltip>
      ) : displayName;
      // 取值规则
      // 1、直接取值
      // 2、全局变量（当前时间、当前用户）
      // 2、控件中配置的变量名
      // 下拉框的值为id
      const value = FILTER_ELEMENT_TYPE.includes(basetype) ? valueObj.id : valueObj.name;
      let initialValue = value;
      if (!initialValue && isGlobalOrCustomVar(defaultValue)) {
        initialValue = getGlobalVarValues({
          varName: defaultValue,
          type: 'defaultValue',
          eleObj,
        });
      }
      let config = {
        initialValue,
        rules: [{
          required: !!requisite,
          message: <FormattedMessage id="global.required"/>,
        }],
      };
      // 富文本控件的校验规则
      if (basetype === 39) {
        config = {
          initialValue,
          validateTrigger: 'onBlur',
          rules: [{
            required: !!requisite,
            validator: (_, value, callback) => {
              if (!!requisite && (!value || (value.editorState && value.editorState.isEmpty()))) { // 判断编辑器中有没有数据
                callback(langLib['validator.textEditor.noData']);
              } else {
                callback();
              }
            },
          }],
        };
      }
      SingleItem = (
        <Form.Item
          label={label}
        >
          {getFieldDecorator(`${id}`, config)(this.setElementToWidget(eleObj, jsTriggerParamObj))}
        </Form.Item>
      );
    }
    const span = ((columnSpan && columnSpan > 100) || !columnSpan) ? 12 : columnSpan;
    return (
      <Col span={span} key={id} className={visiabled ? '' : 'hide'}>
        {SingleItem}
      </Col>
    );
  };
  // 生成表单项
  getFormItems = () => {
    const { tabInfo, elementMap, triggerMap } = this.props;
    const elementList = tabInfo.id ? elementMap[tabInfo.id] : [];
    // 纯表单里的控件（不包括按钮）
    const pureElementList = elementList.filter(item => !(BTN_ELEMENT_TYPE.concat(42)).includes(item.basetype));
    return pureElementList.map(ele => {
      return this.setItem(ele);
    });
  };
  getStep = () => {
    const { stepList, tabInfo, elementMap, tabList, advancedQueryMap, getGlobalVarValues } = this.props;
    const currentElementList = elementMap[tabInfo.id] || [];
    let SubPanel = currentElementList.find(item => item.basetype === 42) || {};
    if (JSON.stringify(SubPanel) === '{}' && !SubPanel.relationTabId) return;
    const { relationTabId } = SubPanel;
    let SubPanelTabInfo = tabList.find(item => item.id === relationTabId) || {};
    if (JSON.stringify(SubPanelTabInfo) === '{}') return;
    if (SubPanelTabInfo.showType !== 9) return;
    let defaultProps = {
      ...this.props,
      tabInfo: SubPanelTabInfo,
    };
    let stepBarList = stepList ? stepList.datalist : [];
    return <FrameStepBar list={stepBarList} {...defaultProps}/>;
  };

  render() {
    const { className } = this.props;
    const wrapCls = classNames({
      [styles.wrap]: true,
      [detailFormStyle.wrap]: true,
      [className]: className,
    });
    return (
      <div id="a" className={wrapCls}>
        <div className={styles.itemWrap}>
          <Form colon={false}>
            <Row>
              {this.getStep()}
              {this.getFormItems()}
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}

export default Form.create()(DetailForm);
