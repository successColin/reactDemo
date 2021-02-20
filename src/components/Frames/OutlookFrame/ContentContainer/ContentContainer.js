/*
 * @Author: Fus
 * @Date:   2019-08-27 15:43:12
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-01-27 13:44:22
 * @Desc: 框架主体内容（资源管理器框架）
 */
import { Component, Fragment } from 'react';
import { Card, Form, Modal, Tabs, message } from 'antd';
import classNames from 'classnames';
import qsStringify from 'qs-stringify';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import DetailForm from '@/components/Frames/TreeFrame/ContentContainer/DetailForm/DetailForm';
import DetailList from '@/components/Frames/TreeFrame/ContentContainer/DetailList/DetailList';
import ButtonLine from '@/components/Frames/TreeFrame/ContentContainer/ButtonLine/ButtonLine';
import RelationPopup from '@/components/Frames/TreeFrame/ContentContainer/RelationPopup/RelationPopup';
import RelationFileTab from '@/components/common/RelationFileTab/RelationFileTab';
import MainTable from './MainTable/MainTable';
import { getExplorerMainListData } from '@/services/explorerFrame';
import {
  insertOrUpdateByTriggers,
  insertOrUpdatePageData,
  insertOrUpdateRelationPageData, // 修改
  getPageData,
  getPageSelectOptions,
  getTreeFrameListData, // 获取列表
  batchDeletePageData,
  doArchiveCycle,
  doArchiveNormal,
  batchUpdate, // 批量修改
  httpRequest,
  doBatchArchiveCycle,
  doBatchArchiveNormal,
  insertCreateOutlook, // 生成工单
  getSelectOutlook, // 获取展望列表
  getList, // 通用查询PC列表页面数据（左侧列表框架）
} from '@/services/frame';
import { BaseContext, NEED_CLEAR_SATATE_TABS } from '@/constants/global';
import query from '@/constants/query';
import {
  BTN_ELEMENT_TYPE,
  IGNORE_FORM_ITEM,
  SELECT_ELEMETN_TYPE,
  NO_SUBMIT_ELEMENT_TYPE,
  TIME_DEFAULT_VALUES,
  SEARCH_SELECT_TYPE,
  HIDE_IN_LIST_ELEMENT_TYPE,
} from '@/constants/element';
import {
  validTriggerMatch,
  filterHiddenFormData,
  getTriggerMapFromEle,
  getValueFromGlobalVariables,
  getValueFromCustomVariables,
  getDefaultConfirmProps,
  parseFormData,
  parseListData,
  isGlobalOrCustomVar,
  resetDefaultValue,
  matchGlobalVars,
  matchGlobalFunctionParam,
  getSelectSearchInfoById,
  controlAuthority,
  jsonParse,
  returnJumpMenuData,
  getFunctionComDetail,
  prevSetFormData,
  unique,
  reducerVariableToArray, multiDataComparison, jumpFileOfCommon,
  validMatchMultiTrigger,
} from '@/utils/common';
import styles from './ContentContainer.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import moment from 'moment';
import { formatTime } from '@/utils/common';

const { TabPane } = Tabs;

// 创建url对象
function createObjectURL(object) {
  return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
}

let startDay = formatTime(moment().startOf('month'));
let endDay = formatTime(moment().endOf('month'));
// let startDay = moment().add(-0.5, 'y').format('YYYY-MM-01 00:00:00');
// let endDay = moment().add(0.5, 'y').format('YYYY-MM-01 23:59:59');
const initQueryParams = {
  pageNum: 1,
  pageSize: 10,
  // startDay: startDay,
  // endDay: endDay,
  // keyword: '',
};

class ContentContainer extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    fromType: '', // 调用类型 （inPopup在弹出面板内）
    prevTabInfo: {}, // 上一个面板的信息(最后在props中取值)
    prevEleObj: {}, // 上一个面板点击的控件信息（最后在props中取值）
    prevSelectedRows: [], // 上个列表面板中选中的数据
  };

  static getDerivedStateFromProps(props, state) {
    // elementMap转为state
    // 原因：弹出第二层面板后发生触发器或修改按钮状态等情况下需要更新elementMap，会造成弹出面板死循环反复弹出
    if (JSON.stringify(props.elementMap) !== '{}' && JSON.stringify(state.elementMap) === '{}') {
      return {
        elementMap: props.elementMap,
      };
    }
    return null;
  }

  state = {
    seniorFilter: {}, // 高级筛选
    elementMap: {}, // 控件map
    tabId: null, // 面板id
    listRowData: {}, // 上一个面板的行数据(最后在props中取值)
    formData: {}, // 表单数据
    originFormData: {}, // 原始表单数据（避免触发器影响显示初始状态）
    listDataObj: {}, // 列表数据
    listDataArr: [], // 列表数据arr
    listQueryParams: initQueryParams, // 列表请求参数
    listSelectedRows: [], // 列表选择的行数据
    tabDropDownData: {}, // 当前面板下的下拉数据(内容以{表名: [下拉数据]})形式）
    visiblePopup: false, // 弹出面板的显示状态
    triggerPopupEle: {}, // 触发弹出面板的控件信息
    popupTabInfo: {}, // 弹出面板信息
    popupHasFetched: false,
    relationFileObj: {}, // 文件关联信息
    calendarList: [], // 便捷搜索条件
    handleSetCustomSelectList: null, // 自定义选择框弹出列表中选中行后点击确定
    loadingStatus: {
      data: false, // 获取数据
      mainList: false, // 主列表
    },
    mainListData: [], // 主面板列表数据
    mainListRowData: {}, // 主列表行数据
    externalParameters: {}, // 外部页面的参数集合
    stateEndTime: {
      stateTime: '',
      endTime: '',
    }, // 开始结束时间
  };

  componentDidMount() {
    this.props.fromType === 'inPopup' && this.doFetchPageData();
    this.fetchTabDropDownData();
  }

  // 获取页面数据
  doFetchPageData = () => {
    const { tabInfo, prevEleObj = {}, prevSelectedRows } = this.props;
    const { elementMap } = this.state;
    const { showType, basetype, fileRelationTableName, fileRelationParam, fileRelationColumnName, tableGroupName } = tabInfo;
    // 展望
    // if (basetype === 8) {
    //   this.fetchMainList();
    //   return;
    // }
    // 点击新增按钮时、批量时不需要获取面板内数据
    if (
      (prevEleObj.basetype === 4) ||
      (prevEleObj.basetype === 49) ||
      (prevEleObj.basetype === 24 && showType !== 1) ||
      (showType === 6) ||
      (prevSelectedRows.length > 1)
    ) {
      const formData = prevSetFormData({
        elementList: elementMap[tabInfo.id],
        getGlobalVarValues: this.getGlobalVarValues,
      });
      this.setState({
        formData,
        originFormData: formData, // 保留一份原始数据是为了触发器修改值后若不符合触发条件，需要回显原始值
      }, () => {
        this.fetchTabDropDownData('cascade'); // 获取级联下拉数据
        this.checkTriggerResult();
      });
      return;
    }
    // 列表
    if (showType === 1 || showType === 4 || showType === 5) {
      this.fetchListData({});
      return;
    } else if (showType === 2) { // 表单
      this.fetchFormData();
    } else if (showType === 7) { // 关联资料面板
      const relationId = this.getGlobalVarValues({
        varName: fileRelationParam,
      });
      this.relationFileTabRef && this.relationFileTabRef.fetchRelationFiles({
        relationId,
        relationTableName: fileRelationTableName,
        relationColumnName: fileRelationColumnName,
        tableGroupName: tableGroupName,
      });
    } else if (showType === 11) {
      this.getExternalParameters();
    }
  };
  // 获取外部页面的参数
  getExternalParameters = () => {
    const { elementMap } = this.state;
    const { tabInfo: { id } } = this.props;
    const elementList = elementMap[id] || [];
    const paramElement = elementList.filter(item => !!item.parameter) || [];
    let externalParameters = {};
    paramElement.forEach(item => {
      const { defaultValue, parameter } = item;
      externalParameters[parameter] = this.getGlobalVarValues({
        varName: defaultValue,
      }) || defaultValue;
    });
    this.setState({ externalParameters });
  };
  // 获取主面板列表数据
  fetchMainList = () => {
    const { elementMap, tabInfo, frameData, advancedQueryMap, treeNodeData = {} } = this.props;
    const { id: tabId } = tabInfo;
    const { datasource1, datasource2, groupColumn } = frameData;
    const { isGroup, id } = treeNodeData;
    const elementList = elementMap[tabId] && elementMap[tabId].map(item => {
      const { resourceManagerSql, applyToTable, id: elementId } = item;
      return { elementId, resourceManagerSql, applyToTable };
    });
    const queryList = advancedQueryMap[tabInfo.id] || [];
    const globalMap = {};
    // 将过滤条件中的全局变量赋值
    queryList.forEach(item => {
      const { asqlValueType, asqlValue } = item;
      // 值类型为【变量】时，需要将变量对应的值传给后台
      if (asqlValueType === 2) {
        globalMap[item.asqlValue] = this.getGlobalVarValues({ varName: asqlValue });
      }
    });
    const params = {
      elementList,
      tabId,
      dataSource: datasource2,
      groupDataSource: isGroup ? datasource1 : '',
      globalMap: {},
      id,
      groupColumn,
      // pageNum,
      // pageSize,
    };
    this.setLoadingStatus('mainList', true);
    getExplorerMainListData(params).then(mainListData => {
      this.setState({ mainListData });
      this.setLoadingStatus('mainList', false);
    }, err => this.setLoadingStatus('mainList', false));
  };
  // 获取表单数据
  fetchFormData = () => {
    const { elementMap = {} } = this.state;
    const { tabInfo = {}, pageFrameData, treeNodeData = {}, advancedQueryMap, prevListRowData, prevTabData, fromType } = this.props;
    const tabId = tabInfo.id;
    const tabEleList = elementMap[tabId] || []; // 面板内所有的控件信息
    const elementList = tabEleList.filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype)).map(item => ({
      elementId: item.id,
      name: item.relationColumnName,
      baseType: item.basetype,
      mainColumnName: item.mainColumnName,
      mainTableName: item.mainTableName,
      elementMultiRelation: item.elementMultiRelation,
      relationColumnType: item.relationColumnType,
      elementFormat: item.elementFormat,
    }));
    if (!elementList || !elementList.length) return;
    let id = treeNodeData.id;
    // 弹出面板中的数据需要根据前一个面板中的当前行数据获取
    if (fromType === 'inPopup' && JSON.stringify(prevTabData) !== '{}') {
      // 面板过滤条件
      const filterIdData = advancedQueryMap[tabId].find(item => item.asqlColumnName === 'id') || {};
      const { asqlValueType, asqlValue } = filterIdData;
      // 值类型为【值】，直接取值
      if (asqlValueType === 1) {
        id = asqlValue;
      } else if (asqlValueType === 2) { // 值类型为【变量】，取上个面板传入的数据中对应的变量值
        // const ele = elementMap[prevTabInfo.id].find(item => item.parameter === asqlValue) || {};
        // const { id: eleId } = ele;
        // const eleBusData = prevTabData[eleId] || {};
        // id = +eleBusData.id || '';

        // const eleBusData = prevTabData.id || {};
        // id = +(eleBusData.id || eleBusData) || ''; // 因为主列表的数据不是id和name的对象，与其他面板类型返回结构不同
        id = this.getGlobalVarValues({ varName: asqlValue });
      }
    }
    const params = {
      tabSource: tabInfo.relationTableName,
      id,
      elementList,
      // calendarList,
    };
    this.setLoadingStatus('data', true);
    getPageData(params).then(res => {
      this.getParseFormData(res, tabEleList).then(formData => {
        this.setState({
          formData,
          originFormData: formData, // 保留一份原始数据是为了触发器修改值后若不符合触发条件，需要回显原始值
        }, () => {
          this.fetchTabDropDownData('cascade'); // 获取级联下拉数据
          this.checkTriggerResult();
          const { tabInfo, elementMap, tabList, advancedQueryMap } = this.props;
          const currentElementList = elementMap[tabInfo.id] || [];
          let SubPanel = currentElementList.find(item => item.basetype === 42) || {};
          if (JSON.stringify(SubPanel) === '{}' && !SubPanel.relationTabId) return;
          const { relationTabId } = SubPanel;
          let SubPanelTabInfo = tabList.find(item => item.id === relationTabId) || {};
          if (JSON.stringify(SubPanelTabInfo) === '{}') return;
          if (SubPanelTabInfo.showType !== 9) return;
          this.fetchSubPanelListData(SubPanelTabInfo);
        });
        this.setLoadingStatus('data', false);
      });
    }, err => this.setLoadingStatus('data', false));
  };
  /**
   * 获取子面板列表数据
   * @param {array} searchQueryList 便捷搜索条件
   * @param {object} targetTabInfo  目标面板信息（如，数据选择框的弹出列表面板、常规列表面板）
   */
  fetchSubPanelListData = (SubPanelTabInfo) => {
    const { elementMap, treeNodeData = {}, advancedQueryMap, userInfo, fromType, prevTabData, prevTabInfo } = this.props;
    const { id: tabId, relationTableName: tabSource, showType, relationColumn } = SubPanelTabInfo;
    const elementList = elementMap[tabId].map(item => {
      const { relationColumnName: name, basetype: baseType, mainColumnName, mainTableName, elementMultiRelation, id: elementId, relationColumnType, elementFormat } = item;
      return {
        elementId, name, baseType, mainColumnName, mainTableName, elementMultiRelation, relationColumnType,
        elementFormat,
      };
    });
    let seniorFilterMap = {};
    // 关联面板且有关联字段时传入
    if (showType === 4 && relationColumn) {
      const treeNodeId = treeNodeData.id;
      seniorFilterMap = {
        [relationColumn]: {
          static_connector: 3,
          static_type: 2,
          static_value: treeNodeId,
        },
      };
    }
    const queryList = advancedQueryMap[tabId] || [];
    const { id: nodeId } = treeNodeData;
    const globalMap = {};
    const globalQueryMap = {};
    // 将过滤条件中的全局变量赋值
    queryList.forEach(item => {
      const { asqlValueType, asqlValue, queryType, basetype, apiSql } = item;
      // 面板过滤条件为组合条件方式
      if (queryType === 1 && basetype === 1) {
        // 值类型为【变量】时，需要将变量对应的值传给后台
        if (asqlValueType === 2 || isGlobalOrCustomVar(asqlValue)) {
          globalMap[item.asqlValue] = this.getGlobalVarValues({ varName: asqlValue });
        }
      } else if (queryType === 2 && basetype === 2) { // SQL过滤条件方式
        const varArr = matchGlobalVars(apiSql);
        varArr.forEach(varName => {
          globalQueryMap[varName] = this.getGlobalVarValues({ varName, globalMapType: 'globalQueryMap' });
        });
      }
    });
    const params = {
      elementList,
      tabId,
      tabSource,
      pageNum: 1,
      pageSize: 9999,
      calendarList: [],
      globalMap,
      globalQueryMap,
      seniorFilterMap,
    };
    if (!elementList.length) return;
    this.setLoadingStatus('data', true);
    getTreeFrameListData(params).then(res => {
      const listDataObj = parseListData({
        elementList: elementMap[tabId],
        listDataObj: res,
      });
      this.setState({ stepList: listDataObj });
      this.setLoadingStatus('data', false);
    }, err => this.setLoadingStatus('data', false));
  };

  async getParseFormData(res, tabEleList) {
    const formData = await parseFormData({
      elementList: tabEleList,
      formData: res,
      getGlobalVarValues: this.getGlobalVarValues,
    });
    return formData;
  }

  /**
   * 获取列表数据
   * @param {array} searchQueryList 便捷搜索条件
   * @param {object} targetTabInfo  目标面板信息（如，数据选择框的弹出列表面板、常规列表面板）
   */
  fetchListData = ({ searchQueryList = [] }) => {
    const { tabInfo, treeNodeData = {}, advancedQueryMap, userInfo, fromType, prevTabData, prevTabInfo } = this.props;
    const { elementMap, listQueryParams, seniorFilter } = this.state;
    const { pageNum, pageSize } = ContentContainer;
    const { id: tabId, relationTableName: tabSource, showType, relationColumn } = tabInfo;
    const elementList = elementMap[tabId].map(item => {
      const { relationColumnName: name, basetype: baseType, mainColumnName, mainTableName, elementMultiRelation, id: elementId, relationColumnType, elementFormat } = item;
      return {
        elementId, name, baseType, mainColumnName, mainTableName, elementMultiRelation, relationColumnType,
        elementFormat,
      };
    });
    let seniorFilterMap = { ...seniorFilter };
    // 关联面板且有关联字段时传入
    if (showType === 4 && relationColumn) {
      const treeNodeId = treeNodeData.id;
      seniorFilterMap = {
        [relationColumn]: {
          static_connector: 3,
          static_type: 2,
          static_value: treeNodeId,
        },
      };
    }
    const queryList = advancedQueryMap[tabId] || [];
    const { id: nodeId } = treeNodeData;
    const globalMap = {};
    const globalQueryMap = {};
    // 将过滤条件中的全局变量赋值
    queryList.forEach(item => {
      const { asqlValueType, asqlValue, queryType, basetype, apiSql } = item;
      // 面板过滤条件为组合条件方式
      if (queryType === 1 && basetype === 1) {
        // 值类型为【变量】时，需要将变量对应的值传给后台
        if (asqlValueType === 2 || isGlobalOrCustomVar(asqlValue)) {
          globalMap[item.asqlValue] = this.getGlobalVarValues({ varName: asqlValue });
        }
      } else if (queryType === 2 && basetype === 2) { // SQL过滤条件方式
        const varArr = matchGlobalVars(apiSql);
        varArr.forEach(varName => {
          globalQueryMap[varName] = this.getGlobalVarValues({ varName, globalMapType: 'globalQueryMap' });
        });
      }
    });
    const params = {
      elementList,
      tabId,
      tabSource,
      pageNum,
      pageSize,
      calendarList: searchQueryList,
      globalMap,
      globalQueryMap,
      seniorFilterMap,
      ...listQueryParams,
    };
    if (!elementList.length) return;
    this.setLoadingStatus('data', true);
    getList(params).then(res => {
      const listDataObj = parseListData({
        elementList: elementMap[tabId],
        listDataObj: res,
      });
      this.setState({
        listDataObj,
        calendarList: searchQueryList,
        listDataArr: res,
      });
      this.setLoadingStatus('data', false);
    }, err => this.setLoadingStatus('data', false));
  };
  /**
   * 获取面板下的下拉数据
   *  @param {string} type 下拉类型 （normal-普通下拉，cascade-级联下拉）
   */
  fetchTabDropDownData = (type = 'normal', callback) => {
    const { elementMap, tabDropDownData } = this.state;
    const { tabInfo = {}, filterMap } = this.props;
    const elementList = elementMap[tabInfo.id] || [];
    const typeid = type === 'normal' ? 1 : 2;
    // 下拉框控件列表
    const dropDownList = elementList.filter(item => (SELECT_ELEMETN_TYPE.includes(item.basetype) && !!item.mainTableName && item.elementFormat === typeid) || item.basetype === 15)
      .map(item => ({ dataSource: item.mainTableName, elementId: item.id, columnName: item.mainColumnName }));
    if (!dropDownList.length) {
      callback && callback();
      return;
    }
    const globalMap = {};
    Object.keys(filterMap).map(key => {
      filterMap[key].forEach(item => {
        const { asqlValue, asqlValueType } = item;
        if (asqlValueType === 2 || isGlobalOrCustomVar(asqlValue)) {
          globalMap[item.asqlValue] = this.getGlobalVarValues({ varName: asqlValue });
        }
      });
    });
    getPageSelectOptions({ dropDownList, globalMap }).then(res => {
      this.setState({
        tabDropDownData: {
          ...tabDropDownData,
          ...res,
        },
      });
      callback && callback();
    });
  };
  // 获取表单的默认值
  getDefaultFormData = () => {
    const { tabInfo } = this.props;
    const { elementMap } = this.state;
    const eleList = elementMap[tabInfo.id] || [];
    const result = {};
    eleList.forEach(eleObj => {
      const { defaultValue, id: eleId } = eleObj;
      if (isGlobalOrCustomVar(defaultValue)) {
        const value = this.getGlobalVarValues({ varName: defaultValue, eleObj });
        result[eleId] = {
          id: value,
          name: value,
        };
      }
    });
    return result;
  };
  // 生成全局变量的值
  /**
   * @param {string} varName 变量名
   * @param {object} eleObj 控件对象
   * @param {object} listActiveRowData 列表的当前行数据
   */
  getGlobalVarValues = ({
                          varName,
                          eleObj = {},
                          listActiveRowData = {},
                          isRealValue = true,
                          globalMapType = 'globalMap',
                          isReturnObj = false, // 返回值是否包含id/name的对象
                          formData = this.state.formData,
                        }) => {
    if (!varName) return;
    const { langLib } = this.context;
    const { elementMap, originFormData } = this.state;
    const { userInfo, treeNodeData = {}, fromType, prevTabData, prevTabInfo, tabInfo, mainListRowData } = this.props;
    // @@BusinessID 取左侧树的主业务数据（因为左侧树无法配置）
    // 当前时间、当前用户
    const globalVar = getValueFromGlobalVariables({
      globalVar: varName,
      userInfo,
      treeNodeData,
      eleObj,
      isRealValue,
      globalMapType,
      curFormData: formData,
      curEleList: elementMap[tabInfo.id],
      explorerMainListRow: mainListRowData,
      originData: originFormData,
      isReturnObj,
    });
    // 或用户自定义的变量
    const customVar = getValueFromCustomVariables({
      prevListRowData: prevTabData, // @TODO: common中传参待修改
      prevElementList: elementMap[prevTabInfo.id],
      curElementList: elementMap[tabInfo.id],
      curTabData: tabInfo.showType === 2 ? formData : listActiveRowData,
      varName,
      isRealValue,
      globalMapType,
      langLib,
      isReturnObj,
    });

    if (isReturnObj) {
      return globalVar.id ? globalVar : customVar;
    }
    return globalVar || customVar || '';
  };
  // 单个控件的加载触发器逻辑
  singleEleCheckTrigger = ({
                             eleObj, // 控件对象
                             newElementList, // 更新后的控件列表
                             infosObj, // 请求过getInfo接口的数据
                             newFormData, // 更新后的表单数据
                             checkTriggerBaseTypes = [4, 3], // 需要检测的触发器类型
                           }) => {
    const { triggerMap } = this.props;
    const { id: eleId, basetype: originEleBaseType, mainTableName: originEleMainTableName } = eleObj;
    // 该元素有配置触发器
    const triggerList = triggerMap[eleId] || [];
    if (!triggerList.length) return;
    // 最外层遍历只走加载触发器，触发器其他控件中则需要匹配赋值和加载
    const triggers = triggerList.filter(item => checkTriggerBaseTypes.includes(item.basetype) && item.triggerType === 1);
    triggers.forEach(trigger => { // 【加载】的前端触发器事件类型
      const { endTriggerNum, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible, relationElementValue } = trigger;
      const matchEleIndex = newElementList.findIndex(item => item.id === relationElementId);
      const targetEle = newElementList[matchEleIndex];
      if (matchEleIndex === -1) return; // 无目标控件
      const { basetype: targetEleType, id: targetEleId, mainColumnName: targetEleMainColumnName } = targetEle;
      let actualVal = newFormData[eleId] ? newFormData[eleId].id : '';
      let matchVal = endTriggerNum;
      if (isGlobalOrCustomVar(actualVal)) { // 全局变量
        actualVal = this.getGlobalVarValues({ varName: actualVal });
      }
      if (isGlobalOrCustomVar(endTriggerNum)) {
        matchVal = this.getGlobalVarValues({ varName: endTriggerNum });
      }
      const validMatch = validTriggerMatch(trigger, actualVal, matchVal, this.getGlobalVarValues);
      if (!validMatch) return; // 不满足匹配条件
      let valueObj = { id: relationElementValue, name: relationElementValue };
      // // 有隐藏项的控件需要id和name不同
      // if (HIDDEN_ELEMENT_TYPE.includes(targetEleType)) {
      //   valueObj.name = '';
      // }
      // 值为变量
      if (isGlobalOrCustomVar(relationElementValue)) {
        valueObj = this.getGlobalVarValues({
          varName: relationElementValue,
          eleObj: targetEle,
          isReturnObj: true,
          formData: newFormData,
        });
      }
      newFormData[targetEle.id] = valueObj;
      this.setState({ formData: newFormData });

      // 获取详情接口（或取已有数据）
      const getInfoById = (infoEleObj, infoValueObj, paramName) => {
        const { mainTableName, basetype } = infoEleObj;
        const detailKey = `${mainTableName}_${infoValueObj.id}`;
        if (infosObj[detailKey]) {
          newFormData[infoEleObj.id] = infosObj[detailKey].valueObj;
          newFormData[targetEle.id] = infosObj[detailKey][targetEleMainColumnName];
          this.setState({ formData: newFormData });
        } else {
          const that = this;
          getSelectSearchInfoById(infoEleObj, infoValueObj.id, function(res) {
            const { basetype: infoBaseType } = infoEleObj;
            let targetVlue = infoBaseType === 45 ? res.detailInfo.map(item => item[paramName]).join(',') : res.detailInfo[paramName];
            newFormData[infoEleObj.id] = res.valueObj;
            newFormData[targetEle.id] = {
              id: infoBaseType === 45 ? res.detailInfo.map(item => item.id).join(',') : res.detailInfo.id,
              name: targetVlue,
            };
            // 如果源控件是多选，被触发控件是数据选择框，需要对数据选择框的数据进行去重
            if ([3, 12, 25].includes(targetEle.basetype) && infoBaseType === 45) {
              const uniqueArr = unique(res.detailInfo, paramName) || [];
              const lastArr = uniqueArr.filter(item => item[paramName]); // 去空值
              if (lastArr.length !== 1) {
                delete newFormData[targetEle.id];
              } else {
                targetVlue = lastArr[0][paramName];
              }
            }
            // 目标控件为选择框，则需要继续校验该控件的触发器并且值是
            if ([45].includes(targetEle.basetype) && targetVlue) {
              getSelectSearchInfoById(targetEle, targetVlue, function(res) {
                newFormData[targetEle.id] = res.valueObj;
                that.setState({ formData: newFormData }, () => {
                  that.singleEleCheckTrigger({
                    eleObj: targetEle,
                    newElementList,
                    infosObj,
                    newFormData,
                  });
                });
              });
              return;
            }
            if (SEARCH_SELECT_TYPE.concat([17]).includes(targetEle.basetype) && !isNaN(Number(targetVlue))) {
              getSelectSearchInfoById(targetEle, targetVlue, function(res) {
                newFormData[targetEle.id] = res.valueObj;
                that.setState({ formData: newFormData }, () => {
                  that.singleEleCheckTrigger({
                    eleObj: targetEle,
                    newElementList,
                    infosObj,
                    newFormData,
                  });
                });
              });
            } else {
              that.setState({ formData: newFormData });
            }
          });
        }
      };
      // 源控件为选择框
      if (SEARCH_SELECT_TYPE.includes(originEleBaseType)) {
        // 全局函数入参
        const paramName = matchGlobalFunctionParam(relationElementValue);
        // 取当前数据选择框中选中的详情数据对应参数值
        if (paramName) {
          getInfoById(eleObj, newFormData[eleId], paramName);
        }
      } else if (SEARCH_SELECT_TYPE.includes(targetEleType)) { // 目标控件为选择框
        getInfoById(targetEle, newFormData[targetEleId], targetEleMainColumnName);
      } else if (targetEle.basetype === 17 && targetEle.valueFieldType !== 2) {
        getInfoById(targetEle, newFormData[targetEleId], targetEleMainColumnName);
      }
      newElementList.splice(matchEleIndex, 1, {
        ...newElementList[matchEleIndex],
        requisite: relationElementRequisite,
        readonly: relationElementReadonly,
        visiabled: relationElementVisible,
      });
    });
  };
  // 再进进入面板时，验证触发器是否匹配
  checkTriggerResult = () => {
    const { tabInfo, tabData, triggerMap } = this.props;
    const { formData, elementMap } = this.state;
    const elementList = elementMap[tabInfo.id];
    const newElementList = [...elementList];
    const newFormData = { ...formData };
    if (JSON.stringify(formData) === '{}') return;
    const infosObj = {};// 数据选择框走过getById的实体表+id数据的详情
    elementList.forEach(eleObj => {
      this.singleEleCheckTrigger({
        eleObj,
        newElementList,
        infosObj,
        newFormData,
        checkTriggerBaseTypes: [4],
      });
    });
    this.setState({
      elementMap: {
        ...elementMap,
        [tabInfo.id]: newElementList,
      },
    });
  };
  // 点击之前的判断
  checkBeforeHandleClick = (btn, record) => {
    const { executeCondition, defaultConditions } = btn;
    const { tabInfo } = this.props;
    const { showType } = tabInfo;
    const { langLib } = this.context;
    const makeTriggerObj = (str) => { // 将执行前的条件处理成对应的数据
      if (!str) return;
      let executeConditionJson = JSON.parse(executeCondition) || {};
      const { formula, fortype = '', ...rest } = executeConditionJson;
      let triggerObj = {
        endTriggerNum: formula,
        ...rest,
      };
      let methodType = fortype.toLowerCase();
      if (methodType === 'or') {
        triggerObj.methodType = 2;
      }
      if (methodType === 'and') {
        triggerObj.methodType = 1;
      }
      return triggerObj;
    };
    if (showType === 2) {
      if (!executeCondition) {
        return true;
      } else {
        if (!executeCondition) return true;
        let triggerObj = makeTriggerObj(executeCondition);
        let isTrue = validMatchMultiTrigger(triggerObj, this.getGlobalVarValues);
        if (!isTrue) {
          const { isFalse } = triggerObj;
          CMessage(isFalse, 'error');
          return false;
        } else {
          return true;
        }
      }
    } else {
      // 列表上的判断
      const { oldListSelectedRows = [] } = this.state;
      const { canLineEdit } = tabInfo;
      const { basetype } = btn;
      let ListArr = canLineEdit === 1 && [7, 43, 44].includes(basetype) ? [record] : oldListSelectedRows;
      let isDefaultTrue = false, isExecuteConditionTrue = false;
      if (!defaultConditions) { // 没有默认条件时返回true
        isDefaultTrue = true;
      } else if (defaultConditions === 1 && ListArr.length === 1) { // defaultConditions=1且只选择一条数据了返回true
        isDefaultTrue = true;
      } else if (defaultConditions === 1 && (!ListArr.length || ListArr.length !== 1)) {
        isDefaultTrue = false;
        CMessage(langLib['message.error.onlyOne'], 'error');
        return;
      } else if (defaultConditions === 2 && ListArr.length && ListArr.length >= 1) { // defaultConditions=2且只选择2条及2条以上数据了返回true
        isDefaultTrue = true;
      } else if (defaultConditions === 2 && (!ListArr.length || ListArr.length < 1)) {
        CMessage('请选择数据', 'warning');
        isDefaultTrue = false;
        return;
      }
      if (!executeCondition) {
        isExecuteConditionTrue = true;
      } else {
        if (!ListArr.length) {
          isExecuteConditionTrue = false;
          CMessage(langLib['message.please.choose'], 'error');
        } else {
          let newExecuteCondition = makeTriggerObj(executeCondition);
          const { isFalse } = newExecuteCondition;
          // 首先将提示标语换成正确的
          let str = [], flagArr = [];
          const errMsg = ({ msg, record, elementList, recordIndex }) => { // 修改错误信息
            const varArr = matchGlobalVars(msg);
            let newStr = msg;
            if (varArr.length) {
              varArr.forEach(item => {
                let currentElement = elementList.find(ele => ele.parameter === item);
                if (currentElement) {
                  let contentValue = record[currentElement.id].name;
                  newStr = newStr.replace(`{${item}}`, `第${recordIndex + 1}条 ${currentElement.displayName}为 ${contentValue || '空'}`);
                }
              });
            } else {
              newStr = newStr;
            }
            return newStr;
          };
          let triggerObj = makeTriggerObj(executeCondition);
          const { tabInfo, elementMap, userInfo, activeTreeNode, tabList } = this.props;
          ListArr.forEach((item, index) => {
            const { tabInfo, userInfo, activeTreeNode, tabList } = this.props;
            const { elementMap } = this.state;
            const getValueFromCurrentTableColumn = (varName) => {
              if (typeof varName === 'object') {
                varName = varName.varName;
              }
              if (!varName) return;

              const elementList = elementMap[tabInfo.id];
              const value = this.getGlobalVarValues({
                varName,
              });
              if (value) return value;

              let currentEle = elementList && elementList.find(item => item.parameter === varName);
              return JSON.parse(item[currentEle.id]).id;
            };
            let isTrue = validMatchMultiTrigger(triggerObj, getValueFromCurrentTableColumn);
            // if (!isTrue) {
            //   str.push(errMsg({ msg: isFalse, record: item, elementList: elementMap[tabInfo.id], recordIndex: index }));
            // }
            flagArr.push(isTrue);
          });
          let isTrueArr = flagArr.filter(item => !!item);

          isExecuteConditionTrue = isTrueArr.length === ListArr.length ? true : false;

          if (!isExecuteConditionTrue) {
            // const errMeg = <div>{str.map(item => (<span key={item}>{item}<br/></span>))}</div>;
            const errMeg = errMsg({
              msg: isFalse,
              elementList: elementMap[tabInfo.id],
            });
            message.error(errMeg);
            return;
          }
        }
      }
      return isDefaultTrue && isExecuteConditionTrue;
    }
  };
  // 点击按钮
  handleClickBtn = (btn, ...rest) => {
    if (!this.checkBeforeHandleClick(btn)) return;
    const { basetype } = btn;
    const { tabInfo, tabData, triggerMap } = this.props;
    const { formData, elementMap } = this.state;
    const elementList = elementMap[tabInfo.id];
    const newElementList = [...elementList];
    const newFormData = { ...formData };
    this.singleEleCheckTrigger({
      eleObj: btn, // 控件对象
      newElementList, // 更新后的控件列表
      infosObj: {}, // 请求过getInfo接口的数据
      newFormData, // 更新后的表单数据
      checkTriggerBaseTypes: [1], // 只匹配【点击】触发器
    });
    const doClickBtn = () => {
      this.setState({
        elementMap: {
          ...elementMap,
          [tabInfo.id]: newElementList,
        },
      });
      switch (basetype) {
        case 7:
          this.handleSave(btn, 'normal');
          break; // 保存按钮
        case 6:
          this.handleDel(btn, rest);
          break; // 删除按钮
        case 4:
          this.handleAdd(btn);
          break; // 新增按钮 ok
        case 5:
          this.handleEdit(btn);
          break; // 编辑按钮
        case 18:
          this.handleAdd(btn);
          break; // 关联-新增按钮
        case 24:
          this.handleNormalBtn(btn);
          break; // 普通按钮
        case 26:
          this.handleArchive(btn);
          break; // 归档按钮
        case 28:
          this.handleArchive(btn);
          break; // 普通归档按钮
        case 29:
          this.handleSave(btn, 'batch');
          break; // 批量保存
        case 30:
          this.doExport(btn);
          break; // 导出按钮
        case 34:
          this.handleArchive(btn);
          break; // 批量普通归档按钮
        case 35:
          this.handleArchive(btn);
          break; // 批量归档按钮
        case 49:
          this.handleCreate(btn);
          break; // 展望生成的按钮
        default:
          return;
      }
    };
    setTimeout(() => {
      doClickBtn();
    }, 0);
  };
  // 跳转至按钮中配置的url
  linkToUrl = (btn, url) => {
    const globalVars = matchGlobalVars(url);
    let resultUrl = url;
    if (globalVars.length) {
      const { listSelectedRows } = this.state;
      globalVars.forEach(varName => {
        const value = this.getGlobalVarValues({
          varName,
          listActiveRowData: listSelectedRows[0],
        });
        resultUrl = resultUrl.replace(`{${varName}}`, value);
      });
    }
    window.open(resultUrl);
  };
  // 导出
  doExport = (btn) => {
    const { elementFormat = 1 } = btn;
    if (this.state.listDataArr.length === 0) {
      CMessage('暂无数据', 'warning');
      return;
    }
    if (elementFormat === 1) {
      this.setState({
        downLoadLoading: true,
      });
      this.exportAll();
    } else if (elementFormat === 2) {
      this.exportPart();
    } else {
      this.exportAll();
    }
  };
  // 导出部分
  exportPart = () => {
    console.log('222');
  };
  // 导出全部
  exportAll = () => {
    const { tabInfo, userInfo, elementMap, pageSize, pageIndex, searchSelected, advancedQueryMap, functionData } = this.props;
    let { searchVal, seniorFilter } = this.props;
    // if (this.props.fromType !== 'normal') {
    // }
    // ;
    searchVal = this.state.searchVal;
    seniorFilter = this.state.seniorFilter;
    let currentTabId = tabInfo.id;
    let elementList = elementMap[currentTabId].filter((item) => {
      return !(HIDE_IN_LIST_ELEMENT_TYPE.includes(item.basetype));
    }).map(item => {
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
          displayName: item.displayName,
          visiabled: item.visiabled,
          elementMultiRelation: item.elementMultiRelation,
        };
      } else {
        return {
          name: item.relationColumnName,
          baseType: item.basetype,
          mainColumnName: item.mainColumnName,
          mainTableName: item.mainTableName,
          elementId: item.id,
          displayName: item.displayName,
          visiabled: item.visiabled,
          relationColumnName: item.relationColumnName,
          relationTableName: item.relationTableName,
          elementMultiRelation: item.elementMultiRelation,
        };
      }
    });
    if (!elementList || !elementList.length) return;
    const params = {
      tabSource: tabInfo.relationTableName,
      elementList,
      tabId: currentTabId,
    };
    let quickQuerySelect = elementMap[currentTabId].filter((item) => {
      return item.quickQuery === 1;
    });
    if (searchSelected) {
      let currentEle = quickQuerySelect.find(item => {
        return item.id === searchSelected;
      });
      params.calendarList = [{
        field: currentEle.mainColumnName || currentEle.relationColumnName,
        value: searchVal,
        tableName: currentEle.mainTableName || currentEle.relationTableName,
        elementId: currentEle.id,
      }];
    } else {
      params.calendarList = quickQuerySelect.map(item => {
        return {
          field: item.mainColumnName || item.relationColumnName,
          value: searchVal,
          tableName: item.mainTableName || item.relationTableName,
          elementId: item.id,
        };
      });
    }
    const queryList = advancedQueryMap[currentTabId] || [];
    const globalMap = {}; // 面板过滤条件组合方式
    const globalQueryMap = {}; // 面板过滤条件 asql 方式
    queryList.forEach(item => {
      const { asqlValueType, asqlValue, queryType, apiSql } = item;
      if (queryType === 1) {
        // 值类型为【变量】时，需要将变量对应的值传给后台
        if (asqlValueType === 2) {
          // @@BusinessID 取左侧树的主业务数据（因为左侧树无法配置）
          if (asqlValue === '@@BusinessID') {
          } else {
            // 当前时间、当前用户
            const globalVar = getValueFromGlobalVariables({
              globalVar: asqlValue,
              userInfo,
            }) || this.getFilterData(asqlValue);
            globalMap[item.asqlValue] = globalVar;
          }
        }
      } else if (queryType === 2) {
        if (!apiSql) return;
        const varNameList = matchGlobalVars(apiSql);
        varNameList.forEach(varName => {
            if (varName === '@@BusinessID') {
            } else {
              // 当前时间、当前用户
              let globalVar = getValueFromGlobalVariables({
                globalVar: varName,
                userInfo,
                globalMapType: 'globalMapType',
              }) || this.getFilterData(varName, 'obj');
              globalQueryMap[varName] = globalVar;
            }
          }
          ,
        );
      }
    });
    params.globalMap = globalMap;
    params.globalQueryMap = globalQueryMap;
    params.seniorFilterMap = seniorFilter;

    function createObjectURL(object) {
      return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
    }

    let that = this;

    let xhr = new XMLHttpRequest();
    let formData = new FormData();
    formData.append('calendarList', JSON.stringify(params.calendarList));
    formData.append('tabSource', params.tabSource);
    formData.append('elementList', JSON.stringify(params.elementList));
    formData.append('tabId', params.tabId);
    xhr.open('POST', query.FULL_EXPORT_ALL_TO_EXCEL, true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('token', userInfo.token);
    xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');
    xhr.onload = function(e) {
      if (this.status === 200) {
        var blob = this.response;
        var filename = functionData.name + '.xls';
        if (window.navigator.msSaveOrOpenBlob) {
          navigator.msSaveBlob(blob, filename);
          navigator.msSaveBlob(blob);
        } else {
          var a = document.createElement('a');
          var url = createObjectURL(blob);
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          that.setState({
            downLoadLoading: false,
          });
        }
      } else {
        that.setState({
          downLoadLoading: false,
        });
      }
    };
    xhr.send(JSON.stringify(params));
  };
  // 导出全部
  handleExport = (btn) => {
    const { tabInfo, userInfo, elementMap, treeNodeData = {}, advancedQueryMap } = this.props;
    const { calendarList = [] } = this.state;
    const tabId = tabInfo.id;
    const elementList = elementMap[tabId].filter((item) => {
      return !(BTN_ELEMENT_TYPE.concat([14]).includes(item.basetype));
    }).map(item => {
      let obj = {
        name: item.relationColumnName,
        baseType: item.basetype,
        mainColumnName: item.mainColumnName,
        mainTableName: item.mainTableName,
        elementId: item.id,
        displayName: item.displayName,
        visiabled: item.visiabled,
        relationColumnName: item.relationColumnName,
        relationTableName: item.relationTableName,
        elementMultiRelation: item.elementMultiRelation,
      };
      if (item.basetype === 9) {
        obj = {
          ...obj,
          relationColumnType: item.relationColumnType,
          elementFormat: item.elementFormat,
        };
      }
      return obj;
    });
    if (!elementList || !elementList.length) return;
    const queryList = advancedQueryMap[tabId] || [];
    const globalMap = {};
    const globalQueryMap = {};
    // 将过滤条件中的全局变量赋值
    queryList.forEach(item => {
      const { asqlValueType, asqlValue, queryType, basetype, apiSql } = item;
      // 面板过滤条件为组合条件方式
      if (queryType === 1 && basetype === 1) {
        // 值类型为【变量】时，需要将变量对应的值传给后台
        if (asqlValueType === 2 || isGlobalOrCustomVar(asqlValue)) {
          globalMap[item.asqlValue] = this.getGlobalVarValues({ varName: asqlValue });
        }
      } else if (queryType === 2 && basetype === 2) { // SQL过滤条件方式
        const varArr = matchGlobalVars(apiSql);
        varArr.forEach(varName => {
          globalQueryMap[varName] = this.getGlobalVarValues({ varName, globalMapType: 'globalQueryMap' });
        });
      }
    });
    const params = {
      tabSource: tabInfo.relationTableName,
      elementList,
      tabId,
      calendarList,
      globalMap,
      globalQueryMap,
    };
    if (tabInfo.showType === 4) {
      params.seniorFilterMap = {
        [tabInfo.relationColumn]: {
          static_connector: 3,
          static_type: 2,
          static_value: JSON.parse(treeNodeData.id),
        },
      };
    }
    this.setBtnLoading(btn, true);
    const that = this;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', query.FULL_EXPORT_ALL_TO_EXCEL, true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('token', userInfo.token);
    xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');
    xhr.onload = function(e) {
      if (this.status === 200) {
        var blob = this.response;
        var filename = tabInfo.name + '.xls';
        if (window.navigator.msSaveOrOpenBlob) {
          navigator.msSaveBlob(blob, filename);
          navigator.msSaveBlob(blob);
        } else {
          var a = document.createElement('a');
          var url = createObjectURL(blob);
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          that.setBtnLoading(btn, false);
        }
      } else {
        that.setBtnLoading(btn, false);
      }
    };
    xhr.send(JSON.stringify(params));
  };
  // http触发器
  doHttpRequest = (btn) => {
    const { id: btnId } = btn;
    const { langLib } = this.context;
    const { triggerMap } = this.props;
    const curEleTrigger = triggerMap[btnId] || [];
    const triggers = curEleTrigger.filter(item => item.triggerType === 5) || [];
    if (!triggers.length) {
      this.doBtnRefresh(btn);
      return;
    }
    const globalMap = {};
    const triggerIdsArr = [];
    triggers.forEach(trigger => {
      triggerIdsArr.push(trigger.id);
      const { httpRequestList = [] } = trigger;
      httpRequestList.forEach(httpRequest => {
        const { paramValue } = httpRequest;
        if (isGlobalOrCustomVar(paramValue)) {
          globalMap[paramValue] = this.getGlobalVarValues({ varName: paramValue });
        }
      });
    });
    const triggerIds = triggerIdsArr.join(',');
    this.setBtnLoading(btn, true);
    httpRequest({ triggerIds, globalMap }).then(res => {
      CMessage(langLib['message.check.success']);
      this.setBtnLoading(btn, false);
      this.doBtnRefresh(btn);
    }, err => this.setBtnLoading(btn, false));
  };
  // 按钮的刷新逻辑
  doBtnRefresh = (btn) => {
    const { fromType, afterSave } = this.props;
    const { basetype, elementFormat } = btn;
    if (BTN_ELEMENT_TYPE.includes(basetype) && basetype !== 30) { // 除导出按钮外其他按钮
      if (elementFormat === 1) { // 刷新本面板
        this.doFetchPageData();
      } else if (elementFormat === 2 && fromType === 'inPopup') { // 关闭本面板并刷新上一个面板
        afterSave && afterSave(true);
      } else if (elementFormat === 3) { // 刷新框架
        this.doRefreshFrame();
      }
    }
  };
  // 刷新框架
  doRefreshFrame = () => {
    const { tabs } = this.props;
    const { activeTabKey: tabKey } = tabs;
    const setRefresh = isRefreshing => {
      this.context.dispatch({
        type: 'tabs/updateTabInfo',
        payload: {
          tabKey,
          isRefreshing,
        },
      });
    };
    setRefresh(true);
    setTimeout(() => setRefresh(false), 0);

  };
  // 工单展望生成
  handleCreate = (btn) => {
    // const { elementMap } = this.props;
    // const data = elementMap[btn.relationTabId];
    // let basetypeNum = 0;
    // data.forEach(item => {
    //   if (item.basetype === 9 && typeof id !== 'string') {
    //     basetypeNum += 1;
    //   };
    // });
    // if (basetypeNum === 0) {
    //   CMessage('配置生成展望按钮开始时间和结束时间', 'error');
    //   return;
    // }
    // const time = [
    //   // {
    //   //   id: 'outlookStartDay',
    //   //   displayName: '计划开始时间',
    //   //   visiabled: 1,
    //   //   basetype: 9,
    //   //   relationColumnName: 'outlookStartDay',
    //   //   requisite: 1,
    //   // },
    //   {
    //     id: 'outlookEndDay',
    //     displayName: '计划结束时间',
    //     visiabled: 1,
    //     basetype: 9,
    //     relationColumnName: 'outlookEndDay',
    //     requisite: 1,
    //   },
    // ];
    // data &&
    //   !data.some(item => item.id === 'outlookStartDay') &&
    //   !data.some(item => item.id === 'outlookEndDay') &&
    //   data.unshift(...time);
    this.setPopupTabInfo({ eleObj: btn });
  };
  // 点击新增
  handleAdd = (btn) => {
    this.setPopupTabInfo({ eleObj: btn });
  };
  // 点击编辑
  handleEdit = btn => {
    const { listSelectedRows } = this.state;
    const { langLib } = this.context;
    const selectedLen = listSelectedRows.length;
    if (!selectedLen) { // 未选择数据
      CMessage(langLib['message.error.noSelected'], 'error');
      return;
    } else if (selectedLen > 1) { // 选了多条
      CMessage(langLib['message.error.onlyOne'], 'error');
      return;
    }
    this.setPopupTabInfo({
      eleObj: btn,
      listRowData: listSelectedRows[0],
    });
  };
  // 删除选中的数据（列表）
  handleDel = (btn) => {
    const { relationTableName: tableName } = btn;
    const { listSelectedRows, listDataObj } = this.state;
    let { total, pageNum, pageSize } = listDataObj;
    const { langLib } = this.context;
    const ids = listSelectedRows.map(item => item.id && item.id.id);
    if (!listSelectedRows.length) { // 未选择数据
      CMessage(langLib['message.error.noSelected'], 'error');
      return;
    } else if (!ids.length) { // 列表未配置id
      CMessage(langLib['message.error.noId'], 'error');
      return;
    }
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      onOk: () => {
        batchDeletePageData({ tableName, ids: ids.join(',') }).then(res => {
          CMessage(langLib['message.del.success']);
          if ((pageNum - 1) * pageSize === (total - listSelectedRows.length) && pageNum !== 1) {
            pageNum = pageNum - 1;
          }
          this.setState({
            listSelectedRows: [],
            listQueryParams: {
              pageNum: pageNum,
              pageSize: pageSize,
            },
          });
          this.doHttpRequest(btn);
          this.fetchListData({});
          closeModal();
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // Modal.confirm({
    //   className: 'customConfirmColor',
    //   ...getDefaultConfirmProps(langLib),
    //   onOk: () => {
    //     return batchDeletePageData({ tableName, ids: ids.join(',') }).then(res => {
    //       CMessage(langLib['message.del.success']);
    //       this.setState({ listSelectedRows: [] });
    //       this.doHttpRequest(btn);
    //       this.fetchListData({});
    //     });
    //   },
    // });
  };
  // 归档按钮
  handleArchive = (btn) => {
    const { formData = {}, listSelectedRows, elementMap } = this.state;
    const { langLib } = this.context;
    const { prevTabInfo, tabInfo, triggerMap, prevTabData, userInfo, treeNodeData = {}, prevSelectedRows } = this.props;
    let id = formData.id, ids = ''; // 表单取id
    let selectedRows = tabInfo.showType === 1 ? listSelectedRows : prevSelectedRows;
    if (tabInfo !== 1) { // 非表单取列表选中数据
      const selectedLen = selectedRows.length;
      if (!selectedLen) {
        CMessage(langLib['message.error.noSelected'], 'error');
        return;
      } else if ((selectedLen > 1 && tabInfo.basetype === 26) || (selectedLen > 1 && tabInfo.basetype === 28)) {
        CMessage(langLib['message.error.onlyOne'], 'error');
        return;
      } else {
        const idObj = selectedRows[0].id || {};
        id = idObj.id || '';
        const idList = prevSelectedRows.filter(item => item.id).map(item => item.id.id) || [];
        ids = idList.join(',');
      }
    }
    const { relationTableName: static_tableName, id: btnId, basetype } = btn;
    const triggers = triggerMap[btnId] || [];
    const static_triggerIds = triggers.filter(item => item.triggerType === 2).map(item => item.id).join(',');
    const static_globalMap = getTriggerMapFromEle({
      curEle: btn,
      curEleTriggerList: triggers,
      prevTabEleList: elementMap[prevTabInfo.id],
      prevTabData,
      userInfo,
      treeNodeData,
      curTabEleList: elementMap[tabInfo.id],
      curTabData: tabInfo.showType === 2 ? formData : listSelectedRows[0],
    });
    const params = {
      static_tableName,
      static_triggerIds,
      static_globalMap,
    };
    if (basetype === 26 || basetype === 28) {
      params.id = id;
    } else {
      params.ids = ids;
    }
    let api = null;
    switch (basetype) {
      case 26:
        api = doArchiveCycle;
        break;
      case 28:
        api = doArchiveNormal;
        break;
      case 34:
        api = doBatchArchiveCycle;
        break;
      case 35:
        api = doBatchArchiveNormal;
        break;
      default:
        api = doArchiveCycle;
        break;
    }
    this.setBtnLoading(btn, true);
    api(params).then(res => {
      CMessage(langLib['message.check.success']);
      this.doHttpRequest(btn);
      this.setBtnLoading(btn, false);
    }, err => this.setBtnLoading(btn, false));
  };
  // 普通按钮
  handleNormalBtn = (btn) => {
    const { id: btnId, relationTabId, url, jumpFunctionId } = btn;
    const { langLib } = this.context;
    const { formData, elementMap, listSelectedRows } = this.state;
    const { triggerMap, prevTabInfo, tabInfo, prevTabData, userInfo, treeNodeData = {}, tabList, fromType, afterSave } = this.props;
    const curEleTrigger = triggerMap[btnId] || [];
    const getIds = type => curEleTrigger.filter(item => item.triggerType === type).map(item => item.id).join(',');
    const static_globalMap = getTriggerMapFromEle({
      curEle: btn,
      curEleTriggerList: triggerMap[btnId],
      prevTabEleList: elementMap[prevTabInfo.id],
      prevTabData,
      userInfo,
      treeNodeData,
      curTabEleList: elementMap[tabInfo.id],
      globalIds: tabInfo.showType === 1 ? listSelectedRows.map(item => item.id.id).join(',') : this.getPrevSelectedRowIds1(),
      curTabData: tabInfo.showType === 2 ? formData : listSelectedRows[0],
    });
    const params = {
      static_globalMap,
      static_triggerIds: getIds(2),
      static_procedure_triggerids: getIds(3),
    };
    // 跳转url
    if (url) {
      this.linkToUrl(btn, url);
    }
    if (jumpFunctionId) {
      if (fromType === 'inPopup') {
        // 弹出面板内的保存按钮，点击后统一关闭弹框，且重新刷新上一个面板的数据
        afterSave && afterSave(true);
      }
      setTimeout(() => {
        this.jumpMenu(btn);
      }, 0);
    }
    ;
    if (relationTabId) { // 弹出面板
      this.doBtnRefresh(btn);
      this.setPopupTabInfo({
        eleObj: btn,
        listRowData: tabInfo.showType === 2 ? formData : listSelectedRows[0],
      });
      return;
    }
    // 若普通按钮弹出的是批量面板，需要选择数据才可进行
    const relationTabInfo = tabList.find(item => item.id === relationTabId) || {};
    if (relationTabInfo.showType === 6 && !this.getPrevSelectedRowIds()) {
      return false;
    }
    const { static_triggerIds, static_procedure_triggerids } = params;
    if (!static_triggerIds && !static_procedure_triggerids) { // 后台触发器
      this.doHttpRequest(btn);
      return;
    }
    this.setBtnLoading(btn, true);
    insertOrUpdateByTriggers(params).then(res => {
      CMessage(langLib['message.check.success']);
      this.doHttpRequest(btn);
      this.setBtnLoading(btn, false);
    }, err => this.setBtnLoading(btn, false));
  };
  // 整合数据
  getSeniorFilter = (reqParams) => {
    const { outlookEndDay, seniorFilterMap } = reqParams;
    const { tabInfo, elementMap, prevTabInfo } = this.props;
    let elementList = elementMap[prevTabInfo.id] || [];
    let data = {
      ...seniorFilterMap,
    };
    elementList.forEach(item => {
      const { relationColumnName, basetype, relationColumnType } = item;
      if (basetype === 9) {
        if (relationColumnName.indexOf('plannedstartdate') !== -1) {
          data[relationColumnName] = {
            static_type: relationColumnType,
            static_value: ',' + outlookEndDay,
            static_connector: 7,
          };
        }
      }
    });
    return data;
  };
  /**
   * 生成展望数据整合
   * @param {object} 控件数据
   * @param {string}
   */
  getSeniorFilterMap = (values, filterEles, reqParams) => {
    let data = {};
    filterEles.forEach(item => {
      const { relationColumnName, basetype, relationColumnType, id, relationTableName } = item;
      if (basetype === 9 && relationColumnName === 'plannedstartdate') {
        reqParams.outlookEndDay = values[`${id}`];
        reqParams.tabSource = relationTableName;
      } else if (basetype === 45) {
        if (values[`${id}`]) {
          data[relationColumnName] = {
            static_connector: 8,
            static_value: values[`${id}`],
            static_type: relationColumnType,
          };
        }
      } else {
        if (values[`${id}`] && basetype !== 9) {
          data[relationColumnName] = {
            static_connector: 3,
            static_value: values[`${id}`],
            static_type: relationColumnType,
          };
        }
      }
    });
    reqParams.seniorFilterMap = data;
    return reqParams;
  };
  // 点击保存按钮
  /**
   * @param {object} btn  当前按钮控件
   * @param {string} saveType 保存类型（normal-普通保存  batch-批量保存）
   */
  handleSave = (btn, saveType = 'normal') => {
    const { langLib } = this.context;
    const { originNode } = this.state;
    const { fromType, afterSave, prevSelectedRows, prevEleObj, actionType, elementMap } = this.props;
    const { form } = this.detailFormRef.props;
    form && form.validateFieldsAndScroll((errs, values) => {
      if (errs) return;
      let params = {}, reqParams = {};
      if (prevEleObj.basetype !== 49) {
        // 整合参数
        params = this.resumeSaveParams(values, btn, prevEleObj);
        // 去除前端的隐藏表单项
        reqParams = filterHiddenFormData(params);
      }
      let saveApi = fromType === 'inPopup' ? insertOrUpdateRelationPageData : insertOrUpdatePageData;
      // 批量保存
      if (saveType === 'batch' || prevSelectedRows.length > 1) {
        delete reqParams.tabSource;
        const ids = this.getPrevSelectedRowIds();
        if (!ids) {
          CMessage(langLib['message.error.noData'], 'error');
          return;
        }
        reqParams = {
          ...reqParams,
          static_ids: ids,
          id: null,
        };
        saveApi = batchUpdate;
      }
      // 由新增按钮弹出的面板中的保存按钮，一律不传id或批量修改逻辑
      if (prevEleObj.basetype === 4) {
        reqParams = {
          ...reqParams,
          id: null,
          static_ids: null,
        };
      }
      if (prevEleObj.basetype === 49) {
        let relationTab = elementMap[prevEleObj.relationTabId].filter(item => item.visiabled);
        reqParams = this.getSeniorFilterMap(values, relationTab, reqParams);
        saveApi = insertCreateOutlook;
      }
      this.setBtnLoading(btn, true);
      saveApi(reqParams).then(res => {
        if (prevEleObj.basetype === 49) {
          CMessage(langLib['message.save.generate']);
        } else {
          CMessage(langLib['message.save.success']);
        }
        // this.setBtnLoading(btn, false);
        this.detailFormRef && this.detailFormRef.props.form.resetFields();
        if (fromType === 'inPopup') {
          // 弹出面板内的保存按钮，点击后统一关闭弹框，且重新刷新上一个面板的数据
          if (prevEleObj.basetype === 49) {
            let seniorFilter = this.getSeniorFilter(reqParams);
            afterSave && afterSave(true, seniorFilter);
          } else {
            afterSave && afterSave(true);
          }
        } else {
          if (actionType === 'addChild') { // 新增子级时，因保存后刷新的是父层数据，故只做清空
            this.setState({ formData: {} });
            const textEditor = this.detailFormRef && this.detailFormRef.textEditorRef;
            textEditor && textEditor.clearContent();
          } else {
            this.doFetchPageData();
          }
          // 非弹出面板的需要手动清除数据且刷新树
          this.setState({ relationFileObj: {} }); // 清空文件缓存
          this.props.doFetchTree(false);
          this.setBtnLoading(btn, false);
        }
        this.doHttpRequest(btn);
      }, err => this.setBtnLoading(btn, false));
    });
  };
  // 保存前对额外参数整合
  resumeSaveParams = (values, btn, prevEleObj) => {
    const { relationTableName, id: btnId } = btn;
    const { formData, relationFileObj = {}, elementMap, listSelectedRows, listQueryParams } = this.state;
    const { treeNodeData = {}, tabInfo, actionType, triggerMap, frameData = {}, prevTabInfo = {}, tabList = {}, prevTabData, fromType, userInfo } = this.props;
    const { datasource1 = '', datasource2 = '', groupColumn } = frameData;
    const formValues = {};
    const elementList = elementMap[tabInfo.id] || [];
    Object.keys(values).forEach(key => {
      const eleObj = elementList.find(item => `${item.id}` === key);
      if (!eleObj) return;
      const { relationColumnName, basetype } = eleObj;
      let keyValue = values[key] || '';
      if (basetype === 39 && keyValue && keyValue.editorState) {
        keyValue = keyValue.editorState.toHTML();
      }
      if (
        (key.indexOf(IGNORE_FORM_ITEM) !== -1) || // 去除有隐藏项的显示项名称
        (NO_SUBMIT_ELEMENT_TYPE.includes(eleObj.basetype)) || // 去除有隐藏项的显示项名称
        (!relationColumnName) // 没有业务表字段的不提交
      ) return;
      // 空值转换
      formValues[eleObj.relationColumnName] = resetDefaultValue(eleObj, keyValue, false);
    });
    const static_globalMap = getTriggerMapFromEle({
      curEle: btn,
      curEleTriggerList: triggerMap[btnId],
      prevTabEleList: elementMap[prevTabInfo.id],
      prevTabData,
      userInfo,
      treeNodeData,
      curTabEleList: elementMap[tabInfo.id],
      curTabData: tabInfo.showType === 2 ? formData : listSelectedRows[0],
    });
    // 获取
    let params = {
      ...formValues,
      static_tableName: relationTableName,
      static_dataSource1: datasource1,
      static_dataSource2: datasource2,
      static_fileIds: relationFileObj,
      static_globalMap,
      tabSource: relationTableName,
    };
    const { isGroup, id: nodeId } = treeNodeData;
    // 有配置后台触发器
    const curEleTrigger = triggerMap[btnId] || [];
    params.static_triggerIds = curEleTrigger.filter(item => item.triggerType === 2).map(item => item.id).join(',');
    params.static_procedure_triggerids = curEleTrigger.filter(item => item.triggerType === 3).map(item => item.id).join(',');
    // 不是在弹出面板内的保存，即：
    // 对于树节点的保存
    if (fromType !== 'inPopup') {
      // 若没有rootid、groupid的值，则手动生成
      if (actionType === 'addGroup') { // 新增组
        params.rootid = nodeId;
      } else if (actionType === 'addChild') { // 新增组内
        const isMultiTable = !!datasource1 && !!datasource2;
        if (isGroup) { // 组下第一层元素
          if (isMultiTable) { // 多表时
            params = { ...params, [groupColumn]: nodeId, rootid: 0 };
          } else {
            params.rootid = nodeId;
          }
        } else { // 元素下的元素
          if (isMultiTable) { // 多表时
            params = { ...params, [groupColumn]: treeNodeData.groupId, rootid: nodeId };
          } else {
            params.rootid = nodeId;
          }
        }
      }
      // 若界面配置中有rootid和groupid，则取界面中的数据
      if (formValues.rootid) params.rootid = formValues.rootid;
      if (formValues[groupColumn]) params[groupColumn] = formValues[groupColumn];
    }
    // let stateEndTime = {};
    // if (prevEleObj.basetype === 49) {
    //   stateEndTime['startDay'] = params.outlookStartDay;
    //   stateEndTime['endDay'] = params.outlookEndDay;
    // }
    // if (stateEndTime) {
    //   this.setState({
    //     stateEndTime,
    //   }, () => {
    //     return params;
    //   });
    // } else {
    //   return params;
    // }
    return params;
  };
  // 普通按钮校验批量保存
  getPrevSelectedRowIds1 = () => {
    const { prevSelectedRows } = this.props;
    const idList = prevSelectedRows.filter(item => item.id).map(item => item.id.id) || [];
    return idList.join(',');
  };
  // 校验批量保存
  getPrevSelectedRowIds = () => {
    const { prevSelectedRows } = this.props;
    const { langLib } = this.context;
    // 未选择数据
    if (!prevSelectedRows.length) {
      CMessage(langLib['message.error.noData'], 'error');
      return false;
    }
    const idList = prevSelectedRows.filter(item => item.id).map(item => item.id.id) || [];
    if (!idList.length) { // 列表项未配置id
      CMessage(langLib['message.error.noId'], 'error');
      return false;
    }
    return idList.join(',');
  };
  // 更新配置的按钮loading状态
  setBtnLoading = (btn, loading) => {
    const { elementMap } = this.state;
    const { tabInfo } = this.props;
    const tabId = tabInfo.id;
    const elementList = elementMap[tabInfo.id] || [];
    const newElementList = [...elementList];
    const btnIndex = newElementList.findIndex(item => item.id === btn.id);
    newElementList.splice(btnIndex, 1, {
      ...btn,
      static_loading: loading,
    });
    this.setState({
      elementMap: {
        ...elementMap,
        [tabId]: newElementList,
      },
    });
  };
  // 更新主区块loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
        [type]: loading,
      },
    });
  };
  // 筛选出tab头信息
  filterTabNameList = () => {
    const { matchTabList } = this.props;
    return matchTabList.map(tab => ({
      key: tab.id,
      tab: (
        <span title={tab.name}>
          {tab.name}
        </span>
      ),
    }));
  };
  // 切换面板
  handleChangeTab = (activeTabKey) => {
    const { matchTabList, setFrameState, fetchPageData, form, actionType } = this.props;
    const tabInfo = matchTabList.find(item => item.id === +activeTabKey) || {};
    // form.resetFields();
    this.setState({
      listData: [],
      formData: {},
      prevTabInfo: {},
      listRowData: {},
      listSelectedRows: [],
      relationFileObj: {},
    });
    setFrameState({
      tabInfo,
      // form,
    }, () => {
      // !(actionType === 'addGroup' || actionType === 'addChild') && this.doFetchPageData();
    });
  };
  /**
   * 设置弹出面板信息
   * @param {object} eleObj 控件信息
   * @param {object} listRowData 行数据(若是表单，则取表单数据作为行数据)
   * @param {string} tabIdKey 面板id参数名（relationTabId-关联弹出面板、selectListTabId-数据选择框的弹出列表）
   */
  setPopupTabInfo = ({
                       eleObj,
                       listRowData = {},
                       tabIdKey = 'relationTabId',
                       handleSetCustomSelectList,
                       otherParamsInCustomList,
                     }) => {
    const { tabList, fromType } = this.props;
    const { jumpType } = eleObj;
    if (jumpType === 3) { // 不执行任何逻辑
      return;
    } else if (jumpType === 2) { // 跳转菜单
      // 将带a的key转换成正常的
      this.multiJumpBtn(eleObj, listRowData);
      return;
    }
    const popupTabInfo = tabList.find(item => item.id === eleObj[tabIdKey]);
    if (!popupTabInfo) return;

    const unSetData = {
      popupTabInfo,
      listRowData,
      visiblePopup: true,
      triggerPopupEle: eleObj,
      handleSetCustomSelectList,
      otherParamsInCustomList,
    };
    if (fromType === 'normal') unSetData.mainListRowData = listRowData;
    this.setState(unSetData);
  };
  // 关闭弹出面板
  handleCancelModal = (needReFetch = false, filter = false) => {
    let { seniorFilter } = this.state;
    let params = {
      visiblePopup: false,
      popupTabInfo: {},
      listSelectedRows: [],
      listQueryParams: initQueryParams,
    };
    if (filter) {
      seniorFilter = {
        // ...seniorFilter,
        ...filter,
      };
      params.seniorFilter = seniorFilter;
    }
    this.setState(params, () => {
      // @TODO: 切换页面后需要保存页码的数据，否则每次关闭弹框都重新获取第一页
      needReFetch && this.doFetchPageData();
    });
  };
  setContainerState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  };
  // 多面板跳转
  multiTabBtn = (btn, record) => {
    const { tabInfo, elementMap } = this.props;
    const { jumpMenuList = [] } = btn;
    if (!jumpMenuList) return;
    let elementList = elementMap[tabInfo.id] || [];
    for (let i = 0; i < jumpMenuList.length; i++) {
      let condition = jumpMenuList[i];
      const { preconditions } = condition;
      let normalArr = jsonParse(preconditions, 'array') || [];
      let newCondition = reducerVariableToArray(normalArr, record, elementList, 'tree');
      if (multiDataComparison(newCondition)) {
        const { jumpTabId } = condition;
        let eleObj = { relationTabId: jumpTabId };
        this.setPopupTabInfo({
          eleObj,
          listRowData: record,
          tabIdKey: 'relationTabId',
        });
        return;
      }
    }
  };
  // 多菜单跳转
  multiJumpBtn = (btn, record) => {
    const { tabInfo, elementMap } = this.props;
    const { jumpMenuList = [] } = btn;
    if (!jumpMenuList) return;
    let elementList = elementMap[tabInfo.id] || [];
    for (let i = 0; i < jumpMenuList.length; i++) {
      let condition = jumpMenuList[i];
      const { preconditions } = condition;
      let normalArr = jsonParse(preconditions, 'array') || [];
      let newCondition = reducerVariableToArray(normalArr, record, elementList, 'tree');
      if (multiDataComparison(newCondition)) {
        this.multiJumpToFile(condition, record);
        return;
      }
    }
  };
  // 跳转菜单的时候逻辑处理
  multiJumpToFile = (condition, record) => {
    const { tabInfo, elementMap, user, userInfo, functionData, tabs } = this.props;
    const { passParam, jumpFunctionId } = condition;
    const { langLib } = this.context;
    if (!jumpFunctionId) return;
    let result = controlAuthority(user.functionList, jumpFunctionId);
    if (!result.length) {
      CMessage(langLib['message.warn.nopromiss'], 'error');
      return;
    }
    let data = JSON.parse(JSON.stringify(record)); // 判断数据源来自表单中的还是列表
    let passParams = jsonParse(passParam, 'array') || [];
    const elementList = elementMap[tabInfo.id] || [];
    const fileData = returnJumpMenuData(functionData.id, data, elementList, passParams, userInfo, getValueFromGlobalVariables, tabInfo.showType === 2 ? 1 : '');
    const { tabKey, comKey, title } = getFunctionComDetail(result[0]);
    this.jumpFile(tabKey, comKey, title, fileData, result);
  };
  // 菜单跳转过去，把有存在的菜单先关闭再打开
  jumpFile = (tabKey, comKey, title, fileData, result) => {
    const { tabs, afterSave } = this.props;
    if (!tabKey) return;
    if (afterSave) afterSave(false);
    const { dispatch } = this.context;
    jumpFileOfCommon({ tabKey, comKey, title, tabs, fileData, functionData: result[0], dispatch });
  };
  // 获取面板内容
  getTabContent = (isSingleTab = false) => {
    const { externalParameters, stepList, mainListData, loadingStatus, formData, listDataObj, listDataArr, listQueryParams, tabDropDownData = {}, listSelectedRows, originFormData, relationFileObj, elementMap = {}, seniorFilter, stateEndTime } = this.state;
    const { form, actionType, tabData = {}, advancedQueryMap, tabInfo = {}, triggerMap, originElementMap, treeNodeData = {}, tabList, originTabData, prevTabInfo = {}, prevTabData = [], filterMap, functionData, userInfo, afterSave, setPrevContainerState, prevEleObj, handleSetPrevCustomSelectList, matchTabList, otherParamsInCustomList } = this.props;
    if (JSON.stringify(elementMap) === '{}') return;
    // 单个面板
    const renderTabItem = (tabItem) => {
      const { showType, id: tabId, basetype: tabType, name, jumpUrl } = tabItem;
      const elementList = (tabId ? elementMap[tabId] : []) || [];
      const hasSearchQuery = elementList.filter(item => item.quickQuery).length;
      const contentCls = classNames({
        [styles.contentWrap]: true,
        [styles.listWrap]: showType === 1 || showType === 4 || showType === 5,
        [styles.formWrap]: showType === 2 || showType === 6,
        [styles.hasSearchQuery]: hasSearchQuery,
      });
      const publicProps = {
        setContainerState: this.setContainerState,
        setPopupTabInfo: this.setPopupTabInfo,
        getGlobalVarValues: this.getGlobalVarValues,
        jumpMenu: this.jumpMenu,
        tabInfo: tabItem,
        prevTabInfo,
        prevTabData,
        functionData,
        userInfo,
      };
      const footerBtnProps = {
        ...publicProps,
        // form,
        tabList,
        triggerMap,
        actionType,
        elementList,
        filterMap,
        handleClickBtn: this.handleClickBtn, // 点击弹出
      };
      const detailListProps = {
        ...publicProps,
        triggerMap,
        elementMap,
        treeNodeData,
        tabList,
        listQueryParams,
        listDataObj,
        fetchListData: this.fetchListData,
        setSelected: (listSelectedRows = {}) => this.setState({ listSelectedRows }),
        listSelectedRows,
        handleDeleteBtn: this.handleDel,
        selectType: otherParamsInCustomList && !otherParamsInCustomList.multiple ? 'radio' : 'checkbox',
        afterSave,
        setPrevContainerState,
        prevEleObj,
        tabDropDownData,
        handleSetPrevCustomSelectList,
        otherParamsInCustomList,
        multiJump: this.multiJumpBtn,
        // saveInListBtn: this.saveInList,
        multiTabJump: this.multiTabBtn,
      };
      const footerBtn = <ButtonLine {...footerBtnProps} />;
      // 列表
      const renderList = (
        <div key={tabId} className={contentCls}>
          {/* {showType !== 5 && footerBtn} */}
          <div className={styles.content}>
            <DetailList
              {...detailListProps}
              BtnLine={showType !== 5 && footerBtn || null}
            />
          </div>
          {/* {showType === 5 && footerBtn} */}
        </div>
      );
      // 表单
      const renderForm = (
        <div key={tabId} className={contentCls}>
          <div className={styles.content}>
            <Form>
              <DetailForm
                {...publicProps}
                // form={form}
                formData={formData}
                originFormData={originFormData}
                triggerMap={triggerMap}
                filterMap={filterMap}
                elementMap={elementMap}
                originElementMap={originElementMap}
                treeNodeData={treeNodeData}
                tabData={tabData}
                tabList={tabList}
                advancedQueryMap={advancedQueryMap}
                originTabData={originTabData}
                tabDropDownData={tabDropDownData}
                relationFileObj={relationFileObj}
                wrappedComponentRef={form => this.detailFormRef = form}
                stepList={stepList}
              />
            </Form>
          </div>
          <ButtonLine {...footerBtnProps} fromType="form"/>
        </div>
      );
      if (tabInfo.basetype === 8) { // 资源管理主面板
        return (
          <MainTable
            {...footerBtnProps}
            loading={loadingStatus.mainList}
            mainListData={mainListData}
            elementMap={elementMap}
            allFooterBtnProps={footerBtnProps}
            fetchListData={this.fetchListData}
            listDataObj={listDataObj}
            prevEleObj={prevEleObj}
            listDataArr={listDataArr}
            listQueryParams={listQueryParams}
            setSelected={(listSelectedRows = {}) => this.setState({ listSelectedRows })}
            listSelectedRows={listSelectedRows}
            seniorFilter={seniorFilter}
            stateEndTime={stateEndTime}
          />
        );
      }
      if (showType === 1) { // 列表类型
        return renderList;
      } else if (showType === 2 || showType === 6) { // 表单类型、批量类型
        return renderForm;
      } else if (showType === 4) { // 业务关联面板(包含关联弹出面板)
        return (
          <div className={contentCls}>
            <RelationPopup
              detailListProps={detailListProps}
              advancedQueryMap={advancedQueryMap}
              footerBtnProps={footerBtnProps}
            />
          </div>
        );
      } else if (showType === 7) { // 关联文档
        return (
          <div className={contentCls}>
            <RelationFileTab
              wrappedComponentRef={ref => this.relationFileTabRef = ref}
              functionData={functionData}
              userInfo={userInfo}
            />
          </div>
        );
      } else if (showType === 11) {
        return (
          <div className={contentCls}>
            <iframe src={`${jumpUrl}?${qsStringify(externalParameters)}`}
                    frameBorder={0}
                    style={{ 'width': '100%', 'height': 'calc(100%)' }}/>
          </div>);
      }
    };
    // 弹出面板中只展示一个面板
    if (isSingleTab) {
      return renderTabItem(tabInfo);
    }
    return matchTabList.map(tabItem => {
      const { name, id } = tabItem;
      return (
        <TabPane tab={name} key={`${id}`}>
          {renderTabItem(tabItem)}
        </TabPane>
      );
    });
  };
  // 跳转菜单
  jumpMenu = (btn, record, type) => {
    const { tabInfo, elementMap, user, userInfo, functionData, tabs } = this.props;
    const { langLib } = this.context;
    const { basetype, jumpFunctionId, passParam } = btn;
    let result = controlAuthority(user.functionList, jumpFunctionId);
    if (!result.length) { // 如果在菜单中心没有找到对应的菜单，不允许跳转到对应的页面
      CMessage(langLib['message.warn.nopromiss'], 'error');
      return;
    }
    let fileData = {};
    let passParams = jsonParse(passParam, 'array') || [];
    if (basetype === 27) {
      const { userInfo, treeNodeData = {}, fromType, prevTabData, prevTabInfo, tabInfo } = this.props;
      passParams.forEach(item => {
        const { key, value, type } = item;
        if (isGlobalOrCustomVar(value)) { // 全局变量
          const globalVar = getValueFromGlobalVariables({
            globalVar: value,
            userInfo,
            treeNodeData,
            globalMapType: 'globalQueryMap',
            explorerMainListRow: record,
          });
          fileData[key] = globalVar;
        } else {
          fileData[key] = { value, type };
        }
      });
      fileData.jumpTag = functionData.id;
    } else {
      const { formData, elementMap, listSelectedRows } = this.state;
      let data = tabInfo.showType === 2 ? formData : listSelectedRows[0];
      const elementList = elementMap[tabInfo.id] || [];
      fileData = returnJumpMenuData(functionData.id, JSON.parse(JSON.stringify(data)), elementList, passParams, userInfo, getValueFromGlobalVariables, type);
    }
    const { tabKey, comKey, title } = getFunctionComDetail(result[0]);
    if (!tabKey) return;
    const { openedTabs } = tabs;
    let openedTab = openedTabs.find(item => {
      return item.tabKey === tabKey;
    });
    if (openedTab) { // 如果目标菜单已经存在，则关闭目标菜单再打开
      this.context.dispatch({
        type: 'tabs/removeTab',
        payload: {
          tabKey,
        },
      });
      // 若有对应绑定model数据，则清空model里的状态数据
      const comName = tabKey.split('_')[0];
      const modelName = NEED_CLEAR_SATATE_TABS[comName];
      modelName && this.context.dispatch({
        type: `${modelName}/clearState`,
      });
      setTimeout(() => {
        this.context.dispatch({
          type: 'tabs/addTab',
          payload: {
            tabKey,
            comKey,
            title,
            fileData,
            functionData: result[0],
          },
        });
      }, 0);
    } else {
      this.context.dispatch({
        type: 'tabs/addTab',
        payload: {
          tabKey,
          comKey,
          title,
          fileData,
          functionData: result[0],
        },
      });
    }
  };

  render() {
    const { otherParamsInCustomList, loadingStatus, visiblePopup, popupTabInfo = {}, listRowData = {}, formData = {}, triggerPopupEle, listSelectedRows, handleSetCustomSelectList, mainListRowData } = this.state;
    const { loading, tabInfo = {}, fromType, prevEleObj } = this.props;
    const { showType } = tabInfo;
    const tabCls = classNames({
      'custom-pageConfig-tabs': true,
      [styles.tabWrap]: true,
    });
    const asMainRow = !mainListRowData || JSON.stringify(mainListRowData) === '{}' ? this.props.mainListRowData : mainListRowData;
    return (
      <div className={styles.wrap}>
        <CSpin spinning={loadingStatus.data}>
          {this.getTabContent(true)}
        </CSpin>
        <CreateModal
          visible={visiblePopup}
          title={popupTabInfo.name}
          className={styles.modal}
          // onOk={() => this.handleSave(popupBtn)}
          onCancel={() => this.handleCancelModal(false)}
          footer={null}
          size="large"
          // key={new Date().getTime()}
        >
          <ContentContainer
            {...this.props}
            mainListRowData={asMainRow}
            tabInfo={popupTabInfo}
            prevTabData={showType === 2 ? formData : listRowData}
            prevTabInfo={tabInfo}
            prevEleObj={triggerPopupEle}
            prevSelectedRows={listSelectedRows}
            // prevTabData={listRowData || formData}
            afterSave={this.handleCancelModal}
            setPrevContainerState={this.setContainerState}
            handleSetPrevCustomSelectList={handleSetCustomSelectList}
            otherParamsInCustomList={otherParamsInCustomList}
            fromType="inPopup"
          />
        </CreateModal>
      </div>
    );
  }
}

export default ContentContainer;
