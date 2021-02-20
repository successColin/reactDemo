import React, { Component } from 'react';
import { connect } from 'dva';
import { Col, Icon, Modal, Pagination, Row, Input, Select, Tooltip, Form, InputNumber, DatePicker } from 'antd';
import { BaseContext } from '@/constants/global';
import {
  CMessage,
  CSearch,
  CTable,
  NormalSearchSelect,
} from '@/components/common/BasicWidgets';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import Zmage from 'react-zmage';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import SeniorFilter from '@/components/Frames/TreeFrame/ContentContainer/SeniorFilter/SeniorFilter';
import {
  BTN_ELEMENT_TYPE,
  NO_SUBMIT_ELEMENT_TYPE,
  SELECT_ELEMETN_TYPE,
  HIDE_IN_LIST_ELEMENT_TYPE,
  SELECT_IN_LIST,
  NUMBER_COLUMN_TYPE,
  TIME_FORMATE_TYPES,
  BTN_IN_LIST_COL,
  BTN_IN_EDIT_LIST,
  SEARCH_SELECT_TYPE, BASETYPE_IN_EDIT_COL,
} from '@/constants/element';
import {
  compoundArithmetic,
  filterHiddenFormData,
  getDefaultConfirmProps,
  getValueFromGlobalVariables,
  isGlobalOrCustomVar, matchGlobalFunctionParam, matchGlobalVars, parseDecimal, validTriggerMatch,
} from '@/utils/common';
import {
  getList,
  delFullList,
  updateOrInsertFull,
  getFormDetial,
  fullBatchUpdate,
} from '@/services/leftListFrame';
import Styles from './FullList.less';
import { getCheckBoxSearchDetail, getNormalSearchDetail, getPageSelectOptions, httpRequest } from '@/services/frame';
import { arrayClassify, reduceArrObj } from '@/components/Frames/LeftListFrame/method';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import DataSelectList from '@/components/Frames/LeftListFrame/ContentContainer/DataSelectList/NormalSearchSelect';

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
            toggleEdit={() => this.toggleEdit()}
            eleObj={eleObj}
            filterMap={filterMap}
            form={form}
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
    const { mainColumnName } = eleObj;
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
    const { triggerMap, form, tabInfo, elementMap, setFrameState, originElementMap, getValueFromCurrentTabData, tabData } = this.props;
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
      let { relationElementId, relationElementVisible, relationElementValue } = item;
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
    const { basetype, requisite } = eleObj;
    const recordData = record[dataIndex] ? JSON.parse(record[dataIndex]) : {};
    return editing && BASETYPE_IN_EDIT_COL.includes(basetype) ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(`${dataIndex}`, {
          rules: [
            {
              required: !!requisite,
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

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class FullList extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      functionData: {},
      fileRelationList: [], // 绑定的图片
      mainTab: [], // 主要面板
      filterMap: {}, // 过滤器
      advancedQueryMap: {},
      elementMap: {}, // 控件map
      tabList: [], // 面板数组
      triggerMap: {}, // 触发器map,
      tabDropDownList: {}, // 当前面板下的下拉数据(内容以{表名: [下拉数据]})形式）
      pageSize: 10,
      pageIndex: 1,
      data: {},
      totalWidth: 0,
      selected: [], // 选中的数据
      currentForm: [],
      loading: false,
      searchSelected: '', // 模糊查找选择的的字段
      searchVal: '', // 模糊查找选择的的值
      visible: false,
      relationTableId: '', // 关联面板id
      actionType: '', // 操作类型
      formData: {}, // 所有面板的值
      basicData: [],// 初始数据
      record: {}, // 选中列表
      title: '', // 标题
      otherParams: {},
      originElementMap: {}, // 初始化的数据
      sortName: '',
      sorter: {},
    };
  }

  componentDidMount() {

  }


  // 计算宽度
  conutWidth = () => {
    const { tabList, elementMap, tabInfo } = this.props;
    let totalWidth = 0;
    let realDomWidth = this.refs.getContentWidth && this.refs.getContentWidth.clientWidth;
    let mainTab = tabList.find(item => {
      return item.mainTab === 1;
    }) || {};
    let elementObj = elementMap[mainTab.id] || [];
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
    const { dataSourceType } = tabInfo;
    if (dataSourceType === 2) {
      totalWidth += 300;
    }
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
        sorter: (a, b) => {

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

  sortChinese = (arr, dataLeven) => { // 参数：arr 排序的数组; dataLeven 数组内的需要比较的元素属性
    return arr.sort((item1, item2) => {
      return this.getValue(item1, dataLeven).localeCompare(this.getValue(item2, dataLeven), 'zh-CN');
    });
  };
  /* 获取数组元素内需要比较的值 */
  getValue = (option, dataLeven) => { // 参数： option 数组元素
    if (!dataLeven) return option;
    var data = option;
    dataLeven.split('.').filter(function(item) {
      data = data[item];
    });
    return data + '';
  };
  sortNumber = (arr, dataLeven) => {
    arr.sort((a, b) => {
      return a[dataLeven] - b[dataLeven];
    });
  };
  // 数据处理
  dataProcessing = (arr = []) => {
    let { data, tabInfo, elementMap, tabList } = this.props;
    let { total, pageNum, pageSize } = new Object(data);
    let id = tabInfo.id;
    let elementList = elementMap[id];
    let newDataSource = [];
    arr.forEach((item, index) => {
      let data = {};
      for (let key in item) {
        if (Number(key).toString() !== 'NaN') {
          // item[obj.relationColumnName] = JSON.parse(item[key]).name;
          data.zindex = (pageNum - 1) * pageSize + index;
          data[`a${key}`] = JSON.parse(item[key]).name;
        } else {
          let obj = elementList.find((value) => {
            return value.relationColumnName === key;
          });
          data.zindex = (pageNum - 1) * pageSize + index;
          if (obj) {
            data[`a${obj.id}`] = JSON.parse(item[key]).name;
          }
        }
        if (key === 'id') {
          data.id = JSON.parse(item[key]).name;
        }
      }
      data = {
        ...item,
        ...data,
      };
      newDataSource.push(data);
    });
    return newDataSource;
  };

  onClickRow = (record, selectedRows) => {
    let { selectedArr } = this.props;
    if (selectedRows) {
      if (selectedArr.findIndex(item => item.zindex === record.zindex) !== -1) {
        selectedArr.splice(selectedArr.findIndex(item => item.zindex === record.zindex), 1);
      } else {
        selectedArr.push(record);
      }
      this.props.setFrameState({
        selectedArr: [...selectedArr],
      });
    }
  };
  onClickRowAll = (record, selectedRows, selected) => {
    let { selectedArr } = this.props;
    if (record) {
      this.props.setFrameState({
        selectedArr: [...selectedRows, ...selectedArr],
      });
    } else {
      selected.forEach(item => {
        let index = selectedArr.findIndex(items => items.zindex === item.zindex);
        if (index !== -1) {
          selectedArr.splice(index, 1);
        }
      });
      this.props.setFrameState({
        selectedArr: [...selectedArr],
      });
    }
  };
  // 生成按钮
  renderBtnGroup = () => {
    const { functionData, handleClickBtn, mainTab, elementMap } = this.props;
    const { canadd, candelete, candesign, canexport, canmodify, canview, canprint } = functionData.attributes;
    let btnArr = mainTab.filter((item) => {
      return BTN_ELEMENT_TYPE.includes(item.basetype);
    }) || [];
    return btnArr.map((item) => {
      const { basetype, visiabled } = item;
      switch (basetype) {
        case 4:
          return (
            canadd && visiabled ? <div key={item.id} className={Styles.divFlex} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                <Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>
                <span>{item.displayName}</span>
              </div>
            </div> : null
          );
        case 5:
          return (canmodify && visiabled ?
            <div key={item.id} className={Styles.divFlex} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                <span className={`${Styles.commonIconStyle} custom-color iconEdit iconfont`}></span>
                <span>{item.displayName}</span>
              </div>
            </div> : null);
        case 6:
          return (candelete && visiabled ?
            <div key={item.id} className={Styles.divFlex} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                <span className={`${Styles.commonIconStyle} custom-color icondelete iconfont`}></span>
                <span>{item.displayName}</span>
              </div>
            </div> : null);
        case 18:
          return (canadd && visiabled ?
            <div key={item.id} className={Styles.divFlex} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                <Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>
                <span>{item.displayName}</span>
              </div>
            </div> : null);
        case 24:
          return (canview && visiabled ?
            <div key={item.id} className={Styles.divFlex} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                {/*<Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>*/}
                <span>{item.displayName}</span>
              </div>
            </div> : null);
        case 30:
          return (canprint && visiabled ?
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
  // 删除
  delete = (ele) => {
    const { langLib } = this.context;
    const { selected, searchVal, tabList, elementMap } = this.state;
    const { relationTableName } = ele;
    let that = this;
    let mainTab = tabList.find(item => {
      return item.mainTab === 1;
    }) || {};
    let elementObj = elementMap[mainTab.id] || [];
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
    if (!idEle) return;
    if (selected.length) {
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        content: '',
        onOk() {
          let params = {
            tableName: relationTableName,
            ids: selected.map((item) => item[`a${idEle.id}`]).join(','),
          };
          delFullList(params).then(res => {
            that.setState({
              selected: [],
              record: {},
            }, () => {
              closeModal();
              that.httpRequest(ele);
              that.doSearch();
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
  add = (ele) => {
    const { relationTabId } = ele;
    if (relationTabId) {
      let { tabList } = this.state;
      this.setState({
        visible: true,
        relationTableId: relationTabId,
        actionType: 'add',
        title: tabList.find(item => item.id === relationTabId).name,
        formData: { [relationTabId]: {} },
      }, () => {
        this.fetchTabDropDownData();
      });
    }
  };
  // 编辑
  eddit = (ele) => {
    const { langLib } = this.context;
    let { record, tabList, elementMap, formData, selected } = this.state;
    const { relationTableName } = ele;
    let mainTab = tabList.find(item => {
      return item.mainTab === 1;
    }) || {};
    let elementObj = elementMap[mainTab.id] || [];
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
    if (!idEle) return;
    if (selected.length !== 1) {
      CMessage(langLib['message.pease.choose.one'], 'error');
    } else {
      const { relationTabId } = ele;
      if (relationTabId) {
        const elementList = elementMap[relationTabId] && elementMap[relationTabId].filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype)).map(item => {
          if (item.basetype === 9) {
            return {
              name: item.relationColumnName,
              baseType: item.basetype,
              relationColumnType: item.relationColumnType,
              elementFormat: item.elementFormat,
              mainColumnName: item.mainColumnName,
              mainTableName: item.mainTableName,
              relationColumnName: item.relationColumnName,
              relationTableName: item.relationTableName,
              elementId: item.id,
              elementMultiRelation: item.elementMultiRelation,
            };
          } else {
            return {
              name: item.relationColumnName,
              relationColumnType: item.relationColumnType,
              baseType: item.basetype,
              mainColumnName: item.mainColumnName,
              mainTableName: item.mainTableName,
              relationColumnName: item.relationColumnName,
              relationTableName: item.relationTableName,
              elementId: item.id,
              elementMultiRelation: item.elementMultiRelation,
            };
          }
        });
        if (!elementList || !elementList.length) return;
        const params = {
          tabSource: tabList.find(item => item.id === relationTabId).relationTableName,
          id: selected[0][`a${idEle.id}`],
          elementList,
        };
        getFormDetial(params).then(res => {
          this.setState({
            visible: true,
            relationTableId: relationTabId,
            actionType: 'edit',
            title: tabList.find(item => item.id === relationTabId).name,
            formData: {
              ...formData,
              [relationTabId]: this.reduceData(relationTabId, res),
            },
          }, () => {
            this.fetchTabDropDownData();
          });
        });
      }
    }
  };
  // 列表渲染
  renderList = ({ relationTabId, record, key, queryParams = initQueryParams }) => {
    const { langLib } = this.context;
    const { pageNum, pageSize } = queryParams;
    let { tabList, elementMap, formData, selected, advancedQueryMap, mainTab } = this.state;
    const { userInfo } = this.props;
    let currentTab = tabList.find(item => item.id === relationTabId);
    const elementList = elementMap[relationTabId] && elementMap[relationTabId].filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype)).map(item => {
      if (item.basetype === 9) {
        return {
          name: item.relationColumnName,
          baseType: item.basetype,
          relationColumnType: item.relationColumnType,
          elementFormat: item.elementFormat,
          mainColumnName: item.mainColumnName,
          mainTableName: item.mainTableName,
          relationColumnName: item.relationColumnName,
          relationTableName: item.relationTableName,
          elementId: item.id,
          elementMultiRelation: item.elementMultiRelation,
        };
      } else {
        return {
          name: item.relationColumnName,
          relationColumnType: item.relationColumnType,
          baseType: item.basetype,
          mainColumnName: item.mainColumnName,
          mainTableName: item.mainTableName,
          relationColumnName: item.relationColumnName,
          relationTableName: item.relationTableName,
          elementId: item.id,
          elementMultiRelation: item.elementMultiRelation,
        };
      }
    });
    if (!elementList || !elementList.length) return;
    const params = {
      tabSource: currentTab.relationTableName,
      elementList,
      pageNum,
      pageSize,
      tabId: relationTabId,
    };
    const globalMap = {}; // 面板过滤条件组合方式
    const globalQueryMap = {}; // 面板过滤条件 asql 方式
    const queryList = advancedQueryMap[relationTabId] || [];

    // 赛选对应控件值
    function getFilterData(record, mainTab, asqlValue) {
      let currentAsql = mainTab.find(item => item.parameter === asqlValue);
      return JSON.parse(record[currentAsql.id]).id || '';
    }

    const mainTabId = mainTab.find(item => item.relationColumnName === 'id');
    // 将过滤条件中的全局变量赋值
    queryList.forEach(item => {
      const { asqlValueType, asqlValue, queryType, apiSql } = item;
      if (queryType === 1) {
        // 值类型为【变量】时，需要将变量对应的值传给后台
        if (asqlValueType === 2) {
          // @@BusinessID 取左侧树的主业务数据（因为左侧树无法配置）
          if (asqlValue === '@@BusinessID') {
            if (!mainTabId) return;
            globalMap[item.asqlValue] = record[`a${mainTabId.id}`];
          } else {
            // 当前时间、当前用户
            const globalVar = getValueFromGlobalVariables({
              globalVar: asqlValue,
              userInfo,
            }) || getFilterData(record, mainTab, asqlValue);
            globalMap[item.asqlValue] = globalVar;
          }
        }
      } else if (queryType === 2) {
        if (!apiSql) return;
        const varNameList = matchGlobalVars(apiSql);
        varNameList.forEach(varName => {
            if (varName === '@@BusinessID') {
              if (!mainTabId) return;
              globalQueryMap[varName] = record[`a${mainTabId.id}`];
            } else {
              // 当前时间、当前用户
              let globalVar = getValueFromGlobalVariables({
                globalVar: varName,
                userInfo,
                globalMapType: 'globalMapType',
              });
              if (globalVar) {
                globalQueryMap[varName] = globalVar;
              } else {
                globalVar = getFilterData(record, mainTab, varName);
                let currentAsql = mainTab.find(item => item.parameter === varName);
                if (!currentAsql) return;
                const { relationColumnType } = currentAsql;
                globalQueryMap[varName] = { value: globalVar, type: relationColumnType };
              }

            }
          }
          ,
        );
      }
    });
    params.globalMap = globalMap;
    params.globalQueryMap = globalQueryMap;

    getList(params).then(res => {
      this.setState({
        visible: true,
        relationTableId: relationTabId,
        currentForm: res,
        title: tabList.find(item => item.id === relationTabId).name,
        otherParams: {
          relationTabId,
          record,
          key,
        },
      });
    });
  };

  // 数据处理
  reduceData = (relationTabId, objRes = {}) => {
    const { tabInfo, elementMap, triggerMap, form } = this.state;
    let { formData } = this.state;
    const elementList = elementMap[relationTabId] || [];
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
  // 第三方接口请求
  httpRequest = (btn) => {
    const { triggerMap } = this.state;
    const { userInfo } = this.props;
    const { id } = btn;
    const btnTriggerMap = triggerMap[id] || [];
    let arr = []; // 所有参数集合
    let globalMap = {};
    let triggerList = btnTriggerMap.length && btnTriggerMap.filter(item => item.triggerType === 5);
    if (triggerList.length) {
      let params = { triggerIds: triggerList.map(item => item.id).join(',') };
      triggerList.forEach(item => arr.push(...item.httpRequestList));
      arr.forEach(item => {
        if (isGlobalOrCustomVar(item.paramValue)) {
          globalMap[item.paramValue] = getValueFromGlobalVariables({
            globalVar: item.paramValue,
            userInfo,
          }) || this.getValueFromCurrentTabData(item.paramValue);
        }
      });
      params.globalMap = globalMap;
      httpRequest(params);
    }
  };

  // 点击按钮
  handleClickBtn = (btn) => {
    const { basetype } = btn;
    switch (basetype) {
      case 7:
        this.handleSave(btn);
        break; // 保存按钮
      case 4:
        this.handleSave(btn);
        break; // 新增按钮
      // case 18:
      //   this.handleAdd(btn);
      //   break; // 关联-新增按钮
      case 29:
        this.doBatchModification(btn);
      default:
        return;
    }
  };
  doBatchModification = (btn) => {
    const { langLib } = this.context;
    const { tabList, relationTableId, triggerMap, elementMap, fileRelationList, selected } = this.state;
    const { userInfo } = this.props;
    const { id } = btn;
    let tabInfo = tabList.find(item => item.id === relationTableId);
    let mainTab = tabList.find(item => {
      return item.mainTab === 1;
    }) || {};
    let elementObj = elementMap[mainTab.id] || [];
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
    if (!idEle) return;
    const { form } = this.detailFormRef.props;
    form.validateFields((err, values) => {
      if (!err) {
        // 去除前端的隐藏表单项
        let reqParams = filterHiddenFormData(values);
        const curEleTrigger = triggerMap[id];
        let newParams = {};
        let eleMap = elementMap[tabInfo.id];
        if (curEleTrigger && curEleTrigger.length) {
          let triggerMapData = {};
          curEleTrigger.forEach(item => {
            const { relationColumnValue, valueType } = item;
            if (valueType === 2) {
              // 定义变量的控件
              const parameterEle = elementMap[tabInfo.id].find(ele => ele.parameter === relationColumnValue) || {};
              const { mainTableName, relationColumnName, id } = parameterEle;
              const fieldKey = mainTableName ? id : relationColumnName;
              const globalVarValue = getValueFromGlobalVariables({
                userInfo,
                // treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
                globalVar: relationColumnValue,
              });
              let currentEle = eleMap.find(item => item.parameter === relationColumnValue);
              triggerMapData[relationColumnValue] = currentEle && reqParams[`a${currentEle.id}`] || globalVarValue || '';
            } else {
              const { procedureMap } = item;
              procedureMap && Object.keys(procedureMap).forEach(items => {
                let currentEle = eleMap.find(item => item.parameter === procedureMap[items]);
                triggerMapData[procedureMap[items]] = currentEle && reqParams[`a${currentEle.id}`] || '';
              });
            }
          });
          newParams.static_triggerIds = curEleTrigger.filter(item => item.triggerType === 2).map(item => item.id).join(',');
          newParams.static_procedure_triggerids = curEleTrigger.filter(item => item.triggerType === 3).map(item => item.id).join(',');
          newParams.static_globalMap = triggerMapData;
        }
        for (let key in reqParams) {
          if (key.substr(0, 1) === 'a') {
            let eleData = elementMap[tabInfo.id].filter(item => {
              return !NO_SUBMIT_ELEMENT_TYPE.includes(item.basetype);
            });
            let currentEle = eleData.find(item => item.id === Number(key.replace('a', '')));
            if (currentEle) {
              newParams[currentEle.relationColumnName] = reqParams[key];
            }
          } else {
            if (reqParams[key]) {
              newParams[key] = reqParams[key];
            }
          }
        }
        if (fileRelationList.length) {
          newParams.static_fileIds = fileRelationList.join(',');
        }
        let params = {
          ...newParams,
          static_tableName: tabInfo.relationTableName,
          static_ids: selected.map(item => item[`a${idEle.id}`]).join(','),
        };
        fullBatchUpdate(params).then(res => {
          this.doSearch();
          this.httpRequest(btn);
          // this.relationFile(res);
          this.setState({
            visible: false,
            record: {},
            selected: [],
          });
          CMessage(langLib['message.save.success']);
        });
      }
    });
  };
  handleSave = (btn) => {
    const { langLib } = this.context;
    const { tabList, relationTableId, triggerMap, elementMap, fileRelationList } = this.state;
    const { userInfo } = this.props;
    const { id } = btn;
    let tabInfo = tabList.find(item => item.id === relationTableId);
    const { form } = this.detailFormRef.props;
    form.validateFields((err, values) => {
      if (!err) {
        // 去除前端的隐藏表单项
        let reqParams = filterHiddenFormData(values);
        const curEleTrigger = triggerMap[id];
        let newParams = {};
        let eleMap = elementMap[tabInfo.id];
        if (curEleTrigger && curEleTrigger.length) {
          let triggerMapData = {};
          curEleTrigger.forEach(item => {
            const { relationColumnValue, valueType } = item;
            if (valueType === 2) {
              // 定义变量的控件
              const parameterEle = elementMap[tabInfo.id].find(ele => ele.parameter === relationColumnValue) || {};
              const { mainTableName, relationColumnName, id } = parameterEle;
              const fieldKey = mainTableName ? id : relationColumnName;
              const globalVarValue = getValueFromGlobalVariables({
                userInfo,
                // treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
                globalVar: relationColumnValue,
              });
              let currentEle = eleMap.find(item => item.parameter === relationColumnValue);
              triggerMapData[relationColumnValue] = currentEle && reqParams[`a${currentEle.id}`] || globalVarValue || '';
            } else {
              const { procedureMap } = item;
              procedureMap && Object.keys(procedureMap).forEach(items => {
                let currentEle = eleMap.find(item => item.parameter === procedureMap[items]);
                triggerMapData[procedureMap[items]] = currentEle && reqParams[`a${currentEle.id}`] || '';
              });
            }
          });
          newParams.static_triggerIds = curEleTrigger.filter(item => item.triggerType === 2).map(item => item.id).join(',');
          newParams.static_procedure_triggerids = curEleTrigger.filter(item => item.triggerType === 3).map(item => item.id).join(',');
          newParams.static_globalMap = triggerMapData;
        }
        for (let key in reqParams) {
          if (key.substr(0, 1) === 'a') {
            let eleData = elementMap[tabInfo.id].filter(item => {
              return !NO_SUBMIT_ELEMENT_TYPE.includes(item.basetype);
            });
            let currentEle = eleData.find(item => item.id === Number(key.replace('a', '')));
            if (currentEle) {
              newParams[currentEle.relationColumnName] = reqParams[key];
            }
          } else {
            if (reqParams[key]) {
              newParams[key] = reqParams[key];
            }
          }
        }
        if (fileRelationList.length) {
          newParams.static_fileIds = fileRelationList.join(',');
        }
        let params = {
          ...newParams,
          static_tableName: tabInfo.relationTableName,
        };
        updateOrInsertFull(params).then(res => {
          this.doSearch();
          this.httpRequest(btn);
          // this.relationFile(res);
          this.setState({
            visible: false,
            record: {},
          });
          CMessage(langLib['message.save.success']);
        });
      }
    });
  };
  toggle = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  // 更新该组件内状态
  setFrameState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  };
  // 筛选默认值
  getValueFromFilter = ({ varName }) => {
    const { userInfo } = this.props;
    switch (varName) {
      // 当前时间
      case '@@CurrentDateTime':
        return moment(new Date());
      // 当前用户
      case '@@CurrentUserID':
        return userInfo.id;
      // 主业务数据id
      // todo 后续处理
      case '@@BusinessID':
        return '';
      case '@@null':
        return '';
      default:
        return '';
    }
  };

  // 获取面板下的下拉数据
  fetchTabDropDownData = () => {
    const { relationTableId, formData, elementMap, filterMap } = this.state;
    const elementList = elementMap[relationTableId] || [];
    // 下拉框控件列表
    const dropDownList = elementList.filter(item => SELECT_ELEMETN_TYPE.includes(item.basetype) && !!item.mainTableName).map(item => ({
      dataSource: item.mainTableName,
      elementId: item.id,
      columnName: item.mainColumnName,
    }));
    if (!dropDownList.length) return;
    // 从实体过滤器过滤出含有下拉控件的过滤器
    let dropFilterMap = {};
    Object.keys(filterMap).forEach(item => {
      if (dropDownList.find(items => Number(items.elementId) === Number(item))) {
        dropFilterMap[item] = filterMap[item];
      }
    });
    const globalMap = {};
    filterMap && Object.keys(dropFilterMap).map(key => {
      dropFilterMap[key].forEach(item => {
        const { asqlValue, asqlValueType } = item;
        if (asqlValueType === 2) {
          globalMap[item.asqlValue] = this.getValueFromFilter({ varName: asqlValue }) || this.getValueFromCurrentTabData(asqlValue);
        }
      });
    });
    getPageSelectOptions({ dropDownList, globalMap }).then(tabDropDownData => {
      this.setState({
        tabDropDownData,
      });
    });
  };
  // 全局变量的值
  getValueFromCurrentTabData = (asqValue) => {
    if (!asqValue) return;
    const { tabInfo = {}, tabList, elementMap = {}, formData, relationTableId } = this.state;
    let elementList = elementMap[relationTableId];
    let currentEle = elementList && elementList.find(item => item.parameter === asqValue);
    if (!currentEle) return;
    let tabInfoData = formData[relationTableId];
    let currentEleValue = currentEle && tabInfoData[`a${currentEle.id}`] && JSON.parse(tabInfoData[`a${currentEle.id}`]);
    const { valueFieldType } = currentEle;
    if (valueFieldType === 2) {
      return currentEleValue && currentEleValue.name || '';
    } else {
      return currentEleValue && currentEleValue.id || '';
    }
  };
  // 点击行
  clickRow = (record) => {
    return {
      onClick: () => {
        let { selectedArr } = this.props;
        if (selectedArr.find((item) => item.zindex === record.zindex)) {
          selectedArr.splice(selectedArr.findIndex((item) => item.zindex === record.zindex), 1);
        } else {
          selectedArr.push(record);
        }
        this.props.setFrameState({
          selectedArr: [...selectedArr],
        });
      },
    };
  };
  onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
    this.setState({
      sortName: 'a' + sorter.columnKey,
      sorter,
    });
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
    let { getList, updataState, filterMap, tabDropDownData, data = {}, userInfo, tabList, triggerMap, selectedArr = [], loading, mainTab = [], visible, title, elementMap, functionData, getAdvancedFilter, tabInfo } = this.props;
    const { canview } = functionData.attributes;
    let totalWidth = this.conutWidth();
    const cellProps = { tabInfo, elementMap, userInfo, tabList, triggerMap, ...this.props }; // 行编辑的props
    // 判断是否可以行编辑
    let columns = this.getEditTableColumns() || [];
    let tabInfoIdEle = JSON.stringify(tabInfo) !== '{}' && JSON.stringify(elementMap) !== '{}' && elementMap[tabInfo.id].find(item => item.relationColumnName === 'id') || {}; // 左侧列表的id字段
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
          formData: this.props.data,
          idObj: tabInfoIdEle,
          eleObj: col.eleObj,
          tabdropdowndata: tabDropDownData,
        }),
      };
    });
    const { sortName, sorter } = this.state;
    let { datalist = [], total = 0, pageNum = 1, pageSize = 10 } = data;
    let dataSource = this.dataProcessing(datalist) || [];
    if (dataSource && sortName) {
      if (sorter.order === 'ascend') {
        dataSource = this.sortChinese(Array.from(dataSource), sortName);
      } else if (sorter.order === 'descend') {
        dataSource = this.sortChinese(Array.from(dataSource), sortName).reverse();
      } else {
        dataSource = this.dataProcessing(datalist);
      }
      console.log(this.sortChinese(Array.from(dataSource), sortName));
    }
    let searchBox = mainTab.filter((item) => {
      return item.basetype === 14 && item.visiabled;
    });
    let btnArr = mainTab.filter((item) => BTN_ELEMENT_TYPE.includes(item.basetype));
    let searchArr = mainTab.filter((item) => item.basetype === 14);
    let quickQuerySelect = mainTab.filter((item) => {
      return item.quickQuery === 1;
    }).map((items) => {
      return (<Option key={items.id} value={items.id}>{items.displayName}</Option>);
    });
    let fiterBtn = mainTab.find(item => item.basetype === 33);
    const rowSelection = {
      type: 'checkbox',
      columnWidth: '50px',
      selectedRowKeys: selectedArr.map(item => item.zindex),
      onSelectAll: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRowAll(record, selected, selectedRows);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
      onChange: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
    };
    const pagination = {
      total,
      current: pageNum,
      pageSize,
      className: Styles.paginationSty,
      pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
      onChange: (page, newPageSize) => {
        this.props.updataState({
          pageIndex: page,
          pageSize: newPageSize,
        }, () => {
          this.props.getList();
        });
      },
      onShowSizeChange: (current, pageSize) => {
        this.props.updataState({
          pageIndex: 1,
          pageSize: pageSize,
        }, () => {
          this.props.getList();
        });
      },
      showTotal: (total, range) => {
        return (
          <div><FormattedMessage id="global.total"/>{total}</div>
        );
      },
    };
    const modalProps = {
      className: Styles.modalStyle,
      visible,
      title: title,
      footer: null,
      size: 'large',
      destroyOnClose: true,
      onCancel: () => this.toggle(),
    };
    let searchArrFlag = searchArr.length && searchArr.filter((item) => !item.visiabled); // 查找隐藏个数
    let btnFlag = btnArr.length && btnArr.filter((item) => !item.visiabled); // 按钮隐藏个数
    let isTrue;
    if (searchArr.length === 0 && btnArr.length === 0) {
      isTrue = true;
    } else if (btnFlag.length === btnArr.length && searchArr.length === searchArrFlag.length) {
      isTrue = true;
    } else if (btnFlag.length === btnArr.length && searchArr.length === 0) {
      isTrue = true;
    } else if (btnFlag.length === 0 && searchArr.length === searchArrFlag.length) {
      isTrue = true;
    } else {
      isTrue = false;
    }
    const components = { // 可编辑
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const seniorFilterEle = mainTab.find((item) => item.basetype === 33); // 高级筛选
    return (<div className={Styles.content} ref="getContentWidth">
      <div className={Styles.mainContent}>
        <Row style={{ 'padding': '0 10px' }}>
          <Col span={15}>
            {this.renderBtnGroup()}
          </Col>
          <Col span={9}>
            {searchBox.length && canview ? <div className={Styles.searchBox}>
              <InputGroup compact>
                <Select defaultValue="" style={{ 'width': '34%' }}
                        onChange={(value) => this.props.updataState({ searchSelected: value })}
                >
                  <Option key={''} value=""><FormattedMessage id="role.table.all"/></Option>
                  {quickQuerySelect}
                </Select>
                <CSearch
                  style={{ 'width': '66%' }}
                  onSearch={(value) => {
                    this.props.updataState({ searchVal: value, seniorFilter: {}, pageIndex: 1 }, () => {
                      this.props.getList();
                    });
                  }}
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
                  elementList={mainTab}
                  filterMap={filterMap}
                  fetchListData={getList}
                  setContainerState={updataState}
                  restSearchParams={this.doRestSearchList}
                />
              </div> : null}
          </Col>
        </Row>
        <CTable
          className={isTrue ? Styles.tableStyle : Styles.tableStyleNomal}
          columns={newColumns}
          loading={loading}
          components={components}
          pagination={false}
          dataSource={dataSource}
          rowSelection={rowSelection}
          rowKey={record => record.zindex}
          onRow={tabInfo.canLineEdit === 1 ? (() => {
          }) : this.clickRow}
          scroll={{ x: totalWidth >= 1000 ? totalWidth : 'max-content', y: 92 }}
          onChange={this.onChange}
        />
      </div>
      <Pagination
        showQuickJumper
        showSizeChanger
        {...pagination}
      />
    </div>);
  }
}

export default FullList;
