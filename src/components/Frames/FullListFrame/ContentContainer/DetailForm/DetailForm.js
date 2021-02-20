import React, { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Col, Select, Tooltip, Radio } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import _ from 'lodash';
import classNames from 'classnames';
import {
  CRate,
  CInput,
  CInputNumber,
  CTextArea,
  CSelect,
  SplitLine,
  NormalSearchSelect,
  CUpload,
  CDatePicker, CLabel, ImgUnRelation, CBraftEditor, CheckBoxSearchSelect,
  CQRCode,
  CMapInput,
} from '@/components/common/BasicWidgets';
import {
  BTN_ELEMENT_TYPE,
  HIDDEN_ELEMENT_TYPE,
  IGNORE_FORM_ITEM,
  EMPTY_ITEM,
  NUMBER_COLUMN_TYPE,
  FILTER_ELEMENT_TYPE,
  TIME_FORMATE_TYPES, NO_SUBMIT_ELEMENT_TYPE, SELECT_ELEMETN_TYPE, SEARCH_SELECT_TYPE,
} from '@/constants/element';
import {
  setElementToValue,
  setValueToElement,
  validTriggerMatch,
  jsonParse,
  getValueFromGlobalVariables,
  matchGlobalFunctionParam,
  isGlobalOrCustomVar,
  parseDecimal,
} from '@/utils/common';
import { Steps } from 'antd';
import { BaseContext } from '@/constants/global';
import styles from '@/components/common/FormItems/FormItems.less';
import { getCheckBoxSearchDetail, getNormalSearchDetail, getPageSelectOptions } from '@/services/frame';
import { jsFunctions, validJsFunctions } from '@/constants/jsTriggerFunctions';
import DataSelectList from '@/components/Frames/FullListFrame/ContentContainer/DataSelectList/NormalSearchSelect';
import { arrayClassify, getFilterConditions, reduceArrObj } from '@/components/Frames/LeftListFrame/method';
import FrameStepBar from '@/components/common/FrameStepBar/FrameStepBar';

const { Option } = Select;
const { Step } = Steps;

class DetailForm extends Component {
  static contextType = BaseContext;
  state = {};
  // 数据选择框 根据id获取详情
  fetchDetailById = (eleObj, id) => {
    const { mainTableName: tabSource, mainColumnName, id: eleId, basetype, triggerSign } = eleObj;
    const api = basetype === 45 ? getCheckBoxSearchDetail : getNormalSearchDetail;
    const params = {
      [basetype === 45 ? 'tableName' : 'tabSource']: tabSource,
      [basetype === 45 ? 'ids' : 'id']: id,
    };
    api(params).then(res => {
      const { setFrameState, tabData, tabInfo } = this.props;
      let resData = basetype === 45 ? {
        id: res.map(item => item.id).join(','),
        name: res.map(item => item[mainColumnName]).join(','),
      } : {
        id: res.id || '',
        name: res[mainColumnName] || '',
      };
      setFrameState({
        tabData: {
          ...tabData,
          [tabInfo.id]: {
            ...tabData[tabInfo.id],
            [`a${eleId}`]: JSON.stringify(resData),
          },
        },
      }, () => {
        // 该控件为选择框，则需要继续校验该控件的触发器
        if (SEARCH_SELECT_TYPE.includes(basetype)) {
          if (!triggerSign) {
            this.handleTriggerEvent(eleObj, res);
          } else {
            this.handleNewTriggerEvent(eleObj, res);
          }
        }
      });

    });
  };
  // 触发器实现(数据选择框)
  handleTriggerEvent = (eleObj = {}, selecctedData = {}, data = {}) => {
    const { relationTableId, form, triggerMap, activeTreeNode, elementMap = {}, tabInfo = {}, formData, tabData = {}, setFrameState, isNew } = this.props;
    const { id } = eleObj;
    const eleTriggers = triggerMap[id];
    // if (!eleTriggers) return;
    const elementList = elementMap[tabInfo.id];
    const triggers = eleTriggers && eleTriggers.filter(item => item.triggerType === 1 && item.basetype === 3) || [];
    const unsetData = {};
    triggers.forEach(trigger => {
      const { relationElementValue, relationElementId } = trigger;
      const targetEle = elementList.find(item => item.id === relationElementId);
      // 全局函数入参
      const funcParam = matchGlobalFunctionParam(relationElementValue);
      const { basetype, id, valueFieldType, mainColumnName } = targetEle;
      let targetEleName = selecctedData[funcParam];
      if (valueFieldType === 2) {
        unsetData[`a${id}`] = JSON.stringify({ id: targetEleName, name: selecctedData[mainColumnName] });
      } else {
        unsetData[`a${id}`] = JSON.stringify({ id: targetEleName, name: targetEleName });
      }
      // form.setFieldsValue({
      //   [`${IGNORE_FORM_ITEM}${id}`]: '',
      //   [`a${id}`]: '',
      // });
      // 该控件为选择框，则需要继续校验该控件的触发器
      if (SEARCH_SELECT_TYPE.includes(basetype) && !isNaN(Number(targetEleName))) {
        if (basetype === 17 && valueFieldType === 2) return;
        this.fetchDetailById(targetEle, +targetEleName);
      }
    });

    setFrameState({
      tabData: {
        ...tabData,
        [tabInfo.id]: {
          ...tabData[tabInfo.id],
          ...unsetData,
          ...data,
        },
      },
    });
  };
  // 触发器实现新(数据选择框)
  handleNewTriggerEvent = (eleObj = {}, selecctedData = {}, data = {}) => {
    const { getValueFromCurrentTabData, originFormData: originTabData, form, triggerMap, activeTreeNode, elementMap = {}, tabInfo = {}, formData, tabData = {}, setFrameState, isNew, updataState } = this.props;
    const { id, basetype: eleObjBasetype } = eleObj;
    const eleTriggers = triggerMap[id];
    const targetEleList = []; // 目标控件列表
    const elementList = elementMap[tabInfo.id];
    // triggerType对应触发器值1前端2后3存储4js5http6jira
    // basetype对于的点击事件，区分数据变化，加载
    const triggers = eleTriggers && eleTriggers.filter(item => item.triggerType === 1 && item.basetype === 3) || [];
    const unsetData = {};
    let eventType = arrayClassify(triggers, 'elementEvent') || []; // 处理出来有几种前端触发器事件
    if (!eventType.length) return;
    let reduceEventType = reduceArrObj(eventType, 'endTriggerNum', 'conditionType', 'eventBasepriority', 'methodType');
    let triggerList = this.reducevVariableToData(reduceEventType), ids = ''; // 默认值处理成值
    if (eleObjBasetype === 45) {
      ids = JSON.stringify(selecctedData) !== '{}' ? selecctedData.map(item => item.id).join(',') : '';
    }
    let list = triggerList.filter(item => {
      const { endTriggerNum } = item;
      return validTriggerMatch(item, eleObjBasetype === 45 ? ids : selecctedData.id, endTriggerNum, getValueFromCurrentTabData);
    }) || []; // 过滤出符合条件的事件
    if (!list.length) return;
    list.sort((a, b) => {
      return a.eventBasepriority - b.eventBasepriority;
    }); // 排序
    let newList = [];
    list.forEach(item => {
      newList.push(item.list);
    });
    let lastList = newList.reduce((a, b) => {
      return a.concat(b);
    });
    lastList.forEach(trigger => {
      const { relationElementValue, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible } = trigger;
      const targetEle = elementList.find(item => item.id === relationElementId);
      // 全局函数入参
      if (!targetEle) return;
      const { basetype, id, valueFieldType, mainColumnName, relationColumnName } = targetEle;
      if (relationElementValue === '@@InitValue') {
        let formData = originTabData[tabInfo.id];
        unsetData[`a${id}`] = formData[[`a${id}`]];
        let targetEleValue = formData[[`a${id}`]] && JSON.parse(formData[[`a${id}`]]) && JSON.parse(formData[[`a${id}`]]).id;
        // 该控件为选择框，则需要继续校验该控件的触发器
        if (SEARCH_SELECT_TYPE.includes(basetype) && !isNaN(Number(targetEleValue))) {
          if (basetype === 17 && valueFieldType === 2) return;
          this.fetchDetailById(targetEle, +targetEleValue);
        }
      } else if (relationElementValue === '@@Null') {
        unsetData[`a${id}`] = JSON.stringify({ id: '', name: '' });
      } else if (!relationElementValue) {
        // unsetData = { ...targetEleData };
      } else {
        const funcParam = matchGlobalFunctionParam(relationElementValue);
        let targetEleName = selecctedData[funcParam];
        if (!targetEleName) {
          targetEleName = relationElementValue && relationElementValue.indexOf('@@') > -1 ? getValueFromCurrentTabData(relationElementValue) : relationElementValue;
        }
        if (valueFieldType === 2) {
          unsetData[`a${id}`] = JSON.stringify({ id: targetEleName, name: selecctedData[mainColumnName] });
        } else {
          unsetData[`a${id}`] = JSON.stringify({ id: targetEleName || '', name: targetEleName || '' });
        }
        if (eleObjBasetype === 45 && !!funcParam && !SEARCH_SELECT_TYPE.includes(basetype)) { // 如果触发器初始控件是多选框并且被触发的控件有对应的paramKey，就拼装数据
          if (JSON.stringify(selecctedData) !== '{}') {
            targetEleName = selecctedData.map(item => item[funcParam]).join(',');
            let data1 = {
              id: selecctedData.map(item => item[funcParam]).join(','),
              name: selecctedData.map(item => item[funcParam]).join(','),
            };
            unsetData[`a${id}`] = JSON.stringify(data1);
          } else {
            unsetData[`a${id}`] = JSON.stringify({ id: '', name: '' });
          }
        }
        // 如果触发器初始控件是多选框并且被触发的控件是数据选择框，
        if (eleObjBasetype === 45 && [3, 12, 25, 17].includes(basetype)) {
          let arr = [], param = '';
          if (funcParam) {
            if (JSON.stringify(selecctedData) !== '{}') {
              selecctedData.forEach(item => {
                let value = item[funcParam];
                if ((typeof value === 'number' || !!value) && arr.indexOf(item[funcParam]) === -1) {
                  arr.push(value);
                }
              });
              param = arr.join(',');
              param = Array.from(new Set(param.split(','))).join(',');
            } else {
              param = '';
            }
          } else {
            param = relationElementValue;
          }

          // 去重之后有一个值的，会调用接口，反之不调用
          if (!isNaN(Number(param))) {
            if (basetype === 17 && valueFieldType === 2) return;
            this.fetchDetailById(targetEle, +param);
          }
        }
        // 该控件为选择框，则需要继续校验该控件的触发器
        if (basetype === 45) {
          if (eleObjBasetype === 45 && JSON.stringify(selecctedData) !== '{}') {
            let arr = [];
            selecctedData.forEach(item => {
              let value = item[funcParam];
              if ((typeof value === 'number' || !!value) && arr.indexOf(item[funcParam]) === -1) {
                arr.push(value);
              }
            });
            targetEleName = arr.join(',');
          }
          !!targetEleName && this.fetchDetailById(targetEle, targetEleName);
        }

        // 该控件为选择框，则需要继续校验该控件的触发器
        if (eleObjBasetype !== 45 && targetEleName && SEARCH_SELECT_TYPE.concat([17]).includes(basetype) && !isNaN(Number(targetEleName))) {
          if (basetype === 17 && valueFieldType === 2) return;
          this.fetchDetailById(targetEle, +targetEleName);
        }
      }
      form.resetFields([
        `a${id}`,
        `${IGNORE_FORM_ITEM}${id}`,
      ]);
      targetEleList.push({
        ...targetEle,
        requisite: relationElementRequisite,
        readonly: relationElementReadonly,
        visiabled: relationElementVisible,
      });
    });
    const newElementList = [...elementList];
    targetEleList.length && targetEleList.forEach(changedItem => {
      const targetIndex = newElementList.findIndex(item => changedItem.id === item.id);
      newElementList.splice(targetIndex, 1, changedItem);
    });
    updataState({
      elementMap: {
        ...elementMap,
        [tabInfo.id]: newElementList,
      },
    });
    setFrameState({
      tabData: {
        ...tabData,
        [tabInfo.id]: {
          ...tabData[tabInfo.id],
          ...unsetData,
          ...data,
        },
      },
    });
  };
  // 图片转base64
  setFileUrl = (data, eleObj) => {
    const { id } = eleObj;
    const { formData, tabInfo, tabData, setFrameState, form } = this.props;
    form.resetFields([
      `a${id}`,
      `${IGNORE_FORM_ITEM}${id}`,
    ]);
    setFrameState({
      tabData: {
        ...tabData,
        [tabInfo.id]: {
          ...tabData[tabInfo.id],
          [`a${id}`]: JSON.stringify({
            id: data,
            name: data,
          }),
        },
      },
    }, () => {
      form && form.setFieldsValue({
        [`a${id}`]: data,
      });
    });
  };
  // 判断触发值是否是变量，如果是变量变成对应的值
  reducevVariableToData = (arr) => {
    if (!arr.length) return;
    const { getValueFromCurrentTabData } = this.props;
    let newData = [];
    arr.forEach(item => {
      if (item.endTriggerNum && item.endTriggerNum.indexOf('@@') > -1 && item.endTriggerNum.split('@@').length < 3) {
        item.endTriggerNum = getValueFromCurrentTabData(item.endTriggerNum);
      }
      newData.push(item);
    });
    return newData;
  };
  // 直接删除多选便签
  deletteSetChecBoxValue = (selecteds, eleObj) => {
    const { form } = this.props;
    const { mainTableName: tabSource, relationColumnName, id, mainColumnName, triggerSign } = eleObj;
    const { triggerMap, activeTreeNode, elementMap = {}, tabInfo = {}, formData, tabData = {}, setFrameState, isNew } = this.props;
    form.resetFields([
      `a${id}`,
      `${IGNORE_FORM_ITEM}${id}`,
    ]);
    setFrameState({
      tabData: {
        ...tabData,
        [tabInfo.id]: {
          ...tabData[tabInfo.id],
          [`a${id}`]: JSON.stringify(selecteds),
        },
      },
    }, () => {
      if (!selecteds.id) {
        this.handleNewTriggerEvent(eleObj);
        return;
      }
      getCheckBoxSearchDetail({
        tableName: tabSource,
        ids: selecteds.id,
      }).then(res => {
        this.handleNewTriggerEvent(eleObj, res);
      });
    });
  };
  // 设置多选框的数据
  handleSetChecBoxValue = (selecteds = [], eleObj) => {
    const { form } = this.props;
    const { relationColumnName, id, mainColumnName, triggerSign } = eleObj;
    const { triggerMap, activeTreeNode, elementMap = {}, tabInfo = {}, formData, tabData = {}, setFrameState, isNew } = this.props;
    form.resetFields([
      `a${id}`,
      `${IGNORE_FORM_ITEM}${id}`,
    ]);
    let data = {
      id: selecteds.map(item => item.id).join(','),
      name: selecteds.map(item => item[mainColumnName]).join(','),
    };
    setFrameState({
      tabData: {
        ...tabData,
        [tabInfo.id]: {
          ...tabData[tabInfo.id],
          [`a${id}`]: JSON.stringify(data),
        },
      },
    }, () => {
      this.handleNewTriggerEvent(eleObj, selecteds, data);
    });
  };
  // 设置数据选择框的值
  handleSetSelectSearchValue = (selecteds = [], eleObj) => {
    const { triggerMap, activeTreeNode, elementMap = {}, tabInfo = {}, formData, tabData = {}, setFrameState, isNew } = this.props;
    const { form } = this.props;
    const selecctedData = selecteds[0] || {};
    const { relationColumnName, id, mainColumnName, triggerSign } = eleObj;
    if (!triggerSign) {
      this.handleTriggerEvent(eleObj, selecctedData, {
        [`a${id}`]: JSON.stringify({
          id: selecctedData.id || '',
          name: selecctedData[mainColumnName] || '',
        }),
      });
      form.resetFields([
        `a${id}`,
        `${IGNORE_FORM_ITEM}${id}`,
      ]);
      return;
    }
    setFrameState({
      tabData: {
        ...tabData,
        [tabInfo.id]: {
          ...tabData[tabInfo.id],
          [`a${id}`]: JSON.stringify({
            id: selecctedData.id || '',
            name: selecctedData[mainColumnName] || '',
          }),
        },
      },
    }, () => {
      form.resetFields([
        `a${id}`,
        `${IGNORE_FORM_ITEM}${id}`,
      ]);
      this.handleNewTriggerEvent(eleObj, selecctedData, {
        [`a${id}`]: JSON.stringify({
          id: selecctedData.id || '',
          name: selecctedData[mainColumnName] || '',
        }),
      });
    });
  };
  // js触发器转化参数名称及值
  getJsTriggerParmValues = eleObj => {
    const { triggerMap, getValueFromCurrentTabData } = this.props;
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
          result[param] = getValueFromCurrentTabData(paramValue);
        } else {
          result[param] = paramValue;
        }
      });
    });
    return result;
  };
  // 修改数字框
  handleChangeInputNumber = (eleObj, val) => {
    const { setFrameState, tabData, tabInfo } = this.props;
    const newVal = val === null ? '' : val;
    setFrameState({
      tabData: {
        ...tabData,
        [tabInfo.id]: {
          ...tabData[tabInfo.id],
          [`a${eleObj.id}`]: JSON.stringify({ id: val, name: newVal }),
        },
      },
    }, () => {
      this.handleChange(eleObj, newVal);
    });
  };
  // 根据控件类型生成对应控件
  setElementToWidget = (eleObj, valueObj = {}) => {
    const { functionData = {}, form, formData, setFrameState, elementMap, tabInfo, fileRelationList, filterMap, getValueFromCurrentTabData, filePassList, updataState } = this.props;
    const { canmodify } = functionData.attributes;
    const { selectListTabId, relationColumnType, basetype, readonly, mainTableName, mainColumnName, relationTableName, relationTabId, visiabled, placeholderText, elementFormat, displayName } = eleObj;
    const baseProps = {
      key: `${eleObj.relationColumnName}_${eleObj.id}`,
      disabled: !!readonly || !canmodify,
      placeholder: placeholderText,
    };

    if (basetype === 1) {
      // 数字输入框
      if (NUMBER_COLUMN_TYPE.includes(relationColumnType)) {
        const jsTriggerParamObj = this.getJsTriggerParmValues(eleObj);
        const _props = {
          ...baseProps,
          onChange: val => this.handleChangeInputNumber(eleObj, val),
        };
        if (jsTriggerParamObj) { // 有js触发器的计算属性
          const { max, min } = jsTriggerParamObj;
          if (max !== '' && !isNaN(Number(max))) _props.max = max;
          if (min !== '' && !isNaN(Number(min))) _props.min = min;
        }
        return <CInputNumber {..._props} />;
      }
      return ( // 输入框
        <CInput {...baseProps} onChange={e => this.handleChange(eleObj, e.target.value)}/>
      );
    } else if (SELECT_ELEMETN_TYPE.includes(basetype)) { // 下拉框
      return (
        <CSelect {...baseProps} onChange={val => this.handleChange(eleObj, `${val}`)}>
          <Option value={''} key="0_index"><FormattedMessage id="global.choose"/></Option>
          {this.getOptions(eleObj.id)}
        </CSelect>
      );
    } else if (basetype === 45) {
      const _props = {
        ...baseProps,
        eleObj,
        filterMap,
        form,
        multiple: true,
        valueObj: JSON.stringify(formData) !== '{}' && formData[`a${eleObj.id}`] && JSON.stringify(formData[`a${eleObj.id}`]) !== '{}' ? JSON.parse(formData[`a${eleObj.id}`]) : {},
        handleClickValue: () => relationTabId && this.props.setPopupTabInfo(eleObj, formData),
        mainTableName,
        mainColumnName,
      };
      if (selectListTabId) {
        return (
          <DataSelectList
            {..._props}
            {...this.props}
            doSearchList={() => selectListTabId && this.props.setPopupTabInfo1(eleObj, formData)}
            getGlobalVarValues={varName => getValueFromCurrentTabData(varName)}
            deleteTag={data => this.deletteSetChecBoxValue(data, eleObj)}
            setSelected={selecteds => this.handleSetChecBoxValue(selecteds, eleObj)}
          />);
      }
      return (
        <CheckBoxSearchSelect
          {..._props}
          getGlobalVarValues={varName => getValueFromCurrentTabData(varName)}
          deleteTag={data => this.deletteSetChecBoxValue(data, eleObj)}
          setSelected={selecteds => this.handleSetChecBoxValue(selecteds, eleObj)}
        />);
    } else if (basetype === 3) {
      if (selectListTabId) {
        return ( // 数据选择框
          <DataSelectList
            {...baseProps}
            {...this.props}
            eleObj={eleObj}
            filterMap={filterMap}
            form={form}
            mainTableName={mainTableName}
            mainColumnName={mainColumnName}
            setSelected={selecteds => this.handleSetSelectSearchValue(selecteds, eleObj)}
            handleClickValue={() => relationTabId && this.props.setPopupTabInfo(eleObj, formData)}
            getGlobalVarValues={varName => getValueFromCurrentTabData(varName)}
          />
        );
      } else {
        const { jumpType, jumpMenuList } = eleObj;
        const hasColor = ((relationTabId && (jumpType === 1 || !jumpType)) || (jumpType === 2 && jumpMenuList.length));
        return ( // 数据选择框
          <NormalSearchSelect
            {...baseProps}
            eleObj={eleObj}
            filterMap={filterMap}
            form={form}
            valueObj={JSON.stringify(formData) !== '{}' && formData[`a${eleObj.id}`] && JSON.stringify(formData[`a${eleObj.id}`]) !== '{}' ? JSON.parse(formData[`a${eleObj.id}`]) : {}}
            mainTableName={mainTableName}
            mainColumnName={mainColumnName}
            setSelected={selecteds => this.handleSetSelectSearchValue(selecteds, eleObj)}
            handleClickValue={() => !!hasColor && this.props.setPopupTabInfo(eleObj, formData)}
            getGlobalVarValues={varName => getValueFromCurrentTabData(varName)}
          />
        );
      }
    } else if (basetype === 8 || basetype === 13) {
      let id = elementMap[tabInfo.id] && elementMap[tabInfo.id].find(item => item.relationColumnName === 'id').id;
      if (elementFormat === 2) {
        const valueObj = formData[`a${eleObj.id}`] && JSON.parse(formData[`a${eleObj.id}`]) || {};
        return (
          <ImgUnRelation
            {...baseProps}
            eleObj={eleObj}
            setFileUrl={url => this.setFileUrl(url, eleObj)}
            urlVal={valueObj.id || ''}
          />
        );
      }
      return ( // 上传文件
        <div>
          <CUpload
            {...baseProps}
            relationParams={{
              relationId: jsonParse(formData['a' + id]).name,
              relationTableName,
              relationPriorityId: eleObj.priorityId,
              relationStateId: eleObj.stateId,
              relationTypeId: eleObj.typeId,
              parameter: eleObj.parameter,
              setFrameState: updataState,
              filePassList,
              defaultValue: eleObj.defaultValue,
              updataState: setFrameState,
            }}
            eleObj={eleObj}
            relationFileObj={fileRelationList}
            setFileInfo={(fileId, fileObj) => this.handleFileChange(eleObj, fileId, fileObj)}
            onRemoveFile={removeId => this.handleRemoveFile(eleObj, removeId)}
            ref={'uploadForm'}
            // fileRelationList={fileRelationList}
            // setFileInfo={fileRelationList => this.reduceFiles(eleObj, fileRelationList)}
          />
        </div>
      );
    } else if (basetype === 9) {
      const jsTriggerParamObj = this.getJsTriggerParmValues(eleObj);
      const _props = {
        ...baseProps,
        format: TIME_FORMATE_TYPES[elementFormat || 1],
        showTime: elementFormat !== 2,
        onChange: date => this.setHiddenValue(eleObj, date),
      };
      if (jsTriggerParamObj) { // 有js触发器的计算属性
        _props.disabledDate = current => jsFunctions.getDatePickerRange(current, jsTriggerParamObj);
        _props.disabledTime = current => jsFunctions.getDatePickerRange(current, jsTriggerParamObj);
      }
      return (
        <CDatePicker {..._props} />
      );
    } else if (basetype === 10) {
      return ( // 多行文本
        <CTextArea {...baseProps} onChange={e => this.handleChange(eleObj, e.target.value)}/>
      );
    } else if (basetype === 15) {
      return ( // 多行文本
        <Radio.Group {...baseProps} onChange={e => this.handleChange(eleObj, e.target.value)}>
          {this.getRadioGroup(eleObj.id)}
        </Radio.Group>
      );
    } else if (basetype === 17) {
      return (<CLabel
        {...baseProps}
        onChange={value => this.handleChange(eleObj, value)}
        relationTabId={relationTabId}
        onClick={() => relationTabId && this.props.setPopupTabInfo(eleObj, formData)}
      />);
    } else if (basetype === 36) {
      return ( // 评分
        <CRate {...baseProps} onChange={value => this.handleChange(eleObj, value)}/>);
    } else if (basetype === 39) {
      const valueObj = formData[`a${eleObj.id}`] && JSON.parse(formData[`a${eleObj.id}`]) || {};
      return (
        <CBraftEditor
          {...baseProps}
          eleObj={eleObj}
          textValue={valueObj.id || ''}
        />
      );
    } else if (basetype === 50) {
      return <CQRCode eleObj={eleObj}/>;
    } else if (basetype === 46) {
      return <CMapInput title={displayName} {...baseProps}/>;
    } else {
      return <CInput {...baseProps} onChange={e => this.handleChange(eleObj, e.target.value)}/>;
    }

  };
  // 删除文件
  handleRemoveFile = (eleObj, removeId) => {
    const { fileRelationList, setFrameState, filePassList, updataState } = this.props;
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
    setFrameState({ fileRelationList: newFilesObj });
    updataState({ filePassList: newFilesPassObj });
  };
  // 更新关联文件
  handleFileChange = (eleObj, fileId, fileObj) => {
    const { stateId, typeId, priorityId, id: eleId, parameter } = eleObj;
    const { fileRelationList, setFrameState, form, filePassList, updataState } = this.props;
    form && form.resetFields([`a${eleId}`]);
    const newFiles = {
      [fileId]: {
        stateId,
        typeId,
        priorityId,
      },
    };
    setFrameState({
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
      updataState({
        filePassList: newFilePassList,
      }, () => {
        console.log(filePassList);
      });
    }
  };
  // 数据变化
  handleNewChange = (eleObj, valStr) => {
    const { id, relationColumnType } = eleObj;
    if (relationColumnType === 4) {
      valStr = parseDecimal(valStr + '');
    }
    const { tabList, activeTreeNode, userInfo, originFormData: originTabData, triggerMap, form, tabInfo, updataState, elementMap, setFrameState, originElementMap, getValueFromCurrentTabData, tabData, isNew } = this.props;
    const elementList = elementMap[tabInfo.id] || [];
    const originElementList = originElementMap[tabInfo.id];
    let newOriginElementMap = JSON.parse(JSON.stringify(originElementMap));
    const triggerData = triggerMap[id] && triggerMap[id].filter(item => item.basetype !== 4 && item.triggerType === 1) || [];
    let eventType = arrayClassify(triggerData, 'elementEvent') || []; // 处理出来有几种前端触发器事件
    if (!eventType.length) return;
    let reduceEventType = reduceArrObj(eventType, 'endTriggerNum', 'conditionType', 'eventBasepriority', 'methodType');
    let triggerList = this.reducevVariableToData(reduceEventType); // 默认值处理成值

    let list = triggerList.filter(item => {
      const { endTriggerNum } = item;
      return validTriggerMatch(item, valStr, endTriggerNum, getValueFromCurrentTabData);
    }) || []; // 过滤出符合条件的事件

    if (!list.length) return;
    list.sort((a, b) => {
      return a.eventBasepriority - b.eventBasepriority;
    }); // 排序
    let newList = [];
    list.forEach(item => {
      newList.push(item.list);
    });
    let lastList = newList.reduce((a, b) => {
      return a.concat(b);
    });
    const targetEleList = []; // 目标控件列表
    let targetEleData = {}; // 目标控件的值
    const CascadeDropbox = []; // 级联下拉框
    // 对应的触发器事件
    if (lastList.length) {
      lastList.forEach(item => {
        let {
          beginTriggerNum, endTriggerNum, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible, relationElementValue, canModifyValue,
        } = item;
        relationElementValue = relationElementValue === null ? '' : relationElementValue;
        const targetEle = elementList.find(item => item.id === relationElementId) || {};
        const { basetype, id: targetEleId, valueFieldType, mainColumnName } = targetEle;
        if (targetEle.elementFormat === 2) CascadeDropbox.push(targetEle);
        let value = relationElementValue;
        if (relationElementValue === '@@InitValue') {
          let formData = originTabData[tabInfo.id];
          targetEleData[`a${targetEleId}`] = formData[[`a${targetEleId}`]];
        } else if (relationElementValue === '@@Null') {
          targetEleData[`a${targetEleId}`] = JSON.stringify({ id: '', name: '' });
        } else if (!relationElementValue) {
          // targetEleData = { ...targetEleData };
        } else if (isGlobalOrCustomVar(relationElementValue)) {
          value = getValueFromGlobalVariables({
            globalVar: relationElementValue,
            userInfo,
          }) || getValueFromCurrentTabData(relationElementValue);
          targetEleData[`a${targetEleId}`] = JSON.stringify({ id: value, name: value });
        } else {
          targetEleData[`a${targetEleId}`] = JSON.stringify({ id: value, name: value });
        }
        // 目标控件
        const { relationColumnName, id, relationColumnType } = targetEle;
        // 属性的改变-改变对应数据
        targetEleList.push({
          ...targetEle,
          requisite: relationElementRequisite,
          readonly: relationElementReadonly,
          visiabled: relationElementVisible,
        });

        // 值的改变-直接表单赋值
        // relationColumnName && form.setFieldsValue({
        //   [`a${id}`]: relationColumnType === 2 ? Number(value) : value,
        // });
        form.resetFields([
          `a${id}`,
          `${IGNORE_FORM_ITEM}${id}`,
        ]);
        if (value && SEARCH_SELECT_TYPE.includes(basetype) && !isNaN(Number(value))) {
          if (basetype === 17 && valueFieldType === 2) return;
          this.fetchDetailById(targetEle, +value);
        } else if (basetype === 45 && value) {
          this.fetchDetailById(targetEle, value);
        }
      });
      // 更新元素属性
      // const newElementList = [...newOriginElementMap[tabInfo.id]];
      const newElementList = [...elementList];
      targetEleList.length && targetEleList.forEach(changedItem => {
        const targetIndex = newElementList.findIndex(item => changedItem.id === item.id);
        newElementList.splice(targetIndex, 1, changedItem);
      });
      let obj = {};
      CascadeDropbox.forEach(item => {
        obj[`a${item.id}`] = '';
      });
      form.setFieldsValue(obj); // 值恢复
      setFrameState({
        tabData: {
          ...tabData,
          [tabInfo.id]: {
            ...tabData[tabInfo.id],
            ...targetEleData,
            [`a${eleObj.id}`]: JSON.stringify({ id: valStr, name: valStr }),
          },
        },
      }, () => {
        if (CascadeDropbox.length) {
          this.fetchEleDropDownData(CascadeDropbox, eleObj, valStr);
        }
      });
      updataState({
        elementMap: {
          ...elementMap,
          [tabInfo.id]: [...newElementList],
        },
      });
    } else {
      form.resetFields([
        `a${id}`,
        `${IGNORE_FORM_ITEM}${id}`,
      ]);
      setFrameState({
        tabData: {
          ...tabData,
          [tabInfo.id]: {
            ...tabData[tabInfo.id],
            [`a${eleObj.id}`]: JSON.stringify({ id: valStr, name: valStr }),
          },
        },
      });
    }
  };
  // 数据改变
  handleChange = (eleObj, valStr) => {
    const { triggerSign } = eleObj;
    const { triggerMap, form, tabInfo, elementMap, setFrameState, originElementMap, formData, tabData, userInfo, getValueFromCurrentTabData, relationTableId } = this.props;
    if (triggerSign) {
      setFrameState({
        tabData: {
          ...tabData,
          [tabInfo.id]: {
            ...tabData[tabInfo.id],
            [`a${eleObj.id}`]: JSON.stringify({ id: valStr, name: valStr }),
          },
        },
      }, () => {
        this.handleNewChange(eleObj, valStr);
      });
      return;
    }
    const { id } = eleObj;
    const { originEleData } = this.state;
    // const { triggerMap, form, tabInfo, elementMap, setFrameState, originElementMap, formData, tabData, userInfo, getValueFromCurrentTabData, relationTableId } = this.props;
    const elementList = elementMap[tabInfo.id] || [];
    const originElementList = originElementMap[tabInfo.id];
    const triggerData = triggerMap[id] && triggerMap[id].filter(item => item.basetype !== 4 && item.triggerType === 1) || [];
    const targetEleList = []; // 目标控件列表
    const targetEleData = {}; // 目标控件的值
    const CascadeDropbox = []; // 级联下拉框
    let newOriginEleData = { ...originEleData };
    if (triggerData.length) {
      if (triggerData.length) { // 对应的触发器事件
        triggerData.forEach(item => {
          let {
            beginTriggerNum, endTriggerNum, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible, relationElementValue, canModifyValue,
          } = item;
          relationElementValue = relationElementValue === null ? '' : relationElementValue;
          const validMatch = validTriggerMatch(item, valStr);
          const targetEle = elementList.find(item => item.id === relationElementId) || {};
          if (targetEle.elementFormat === 2) CascadeDropbox.push(targetEle);
          let value = relationElementValue;
          if (isGlobalOrCustomVar(relationElementValue)) {
            value = getValueFromGlobalVariables({
              globalVar: relationElementValue,
              userInfo,
            }) || getValueFromCurrentTabData(relationElementValue) || '';
          }
          // 目标控件
          const { relationColumnName, id, relationColumnType } = targetEle;
          if (validMatch) {
            // 属性的改变-改变对应数据
            targetEleList.push({
              ...targetEle,
              requisite: relationElementRequisite,
              readonly: relationElementReadonly,
              visiabled: relationElementVisible,
            });
            // 值的改变-直接表单赋值
            // relationColumnName && form.setFieldsValue({
            //   [`a${id}`]: relationColumnType === 2 ? Number(relationElementValue) : relationElementValue,
            // });
            form.resetFields([
              `a${id}`,
              `${IGNORE_FORM_ITEM}${id}`,
            ]);
            targetEleData[`a${id}`] = JSON.stringify({ id: value, name: value });
          } else {
            form.resetFields([`a${id}`]); // 值恢复
            // 属性恢复原始状态
            const originTargetEle = originElementList.find(item => item.id === relationElementId);
            originTargetEle && targetEleList.push(originTargetEle);
          }
        });
        // 更新元素属性
        const newElementList = [...elementList];
        targetEleList.length && targetEleList.forEach(changedItem => {
          const targetIndex = newElementList.findIndex(item => changedItem.id === item.id);
          newElementList.splice(targetIndex, 1, changedItem);
        });
        let obj = {};
        CascadeDropbox.forEach(item => {
          obj[`a${item.id}`] = '';
        });
        form.setFieldsValue(obj); // 值恢复
        setFrameState({
          elementMap: {
            ...elementMap,
            [tabInfo.id]: newElementList,
          },
          tabData: {
            ...tabData,
            [tabInfo.id]: {
              ...tabData[tabInfo.id],
              ...targetEleData,
              [`a${eleObj.id}`]: JSON.stringify({ id: valStr, name: valStr }),
            },
          },
        }, () => {
          // this.props.fetchTabDropDownData();
          if (CascadeDropbox.length) {
            this.fetchEleDropDownData(CascadeDropbox, eleObj, valStr);
          }
        });
      } else {
        form.resetFields(); // 值恢复
        // 更新元素属性
        setFrameState({
          tabData: {
            ...tabData,
            [tabInfo.id]: {
              ...tabData[tabInfo.id],
              ...targetEleData,
              [`a${eleObj.id}`]: JSON.stringify({ id: valStr, name: valStr }),
            },
          },
        });
      }
    } else {
      form.resetFields([
        `a${id}`,
        `${IGNORE_FORM_ITEM}${id}`,
      ]);
      setFrameState({
        tabData: {
          ...tabData,
          [relationTableId]: {
            ...tabData[relationTableId],
            [`a${eleObj.id}`]: JSON.stringify({ id: valStr, name: valStr }),
          },
        },
      });
    }
  };
  // 获取当前下拉框的下拉数据
  fetchEleDropDownData = (CascadeDropbox, eleObj, valStr) => {
    const { filterMap, setFrameState, tabDropDownData } = this.props;
    // 下拉框控件列表
    const dropDownList = CascadeDropbox.filter(item => SELECT_ELEMETN_TYPE.includes(item.basetype) && !!item.mainTableName).map(item => ({
      dataSource: item.mainTableName,
      elementId: item.id,
      columnName: item.mainColumnName,
    }));
    if (!dropDownList.length) return;
    const globalMap = {};
    // 从实体过滤器过滤出含有下拉控件的过滤器
    let dropFilterMap = {};
    Object.keys(filterMap).forEach(item => {
      if (dropDownList.find(items => Number(items.elementId) === Number(item))) {
        dropFilterMap[item] = filterMap[item];
      }
    });
    Object.keys(dropFilterMap).map(key => {
      dropFilterMap[key].forEach(item => {
        const { asqlValue, asqlValueType } = item;
        if (asqlValueType === 2) {
          // globalMap[item.asqlValue] = this.getGlobalVarValues({ varName: asqlValue });
          if (asqlValue === eleObj.parameter) {
            globalMap[item.asqlValue] = valStr;
          } else {
            globalMap[item.asqlValue] = '';
          }
        }
      });
    });
    getPageSelectOptions({ dropDownList, globalMap }).then(res => {
      setFrameState({
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
    return optionData.filter(item => (item.name && item.id)).map(item => <Option value={item.id}
                                                                                 key={`select_option_${item.id}`}
    >{item.name}</Option>);
  };
  // 单选框
  getRadioGroup = (id) => {
    let { tabDropDownData = {} } = this.props;
    const optionData = tabDropDownData[id] || [];
    // 只显示下拉数据有id和name的项，否则不显示
    return optionData.filter(item => (item.name)).map(item => <Radio value={item.id}
                                                                     key={`Radio_${item.id}`}
    >{item.name}</Radio>);
  };
  // 修改表象控件时对应修改隐藏真实值的控件
  setHiddenValue = (eleObj, eleValue) => {
    const { setFrameState, tabData, tabInfo, form } = this.props;
    const { relationColumnName, id } = eleObj;
    const value = setElementToValue(eleObj, eleValue);
    let valStr = eleValue ? moment(eleValue).format('YYYY-MM-DD HH:mm:ss') : '';
    setFrameState({
      tabData: {
        ...tabData,
        [tabInfo.id]: {
          ...tabData[tabInfo.id],
          [`a${eleObj.id}`]: JSON.stringify({ id: valStr, name: valStr }),
        },
      },
    }, () => {
      form.setFieldsValue({ [`a${id}`]: valStr });
      this.handleChange(eleObj, valStr);
    });
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
  // 生成隐藏表单项
  setHiddenItem = (eleObj, jsTriggerParamObj) => {
    const { form, formData, userInfo, tabInfo, prevTabInfo, prevListRowData, elementMap, tabData } = this.props;
    const { getFieldDecorator } = form;
    const { relationColumnName, displayName, columnSpan, requisite, basetype, id, defaultValue, tooltipText } = eleObj;
    let valueObj = formData[`a${id}`] ? JSON.parse(formData[`a${id}`]) : '';
    const initialValue = setValueToElement(eleObj, valueObj.name) || getValueFromGlobalVariables({
      globalVar: defaultValue,
      eleObj,
      isRealValue: false,
      userInfo,
    }) || '';
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
          {getFieldDecorator(`${IGNORE_FORM_ITEM}${id}`, {
            initialValue: basetype === 9 && String(initialValue).indexOf('1970 00:00:00') > -1 ? '' : (initialValue || ''),
            rules: [{
              required: !!requisite,
              message: <FormattedMessage id="global.required"/>,
            }, {
              validator: (...args) => this.customValidRule(jsTriggerParamObj, eleObj, ...args),
            }],
          })(this.setElementToWidget(eleObj, valueObj))}
        </Form.Item>
        <div className="hide">
          {/* <div> */}
          <Form.Item // 隐藏的实际值控件
            label={displayName}
          >
            {getFieldDecorator(`a${id}` || `${EMPTY_ITEM}_${id}`, {
              // initialValue: eleObj.basetype === 9 ? (valueObj ? valueObj : '') : (valueObj.id ? valueObj.id : ''),
              initialValue: valueObj.id || getValueFromGlobalVariables({
                globalVar: defaultValue,
                eleObj,
                userInfo,
              }) || '',
              rules: [{
                required: !!requisite,
                message: <FormattedMessage id="global.required"/>,
              }],
            })(<CInput/>)}
          </Form.Item>
        </div>
      </Fragment>
    );
    // }
  };
  // 返回对应的值
  returnValue = (defaultValue, eleObj, userInfo) => {
    return getValueFromGlobalVariables({
      globalVar: defaultValue,
      eleObj,
      userInfo,
    }) || defaultValue;
  };
  // 根据类型生成表单项
  setItem = (eleObj) => {
    const { langLib } = this.context;
    const { form, formData = {}, userInfo, tabInfo, prevTabInfo, prevListRowData, elementMap } = this.props;
    const { getFieldDecorator } = form;
    const { relationColumnName, relationColumnType, displayName, columnSpan, requisite, basetype, id, defaultValue, visiabled, tooltipText } = eleObj;
    if (formData[`a${id}`] === 'null' || JSON.stringify(formData[`a${id}`]) === '{}') {
      formData[`a${id}`] = JSON.stringify({ id: null, name: null });
    }
    const jsTriggerParamObj = this.getJsTriggerParmValues(eleObj);
    const initialValue = (formData[`a${id}`] !== 'null' && formData[`a${id}`]) ? (relationColumnType === 4 ? parseDecimal(String(JSON.parse(formData[`a${id}`]).name)) : JSON.parse(formData[`a${id}`]).name || this.returnValue(defaultValue, eleObj, userInfo)) : (this.returnValue(defaultValue, eleObj, userInfo));
    const label = tooltipText ? (
      <Tooltip title={tooltipText}>
        {displayName}
      </Tooltip>
    ) : displayName;
    let SingleItem = null;
    if (basetype === 11) { // 分割线
      SingleItem = <SplitLine title={displayName}/>;
    } else if ([3, 9, 45].includes(basetype) || (basetype === 8 && eleObj.elementFormat === 2)) { // 需要生成隐藏表单项的控件
      SingleItem = this.setHiddenItem(eleObj, jsTriggerParamObj);
    } else if (FILTER_ELEMENT_TYPE.includes(basetype)) {
      SingleItem = (
        <Form.Item
          label={label}
        >
          {getFieldDecorator(`a${id}` || `${EMPTY_ITEM}_${id}`, {
            initialValue: formData[`a${id}`] && JSON.parse(formData[`a${id}`]).id ? Number(JSON.parse(formData[`a${id}`]).id) : Number(defaultValue) === 0 ? '' : Number(defaultValue),
            rules: [{
              required: !!requisite,
              message: <FormattedMessage id="global.required"/>,
            }],
          })(this.setElementToWidget(eleObj))}
        </Form.Item>
      );
    } else if (basetype === 8) {
      SingleItem = (
        <Form.Item
          label={label}
        >
          {getFieldDecorator(`a${id}` || `${EMPTY_ITEM}_${id}`, {
            initialValue,
            rules: [{
              required: !!requisite,
              validator: (_, value, callback) => {
                const fileList = this.refs && this.refs.uploadForm.state.fileList || [];
                if ((!!requisite && !fileList.length)) {
                  callback(langLib['validator.upload.noData']);
                } else {
                  callback();
                }
              },
            }],
          })(this.setElementToWidget(eleObj))}
        </Form.Item>
      );
    } else if (basetype === 39) {
      SingleItem = (
        <Form.Item
          label={label}
        >
          {getFieldDecorator(`a${id}` || `${EMPTY_ITEM}_${id}`, {
            initialValue,
            validateTrigger: 'onBlur',
            rules: [{
              required: !!requisite,
              validator: (_, value, callback) => {
                if ((!!requisite && !value) || (!!requisite && value.editorState && value.editorState.isEmpty())) {
                  callback(langLib['validator.textEditor.noData']);
                } else {
                  callback();
                }
              },
            }],
          })(this.setElementToWidget(eleObj))}
        </Form.Item>
      );
    } else {
      SingleItem = (
        <Form.Item
          label={label}
        >
          {getFieldDecorator(`a${id}` || `${EMPTY_ITEM}_${id}`, {
            initialValue,
            rules: [{
              required: !!requisite,
              message: <FormattedMessage id="global.required"/>,
            }],
          })(this.setElementToWidget(eleObj))}
        </Form.Item>
      );
    }
    const span = ((columnSpan && columnSpan > 100) || !columnSpan) ? 12 : columnSpan;
    return (
      <Col span={span} key={`a${id}`} className={visiabled ? '' : 'hide'}>
        {SingleItem}
      </Col>
    );
  };
  // 生成表单项
  getFormItems = () => {
    const { tabInfo, elementMap, triggerMap } = this.props;
    const elementList = elementMap[tabInfo.id] || [];
    // 纯表单里的控件（不包括按钮）
    const pureElementList = elementList.filter(item => !(BTN_ELEMENT_TYPE.concat(42)).includes(item.basetype));
    return pureElementList.map(ele => {
      return this.setItem(ele);
    });
  };
  // 生成步骤条
  renderStep = () => {
    const { stepList, tabInfo, elementMap, tabList, advancedQueryMap, prevListRowData, prevTabInfo, userInfo } = this.props;
    const currentElementList = elementMap[tabInfo.id] || [];
    let SubPanel = currentElementList.find(item => item.basetype === 42) || {};
    if (JSON.stringify(SubPanel) === '{}' || !SubPanel.relationTabId) return;
    const { relationTabId } = SubPanel;
    let SubPanelTabInfo = tabList.find(item => item.id === relationTabId) || {};
    if (JSON.stringify(SubPanelTabInfo) === '{}' || SubPanelTabInfo.showType !== 9) return;
    let defaultProps = {
      ...this.props,
      tabInfo: SubPanelTabInfo,
    };
    let stepBarList = stepList ? stepList.datalist : [];
    return <FrameStepBar list={stepBarList} {...defaultProps}/>;
  };

  render() {
    const { className, tabInfo, elementMap, triggerMap, formData } = this.props;
    const wrapCls = classNames({
      [styles.wrap]: true,
      [className]: true,
    });
    return (
      <div id="a" className={wrapCls}>
        <div className={styles.itemWrap}>
          {this.renderStep()}
          {this.getFormItems()}
        </div>
      </div>
    );
  }
}

export default Form.create()(DetailForm);
