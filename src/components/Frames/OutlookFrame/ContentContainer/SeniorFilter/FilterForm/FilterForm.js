/*
 * @Author: jwk
 * @Date:   2020-10-19 10:35:17
 * @Desc: 高级筛选表单
 */
import { Component, Fragment } from 'react';
import { Form, Col, Select, Tooltip, DatePicker, Row } from 'antd';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import {
  BTN_ELEMENT_TYPE,
  ELEMENT_TYPE_NOT_IN_FILTER,
  EMPTY_ITEM, IGNORE_FORM_ITEM,
  NUMBER_COLUMN_TYPE,
  SELECT_ELEMETN_TYPE, TIME_FORMATE_TYPES,
} from '@/constants/element';
import {
  CDatePicker,
  CheckBoxSearchSelect,
  CInput,
  CInputNumber,
  CSelect,
  NormalSearchSelect,
  SplitLine,
} from '@/components/common/BasicWidgets';
import { FILTER_CONDITION } from '@/constants/triggerState';
import { jsFunctions } from '@/constants/jsTriggerFunctions';
import { getValueFromGlobalVariables, setElementToValue, setValueToElement } from '@/utils/common';
import styles from '@/components/common/FormItems/FormItems.less';
import Styles from './FilterForm.less';


const { Option } = Select;
const { RangePicker } = DatePicker;

class FilterForm extends Component {
  // 生成表单项
  getFormItems = () => {
    const { tabInfo, elementMap, triggerMap, filterEles = [] } = this.props;
    // 纯表单里的控件（不包括按钮）
    if (!filterEles.length) return;
    const pureElementList = filterEles.filter(item => !(BTN_ELEMENT_TYPE.concat([14])).includes(item.elementPramDto && item.elementPramDto.basetype));
    return pureElementList.map(ele => {
      return this.setItem(ele);
    });
  };
  // 根据类型生成表单项
  setItem = (eleObj) => {
    const { form, formData = {}, userInfo, tabInfo, prevTabInfo, prevListRowData, elementMap } = this.props;
    const { getFieldDecorator } = form;
    const { elementPramDto = {}, relationColumnName, displayName, columnSpan, requisite, defaultValue, visiabled, tooltipText } = eleObj;

    const { basetype, id, dataFormat } = elementPramDto;
    const span = ((columnSpan && columnSpan > 100) || !columnSpan) ? 12 : columnSpan;
    let SingleItem = null;
    if (ELEMENT_TYPE_NOT_IN_FILTER.includes(basetype)) {
      return;
    } else if (basetype === 11) { // 分割线
      SingleItem = <SplitLine title={displayName}/>;
    } else if ([3, 8, 45].includes(basetype) || (9 === basetype && !dataFormat)) { // 需要生成隐藏表单项的控件
      SingleItem = this.setHiddenItem(eleObj);
    } else if (SELECT_ELEMETN_TYPE.includes(basetype)) {
      const label = tooltipText ? (
        <Tooltip title={tooltipText}>
          {displayName}
        </Tooltip>
      ) : displayName;
      SingleItem = (
        <Form.Item
          label={label}
        >
          {getFieldDecorator(`${id}` || `${EMPTY_ITEM}_${id}`, {
            initialValue: JSON.stringify(formData) !== '{}' ? formData[`${id}`] && formData[`${id}`].id : '',
          })(this.setElementToWidget(eleObj))}
        </Form.Item>);
    } else if (basetype === 9 && dataFormat) {
      const label = tooltipText ? (
        <Tooltip title={tooltipText}>
          {displayName}
        </Tooltip>
      ) : displayName;
      let startWidth = 12;
      SingleItem = (
        <Row>
          <Col span={startWidth}>
            <Form.Item
              label={label}
            >
              {getFieldDecorator(`${id}_start`, {
                initialValue: JSON.stringify(formData) !== '{}' ? (formData[`${id}_start`] && formData[`${id}_start`].id ? moment(formData[`${id}_start`].id) : null) : null,
              })(this.setElementToWidget(eleObj, {}, `${id}_start`))}
            </Form.Item>
          </Col>
          <Col span={startWidth} className={Styles.betteenSty}>
            <Form.Item
              label={'至'}
            >
              {getFieldDecorator(`${id}_end`, {
                initialValue: JSON.stringify(formData) !== '{}' ? (formData[`${id}_end`] && formData[`${id}_end`].id ? moment(formData[`${id}_end`].id) : null) : null,
              })(this.setElementToWidget(eleObj, {}, `${id}_end`))}
            </Form.Item>
          </Col>
        </Row>
      );
    } else {
      const label = tooltipText ? (
        <Tooltip title={tooltipText}>
          {displayName}
        </Tooltip>
      ) : displayName;
      SingleItem = (
        <Form.Item
          label={label}
        >
          {getFieldDecorator(`${id}` || `${EMPTY_ITEM}_${id}`, {
            initialValue: JSON.stringify(formData) !== '{}' ? formData[`${id}`] && formData[`${id}`].id || '' : '',
          })(this.setElementToWidget(eleObj))}
        </Form.Item>
      );
    }

    const Options = Object.keys(FILTER_CONDITION).map(item => <Option value={item}
                                                                      key={item}>{FILTER_CONDITION[item]}</Option>);
    const isTrue = ((basetype === 9 && dataFormat === 1) || basetype === 45) ? false : true;
    return (
      <Col span={isTrue ? span : 24} key={`${id}`} className={Styles.itemClass}>
        <Col span={isTrue ? 20 : 24}>
          {SingleItem}
        </Col>
        {isTrue ?
          <Col span={4}>
            <Form.Item>
              {getFieldDecorator(`cond_${id}`, {
                initialValue: JSON.stringify(formData) !== '{}' ? (formData[`cond_${id}`] && formData[`cond_${id}`].id) || '3' : '3',
              })(<CSelect
                onChange={(value) => this.changeCondSelect(value, `cond_${id}`)}>{Options}</CSelect>)}
            </Form.Item>
          </Col> : null}
      </Col>
    );
  };
  // 选择值
  changeCondSelect = (value, id, eleObj = {}) => {
    const { formData, updateState } = this.props;
    const { displayName } = eleObj;
    updateState({
      formData: {
        ...formData,
        [id]: { id: value, name: value, displayName },
      },
    });
  };
  changeCondSelect1 = (values, options, eleObj) => {
    const { props: { children, value } } = options;
    const { formData, updateState } = this.props;
    const { id, displayName } = eleObj;
    updateState({
      formData: {
        ...formData,
        [id]: { id: value, name: value ? children : '', displayName },
      },
    });
  };

  // 获取下拉框数据
  getOptions = (id) => {
    const { tabDropDownData = {} } = this.props;
    const optionData = tabDropDownData[id] || [];
    // 只显示下拉数据有id和name的项，否则不显示
    return optionData.filter(item => (item.name && item.id)).map(item => <Option value={item.id}
                                                                                 key={`select_option_${item.id}`}>{item.name}</Option>);
  };
  // 直接删除多选便签
  deletteSetChecBoxValue = (selecteds, eleObj) => {
    const { form, formData, updateState } = this.props;
    const { mainTableName: tabSource, relationColumnName, id, displayName } = eleObj;
    updateState({
      formData: {
        ...formData,
        [id]: {
          id: selecteds.id || '',
          name: selecteds.name || '',
          displayName,
        },
      },
    });
  };
  // 获取当前变量的值
  getValueFromCurrentTabData = (varName) => {
    if (!varName) return '';
    const { tabInfo, elementMap, filterEle, form } = this.props;
    let eleObj = filterEle.find(item => item.elementPramDto.parameter === varName);
    if (!eleObj) return '';
    const { elementId } = eleObj;
    let value = form && form.getFieldValue(`${elementId}`) || '';
    return value;
  };
  // 时间区间的开始时间和结束时间的限制
  getJsTriggerParmValues = (eleObj, formKey) => {
    const { id } = eleObj;
    const { formData } = this.props;
    if (formKey && formKey.indexOf('start') !== -1) {
      return {
        startTime: '',
        endTime: formData[`${id}_end`] ? formData[`${id}_end`].id : '',
      };
    }
    if (formKey && formKey.indexOf('end') !== -1) {
      return {
        startTime: formData[`${id}_start`] ? formData[`${id}_start`].id : '',
        endTime: '',
      };
    }
    return {
      startTime: formData[`${id}_start`] ? formData[`${id}_start`].id : '',
      endTime: formData[`${id}_end`] ? formData[`${id}_end`].id : '',
    };
  };
  // 设置多选框的数据
  handleSetChecBoxValue = (selecteds = [], eleObj) => {
    if (!selecteds.length) return;
    const { form, updateState, formData } = this.props;
    const { displayName, id, mainColumnName } = eleObj;
    updateState({
      formData: {
        ...formData,
        [id]: {
          id: selecteds.map(item => item.id).join(','),
          name: selecteds.map(item => item[mainColumnName]).join(','),
          displayName,
        },
      },
    });
  };
  // 设置数据选择框的值
  handleSetSelectSearchValue = (selecteds = [], eleObj) => {
    const { formData, updateState } = this.props;
    const selecctedData = selecteds[0] || {};
    const { id, mainColumnName, displayName } = eleObj;
    updateState({
      formData: {
        ...formData,
        [id]: {
          id: selecctedData.id || '',
          name: selecctedData[mainColumnName] || '',
          displayName,
        },
      },
    });
  };
  // 根据控件类型生成对应控件
  setElementToWidget = (eleObj, valueObj = {}, formKey) => {
    const { functionData = {}, form, formData, setFrameState, elementMap, tabInfo, fileRelationList, filterMap, getValueFromCurrentTabData } = this.props;
    const { elementPramDto } = eleObj;
    const { id, dataFormat, selectListTabId, basetype, relationColumnType, readonly, mainTableName, mainColumnName, relationTableName, relationTabId, visiabled, placeholderText, elementFormat } = elementPramDto;
    const baseProps = {
      key: `${eleObj.relationColumnName}_${eleObj.id}`,
      // disabled: !!readonly,
      placeholder: placeholderText,
    };

    if (basetype === 1) {
      const _props = {
        ...baseProps,
        onBlur: e => this.changeCondSelect(e.target.value, id, elementPramDto),
      };
      // 数字输入框
      if (NUMBER_COLUMN_TYPE.includes(relationColumnType)) {

        return <CInputNumber {..._props} />;
      }
      return ( // 输入框
        <CInput {..._props} />
      );
    } else if (SELECT_ELEMETN_TYPE.includes(basetype)) { // 下拉框
      return (
        <CSelect {...baseProps} onChange={(value, child) => this.changeCondSelect1(value, child, elementPramDto)}>
          <Option value={''} key="0_index"><FormattedMessage id="global.choose"/></Option>
          {this.getOptions(eleObj.elementPramDto.id)}
        </CSelect>
      );
    } else if (basetype === 45) {
      return (
        <CheckBoxSearchSelect
          {...baseProps}
          eleObj={elementPramDto}
          filterMap={filterMap}
          form={form}
          multiple={true}
          valueObj={JSON.stringify(formData) !== '{}' && formData[id] && formData[`${id}`] !== '{}' ? formData[`${id}`] : {}}
          getGlobalVarValues={varName => this.getValueFromCurrentTabData(varName)}
          mainTableName={mainTableName}
          mainColumnName={mainColumnName}
          deleteTag={data => this.deletteSetChecBoxValue(data, elementPramDto)}
          setSelected={selecteds => this.handleSetChecBoxValue(selecteds, elementPramDto)}
        />);
    } else if (basetype === 3) {
      return ( // 数据选择框
        <NormalSearchSelect
          {...baseProps}
          eleObj={elementPramDto}
          filterMap={filterMap}
          form={form}
          mainTableName={mainTableName}
          mainColumnName={mainColumnName}
          getGlobalVarValues={varName => this.getValueFromCurrentTabData(varName)}
          setSelected={selecteds => this.handleSetSelectSearchValue(selecteds, elementPramDto)}
        />
      );
    } else if (basetype === 9 && !dataFormat) {
      let _props = {
        ...baseProps,
        format: TIME_FORMATE_TYPES[elementFormat || 1],
        onChange: (date, dateString) => this.changeCondSelect(dateString, id, elementPramDto),
      };
      return (
        <CDatePicker {..._props} />
      );
    } else if (basetype === 9 && dataFormat) {
      const jsTriggerParamObj = this.getJsTriggerParmValues(elementPramDto, formKey);
      let _props = {
        ...baseProps,
        format: TIME_FORMATE_TYPES[elementFormat || 1],
        showTime: elementFormat !== 2,
        onChange: (date, dateString) => this.changeCondSelect(dateString, formKey, elementPramDto),
        disabledDate: current => jsFunctions.getDatePickerRange(current, jsTriggerParamObj),
        disabledTime: current => jsFunctions.getDatePickerRange(current, jsTriggerParamObj),
      };
      return ( // 时间区间
        <CDatePicker {..._props}/>
      );
    }

  };
  // 生成隐藏表单项
  setHiddenItem = (eleObj) => {
    const { form, formData = {}, userInfo, tabInfo, prevTabInfo, prevListRowData, elementMap, tabData } = this.props;
    const { getFieldDecorator } = form;
    const { elementPramDto } = eleObj;
    const { relationColumnName, displayName, columnSpan, requisite, basetype, id, defaultValue, tooltipText } = elementPramDto;
    let valueObj = formData[`${id}`] || {};
    const initialValue = setValueToElement(elementPramDto, valueObj.name) || defaultValue;
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
            initialValue: basetype === 9 && String(initialValue).indexOf('1970') > -1 ? '' : initialValue,
            rules: [{
              required: !!requisite,
              message: <FormattedMessage id="global.required"/>,
            }],
          })(this.setElementToWidget(eleObj, valueObj))}
        </Form.Item>
        <div className="hide">
          <Form.Item // 隐藏的实际值控件
            label={displayName}
          >
            {getFieldDecorator(`${id}`, {
              initialValue: valueObj.id || '',
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
// 修改表象控件时对应修改隐藏真实值的控件
  setHiddenValue = (eleObj, eleValue) => {
    const { relationColumnName, id } = eleObj;
    const value = setElementToValue(eleObj, eleValue);
    this.changeCondSelect(value, id, eleObj);
  };

  render() {
    const wrapCls = classNames({
      [styles.wrap]: true,
    });
    return (
      <div className={wrapCls} style={{ 'padding': '10px 0' }}>
        <div className={styles.itemWrap}>
          {this.getFormItems()}
        </div>
      </div>
    );
  }
}

export default Form.create()(FilterForm);
