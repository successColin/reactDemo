/*
 * @Author: Fus
 * @Date:   2020-02-24 10:38:14
 * @Desc: 筛选弹窗表单（同高级筛选）
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Form, Tooltip, Select } from 'antd';
import classNames from 'classnames';
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
  CButton,
  CheckBoxSearchSelect,
} from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import {
  BTN_ELEMENT_TYPE,
  HIDDEN_ELEMENT_TYPE,
  IGNORE_FORM_ITEM,
  TIME_FORMATE_TYPES,
  NUMBER_COLUMN_TYPE,
  SELECT_ELEMETN_TYPE,
  SEARCH_SELECT_TYPE,
} from '@/constants/element';
import { jsFunctions, validJsFunctions } from '@/constants/jsTriggerFunctions';
import {
  setElementToValue,
  setValueToElement,
  validTriggerMatch,
  matchGlobalFunctionParam,
  isGlobalOrCustomVar,
  formatTime,
} from '@/utils/common';
import CutomSearchSelectList from './CutomSearchSelectList/CutomSearchSelectList';
import { getNormalSearchDetail, getPageSelectOptions } from '@/services/frame';
import styles from '@/components/common/FormItems/FormItems.less';
import filterStyles from './FilterForm.less';
import DataSelectList from '@/components/Frames/FullListFrame/ContentContainer/DataSelectList/NormalSearchSelect';

const { Option } = Select;

class FilterForm extends Component {
  state = {
    visibleCustomList: false, // 自定义数据选择框弹出列表
    customListTabInfo: {}, // 自定义数据选择框弹出列表面板信息
    customListEleObj: {}, // 有自定义弹出列表的控件对象
    loadingStatus: {
      saveCustomList: false, // 保存自定义弹出列表选中数据
    },
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

  // js触发器转化参数名称及值
  getJsTriggerParmValues = eleObj => {
    const { triggerMap, getGlobalVarValue } = this.props;
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
          result[param] = getGlobalVarValue({ varName: paramValue, eleObj });
        } else {
          result[param] = paramValue;
        }
      });
    });
    return result;
  };
  // 根据控件类型生成对应控件
  setElementToWidget = (eleObj, jsTriggerParamObj, comConfig) => {
    const { form, tabList, formData, filterMap, setContainerState, getGlobalVarValue, elementMap } = this.props;
    const { basetype, readonly, mainTableName, mainColumnName, relationTableName, elementFormat, placeholderText, relationColumnType, relationTabId, id: eleId } = eleObj;
    const baseProps = {
      key: `${eleObj.id}`,
      // key: `${eleId}`,
      disabled: !!readonly,
      placeholder: placeholderText,
    };
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
        const _props = {
          ...baseProps,
          onChange: val => this.handleChangeInputNumber(eleObj, val),
        };
        if (jsTriggerParamObj) { // 有js触发器的计算属性
          const { max, min } = jsTriggerParamObj;
          if (max !== '' && !isNaN(Number(max))) _props.max = max;
          if (min !== '' && !isNaN(Number(min))) _props.min = min;
        }
        return <CInputNumber {..._props} onBlur={e => setEleFormData(e.target.value)}/>;
      }
      return ( // 输入框
        <CInput {...baseProps} onBlur={e => setEleFormData(e.target.value)}/>
      );
    } else if (SELECT_ELEMETN_TYPE.includes(basetype)) { // 下拉框
      return (
        <CSelect {...baseProps} onChange={val => this.handleChangeSelect(eleObj, `${val}`)}>
          {this.getOptions(eleObj.id)}
        </CSelect>
      );
    } else if (basetype === 3) { // 数据选择框
      const { selectListTabId } = eleObj;
      const _props = {
        ...baseProps,
        eleObj: eleObj,
        valueObj: formData[eleId],
        form: form,
        filterMap: filterMap,
        setSelected: selecteds => this.handleChangeSearchSelect(eleObj, selecteds[0] || {}),
        // handleClickValue: () => relationTabId && this.props.setPopupTabInfo({ eleObj, listRowData: formData }),
        getGlobalVarValue: varName => getGlobalVarValue({
          varName,
          eleObj,
        }),
      };
      // 自定义弹出列表
      if (selectListTabId) {
        const customListTabInfo = tabList.find(item => item.id === selectListTabId);
        _props.onOpen = () => this.setState({
          visibleCustomList: true,
          customListTabInfo,
          customListEleObj: eleObj,
        });
      }
      return (
        <NormalSearchSelect {..._props} />
      );
    } else if (basetype === 9) { // 日期选择框
      const _props = {
        ...baseProps,
        format: TIME_FORMATE_TYPES[elementFormat || 1],
        showTime: elementFormat !== 2,
        onChange: date => this.handleChangeDatePicker(eleObj, date, comConfig),
      };
      if (jsTriggerParamObj) { // 有js触发器的计算属性
        _props.disabledDate = current => jsFunctions.getDatePickerRange(current, jsTriggerParamObj);
      }
      return (
        <CDatePicker {..._props} />
      );
    } else if (basetype === 10) { // 多行文本
      return <CTextArea {...baseProps} autoSize={true}/>;
    } else if (basetype === 45) {
      const { selectListTabId } = eleObj;
      const _props = {
        ...baseProps,
        eleObj: eleObj,
        valueObj: formData[eleId],
        form: form,
        filterMap: filterMap,
        multiple: true,
        deleteTag: data => this.deletteSetChecBoxValue(data, eleObj),
        setSelected: selecteds => this.handleSetChecBoxValue(selecteds, eleObj),
        getGlobalVarValue: varName => getGlobalVarValue({
          varName,
          eleObj,
        }),
      };
      // 自定义弹出列表
      if (selectListTabId) {
        const customListTabInfo = tabList.find(item => item.id === selectListTabId);
        _props.onOpen = () => this.setState({
          visibleCustomList: true,
          customListTabInfo,
          customListEleObj: eleObj,
        });
      }
      return <CheckBoxSearchSelect {..._props}/>;
    } else {
      return <CInput {...baseProps} onBlur={e => setEleFormData(e.target.value)}/>;
    }
  };
  // 修改数字框
  handleChangeInputNumber = (eleObj, val) => {
    const activeEleValObj = {
      id: val,
      name: val,
    };
    this.doFrontTrigger({
      eleObj,
      activeEleValObj,
    });
  };
  // 修改下拉框
  handleChangeSelect = (eleObj, valStr) => {
    const { elementFormat, id } = eleObj;
    const { tabDropDownData } = this.props;
    const matchOption = tabDropDownData[id] && tabDropDownData[id].find(item => `${item.id}` === valStr) || {};
    const activeEleValObj = {
      id: valStr,
      name: matchOption.name || '',
    };
    this.doFrontTrigger({
      eleObj,
      activeEleValObj,
    });
  };
  // 修改选择框
  handleChangeSearchSelect = (eleObj, searchSelectedData) => {
    const { mainColumnName } = eleObj;
    const activeEleValObj = {
      id: searchSelectedData.id || '',
      name: searchSelectedData[mainColumnName] || '',
    };
    this.doFrontTrigger({
      eleObj,
      activeEleValObj,
      searchSelectedData,
    });
  };
  // 多选
  handleSetChecBoxValue = (selecteds, eleObj) => {
    const { mainColumnName, id } = eleObj;
    const { setContainerState, formData } = this.props;
    let data = {
      id: selecteds.map(item => item.id).join(','),
      name: selecteds.map(item => item[mainColumnName]).join(','),
    };
    setContainerState({
      formData: {
        ...formData,
        [id]: data,
      },
    });
  };
  // 直接删除多选便签
  deletteSetChecBoxValue = (selecteds, eleObj) => {
    const { mainColumnName, id } = eleObj;
    const { setContainerState, formData } = this.props;
    setContainerState({
      formData: {
        ...formData,
        [id]: selecteds,
      },
    });
  };
  // 修改时间控件时对应修改隐藏真实值的控件
  handleChangeDatePicker = (eleObj, eleValue, comConfig = {}) => {
    const { setContainerState, formData } = this.props;
    const { elementFormat, id, dataFormat } = eleObj;
    const value = eleValue ? formatTime(eleValue, elementFormat) : '';
    const activeEleValObj = {
      id: value,
      name: value,
    };
    const { formDataId } = comConfig;
    const curItemValueObj = {
      [formDataId]: activeEleValObj,
    };
    setContainerState({
      formData: {
        ...formData,
        ...curItemValueObj,
      },
    }, () => {
      this.doFrontTrigger({
        eleObj,
        activeEleValObj,
      });
    });
  };

  // 前端触发器
  doFrontTrigger = ({
                      eleObj,
                      activeEleValObj = {},
                      searchSelectedData = {},
                    }) => {
    const { triggerMap, getGlobalVarValue, elementMap = {}, tabInfo = {}, formData = {}, setFilterEle, originElementMap, form } = this.props;
    const { id: originEleId, basetype: originEleBaseType } = eleObj;
    const eleTriggers = triggerMap[originEleId] || [];
    const elementList = elementMap[tabInfo.id] || [];
    const triggers = eleTriggers.filter(item => item.triggerType === 1);
    const unsetFormData = {
      [originEleId]: activeEleValObj, // 源控件
    };
    const targetEleList = []; // 需要修改的目标控件列表
    const cascadeSelectList = []; // 需要重新获取下拉数据的控件
    triggers.forEach(trigger => {
      const { relationElementValue, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible, canModifyValue, endTriggerNum } = trigger;
      const targetEle = elementList.find(item => item.id === relationElementId);
      if (!targetEle) return;
      let actualVal = activeEleValObj.id || '';
      let matchVal = endTriggerNum;
      if (isGlobalOrCustomVar(actualVal)) { // 全局变量
        actualVal = getGlobalVarValue({ varName: actualVal });
      }
      if (isGlobalOrCustomVar(endTriggerNum)) {
        matchVal = getGlobalVarValue({ varName: endTriggerNum });
      }
      const validMatch = validTriggerMatch(trigger, actualVal, matchVal);
      // // 符合触发条件
      if (validMatch) {
        let value = relationElementValue;
        // 值为变量
        if (isGlobalOrCustomVar(value)) {
          value = getGlobalVarValue({ varName: value, targetEle });
        }
        // 源控件为下拉框
        if (SELECT_ELEMETN_TYPE.includes(originEleBaseType)) {
          const { id, basetype, elementFormat } = targetEle;
          // 级联下拉框
          if (canModifyValue && SELECT_ELEMETN_TYPE.includes(basetype) && elementFormat === 2) {
            cascadeSelectList.push(targetEle);
          }
        }
        // 源控件为选择框
        if (SEARCH_SELECT_TYPE.includes(originEleBaseType)) {
          // 全局函数入参
          const paramName = matchGlobalFunctionParam(relationElementValue);
          // 取当前数据选择框中选中的详情数据对应参数值
          if (paramName) {
            value = searchSelectedData[paramName] || '';
          }
          // 目标控件属于选择框的需要单独调接口获取详情
          if (SEARCH_SELECT_TYPE.includes(targetEle.basetype) && !isNaN(Number(value))) {
            this.fetchDetailById(targetEle, +value);
          }
        }
        unsetFormData[relationElementId] = {
          id: value,
          name: value,
        };
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
      } else { // 不符合触发条件
        // 属性恢复原始状态
        const eleList = originElementMap[tabInfo.id] || [];
        const originTargetEle = eleList.find(item => item.id === relationElementId);
        const originData = {
          id: '',
          name: '',
        };
        originTargetEle && targetEleList.push(originTargetEle);
        // 值恢复原始数据
        unsetFormData[relationElementId] = originData;
        form.setFieldsValue({
          [`${relationElementId}`]: originData.id,
          [`${IGNORE_FORM_ITEM}_${relationElementId}`]: originData.name,
        });
      }
    });
    // 更新元素属性
    const newElementList = [...elementList];
    targetEleList.length && targetEleList.forEach(changedItem => {
      const targetIndex = newElementList.findIndex(item => changedItem.id === item.id);
      newElementList.splice(targetIndex, 1, changedItem);
    });
    setFilterEle({
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
      cascadeSelectList.length && this.fetchCascadeOptions(cascadeSelectList);
    });
  };
  // 动态获取级联下拉数据
  fetchCascadeOptions = (cascadeSelectList) => {
    const { setContainerState, filterMap, tabDropDownData, getGlobalVarValue } = this.props;
    // 下拉框控件列表
    const dropDownList = cascadeSelectList.filter(item => SELECT_ELEMETN_TYPE.includes(item.basetype) && !!item.mainTableName && item.elementFormat === 2)
      .map(item => ({ dataSource: item.mainTableName, elementId: item.id, columnName: item.mainColumnName }));
    if (!dropDownList.length) return;
    const globalMap = {};
    Object.keys(filterMap).map(key => {
      filterMap[key].forEach(item => {
        const { asqlValue, asqlValueType } = item;
        if (asqlValueType === 2 || isGlobalOrCustomVar(asqlValue)) {
          globalMap[item.asqlValue] = getGlobalVarValue({ varName: asqlValue });
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
                                                                                 key={`select_option_${item.id}`}>{item.name}</Option>);
  };
  // 生成隐藏表单项
  setHiddenItem = (eleObj, jsTriggerParamObj) => {
    const { form, formData, getGlobalVarValue } = this.props;
    const { getFieldDecorator } = form;
    const { displayName, requisite, id, defaultValue, tooltipText } = eleObj;
    // 控件显示值
    const getInitVal = isRealValue => {
      const valueObj = formData[id];
      if (valueObj) {
        return isRealValue ? valueObj.id : setValueToElement(eleObj, valueObj.name);
      }
      return isGlobalOrCustomVar(defaultValue) ? getGlobalVarValue({
        varName: defaultValue,
        eleObj,
        isRealValue,
      }) : defaultValue;
    };
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
            initialValue: getInitVal(false),
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
              initialValue: getInitVal(true),
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
  // 根据控件类型展示
  setItem = (eleObj) => {
    const { getGlobalVarValue, form, formData } = this.props;
    const { getFieldDecorator } = form;
    const { displayName, columnSpan, requisite, basetype, id, visiabled, defaultValue, tooltipText, dataFormat } = eleObj;
    let SingleItem = null;
    const jsTriggerParamObj = this.getJsTriggerParmValues(eleObj);
    const span = ((columnSpan && columnSpan > 100) || !columnSpan) ? 12 : columnSpan;
    // 常规表单项
    const setNormalSingleItem = ({
                                   staticDisplayName = '', // 展示名字
                                   itemId = `${id}`,
                                   type = 'normal', // 类型 date-时间
                                   component = null, // 组件
                                   comConfig = { // 组件配置
                                     formDataId: id,
                                   },
                                 }) => {
      const labelName = staticDisplayName || displayName;
      // 悬浮提示
      const label = tooltipText ? (
        <Tooltip title={tooltipText}>
          {labelName}
        </Tooltip>
      ) : labelName;
      const valueObj = formData[comConfig.formDataId];
      let value = valueObj ? valueObj.id : '';
      if (value && type === 'date') {
        value = setValueToElement(eleObj, valueObj.name);
      }
      let initialValue = value || defaultValue || getGlobalVarValue({
        varName: defaultValue,
        eleObj,
      });
      const renderCom = component ? component : this.setElementToWidget(eleObj, jsTriggerParamObj, comConfig);
      return SingleItem = (
        <Form.Item
          label={label}
        >
          {getFieldDecorator(itemId, {
            initialValue,
            rules: [{
              required: !!requisite,
              message: <FormattedMessage id="global.required"/>,
            }],
          })(renderCom)}
        </Form.Item>
      );
    };
    if (basetype === 11) { // 分割线
      SingleItem = <SplitLine title={displayName}/>;
    } else if (basetype === 9 && dataFormat === 1) { // 日期区间 @TODO: 待区间格式定后再修改时间数据默认值
      const _props = {
        span,
        className: visiabled ? '' : 'hide',
      };
      return (
        <Fragment>
          <Col {..._props}>
            {setNormalSingleItem({
              type: 'date',
              itemId: `${IGNORE_FORM_ITEM}_${id}_start`,
              comConfig: {
                rangeType: 'start',
                formDataId: `${id}_start`,
              },
            })}
          </Col>
          <Col {..._props} className="hide">
            {setNormalSingleItem({
              itemId: `${id}_start`,
              component: <CInput/>,
            })}
          </Col>
          <Col {..._props}>
            {setNormalSingleItem({
              type: 'date',
              staticDisplayName: <FormattedMessage id="global.to"/>,
              itemId: `${IGNORE_FORM_ITEM}_${id}_end`,
              comConfig: {
                rangeType: 'end',
                formDataId: `${id}_end`,
              },
            })}
          </Col>
          <Col {..._props} className="hide">
            {setNormalSingleItem({
              staticDisplayName: <FormattedMessage id="global.to"/>,
              component: <CInput/>,
              itemId: `${id}_end`,
            })}
          </Col>
        </Fragment>
      );
    } else if (HIDDEN_ELEMENT_TYPE.includes(basetype)) { // 需要生成隐藏表单项的控件
      SingleItem = this.setHiddenItem(eleObj, jsTriggerParamObj);
    } else {
      setNormalSingleItem({});
    }
    return (
      <Col span={span} key={id} className={visiabled ? '' : 'hide'}>
        {SingleItem}
      </Col>
    );
  };
  // 生成表单项
  getFormItems = () => {
    const { filterEles } = this.props;
    // 纯表单里的控件（不包括按钮）
    const pureElementList = filterEles.filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype));
    return pureElementList.map(ele => {
      return this.setItem(ele);
    });
  };
  // 关闭自定义选择列表
  handleCancelCustomList = () => {
    this.setState({
      visibleCustomList: false,
      customListTabInfo: {},
    });
  };
  // 保存自定义弹出列表
  handleSaveCustomList = () => {
    const { setContainerState } = this.props;
    const { customListTabInfo, customListEleObj, formData } = this.state;
    const { selectedRow } = this.customListRef.state;
    if (JSON.stringify(selectedRow) === '{}' || !selectedRow) {
      this.handleCancelCustomList();
      return;
    }
    const idObj = selectedRow.id;
    if (!idObj) return;
    this.setLoadingStatus('saveCustomList', true);
    getNormalSearchDetail({
      tabSource: customListTabInfo.relationTableName,
      id: idObj.id,
    }).then(res => {
      const { id: eleId, mainColumnName } = customListEleObj;
      setContainerState({
        formData: {
          ...formData,
          [eleId]: {
            id: idObj.id,
            name: res[mainColumnName] || '',
          },
        },
      });
      this.setState({ visibleCustomList: false });
      this.setLoadingStatus('saveCustomList', false);
    }, err => this.setLoadingStatus('saveCustomList', false));
  };
  // 更新loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
        [type]: loading,
      },
    });
  };

  render() {
    const { visibleCustomList, customListTabInfo, customListEleObj, loadingStatus } = this.state;
    const { tabList, elementMap, advancedQueryMap, formData, getGlobalVarValue, handleSubmit, handleCancel, handleReset } = this.props;
    const wrapCls = classNames({
      [styles.wrap]: true,
      [filterStyles.wrap]: true,
    });
    const { id: customListTabId } = customListTabInfo;
    let CustomList = null;
    if (customListTabId) {
      const customSearchSelectTabInfo = tabList.find(item => item.id === customListTabId) || {};
      const valueObj = formData[customListEleObj.id];
      CustomList = (
        <CutomSearchSelectList
          value={valueObj ? valueObj.id : ''}
          tabInfo={customSearchSelectTabInfo}
          elementMap={elementMap}
          tabList={tabList}
          advancedQueryMap={advancedQueryMap}
          getGlobalVarValue={getGlobalVarValue}
          handleCancel={this.handleCancelCustomList}
          ref={ref => this.customListRef = ref}
        />
      );
    }
    return (
      <div className={wrapCls}>
        <div className={`${styles.itemWrap} ${filterStyles.formWrap}`}>
          <Form colon={false}>
            <Row>
              {this.getFormItems()}
            </Row>
          </Form>
        </div>
        <div className={filterStyles.footerBtn}>
          <CButton
            onClick={handleReset}
          >
            <FormattedMessage id="global.reset"/>
          </CButton>
          <CButton
            className={filterStyles.cancelBtn}
            onClick={handleCancel}
          >
            <FormattedMessage id="global.cancel"/>
          </CButton>
          <CButton
            type="primary"
            onClick={handleSubmit}
          >
            <FormattedMessage id="global.ok"/>
          </CButton>
        </div>
        <CreateModal
          visible={visibleCustomList}
          title={customListTabInfo.name}
          onCancel={this.handleCancelCustomList}
          onOk={this.handleSaveCustomList}
          size="large"
          confirmLoading={loadingStatus.saveCustomList}
        >
          {CustomList}
        </CreateModal>
      </div>
    );
  }
}

export default Form.create()(FilterForm);
