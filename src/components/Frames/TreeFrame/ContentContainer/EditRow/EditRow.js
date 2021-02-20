import React, { Component } from 'react';
import { Col, Icon, Row, Modal, Select, Input, Form, InputNumber, DatePicker } from 'antd';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import {
  BASETYPE_IN_EDIT_COL,
  BTN_IN_EDIT_LIST,
  BTN_IN_LIST_COL,
  NUMBER_COLUMN_TYPE, SEARCH_SELECT_TYPE,
  SELECT_IN_LIST,
  TIME_FORMATE_TYPES,
} from '@/constants/element';
import {
  compoundArithmetic,
  getValueFromGlobalVariables,
  matchGlobalFunctionParam,
  parseDecimal,
  validTriggerMatch,
} from '@/utils/common';
import DataSelectList from '@/components/Frames/LeftListFrame/ContentContainer/DataSelectList/NormalSearchSelect';
import { NormalSearchSelect } from '@/components/common/BasicWidgets';
import { arrayClassify, reduceArrObj } from '@/components/Frames/LeftListFrame/method';
import { getCheckBoxSearchDetail, getNormalSearchDetail } from '@/services/frame';
import Styles from './editRow.less';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';

const { Option } = Select;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);
const EditableFormRow = Form.create()(EditableRow);

// 编辑单元格
class EditableCell extends Component {
  state = {
    editing: false,
  };

  // 显示隐藏
  toggleEdit = (eleObj = '') => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        // todo 后续可以做级联操作
        // eleObj 能获取都对应的控件信息，更新控件是下拉框并且是级联的条件进行请求接口获取数据
        if (eleObj && (SELECT_IN_LIST.concat([1, 10]).includes(eleObj.basetype))) {
          this.input.focus();
        }
      }
    });
  };
  // 获取某行中某列的字段
  getValueFromCurrentTableColumn = (varName, record) => {
    if (!varName) return varName;
    const { tabinfo, elementmap, userinfo, activetreenode, tablist } = this.props;
    const elementList = elementmap[tabinfo.id];
    if (getValueFromGlobalVariables({
      globalVar: varName,
      treeNodeData: activetreenode,
      userInfo: userinfo,
    })) {
      return getValueFromGlobalVariables({
        globalVar: varName,
        treeNodeData: activetreenode,
        usernfo: userinfo,
      });
    }
    // 加减乘除四则混合运算@@CompoundArithmetic
    if (varName.indexOf('@@CompoundArithmetic') > -1) {
      return compoundArithmetic({
        asqValue: varName,
        getValueFromCurrentTabData: this.getValueFromCurrentTableColumn,
        CMessage,
        otherParams: { varName, record, type: 'listEidt' },
      });
    }
    let currentEle = elementList && elementList.find(item => item.parameter === varName);
    if (!currentEle) return varName;
    const { valueFieldType } = currentEle;
    const lastData = record[currentEle.id];
    if (valueFieldType === 2) {
      return lastData.name;
    } else {
      return lastData.id;
    }
  };
  // js触发器转化参数名称及值
  getJsTriggerParmValues = (eleObj, record) => {
    const { triggermap } = this.props;
    const { id: eleId, basetype: eleType } = eleObj;
    const triggerList = triggermap[eleId] || [];
    const triggers = triggerList.filter(item => item.triggerType === 4 && item.basetype === 5);
    if (!triggers.length) return false;
    const result = {};
    triggers.forEach(trigger => {
      const { jsFunctionList } = trigger;
      if (!jsFunctionList || !jsFunctionList.length) return;
      jsFunctionList.forEach(jsFunObj => {
        const { valueType, param, paramValue } = jsFunObj;
        if (valueType === 2) {
          result[param] = this.getValueFromCurrentTableColumn(paramValue, record);
        } else {
          result[param] = paramValue;
        }
      });
    });
    return result;
  };
  // 根据控件类型来渲染对应的控件
  setElementToWidget = (eleObj, record, form) => {
    const { id, defaultValue, selectListTabId, relationColumnType, basetype, readonly, mainTableName, mainColumnName, relationTableName, relationTabId, visiabled, placeholderText, elementFormat } = eleObj;
    const { filterMap, getGlobalVarValues } = this.props;
    if (basetype === 1 || basetype === 10) {
      // 数字输入框
      if (NUMBER_COLUMN_TYPE.includes(relationColumnType)) {
        const jsTriggerParamObj = this.getJsTriggerParmValues(eleObj, record);
        const _props = {};
        if (jsTriggerParamObj) { // 有js触发器的计算属性
          const { max, min } = jsTriggerParamObj;
          if (max !== '' && !isNaN(Number(max))) _props.max = +max;
          if (min !== '' && !isNaN(Number(min))) _props.min = +min;
        }
        return <InputNumber {..._props} ref={node => (this.input = node)} onPressEnter={(e) => this.save(e, eleObj)}
                            onBlur={(e) => this.save(e, eleObj)}
        />;
      }
      return ( // 输入框
        <Input ref={node => (this.input = node)} onPressEnter={(e) => this.save(e, eleObj)}
               onBlur={(e) => this.save(e, eleObj)}/>
      );
    } else if (SELECT_IN_LIST.includes(basetype)) {
      return (
        <Select className={Styles.cellSelect}
                onBlur={() => this.toggleEdit()}
                onChange={(e, option) => this.selectSave(e, option, eleObj)}
                ref={node => (this.input = node)}
        >
          {this.props.tabdropdowndata[id] && this.props.tabdropdowndata[id].map(item => <Option key={item.id}
                                                                                                value={`${item.id}`}
                                                                                                data={item}>{item.name}</Option>)}
        </Select>
      );
    } else if (basetype === 3) {
      const { selectListTabId, jumpType, jumpMenuList, readonly } = eleObj;
      const hasColor = ((relationTabId && (jumpType === 1 || !jumpType)) || (jumpType === 2 && jumpMenuList.length));
      const _props = {
        disabled: !!readonly,
        eleObj,
        valueObj: record[id],
        form: form,
        filterMap: filterMap,
        multiple: false,
        setSelected: selecteds => this.handleSetSelectSearchValue(selecteds, eleObj),
        handleClickValue: () => !!hasColor && this.props.setPopupTabInfo({ eleObj, listRowData: record }),
        getGlobalVarValues: varName => getGlobalVarValues({
          varName,
          type: 'defaultValue',
          eleObj,
        }),
      };
      if (selectListTabId) {
        _props.onOpen = () => this.props.setPopupTabInfo({
          eleObj,
          listRowData: record,
          tabIdKey: 'selectListTabId',
          handleSetCustomSelectList: _props.setSelected,
          otherParamsInCustomList: { multiple: false },
        });
      }
      return ( // 数据选择框
        <NormalSearchSelect
          {..._props}
          toggleEdit={() => this.toggleEdit()}
          ref={node => (this.input = node)}
          className={Styles.cellNormalSelect}
          mainTableName={mainTableName}
          mainColumnName={mainColumnName}
        />
      );

    } else if (basetype === 9) {
      const _props = {
        format: TIME_FORMATE_TYPES[elementFormat || 1],
        showTime: elementFormat !== 2,
      };
      return (
        <DatePicker
          {..._props}
          className={Styles.cellInput}
          onMouseLeave={() => this.toggleEdit()}
          onChange={value => this.changeTime(value, eleObj)}
          ref={node => (this.input = node)}
        />
      );
    } else {
      return (
        <Input ref={node => (this.input = node)}
               className={Styles.cellInputNotBorder}
               disabled={true}
               type="text"
        />
      );
    }
  };
  handleSetSelectSearchValue = (selecteds, eleObj) => {
    let { record, dataindex } = this.props;
    const { relationColumnName, id, mainColumnName } = eleObj;
    const selecctedData = selecteds[0] || {};
    let data = {
      [dataindex]: { id: selecctedData.id, name: selecctedData[mainColumnName] },
    };
    record = { ...record, ...data };
    this.updateFormDataList(record, eleObj, selecctedData.id, selecctedData);
    this.toggleEdit();
  };
  // 更新列表中的数据
  updateFormDataList = (record, eleObj, value, selecctedData) => {
    let { updatastate, formdata, idobj } = this.props;
    const { id } = idobj;
    const { datalist, ...rest } = formdata;
    let index = datalist.findIndex(item => item[id].id === record[`${id}`].id);
    let newDataList = [...datalist];
    newDataList.splice(index, 1, record);
    let newFormData = {
      datalist: [...newDataList],
      ...rest,
    };
    updatastate({ listDataObj: { ...newFormData } }, () => {
      if (!eleObj && !value) return;
      const { basetype } = eleObj;
      if (BTN_IN_LIST_COL.includes(basetype)) {
        this.handleChange(record, eleObj, value);
      } else if (basetype === 3) {
        this.handleChange(record, eleObj, value, selecctedData);
      }
    });
  };
  // 判断触发值是否是变量，如果是变量变成对应的值
  reducevVariableToData = (arr, record) => {
    if (!arr.length) return;
    let newData = [];
    arr.forEach(item => {
      if (item.endTriggerNum && item.endTriggerNum.indexOf('@@') > -1 && item.endTriggerNum.split('@@').length < 3) {
        item.endTriggerNum = this.getValueFromCurrentTableColumn(item.endTriggerNum, record);
      }
      newData.push(item);
    });
    return newData;
  };
  handleChange = (record, eleObj, value, selecctedData) => {
    const { id, relationColumnType, basetype: originEleBaseType } = eleObj;
    if (relationColumnType === 4) {
      value = parseDecimal(value + '');
    }
    const { tablist, activetreenode, userinfo, triggermap, tabinfo, elementmap, updatastate, originElementMap, getValueFromCurrentTabData, tabData } = this.props;
    const elementList = elementmap[tabinfo.id] || [];
    const triggerData = triggermap[id] && triggermap[id].filter(item => item.basetype !== 4 && item.triggerType === 1) || [];
    let eventType = arrayClassify(triggerData, 'elementEvent') || []; // 处理出来有几种前端触发器事件
    if (!eventType.length) return;
    let reduceEventType = reduceArrObj(eventType, 'endTriggerNum', 'conditionType', 'eventBasepriority', 'methodType');
    let triggerList = this.reducevVariableToData(reduceEventType, record); // 默认值处理成值
    const getValueFromCurrentTableColumn = (varName) => {
      if (!varName) return;
      const elementList = elementmap[tabinfo.id];
      if (getValueFromGlobalVariables({
        globalVar: varName,
        treeNodeData: activetreenode,
        userInfo: userinfo,
      })) {
        return getValueFromGlobalVariables({
          globalVar: varName,
          treeNodeData: activetreenode,
          userInfo: userinfo,
        });
      }
      let currentEle = elementList && elementList.find(item => item.parameter === varName);
      if (!currentEle) return varName;
      const { valueFieldType } = currentEle;
      const lastData = record[currentEle.id];
      if (valueFieldType === 2) {
        return lastData.name;
      } else {
        return lastData.id;
      }
    };
    let list = triggerList.filter(item => {
      const { endTriggerNum } = item;
      return validTriggerMatch(item, value, endTriggerNum, getValueFromCurrentTableColumn);
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
    if (!lastList.length) return;
    lastList.forEach(item => {
      let { endTriggerNum, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible, relationElementValue, canModifyValue } = item;
      const element = elementList.find(item => item.id === relationElementId);
      if (!element) {
        console.warn(item + '控件不存在');
        return;
      }
      if (BTN_IN_EDIT_LIST.includes(element.basetype)) { // 如果是按钮，只会有true和false
        record[element.id] = !!relationElementVisible;
      }
      let value = relationElementValue;
      const paramValue = matchGlobalFunctionParam(relationElementValue);
      if (paramValue) {
        value = selecctedData[paramValue];
      }
      if (BTN_IN_LIST_COL.includes(element.basetype)) { // 如果时候可下拉框，输入框，时间选择框，则直接填值，不会再继续触发下一层
        if (SELECT_IN_LIST.includes(element.basetype)) { // 如果是下拉框，需要找到下拉框中的名称显示
          let optionData = this.props.tabdropdowndata[element.id].find(item => item.id === +value);
          if (!optionData) {
            record[element.id] = { id: '', name: '' };
          } else {
            record[element.id] = { id: optionData.id, name: optionData.name };
          }
        } else {
          if (relationElementValue === '@@Null') {
            record[element.id] = { id: '', name: '' };
            value = '';
          } else if (relationElementValue && relationElementValue.indexOf('@@') > -1) {
            value = this.getValueFromCurrentTableColumn(relationElementValue, record);
            record[element.id] = { id: value, name: value };
          } else {
            record[element.id] = { id: value, name: value };
          }
        }
      }
      if (SEARCH_SELECT_TYPE.includes(element.basetype)) {
        if (SEARCH_SELECT_TYPE.concat([17]).includes(element.basetype) && !!value && (!isNaN(Number(value)) || !!Number(value))) {
          if (element.basetype === 17 && element.valueFieldType === 2) {
            record[element.id] = { id: value, name: value };
            return;
          }
          this.fetchDetailById(element, +value, record);
        } else {
          record[element.id] = { id: '', name: '' };
        }
      }
    });
    this.updateFormDataList(record);
  };

  // 数据选择框 根据id获取详情
  fetchDetailById = (eleObj, id, record) => {
    const { mainTableName: tabSource, mainColumnName, id: eleId, basetype, triggerSign } = eleObj;
    const api = basetype === 45 ? getCheckBoxSearchDetail : getNormalSearchDetail;
    const params = {
      [basetype === 45 ? 'tableName' : 'tabSource']: tabSource,
      [basetype === 45 ? 'ids' : 'id']: id,
    };
    api(params).then(res => {
      let resData = basetype === 45 ? {
        id: res.map(item => item.id).join(','),
        name: res.map(item => item[mainColumnName]).join(','),
      } : {
        id: res.id || '',
        name: res[mainColumnName] || '',
      };
      record[eleId] = resData;
      this.updateFormDataList(record, eleObj, res.id, res);
    });
  };
  // 修改时间
  changeTime = (time, eleObj) => {
    const { elementFormat } = eleObj;
    let timeValue = time ? moment(time).format(TIME_FORMATE_TYPES[elementFormat || 1]) : '';
    let { record, dataindex } = this.props;
    let data = {
      [dataindex]: { id: timeValue, name: timeValue },
    };
    record = { ...record, ...data };
    this.updateFormDataList(record, eleObj, timeValue);
    this.toggleEdit();
  };

  // 输入框中的值进行修改
  save = (e, eleObj) => {
    let { record, dataindex } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      const eleValue = `${values[dataindex] === null ? '' : values[dataindex]}`;
      let data = {
        [dataindex]: { id: eleValue, name: eleValue },
      };
      record = { ...record, ...data };
      this.updateFormDataList(record, eleObj, eleValue);
    });
  };
  // 下拉框中的值进行修改
  selectSave = (val, option, eleObj) => {
    const { props: { value, children } } = option;
    let { record, dataindex } = this.props;
    this.form.validateFields((error, values) => {
      if (error) {
        return;
      }
      let data = {
        [dataindex]: { id: value, name: children },
      };
      record = { ...record, ...data };
      this.updateFormDataList(record, eleObj, value);
    });
  };

  // 编辑单元格
  renderCell = form => {
    this.form = form;
    const { children, dataindex, record, title, eleobj } = this.props;
    const { editing } = this.state;
    const { basetype } = eleobj;
    const recordData = record[dataindex] ? record[dataindex] : {};
    return editing && BASETYPE_IN_EDIT_COL.includes(basetype) ? (
      <Form.Item className={Styles.form}>
        {form.getFieldDecorator(`${dataindex}`, {
          rules: [
            {
              required: false,
              message: `${title} is required.`,
            },
          ],
          initialValue: basetype === 9 ? recordData.name ? moment(recordData.name) : '' : `${recordData.name || ''}`,
        })(this.setElementToWidget(eleobj, record, form))}
      </Form.Item>
    ) : (
      <div
        className={Styles.cellHeight}
        onClick={() => this.toggleEdit(eleobj)}
      >
        {children}
      </div>
    );
  };

  render() {
    const {
      editable,
      dataindex,
      title,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}

export default { // 可编辑
  body: {
    row: EditableFormRow,
    cell: EditableCell,
  },
};
