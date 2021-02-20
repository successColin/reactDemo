import React, { Component } from 'react';
import { Col, Icon, Row, Tooltip, Modal, Select, Input, Form, InputNumber, DatePicker } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { FormattedMessage } from 'react-intl';
import {
  BTN_ELEMENT_TYPE,
  HIDE_IN_LIST_ELEMENT_TYPE,
  NUMBER_COLUMN_TYPE,
  TIME_FORMATE_TYPES,
  BTN_IN_LIST_COL,
  SELECT_IN_LIST,
  BASETYPE_IN_EDIT_COL,
  BTN_IN_EDIT_LIST, SEARCH_SELECT_TYPE,
} from '@/constants/element';
import Styles from '../DetailList/DetailList.less';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { CSearch, CSpin, CInput, CInputNumber, NormalSearchSelect } from '@/components/common/BasicWidgets';
import Zmage from 'react-zmage';
import { getList, updateMore, del } from '@/services/leftListFrame';
import SeniorFilter from '@/components/Frames/TreeFrame/ContentContainer/SeniorFilter/SeniorFilter';
import DetailList from '@/components/Frames/LeftListFrame/ContentContainer/DetailList/DetailList';
import {
  getValueFromGlobalVariables,
  jsonParse,
  getDefaultConfirmProps,
  parseDecimal,
  validTriggerMatch, matchGlobalFunctionParam, compoundArithmetic,
} from '@/utils/common';
import { BaseContext } from '@/constants/global';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import DataSelectList from '@/components/Frames/LeftListFrame/ContentContainer/DataSelectList/NormalSearchSelect';
import { arrayClassify, reduceArrObj } from '@/components/Frames/LeftListFrame/method';
import { getCheckBoxSearchDetail, getNormalSearchDetail } from '@/services/frame';
import styles from '@/components/Frames/TreeFrame/ContentContainer/DetailList/DetailList.less';

const { Option } = Select;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);
const EditableFormRow = Form.create()(EditableRow);

// 编辑单元格
class EditableCell extends React.Component {
  state = {
    editing: false,
  };

  toggleEdit = (eleObj = '') => {
    const editing = !this.state.editing;
    console.log(editing, 'editing');
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
    const { tabInfo, elementMap, userInfo, activeTreeNode, tabList } = this.props;
    const elementList = elementMap[tabInfo.id];
    const leftListTabInfo = tabList.find(item => item.showType === 3);
    let elementObj = elementMap[leftListTabInfo.id];
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
    if (getValueFromGlobalVariables({
      globalVar: varName,
      userInfo,
    })) {
      return getValueFromGlobalVariables({
        globalVar: varName,
        userInfo,
      });
    }
    if (varName === '@@BusinessID') {
      return JSON.parse(activeTreeNode[idEle.id]).name;
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
    const lastData = JSON.parse(record[currentEle.id]);

    if (valueFieldType === 2) {
      return lastData.name;
    } else {
      return lastData.id;
    }
  };
  // js触发器转化参数名称及值
  getJsTriggerParmValues = (eleObj, record) => {
    const { triggerMap } = this.props;
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
    const { filterMap } = this.props;
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
      if (selectListTabId) {
        return ( // 数据选择框
          <DataSelectList
            {...this.props}
            eleObj={eleObj}
            filterMap={filterMap}
            form={form}
            toggleEdit={() => this.toggleEdit()}
            mainTableName={mainTableName}
            mainColumnName={mainColumnName}
            setSelected={selecteds => this.handleSetSelectSearchValue(selecteds, eleObj)}
            handleClickValue={() => relationTabId && this.props.setPopupTabInfo(eleObj, record)}
            doSearchList={() => selectListTabId && this.props.setPopupTabInfo1(eleObj, record)}
            // getGlobalVarValues={varName => getValueFromCurrentTabData(varName)}
          />
        );
      } else {
        return ( // 数据选择框
          <NormalSearchSelect
            toggleEdit={() => this.toggleEdit()}
            eleObj={eleObj}
            className={Styles.cellNormalSelect}
            filterMap={filterMap}
            form={form}
            ref={node => (this.input = node)}
            valueObj={JSON.stringify(record) !== '{}' && record[`${eleObj.id}`] && JSON.stringify(record[`${eleObj.id}`]) !== '{}' ? JSON.parse(record[`${eleObj.id}`]) : {}}
            mainTableName={mainTableName}
            mainColumnName={mainColumnName}
            setSelected={selecteds => this.handleSetSelectSearchValue(selecteds, eleObj)}
            // handleClickValue={() => relationTabId && this.props.setPopupTabInfo(eleObj, record)}
            // getGlobalVarValues={varName => getValueFromCurrentTabData(varName)}
          />
        );
      }
    } else if (basetype === 9) {
      const _props = {
        // format: TIME_FORMATE_TYPES[elementFormat || 1],
        // showTime: elementFormat !== 2,
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
    }
  };
  handleSetSelectSearchValue = (selecteds, eleObj) => {
    let { record, dataIndex } = this.props;
    const { relationColumnName, id, mainColumnName } = eleObj;
    const selecctedData = selecteds[0] || {};
    let data = {
      [dataIndex]: JSON.stringify({ id: selecctedData.id, name: selecctedData[mainColumnName] }),
      [`a${dataIndex}`]: selecctedData[mainColumnName],
    };
    record = { ...record, ...data };
    this.updateFormDataList(record, eleObj, selecctedData.id, selecctedData);
    this.toggleEdit();
  };
  // 更新列表中的数据
  updateFormDataList = (record, eleObj, value, selecctedData) => {
    let { updataState, formData, idObj } = this.props;
    const { id } = idObj;
    const { datalist, ...rest } = formData;
    let index = datalist.findIndex(item => JSON.parse(item[id]).id === record[`a${id}`]);
    let newDataList = [...datalist];
    newDataList.splice(index, 1, record);
    let newFormData = {
      datalist: [...newDataList],
      ...rest,
    };
    updataState({ currentForm: { ...newFormData } }, () => {
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
    const { tabList, activeTreeNode, userInfo, originTabData, triggerMap, form, tabInfo, elementMap, setFrameState, originElementMap, getValueFromCurrentTabData, tabData } = this.props;
    const elementList = elementMap[tabInfo.id] || [];
    let leftListTabInfo = tabList.find(item => item.showType === 3);
    let leftIdEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
    const triggerData = triggerMap[id] && triggerMap[id].filter(item => item.basetype !== 4 && item.triggerType === 1) || [];
    let eventType = arrayClassify(triggerData, 'elementEvent') || []; // 处理出来有几种前端触发器事件
    if (!eventType.length) return;
    let reduceEventType = reduceArrObj(eventType, 'endTriggerNum', 'conditionType', 'eventBasepriority', 'methodType');
    let triggerList = this.reducevVariableToData(reduceEventType, record); // 默认值处理成值
    const getValueFromCurrentTableColumn = (varName) => {
      if (!varName) return;
      const { tabInfo, elementMap, userInfo, activeTreeNode, tabList } = this.props;
      const elementList = elementMap[tabInfo.id];
      const leftListTabInfo = tabList.find(item => item.showType === 3);
      let elementObj = elementMap[leftListTabInfo.id];
      let idEle = elementObj.find(item => item.relationColumnName === 'id');
      if (getValueFromGlobalVariables({
        globalVar: varName,
        userInfo,
      })) {
        return getValueFromGlobalVariables({
          globalVar: varName,
          userInfo,
        });
      }
      if (varName === '@@BusinessID') {
        return JSON.parse(activeTreeNode[idEle.id]).name;
      }
      let currentEle = elementList && elementList.find(item => item.parameter === varName);
      if (!currentEle) return varName;
      const { valueFieldType } = currentEle;
      const lastData = JSON.parse(record[currentEle.id]);

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
            record[element.id] = JSON.stringify({ id: '', name: '' });
            record[`a${element.id}`] = '';
          } else {
            record[element.id] = JSON.stringify({ id: optionData.id, name: optionData.name });
            record[`a${element.id}`] = optionData.name;
          }
        } else {
          if (relationElementValue === '@@Null') {
            record[element.id] = JSON.stringify({ id: '', name: '' });
            value = '';
          } else if (relationElementValue && relationElementValue.indexOf('@@') > -1) {
            value = this.getValueFromCurrentTableColumn(relationElementValue, record);
            console.log(value, element);
            record[element.id] = JSON.stringify({ id: value, name: value });
          } else {
            record[element.id] = JSON.stringify({ id: value, name: value });
          }
          record[`a${element.id}`] = value;
        }
      }
      if (SEARCH_SELECT_TYPE.includes(element.basetype)) {
        if (SEARCH_SELECT_TYPE.concat([17]).includes(element.basetype) && !!value && (!isNaN(Number(value)) || !!Number(value))) {
          if (element.basetype === 17 && element.valueFieldType === 2) {
            record[element.id] = JSON.stringify({ id: value, name: value });
            record[`a${element.id}`] = value;
            return;
          }
          this.fetchDetailById(element, +value, record);
        } else {
          record[element.id] = JSON.stringify({ id: '', name: '' });
          record[`a${element.id}`] = '';
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
      record[eleId] = JSON.stringify(resData);
      record[`a${eleId}`] = resData.name;
      this.updateFormDataList(record, eleObj, res.id, res);
    });
  };
  // 修改时间
  changeTime = (time, eleObj) => {
    const { elementFormat } = eleObj;
    let timeValue = time ? moment(time).format(TIME_FORMATE_TYPES[elementFormat || 1]) : '';
    let { record, dataIndex } = this.props;
    let data = {
      [dataIndex]: JSON.stringify({ id: timeValue, name: timeValue }),
      [`a${dataIndex}`]: timeValue,
    };
    record = { ...record, ...data };
    this.updateFormDataList(record, eleObj, timeValue);
    this.toggleEdit();
  };

  // 输入框中的值进行修改
  save = (e, eleObj) => {
    let { record, dataIndex } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      const eleValue = `${values[dataIndex] === null ? '' : values[dataIndex]}`;
      let data = {
        [dataIndex]: JSON.stringify({ id: eleValue, name: eleValue }),
        [`a${dataIndex}`]: eleValue,
      };
      record = { ...record, ...data };
      this.updateFormDataList(record, eleObj, eleValue);
    });
  };
  // 下拉框中的值进行修改
  selectSave = (val, option, eleObj) => {
    const { props: { value, children } } = option;
    let { record, dataIndex } = this.props;
    this.form.validateFields((error, values) => {
      if (error) {
        return;
      }
      let data = {
        [dataIndex]: JSON.stringify({ id: value, name: children }),
        [`a${dataIndex}`]: children,
      };
      record = { ...record, ...data };
      this.updateFormDataList(record, eleObj, value);
    });
  };

  // 编辑单元格
  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title, eleObj } = this.props;
    const { editing } = this.state;
    const { basetype } = eleObj;
    const recordData = record[dataIndex] ? JSON.parse(record[dataIndex]) : {};
    return editing && BASETYPE_IN_EDIT_COL.includes(basetype) ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(`${dataIndex}`, {
          rules: [
            {
              required: false,
              message: `${title} is required.`,
            },
          ],
          initialValue: basetype === 9 ? recordData.name ? moment(recordData.name) : '' : `${recordData.name || ''}`,
        })(this.setElementToWidget(eleObj, record, form))}
      </Form.Item>
    ) : (
      <div
        className={Styles.cellHeight}
        onClick={() => this.toggleEdit(eleObj)}
      >
        {children}
      </div>
    );
  };

  render() {
    const {
      editable,
      dataIndex,
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

const initQueryParams = {
  pageNum: 1,
  pageSize: 10,

};
const { confirm } = Modal;
const InputGroup = Input.Group;
const { Search } = Input;

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  // userInfo: state.user.userInfo,
}))

class PopupList extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      elementMap: [],
      basicData: [],// 初始数据
      formData: {}, // 获取面板的数据
      relationTabInfo: {},
      tabList: props.tabList || [],
      popupListDataResult: [],
      pageNum: 1,
      pageSize: 10,
      selectedListArr: [],
      ele: {}, // 关联的按钮元素
      queryParams: initQueryParams,
      loading: false,
      selected: [],
      calendarList: [], // 查询条件
    };
  }

  // 计算宽度
  conutWidth = () => {
    const { tabInfo, elementMap } = this.props;
    if (JSON.stringify(elementMap) === '{}') return;
    let totalWidth = 0;
    let elementObj = elementMap[tabInfo.id];
    let realDomWidth = this.refs.getContentWidth && this.refs.getContentWidth.clientWidth || 0;
    let tableColumes = elementObj.filter((item) => {
      return !HIDE_IN_LIST_ELEMENT_TYPE.includes(item.basetype) && item.visiabled;
    }) || [];
    tableColumes.forEach(item => {
      if (item.columnSpan && item.columnSpan > 100) {
        totalWidth += (Number(item.columnSpan) % 100 / 100 * realDomWidth);
      } else {
        totalWidth += 100;
      }
    });
    return totalWidth;
  };
  // 生成可编辑表头
  getEditTableColumns = () => {
    const { tabInfo, elementMap, functionData } = this.props;
    const { canmodify } = functionData.attributes;
    if (JSON.stringify(elementMap) === '{}') return;
    let elementObj = elementMap[tabInfo.id];
    let realDomWidth = this.refs.getContentWidth && this.refs.getContentWidth.clientWidth || 0;

    let tableColumes = elementObj.filter((item) => {
      return !HIDE_IN_LIST_ELEMENT_TYPE.includes(item.basetype) && item.visiabled;
    }) || [];
    let columns = tableColumes.map((item, index) => {
      const { jumpMenuList, jumpType, relationTabId, id, relationColumnName, defaultValue, readonly, basetype, elementFormat } = item;
      return {
        zid: index,
        eleObj: item,
        title: tabInfo.canLineEdit === 1 && !!!readonly ?
          <span><span className="custom-color iconEdit iconfont"></span>{item.displayName}</span> : item.displayName,
        dataIndex: item.id,
        key: item.id,
        editable: tabInfo.canLineEdit === 1 && !!!readonly,
        width: (item.columnSpan && item.columnSpan > 100) ? (item.columnSpan % 100 / 100 * realDomWidth) + 'px' : '',
        render: (text, record, index) => {
          const content = record[`a${id}`] && record[`a${id}`].indexOf('1970-01-01') > -1 ? '' : (parseDecimal(record[`a${id}`]) || defaultValue);
          // 有关联弹出面板的控件
          if ((relationTabId && (jumpType === 1 || !jumpType)) || (jumpType === 2 && !!jumpMenuList && jumpMenuList.length)) {
            return (
              <a title={content} onClick={(e) => this.props.setPopupTabInfo(item, record)}>
                {content}
              </a>
            );
          }
          if (basetype === 8 && elementFormat === 2 && content) {
            const splitIndex = content.indexOf('_');
            const fileUrl = content.substring(splitIndex + 1, content.length);
            return <div style={{ 'width': '86px', 'height': '86px', 'display': 'flex', 'alignItems': 'center' }}><Zmage
              style={{ 'width': '100%' }}
              src={fileUrl}/></div>;
          }
          const color = (record[id] && JSON.parse(record[id]).color) || '';
          return <div>{!!color && <span className={Styles.stateClass} style={{ 'backgroundColor': color }}></span>}<span
            title={content}>{content}</span></div>;
        },
      };
    });
    let multiJumpBtn = elementObj.find(item => item.basetype === 43); // 多菜单跳转
    let multiTabBtn = elementObj.find(item => item.basetype === 44); // 多面板
    let saveBtn = elementObj.find(item => item.basetype === 7);
    const { multiJump, multiTabJump, saveInListBtn } = this.props;
    let btnColums = {
      title: <FormattedMessage id="global.operator"/>,
      dataIndex: 'operatorcheck',
      key: 'operatorcheck',
      width: tabInfo.canLineEdit === 1 ? 120 : 100,
      render: (text, record) => {
        return <div className="custom-color">
          {canmodify && !!multiJumpBtn ?
            <Tooltip placement="leftTop" title={multiJumpBtn.displayName}><span
              className={`${Styles.columsSpan} iconfont icon-multiJumpBtn`} onClick={() => {
              multiJump(multiJumpBtn, record);
            }}> </span></Tooltip> : null}
          {canmodify && !!multiTabBtn ?
            <Tooltip placement="leftTop" title={multiTabBtn.displayName}><span
              className={`${Styles.columsSpan} iconfont icon-multiTabBtn`} onClick={() => {
              multiTabJump(multiTabBtn, record);
            }}> </span></Tooltip> : null}
          {tabInfo.canLineEdit === 1 && canmodify && !!saveBtn && record[saveBtn.id] ?
            (<Tooltip placement="leftTop" title={saveBtn.displayName}>
              <span className={`${Styles.columsSpan} iconfont icon-saveBtn`} onClick={() => {
                saveInListBtn(saveBtn, record);
              }}> </span>
            </Tooltip>) : null}
        </div>;
      },
    };
    if (!multiJumpBtn && !multiTabBtn && !saveBtn) return columns;
    columns.push(btnColums);
    return columns;
  };
  // 生成按钮
  renderBtnGroup = () => {
    const { tabInfo, elementMap, handleClickBtn, normalBtnInList, functionData } = this.props;
    const { canadd, candelete, candesign, canexport, canmodify, canview, canprint } = functionData.attributes;

    let elementObj = elementMap[tabInfo.id];
    let btnArr = elementObj.filter((item) => {
      return (BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
    }) || [];
    return btnArr.map((item) => {
      const { basetype } = item;
      switch (basetype) {
        case 4:
          return (canadd ? <div className={Styles.divFlex} key={item.id} onClick={() => handleClickBtn(item)}>
            <div className={`${Styles.addNewBtn}`}>
              <Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>
              <span>{item.displayName}</span>
            </div>
          </div> : null);
        case 5:
          return (canmodify ? <div className={Styles.divFlex} key={item.id} onClick={() => handleClickBtn(item)}>
            <div className={Styles.addNewBtn}>
              <span className={`${Styles.commonIconStyle} custom-color iconEdit iconfont`}></span>
              <span>{item.displayName}</span>
            </div>
          </div> : null);
        case 6:
          return (candelete ? <div className={Styles.divFlex} key={item.id} onClick={() => this.btnClick(item)}>
            <div className={Styles.addNewBtn}>
              <span className={`${Styles.commonIconStyle} custom-color icondelete iconfont`}></span>
              <span>{item.displayName}</span>
            </div>
          </div> : null);
        case 18:
          return (canadd ? <div className={Styles.divFlex} key={item.id} onClick={() => this.btnClick(item)}>
            <div className={Styles.addNewBtn}>
              <Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>
              <span>{item.displayName}</span>
            </div>
          </div> : null);
        case 24:
          return (canmodify ? <div className={Styles.divFlex} key={item.id} onClick={() => normalBtnInList(item)}>
            <div className={Styles.addNewBtn}>
              {/*<Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>*/}
              <span>{item.displayName}</span>
            </div>
          </div> : null);
        case 30:
          return (canprint ?
            <div key={item.id} className={Styles.divFlex} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                <span className={`${Styles.commonIconStyle} custom-color iconExport iconfont`}></span>
                <span>{item.displayName}</span>
              </div>
            </div> : null);
        default:
          return null;
      }
    });
  };
  btnClick = (ele) => {
    const { checkBeforeHandleClick } = this.props;
    if (!checkBeforeHandleClick(ele)) return;
    const { basetype } = ele;
    switch (basetype) {
      case 4:
        return this.add(ele);
      case 5:
        return this.eddit(ele);
      case 6:
        return this.delete(ele);
      case 18:
        return this.relationTable(ele);
      default:
        return null;
    }
  };

  // 删除
  delete = (ele) => {
    const { langLib } = this.context;
    const { selected, tabList } = this.state;
    const { elementMap, tabInfo, selectedListArr } = this.props;
    const { relationTableName } = ele;
    let elementObj = elementMap[tabInfo.id];
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
    let that = this;
    if (selectedListArr.length) {
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        content: '',
        onOk() {
          let params = {
            tableName: relationTableName,
            ids: selectedListArr.map(item => JSON.parse(item[idEle.id]).id).join(','),
          };
          del(params).then(res => {
            that.props.updataPageIndexOrSize(1, 10);
            that.props.updataState({
              selectedListArr: [],
            });
            closeModal();
            that.setState({
              selected: [],
              record: {},
            });
          });
        },
        onCancel: () => closeModal(),
      });
      const closeModal = () => {
        close();
      };
    } else {
      CMessage(langLib['message.please.choose'], 'error');
    }
  };
  // 点击按钮弹框选择数据
  relationTable = (ele) => {
    const { relationTabId } = ele;
    if (relationTabId) { // 关联了面板
      const { elementMap, tabList } = this.props;
      let relationTab = elementMap[relationTabId];
      let tabInfo = tabList.find(item => item.id === relationTabId);
      this.setState({ relationTab, visible: true, relationTabInfo: tabInfo, ele }, () => {
        this.fetchPopupListData({});
      });
    }
  };
  // 获取弹出面板的数据
  fetchPopupListData = ({ queryParams = initQueryParams, calendarList }) => {
    const { relationTabInfo } = this.state;
    const { detailListProps, advancedQueryMap, userInfo, elementMap, activeTreeNode, tabList } = this.props;
    const { pageSize, pageNum } = queryParams;
    // const { elementMap, tabInfo, treeNodeData } = detailListProps;
    if (!relationTabInfo.id) return;
    const { id: tabId, relationTableName: tabSource } = relationTabInfo;
    const elementList = elementMap[tabId].map(item => {
      const { relationColumnName: name, basetype: baseType, mainColumnName, mainTableName, elementMultiRelation, id: elementId, relationColumnType, elementFormat } = item;
      return {
        elementId, name, baseType, mainColumnName, mainTableName, elementMultiRelation, relationColumnType,
        elementFormat,
      };
    });
    const queryList = advancedQueryMap[relationTabInfo.id] || [];
    let leftListTabInfo = tabList.find(item => item.showType === 3);
    let leftListIdEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id'); // 左侧列表的id字段
    const nodeId = jsonParse(activeTreeNode[leftListIdEle.id]).id;
    const globalMap = {};
    queryList.forEach(item => {
      const { asqlValueType, asqlValue } = item;
      // 值类型为【变量】时，需要将变量对应的值传给后台
      if (asqlValueType === 2) {
        // @@BusinessID 取左侧树的主业务数据（因为左侧树无法配置）
        if (asqlValue === '@@BusinessID') {
          globalMap[item.asqlValue] = nodeId;
        } else {
          // 当前时间、当前用户
          const globalVar = getValueFromGlobalVariables({
            globalVar: asqlValue,
            userInfo,
            // treeNodeData,
          });
          // 或用户自定义的变量
          // (在关联新增按钮的弹出面板上，只有上一个面板为表单时，才可以获取自定义的变量)
          // （若上一个面板为列表，则无法定位到定义的变量具体哪条数据值）
          // 业务关联文档展示类型却是默认第一个面板为列表的，故无需在该组件中加入自定义变量
          globalMap[item.asqlValue] = globalVar || '';
        }
      }
    });
    const params = {
      elementList,
      tabId,
      tabSource,
      pageNum,
      pageSize,
      globalMap,
      calendarList,
    };
    // this.setLoadingStatus('popupList', true);
    getList(params).then(popupListDataResult => {
      this.setState({ popupListDataResult, loading: false });
      // this.setLoadingStatus('popupList', false);
      // }, err => this.setLoadingStatus('popupList', false));
    }, err => console.log(err));
  };
  // 点击行
  onClickRow = (record, selectedRows) => {
    this.props.updataState({
      selectedListArr: selectedRows,
    });
  };
  handleSave = () => {
    const { langLib } = this.context;
    const { ele, selectedRows, editType, selectedListArr } = this.state;
    const { tabId, relationTabId } = ele;
    const { activeTreeNode, elementMap, tabList, tabInfo } = this.props;
    let table = tabList.find((item) => item.id === tabId);
    let popListIdEle = elementMap[relationTabId].find(item => item.relationColumnName === 'id'); // 关联面板的id字段
    let leftListTabInfo = tabList.find(item => item.showType === 3);
    let leftListIdEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id'); // 左侧列表的id字段
    let activeRelationColumn = table.relationColumn;
    let relationColumnName = ele.relationColumnName;
    if (!selectedListArr.length) {
      CMessage(langLib['message.please.choose'], 'error');
      return;
    }
    let arr = selectedListArr.map((item) => {
      let obj = {
        [relationColumnName]: JSON.parse(item[popListIdEle.id]).id,
        static_tableName: ele.relationTableName,
        [activeRelationColumn]: JSON.parse(activeTreeNode[leftListIdEle.id]).name,
        // ...item,
      };
      return obj;
    });
    let params = {
      static_list: arr,
    };
    updateMore(JSON.stringify(params)).then(res => {
      this.setState({ visible: false, selectedListArr: [] }, () => {
        this.props.updataPageIndexOrSize(1, 10);
      });
    });
  };
  // 状态更新
  updataState = (obj = {}, callback) => {
    this.setState({
      ...obj,
    }, () => {
      if (callback) {
        callback();
      }
    });
  };
  reduceDataSource = () => {
    let formData = this.props.formData;
    let dataSource = new Object(formData).datalist || [];
    let { total, pageNum, pageSize } = new Object(formData);
    const { tabInfo, elementMap } = this.props;
    const { id } = tabInfo;
    let elementList = elementMap[id];
    let newDataSource = [];
    dataSource.forEach((item, index) => {
      let newItem = JSON.parse(JSON.stringify(item));
      for (let key in item) {
        if (Number(key).toString() !== 'NaN') {
          newItem[`a${key}`] = JSON.parse(item[key]).name;
          newItem.zindex = (pageNum - 1) * pageSize + index;
        } else {
          let obj = elementList.find((value) => {
            return value.relationColumnName === key;
          });
          if (obj) {
            newItem[obj.id] = JSON.parse(item[key]).name;
            newItem.zindex = (pageNum - 1) * pageSize + index;
          }
        }
      }
      let data = {
        ...newItem,
        ...item,
      };
      newDataSource.push(data);
    });
    return newDataSource;
  };
  // 点击行
  clickRow = (record) => {
    return {
      onClick: (event) => {
        event.preventDefault();
        event.stopPropagation();
        const { matchTabList, selectedListArr, tabInfo, elementMap } = this.props;
        let tabInfoIdEle = elementMap[tabInfo.id].find(item => item.relationColumnName === 'id'); // 左侧列表的id字段
        const tabInfoIdEleId = tabInfoIdEle.id;
        if (selectedListArr.find(item => item[`a${tabInfoIdEleId}`] === record[`a${tabInfoIdEleId}`])) {
          selectedListArr.splice(selectedListArr.findIndex((item) => item[`a${tabInfoIdEleId}`] === record[`a${tabInfoIdEleId}`]), 1);
        } else {
          selectedListArr.push(record);
        }
        this.props.updataState({
          selectedListArr: [...selectedListArr],
        });
      },
    };
  };
  doSearch = () => {
    const { elementMap, tabInfo, updataState, updataPageIndexOrSize } = this.props;
    const { selectValue, keywords, record, editType, visible, tabList, triggerMap, tabDataM, loading, params, ele, selected, data, queryParams } = this.state;
    const { id } = tabInfo;
    let quickQuerySelect = elementMap && elementMap[id].filter((item) => {
      return item.quickQuery === 1;
    });
    let calendarList = null;
    if (selectValue) {
      let currentEle = quickQuerySelect.find(item => {
        return item.id === selectValue;
      });
      calendarList = [{
        field: currentEle.mainColumnName || currentEle.relationColumnName,
        value: keywords,
        tableName: currentEle.mainTableName || currentEle.relationTableName,
        elementId: currentEle.id,
      }];
    } else {
      calendarList = quickQuerySelect.map(item => {
          return {
            field: item.mainColumnName || item.relationColumnName,
            value: keywords,
            tableName: item.mainTableName || item.relationTableName,
            elementId: item.id,
          };
        },
      );
    }
    this.setState({ calendarList });
    updataState({ seniorFilter: {} }, () => {
      updataPageIndexOrSize({ queryParams: { pageNum: 1, pageSize: 10 }, calendarList });
    });
  };
  // 重置模糊查询的数据
  doRestSearchList = () => {
    this.updataState({ calendarList: [] });
  };

  render() {
    let totalWidth = this.conutWidth();
    const { updataState, filterMap, formData, selectedListArr = [], fetchListData, tabInfo, elementMap, tabDropDownData, userInfo, activeTreeNode, tabList, triggerMap } = this.props;
    const cellProps = { tabInfo, elementMap, userInfo, activeTreeNode, tabList, triggerMap, ...this.props }; // 行编辑的props
    const { selected = [], loading, visible, relationTabInfo, popupListDataResult, queryParams } = this.state;
    // 判断是否可以行编辑
    let columns = this.getEditTableColumns() || [];

    const newColumns = columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          ...cellProps,
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          updataState: updataState,
          formData: formData,
          idObj: tabInfoIdEle,
          eleObj: col.eleObj,
          tabdropdowndata: tabDropDownData,
        }),
      };
    });
    const components = { // 可编辑
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    let dataSource = this.reduceDataSource();
    let elementObj = tabInfo && elementMap[tabInfo.id] || [];
    let searchArr = elementObj.filter((item) => {
      return (item.basetype === 14 && item.visiabled);
    }) || [];
    let btnArr = elementObj.filter((item) => {
      return (BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
    }) || [];
    const seniorFilterEle = elementObj.find((item) => item.basetype === 33); // 高级筛选
    const hasSeniorFilter = !!(seniorFilterEle && seniorFilterEle.visiabled);
    let tabInfoIdEle = JSON.stringify(elementMap) !== '{}' && elementMap[tabInfo.id].find(item => item.relationColumnName === 'id'); // 左侧列表的id字段
    const pagination = {
      total: formData.total,
      current: formData.pageNum,
      pageSize: formData.pageSize,
      showSizeChanger: true,
      onChange: (pageNum, newPageSize) => {
        this.setState({
          queryParams: {
            ...queryParams,
            pageNum,
            pageSize: newPageSize,
            loading: true,
          },
        }, () => {
          const { queryParams, calendarList } = this.state;
          updataState({
            selectedListArr: [],
          });
          fetchListData({ queryParams, calendarList });
        });
      },
      onShowSizeChange: (current, size) => {
        this.setState({
          queryParams: {
            ...queryParams,
            pageNum: 1,
            pageSize: size,
            loading: true,
          },
        }, () => {
          const { queryParams, calendarList } = this.state;
          updataState({
            selectedListArr: [],
          });
          fetchListData({ queryParams, calendarList });
        });
      },
      showTotal: (total, range) => {
        return (
          <div><FormattedMessage id="global.total"/>{total}</div>
        );
      },
      pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
    };
    const rowSelection = {
      type: 'checkbox',
      selectedRowKeys: selectedListArr.map(item => item[tabInfoIdEle.id]),
      onSelectAll: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selected);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
      onChange: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
    };
    let quickQuerySelect = elementObj.filter((item) => {
      return item.quickQuery === 1;
    }).map((items) => {
      return (<Option key={items.id} value={items.id}>{items.displayName}</Option>);
    });
    return <div style={{ 'height': 'calc(100%)' }} ref="getContentWidth">
      <Row style={{ 'padding': '0 0 0 10px', 'maxHeight': '42px' }}>
        <Col span={15}>
          {btnArr.length ? this.renderBtnGroup() : null}
        </Col>
        <Col span={9}>
          {searchArr.length ?
            <div className={Styles.searchStyle}>
              <InputGroup compact>
                <Select defaultValue="" style={{ 'width': '34%' }}
                        onChange={(value) => this.setState({ selectValue: value })}>
                  <Option key={''} value=""><FormattedMessage id="role.table.all"/></Option>
                  {quickQuerySelect}
                </Select>
                <CSearch
                  style={{ 'width': '66%' }}
                  onSearch={(value) => this.doSearch()}
                  onChange={(e) => {
                    this.setState({ keywords: e.target.value });
                  }}
                />
              </InputGroup>
            </div> : null}
          {hasSeniorFilter ?
            <div className={Styles.searchStyle}>
              <SeniorFilter
                entryEleObj={seniorFilterEle}
                elementList={elementObj}
                filterMap={filterMap}
                fetchListData={fetchListData}
                setContainerState={updataState}
                restSearchParams={this.doRestSearchList}
              />
            </div> : null}
        </Col>
      </Row>
      <CTable
        className={btnArr.length || searchArr.length ? Styles.tableHeight1 : Styles.tableHeight2}
        pagination={pagination}
        columns={newColumns}
        components={components}
        dataSource={dataSource}
        rowSelection={rowSelection}
        onClickRow={this.onClickRow}
        loading={loading}
        onRow={tabInfo.canLineEdit === 1 ? (() => {
        }) : this.clickRow}
        scroll={{ x: totalWidth >= 1000 ? totalWidth : 'max-content', y: 92 }}
        rowKey={record => tabInfoIdEle && record[tabInfoIdEle.id]}
      />
      <CreateModal
        visible={visible}
        title={relationTabInfo.name}
        onOk={() => this.handleSave()}
        size="large"
        onCancel={() => this.setState({ visible: false, selectedListArr: [] })}
      >
        <DetailList
          {...this.props}
          selectedListArr={selectedListArr}
          tabInfo={relationTabInfo}
          formData={popupListDataResult}
          updataState={this.updataState}
          updataPageIndexOrSize={this.fetchPopupListData}
        />
      </CreateModal>
    </div>;
  }
}

export default PopupList;
