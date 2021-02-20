import React, { Component } from 'react';
import { Col, Icon, Tooltip, Row, Input, Select, Form, InputNumber, DatePicker } from 'antd';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import { FormattedMessage } from 'react-intl';
import Zmage from 'react-zmage';
import moment from 'moment';
import classNames from 'classnames';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import SeniorFilter from '@/components/Frames/TreeFrame/ContentContainer/SeniorFilter/SeniorFilter';
import {
  BTN_ELEMENT_TYPE,
  NO_SUBMIT_ELEMENT_TYPE,
  HIDE_IN_LIST_ELEMENT_TYPE,
  SELECT_IN_LIST,
  NUMBER_COLUMN_TYPE,
  TIME_FORMATE_TYPES,
  BTN_IN_LIST_COL,
  BTN_IN_EDIT_LIST,
  SEARCH_SELECT_TYPE,
  BASETYPE_IN_EDIT_COL,
} from '@/constants/element';
import { getList, updateMore, del, handleSave } from '@/services/leftListFrame';
import { BaseContext } from '@/constants/global';
import Styles from './DetailList.less';
import { CSearch, NormalSearchSelect } from '@/components/common/BasicWidgets';
import {
  compoundArithmetic,
  getDefaultConfirmProps,
  getValueFromGlobalVariables,
  matchGlobalFunctionParam,
  parseDecimal,
  validTriggerMatch,
} from '@/utils/common';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import DataSelectList from '@/components/Frames/LeftListFrame/ContentContainer/DataSelectList/NormalSearchSelect';
import { arrayClassify, reduceArrObj } from '@/components/Frames/LeftListFrame/method';
import { getCheckBoxSearchDetail, getNormalSearchDetail } from '@/services/frame';

const InputGroup = Input.Group;
const { Option } = Select;
const initQueryParams = {
  pageNum: 1,
  pageSize: 10,
};
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
    if (getValueFromGlobalVariables({
      globalVar: varName,
      userInfo,
    })) {
      return getValueFromGlobalVariables({
        globalVar: varName,
        userInfo,
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
    updataState({ data: { ...newFormData } }, () => {
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
    const { triggerMap, tabInfo, elementMap } = this.props;
    const elementList = elementMap[tabInfo.id] || [];
    const triggerData = triggerMap[id] && triggerMap[id].filter(item => item.basetype !== 4 && item.triggerType === 1) || [];
    let eventType = arrayClassify(triggerData, 'elementEvent') || []; // 处理出来有几种前端触发器事件
    if (!eventType.length) return;
    let reduceEventType = reduceArrObj(eventType, 'endTriggerNum', 'conditionType', 'eventBasepriority', 'methodType');
    let triggerList = this.reducevVariableToData(reduceEventType, record); // 默认值处理成值
    const getValueFromCurrentTableColumn = (varName) => {
      if (!varName) return;
      const { tabInfo, elementMap, userInfo, activeTreeNode, tabList } = this.props;
      const elementList = elementMap[tabInfo.id];
      if (getValueFromGlobalVariables({
        globalVar: varName,
        userInfo,
      })) {
        return getValueFromGlobalVariables({
          globalVar: varName,
          userInfo,
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

class DetailList extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      elementMap: [],
      tabInfo: [],
      tabList: [],
      tabDataM: {},
      loading: false,
      params: {},
      ele: {},
      record: {},
      selectedRows: [], // 弹框选择的数据
      selected: [], // 关联面板选择的数据
      editType: false, // 点击编辑弹出编辑页面
      data: {}, // 点编辑时获取到 的原始数据,
      queryParams: initQueryParams,
      keywords: '', // 关键词
      selectValue: '', // 模糊搜索条件
      basicData: [],// 初始数据
      formData: {}, // 获取面板的数据
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      formData: nextProps.formData,
      basicData: nextProps.formData,
    });
  }


  doSearch = () => {
    const { updataState } = this.props;
    updataState({
      pageIndex: 1,
      seniorFilter: {},
    }, () => {
      this.props.updataPageIndexOrSize();
    });
  };

  // 计算宽度
  conutWidth = () => {
    const { tabInfo, elementMap } = this.props;
    let totalWidth = 0;
    let realDomWidth = this.refs.getContentWidth && this.refs.getContentWidth.clientWidth;
    let elementObj = elementMap[tabInfo.id];
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
    let elementObj = elementMap[tabInfo.id] || [];
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
            <Tooltip placement="leftTop" title={saveBtn.displayName}><span
              className={`${Styles.columsSpan} iconfont icon-saveBtn`} onClick={() => {
              saveInListBtn(saveBtn, record);
            }}></span></Tooltip> : null}
        </div>;
      },
    };
    if (!multiJumpBtn && !multiTabBtn && !saveBtn) return columns;
    columns.push(btnColums);
    return columns;
  };

  btnClick = (ele) => {
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
  // 编辑
  eddit = (ele) => {
    const { langLib } = this.context;
    let { record, tabInfo } = this.state;
    let tabData = this.props.tabData || [];
    let arr = tabData.datalist || [];
    let current = arr.find(item => {
      return item.id === record.id;
    });
    let newTabInfo = JSON.parse(JSON.stringify(tabInfo));
    newTabInfo.showType = 2;
    let obj = this.reduceData(current);
    if (JSON.stringify(record) === '{}') {
      CMessage(langLib['message.please.choose'], 'error');
    } else {
      this.setState({
        ele,
        editType: true,
        visible: true,
        data: obj,
        tabInfo: newTabInfo,
      });
    }
  };
  // 删除
  delete = (ele) => {
    const { langLib } = this.context;
    const { selected, tabInfo, tabList } = this.state;
    const { relationTableName } = ele;
    let that = this;
    if (selected.length) {
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        content: '',
        onOk() {
          let params = {
            tableName: relationTableName,
            ids: selected.map((item) => JSON.parse(item.id).name).join(','),
          };
          del(params).then(res => {
            that.props.updataPageIndexOrSize(1, 10);
            that.setState({
              selected: [],
              record: {},
            });
            closeModal();
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
      const elementList = relationTab.filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype)).map(item => {
        if (item.basetype === 9) {
          return {
            name: item.relationColumnName,
            baseType: item.basetype,
            relationColumnType: item.relationColumnType,
            elementFormat: item.elementFormat,
            mainColumnName: item.mainColumnName,
            mainTableName: item.mainTableName,
            elementId: item.id,
            elementMultiRelation: item.elementMultiRelation,
          };
        } else {
          return {
            relationColumnName: item.relationColumnName,
            relationTableName: item.relationTableName,
            name: item.relationColumnName,
            relationColumnType: item.relationColumnType,
            baseType: item.basetype,
            mainColumnName: item.mainColumnName,
            mainTableName: item.mainTableName,
            elementId: item.id,
            elementMultiRelation: item.elementMultiRelation,
          };
        }
      });
      if (!elementList || !elementList.length) return;
      const params = {
        tabSource: tabInfo.relationTableName,
        tabId: relationTabId,
        elementList,
        pageNum: 1,
        pageSize: 10,
      };
      this.setState({
        loading: true,
      });
      getList(params).then(res => {
        this.setState({ tabDataM: res, loading: false, record: {} });
      }, err => {
        this.setState({ loading: false });
      });
      this.setState({ relationTab, visible: true, elementMap, tabList, tabInfo, params, ele });
    }
  };
  // 数据处理
  reduceData = (objRes = {}) => {
    const { tabInfo, elementMap, triggerMap, form } = this.props;
    let { formData } = this.state;
    const elementList = elementMap[tabInfo.id] || [];
    let data = {};
    for (let key in objRes) {
      if (Number(key).toString() !== 'NaN') {
        let obj = elementList.find((value) => {
          return value.id === Number(key);
        });
        let newKey = 'a' + key;
        data[newKey] = objRes[key];
      } else {
        let control = elementList.find((item) => item.relationColumnName === key);
        if (control) {
          let newKey = 'a' + control.id;
          data[newKey] = objRes[key];
        }
      }
    }
    return data;
  };
  // 新增
  add = (ele) => {
    const { relationTabId } = ele;
    let tabInfo = this.props.tabList.find(item => item.id === relationTabId);
    this.setState({
      visible: true,
      editType: false,
      tabInfo,
    });
  };
  handleSave = () => {
    const { ele, selectedRows, editType } = this.state;
    const { tabId } = ele;
    const { activeTreeNode, elementMap, tabList } = this.props;
    let table = tabList.find((item) => item.id === tabId);
    if (editType) {
      let param = this.props.form.getFieldsValue();
      let elementList = elementMap[tabId] && elementMap[tabId].filter((item) => !NO_SUBMIT_ELEMENT_TYPE.includes(item.basetype));

      let data = {};
      elementList.forEach((item) => {
        data[item.relationColumnName] = param['a' + item.id];
      });
      let params = {
        ...data,
        static_tableName: ele.relationTableName,
      };
      handleSave(params).then(res => {
        this.setState({
          editType: false,
          visible: false,
        }, () => {
          this.props.updataPageIndexOrSize(1, 10);
        });
      });
    } else {
      let activeRelationColumn = table.relationColumn;
      let relationColumnName = ele.relationColumnName;
      let arr = selectedRows.map((item) => {
        let obj = {
          [relationColumnName]: item.id,
          static_tableName: ele.relationTableName,
          [activeRelationColumn]: JSON.parse(activeTreeNode.id).name,
          // ...item,
        };
        delete obj.id;
        return obj;
      });
      let params = {
        static_list: arr,
      };
      updateMore(JSON.stringify(params)).then(res => {
        this.setState({ visible: false, editType: false }, () => {
          this.props.updataPageIndexOrSize(1, 10);
        });
      });
    }

  };
  onClickRow = (record, selectedRows) => {
    this.props.updataState({ selectedArr: selectedRows });
  }
  ;
  // 点击行
  clickRow = (record) => {
    return {
      onClick: () => {
        if (this.props.checkboxType === 'radio') {
          this.props.updataState({ selectedArr: [record] });
        } else {
          let { selectedListArr } = this.props;
          const { elementMap, tabInfo, tabList, triggerMap } = this.props;
          let elementObj = elementMap[tabInfo.id];
          let idEle = elementObj.find(item => item.relationColumnName === 'id');
          if (selectedListArr.find((item) => item[idEle.id] === record[idEle.id])) {
            selectedListArr.splice(selectedListArr.findIndex((item) => item[idEle.id] === record[idEle.id]), 1);
          } else {
            selectedListArr.push(record);
          }
          this.props.updataState({ selectedArr: selectedListArr });
        }
      },
    };
  };
  // 数据处理
  dataProcessing = (arr = []) => {
    let formData = this.props.formData || [];
    let { total, pageNum, pageSize } = new Object(formData);
    const { tabInfo, elementMap } = this.props;
    const { id } = tabInfo;
    let elementList = elementMap[id];
    let newDataSource = [];
    arr.forEach((item, index) => {
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
            newItem[`a${obj.id}`] = JSON.parse(item[key]).name;
            newItem.zindex = (pageNum - 1) * pageSize + index;
          }
        }
        if (key === 'id') {
          newItem.id = JSON.parse(item[key]).name;
        }
      }
      let data = {
        ...item,
        ...newItem,
      };
      newDataSource.push(data);
    });
    return newDataSource;
    // return arr
  };
  // 重置模糊查询的条件
  doRestSearchList = () => {
    this.props.updataState({
      searchSelected: '',
      searchVal: '',
      pageIndex: 1,
    });
  };

  render() {
    let totalWidth = this.conutWidth();
    let formData = this.props.formData;
    const { filterMap, tabDropDownData, getAdvancedFilter, functionData, triggerMap, tabInfo, form, btnGroups, selectedListArr = [], elementMap, loading, hasPagination = true, userInfo, updataState, updataPageIndexOrSize } = this.props;
    const { tabList } = this.state;
    // let columns = tabInfo.canLineEdit === 1 ? this.getEditTableColumns() : this.getTableColumns();
    let columns = this.getEditTableColumns() || [];
    let datalist = new Object(formData).datalist;
    const { canview } = functionData.attributes;
    let { total, pageNum, pageSize } = new Object(formData);
    let dataSource = this.dataProcessing(datalist) || [];
    let elementObj = tabInfo && elementMap[tabInfo.id] || [];
    let btnArr = elementObj.filter((item) => {
      return (BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
    }) || [];
    let searchArr = elementObj.filter((item) => {
      return (item.basetype === 14 && item.visiabled);
    }) || [];
    const seniorFilterEle = elementObj.find((item) => item.basetype === 33); // 高级筛选
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
    if (!idEle) return '';
    const cellProps = { tabInfo, elementMap, userInfo, tabList, triggerMap, ...this.props }; // 行编辑的props

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
          updataState: this.props.updataState,
          formData: formData,
          idObj: idEle,
          eleObj: col.eleObj,
          tabdropdowndata: tabDropDownData,
        }),
      };
    });
    const pagination = {
      total,
      current: pageNum,
      pageSize,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
      onShowSizeChange: (current, size) => {
        this.props.updataState({
          selectedArr: [],
          pageIndex: 1,
          pageSize: size,
        }, () => {
          updataPageIndexOrSize();
        });
      },
      onChange: (pageNum, newPageSize) => {
        this.props.updataState({
          selectedArr: [],
          pageIndex: pageNum,
          pageSize: newPageSize,
        }, () => {
          updataPageIndexOrSize();
        });
      },
      showTotal: (total, range) => {
        return (
          <div><FormattedMessage id="global.total"/>{total}</div>
        );
      },
    };
    const rowSelection = {
      type: this.props.checkboxType || 'checkbox',
      selectedRowKeys: selectedListArr.map(item => item[idEle.id]),
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
    let fiterBtn = elementObj.find(item => item.basetype === 33);
    // 查找按钮
    const searchCls = classNames({
      [Styles.searchBox1]: this.props.checkboxType === 'radio',
      [Styles.searchBox]: this.props.checkboxType !== 'radio',
    });
    const components = { // 可编辑
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    return <div style={{ 'height': 'calc(100%)' }} ref="getContentWidth">
      <Row style={{ 'padding': '0 10px 0 10px' }}>
        <Col span={15}>
          {btnGroups}
        </Col>
        <Col span={9}>
          {searchArr.length ? <div className={searchCls}>
            <InputGroup compact>
              <Select defaultValue="" style={{ 'width': '34%' }}
                      onChange={(value) => this.props.updataState({ searchSelected: value })}>
                <Option key={''} value=""><FormattedMessage id="role.table.all"/></Option>
                {quickQuerySelect}
              </Select>
              <CSearch
                style={{ 'width': '66%' }}
                onSearch={(value) => this.doSearch()}
                onChange={(e) => {
                  this.props.updataState({ searchVal: e.target.value });
                }}
              />
            </InputGroup>
          </div> : null}
          {fiterBtn && fiterBtn.visiabled && canview ?
            <div className={Styles.filterBox}>
              <SeniorFilter
                entryEleObj={seniorFilterEle}
                elementList={elementObj}
                filterMap={filterMap}
                fetchListData={updataPageIndexOrSize}
                setContainerState={updataState}
                restSearchParams={this.doRestSearchList}
              />
            </div> : null}
        </Col>
      </Row>
      <CTable
        className={btnArr.length || searchArr.length ? (this.props.checkboxType === 'radio' ? Styles.tableHeight3 : Styles.tableHeight) : Styles.tableHeight2}
        dataSource={dataSource}
        components={components}
        columns={newColumns}
        loading={loading}
        rowSelection={rowSelection}
        pagination={hasPagination ? pagination : false}
        rowKey={record => idEle && record[idEle.id]}
        onRow={tabInfo.canLineEdit === 1 ? (() => {
        }) : this.clickRow}
        scroll={{ x: totalWidth >= 1000 ? totalWidth : 'max-content', y: 92 }}
      />
    </div>;
  }
}

export default DetailList;
