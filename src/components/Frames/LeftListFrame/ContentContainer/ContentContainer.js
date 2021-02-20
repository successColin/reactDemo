/*
 * @Author: Fus
 * @Date:   2019-08-27 15:43:12
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2021-01-06 16:44:47
 * @Desc: 框架主体内容（左侧树框架）
 */
import React, { Component, Fragment } from 'react';
import { Card, Form, message } from 'antd';
import classNames from 'classnames';
import qsStringify from 'qs-stringify';
import { CMessage, CSpin } from '@/components/common/BasicWidgets';
import DetailForm from './DetailForm/DetailForm';
import DetailList from './DetailList/DetailList';
import RelationPopupList from './PopupList/PopupList';
import FooterButton from './FooterButton/FooterButton';
import MixedPanel from './MixedPanel/MixedPanel';
import { BaseContext, NEED_CLEAR_SATATE_TABS } from '@/constants/global';
import styles from './ContentContainer.less';
import {
  doArchiveCycle,
  getPageSelectOptions,
  doArchiveNormal,
  httpRequest, getNormalSearchDetail,
  doBatchArchiveCycle,
  getCheckBoxSearchDetail,
  doBatchArchiveNormal,
} from '@/services/frame';
import ListBtn from './ListBottom/FooterButton';
import {
  getList,
  getFormDetial,
  handleSave,
  delList,
  del,
  normalButton,
  leftListBatchUpdate,
  filedRelationInsert,
} from '@/services/leftListFrame';
import {
  filterHiddenFormData,
  getDefaultConfirmProps,
  getValueFromGlobalVariables,
  jsonParse,
  validTriggerMatch,
  isGlobalOrCustomVar,
  matchGlobalVars,
  matchGlobalFunctionParam,
  parseDecimal,
  controlAuthority,
  getFunctionComDetail,
  reducerVariableToArray, multiDataComparison, jumpFileOfCommon, validMatchMultiTrigger, compoundArithmetic,
} from '@/utils/common';
import {
  BTN_ELEMENT_TYPE,
  FILTER_ELEMENT_TYPE,
  NO_SUBMIT_ELEMENT_TYPE,
  SEARCH_SELECT_TYPE,
  TIME_DEFAULT_VALUES,
  HIDE_IN_LIST_ELEMENT_TYPE, IGNORE_FORM_ITEM,
} from '@/constants/element';
import RenderModal from './renderModal/renderModal';
import {
  reducePopData,
  reducePopData1,
  isJsonString,
  timeDiff,
  arrayClassify,
  reduceArrObj,
  JumpFileDate, reducePopData2,
  getDefaultValueFromCurrentTab,
} from '../method';
import query from '@/constants/query';
import RelationFileTab from '@/components/common/RelationFileTab/RelationFileTab';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const initQueryParams = {
  pageNum: 1,
  pageSize: 10,
};

class ContentContainer extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      tabInfo: this.props.tabInfo || {}, // 当前面板的信息
      tabList: [], // 所有面板的数据
      currentForm: {}, // 当前面板的数据
      elementMap: {}, // 所有的配置的元素
      triggerMap: {}, // 所有的触发器
      advancedQueryMap: {}, // 所有的过滤条件
      activeTreeNode: {}, // 左侧列表选中的数据
      loading: false,
      visible: false, // 弹框
      popupTabInfo: {}, // 弹出面板的数据
      isrelation: false, // 判断表单是否有过滤条件
      selectedListArr: [], //   记录选中列表的数据 .0+
      type: '', // 点击按钮的类型，add,新增
      tabDropDownData: [], // 下拉数据
      filesData: {}, // 图片上传的值
      calendarList: [], // 查找条件
      defaultData: {}, // 默认值
      stepList: [], // 步骤条
      externalParameters: {}, // 引入外部页面参数集合
      seniorFilter: {}, // 高级筛选条件
      fileRelationList: {}, // 上传文件
    };
  }

  componentDidMount() {
    this.props.fromType === 'relation' && this.getData();
  }


  async getData() {
    const { tabInfo, fromType, advancedQueryMap, elementMap, prevTabInfo, type, tabList, activeTreeNode, userInfo } = this.props;
    const { showType, id, fileRelationTableName, fileRelationParam, fileRelationColumnName, tableGroupName } = tabInfo;
    // 列表
    if (showType === 1 || showType === 4 || showType === 5) {
      this.getRelationList({});
      return;
    } else if (showType === 2) { // 表单
      const { originTabData, triggerMap, activeTreeNode, elementMap = {}, tabInfo = {}, formData, tabData = {}, setFrameState, isNew } = this.props;
      const tabInfoElememt = elementMap[tabInfo.id] || [];
      const { form } = this.detailFormRef.props;
      form && form.resetFields();
      let SubPanelList = tabInfoElememt.filter(item => item.basetype === 42) || [];
      for (let i = 0; i < SubPanelList.length; i++) {
        const { relationTabId } = SubPanelList[i];
        let TabInfo = !!relationTabId && tabList.find(item => item.id === relationTabId) || {};
        if (TabInfo.showType === 1) {
          this.getSubPanelData();
          return;
        }
        if (TabInfo.showType === 9) {

        }
      }

      let defaultValue = await this.getDefaultValueFromAllElements(tabInfoElememt);
      this.setState({
        defaultData: defaultValue,
      });
      if (fromType) {
        const filterIdData = advancedQueryMap[id].find(item => item.asqlColumnName === 'id');
        let isrelation = filterIdData ? true : false;
        if (type !== 'add') { // 判断是否是新增
          if (isrelation) {
            this.fetchFormData();
          } else {
            this.doCheckTrigger();
          }
        }
        const tabInfoId = tabInfo.id;
        this.props.setFrameState({
          tabData: {
            ...this.props.tabData,
            [tabInfoId]: {
              ...this.props.tabData[tabInfoId],
              ...defaultValue,
            },
          },
          originTabData: {
            ...this.props.originTabData,
            [tabInfoId]: {
              ...this.props.originTabData[tabInfoId],
              ...defaultValue,
            },
          },
        }, () => {
          this.doCheckTrigger();
          this.fetchTabDropDownData();
        });
      } else {
        this.fetchFormData();
      }
    } else if (showType === 6) {
      this.fetchTabDropDownData();
    } else if (showType === 7) { // 关联资料面板
      let leftListTabInfo = tabList.find(item => item.showType === 3);
      let idEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
      const relationId = getValueFromGlobalVariables({
        userInfo,
        treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
        globalVar: fileRelationParam,
      }) || this.getValueFromCurrentTabData(fileRelationParam, 'data');
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
    const { tabInfo: { id }, elementMap, tabList, userInfo, activeTreeNode } = this.props;
    const elementList = elementMap[id] || [];
    const paramElement = elementList.filter(item => !!item.parameter) || [];
    let externalParameters = {};
    let leftListTabInfo = tabList.find(item => item.showType === 3);
    let idEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
    paramElement.forEach(item => {
      const { defaultValue, parameter } = item;
      externalParameters[parameter] = getValueFromGlobalVariables({
        userInfo,
        treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
        globalVar: defaultValue,
      }) || this.getValueFromCurrentTabData(defaultValue, 'data') || defaultValue;
    });
    this.setState({ externalParameters });
  };

  // 获取子面板内容
  getSubPanelData = () => {
    this.fetchFormData();
  };
  // 获取子面板中列表的数据
  getSubPanelListData = ({ queryParams = initQueryParams, calendarList = [] }, type = 1) => {
    const { tabList, userInfo, elementMap, advancedQueryMap, activeTreeNode, tabInfo, prevListRowData, prevTabInfo, tabData } = this.props;
    const tabId = tabInfo.id;
    const { pageNum, pageSize } = queryParams;
    const leftListTabInfo = tabList.find(item => item.showType === 3);
    let elementObj = elementMap[leftListTabInfo.id];
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
    const tabInfoElememt = elementMap[tabId];
    let SubPanelList = tabInfoElememt.filter(item => item.basetype === 42) || [];
    let listTabInfo = null;
    for (let i = 0; i < SubPanelList.length; i++) {
      const { relationTabId } = SubPanelList[i];
      let TabInfo = !!relationTabId && tabList.find(item => item.id === relationTabId);
      // if (TabInfo.showType === 1) {
      listTabInfo = TabInfo;
      // }
    }
    if (!listTabInfo) return;
    const elementList = elementMap[listTabInfo.id].filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype)).map(item => {
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
    const globalMap = {}; // 面板组合条件
    const globalQueryMap = {}; // 面板过滤条件ASQL
    const queryList = advancedQueryMap[listTabInfo.id] || [];
    // 将过滤条件中的全局变量赋值
    queryList.forEach(item => {
      const { asqlValueType, asqlValue, queryType, apiSql } = item;
      if (queryType === 1) {
        // 值类型为【变量】时，需要将变量对应的值传给后台
        if (asqlValueType === 2) {
          // @@BusinessID 取左侧树的主业务数据（因为左侧树无法配置）
          if (asqlValue === '@@BusinessID') {
            globalMap[item.asqlValue] = JSON.parse(activeTreeNode[idEle.id]).name;
          } else {
            // 当前时间、当前用户
            let globalVar = getValueFromGlobalVariables({
              globalVar: asqlValue,
              userInfo,
            });
            if (!globalVar) {
              let data = tabData[tabId];
              let eleObj = tabInfoElememt.find(item => item.parameter === asqlValue);
              globalVar = eleObj ? JSON.parse(data[`a${eleObj.id}`]).id : '';
            }
            if (type === 9) {
              globalVar = reducePopData2(prevListRowData, prevTabInfo, tabInfo, elementMap, asqlValue, '');
            }
            // 或用户自定义的变量
            // (在关联新增按钮的弹出面板上，只有上一个面板为表单时，才可以获取自定义的变量)
            // （若上一个面板为列表，则无法定位到定义的变量具体哪条数据值）
            globalMap[item.asqlValue] = globalVar;
          }
        }
      } else if (queryType === 2) {
        if (!apiSql) return;
        const varNameList = matchGlobalVars(apiSql);
        varNameList.forEach(varName => {
            if (varName === '@@BusinessID') {
              globalQueryMap[varName] = { value: JSON.parse(activeTreeNode[idEle.id]).name, type: 2 };
            } else {
              // 当前时间、当前用户
              let globalVar = getValueFromGlobalVariables({
                globalVar: varName,
                userInfo,
                globalMapType: 'globalMapType',
              });
              // 或用户自定义的变量
              // (在关联新增按钮的弹出面板上，只有上一个面板为表单时，才可以获取自定义的变量)
              // （若上一个面板为列表，则无法定位到定义的变量具体哪条数据值）
              if (globalVar.value) {
                globalQueryMap[varName] = globalVar;
              } else {
                globalVar = reducePopData1(prevListRowData, prevTabInfo, tabInfo, elementMap, varName) || {};
                if (JSON.stringify(globalVar) === '{}') return;
                const { data = '', currentEle = {} } = globalVar;
                const { relationColumnType } = currentEle;
                globalQueryMap[varName] = { value: data, type: relationColumnType };
              }
            }
          },
        );
      }
    });
    const params = {
      tabSource: listTabInfo.relationTableName,
      elementList,
      pageNum: type === 9 ? 1 : pageNum,
      pageSize: type === 9 ? 9999 : pageSize,
      globalMap,
      globalQueryMap,
      calendarList,
      tabId: listTabInfo.id,
    };
    getList(JSON.stringify(params)).then(res => {
      this.setState({
        [type === 9 ? 'stepList' : 'currentForm']: res,
      });
    }, err => this.setState({ loading: false }));
  };

  async getDefaultValue(callback) {
    const { originTabData, triggerMap, activeTreeNode, elementMap = {}, tabInfo = {}, formData, tabData = {}, setFrameState, isNew } = this.props;
    const tabInfoElememt = elementMap[tabInfo.id] || [];
    if (tabInfo.showType !== 2) return;
    let defaultValue = await this.getDefaultValueFromAllElements(tabInfoElememt);
    this.setState({
      defaultData: defaultValue,
    }, () => {
      if (callback) {
        callback(defaultValue);
      }
    });
  }

  // 获取列表数据
  getRelationList = ({ queryParams = initQueryParams, calendarList = [] }) => {
    console.log('fetch list');
    const { triggerMap, tabList, userInfo, elementMap, advancedQueryMap, activeTreeNode, tabInfo, prevListRowData, prevTabInfo, fromType } = this.props;
    const tabId = tabInfo.id;
    const showType = tabInfo.showType;
    const { pageNum, pageSize } = queryParams;
    const leftListTabInfo = tabList.find(item => item.showType === 3);
    let elementObj = elementMap[leftListTabInfo.id];
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
    const elementList = elementMap[tabId] && elementMap[tabId].filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype)).map(item => {
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
    const globalMap = {}; // 面板组合条件
    const globalQueryMap = {}; // 面板过滤条件ASQL
    const queryList = advancedQueryMap[tabInfo.id] || [];
    // 将过滤条件中的全局变量赋值
    queryList.forEach(item => {
      const { asqlValueType, asqlValue, queryType, apiSql } = item;
      if (queryType === 1) {
        // 值类型为【变量】时，需要将变量对应的值传给后台
        if (asqlValueType === 2) {
          // @@BusinessID 取左侧树的主业务数据（因为左侧树无法配置）
          if (asqlValue === '@@BusinessID') {
            globalMap[item.asqlValue] = JSON.parse(activeTreeNode[idEle.id]).name;
          } else {
            // 当前时间、当前用户
            const globalVar = getValueFromGlobalVariables({
              globalVar: asqlValue,
              userInfo,
            }) || reducePopData(prevListRowData, prevTabInfo, tabInfo, elementMap, asqlValue);
            // 或用户自定义的变量
            // (在关联新增按钮的弹出面板上，只有上一个面板为表单时，才可以获取自定义的变量)
            // （若上一个面板为列表，则无法定位到定义的变量具体哪条数据值）
            globalMap[item.asqlValue] = globalVar;
          }
        }
      } else if (queryType === 2) {
        if (!apiSql) return;
        const varNameList = matchGlobalVars(apiSql);
        varNameList.forEach(varName => {
            if (varName === '@@BusinessID') {
              globalQueryMap[varName] = { value: JSON.parse(activeTreeNode[idEle.id]).name, type: 2 };
            } else {
              // 当前时间、当前用户
              let globalVar = getValueFromGlobalVariables({
                globalVar: varName,
                userInfo,
                globalMapType: 'globalMapType',
              });
              // 或用户自定义的变量
              // (在关联新增按钮的弹出面板上，只有上一个面板为表单时，才可以获取自定义的变量)
              // （若上一个面板为列表，则无法定位到定义的变量具体哪条数据值）
              if (globalVar.value) {
                globalQueryMap[varName] = globalVar;
              } else {
                globalVar = reducePopData1(prevListRowData, prevTabInfo, tabInfo, elementMap, varName) || {};
                if (JSON.stringify(globalVar) === '{}') return;
                const { data = '', currentEle = {} } = globalVar;
                const { relationColumnType } = currentEle;
                globalQueryMap[varName] = { value: data, type: relationColumnType };
              }
            }
          },
        );
      }
    });
    const { seniorFilter } = this.state;
    let seniorFilterMap = { ...seniorFilter };
    const params = showType === 4 ? {
      tabSource: tabInfo.relationTableName,
      elementList,
      pageNum,
      pageSize,
      tabId: tabId,
      globalMap,
      globalQueryMap,
      calendarList,
      seniorFilterMap: {
        ...seniorFilterMap,
        [tabInfo.relationColumn]: {
          static_connector: 3,
          static_type: 2,
          static_value: JSON.parse(activeTreeNode[idEle.id]).name,
        },
      },
    } : {
      tabSource: tabInfo.relationTableName,
      elementList,
      pageNum,
      pageSize,
      globalMap,
      globalQueryMap,
      seniorFilterMap,
      tabId: tabId,
      calendarList,
    };
    getList(JSON.stringify(params)).then(res => {
      this.setState({
        currentForm: this.setBtnDataToCurrentFormList(res),
      });
      tabInfo.canLineEdit === 1 && this.fetchTabDropDownData();
    }, err => this.setState({ loading: false }));
  };
  /**
   * 根据面板的类型将对应的按钮的值转换进数组
   * @param tabInfo
   * @param elementMap
   * @param triggerMap
   * @param dataSource
   * @returns {[]}
   */
  setBtnDataToCurrentFormList = (dataSource) => {
    const { tabInfo, elementMap, triggerMap } = this.props;
    if (tabInfo.canLineEdit !== 1) return dataSource;
    let arrList = [];
    let elementList = elementMap[tabInfo.id] || [];
    // 先找到3种按钮控件
    let multiJumpBtn = elementList.find(item => item.basetype === 43); // 多菜单跳转
    let multiTabBtn = elementList.find(item => item.basetype === 44); // 多面板
    let saveBtn = elementList.find(item => item.basetype === 7); // 保存按钮
    // 将triggerMap中的触发器合并成一个数组
    let triggerMapList = [];
    Object.keys(triggerMap).forEach(item => {
      triggerMapList = triggerMapList.concat(triggerMap[item]);
    });
    const getTriggerList = (elementid) => triggerMapList.filter(item => item.relationElementId === elementid && item.triggerType === 1 && item.basetype === 4);
    // 找到每种按钮中对应的加载触发器
    let multiJumpArr = multiJumpBtn && getTriggerList(multiJumpBtn.id) || [];
    let multiTabArr = multiTabBtn && getTriggerList(multiTabBtn.id) || [];
    let saveArr = saveBtn && getTriggerList(saveBtn.id) || [];
    const { datalist = [], ...rest } = dataSource;
    datalist.forEach(item => {
      let newItem = {
        ...item,
      };
      if (multiJumpBtn) newItem[multiJumpBtn.id] = this.judgeValueIsTrue(multiJumpBtn, multiJumpArr[multiJumpArr.length - 1], item);
      if (multiTabBtn) newItem[multiTabBtn.id] = this.judgeValueIsTrue(multiTabBtn, multiTabArr[multiTabArr.length - 1], item);
      if (saveBtn) newItem[saveBtn.id] = this.judgeValueIsTrue(saveBtn, saveArr[saveArr.length - 1], item);
      arrList.push(newItem);
    });
    let newDataSource = {
      datalist: arrList,
      ...rest,
    };
    return newDataSource;
  };

  // 判断按钮的值是否正确
  judgeValueIsTrue = (btn, triggerObj, record) => {
    if (!btn) return false; // 如果按钮不存在，直接返回false
    if (btn && !triggerObj) return !!btn.visiabled; // 如果按钮存在，但是没有对应的触发器，则取值按钮的属性
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
      if (!currentEle) return;
      const { basetype, valueFieldType } = currentEle;
      if (basetype === 17 && valueFieldType === 2) {
        return JSON.parse(record[currentEle.id]).name;
      }
      return JSON.parse(record[currentEle.id]).id;
    };
    const { endTriggerNum, elementId } = triggerObj;
    let elementIdValue = JSON.parse(record[elementId]).id;
    return validTriggerMatch(triggerObj, elementIdValue, endTriggerNum, getValueFromCurrentTableColumn);
  };

  // 获取表单数据
  fetchFormData = () => {
    const { isrelation } = this.state;
    const { langLib } = this.context;
    const { originElementMap, userInfo, isNew, tabInfo = {}, tabList, elementMap = {}, activeTreeNode = {}, advancedQueryMap, prevTabInfo, prevListRowData = {}, fromType } = this.props;
    let newTabInfo = tabInfo;
    const tabId = newTabInfo.id;
    const leftListTabInfo = tabList.find(item => item.showType === 3);
    if (!leftListTabInfo) return;
    const elementList = originElementMap[tabId] && originElementMap[tabId].filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype)).map(item => {
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
    if (!isNew && JSON.stringify(activeTreeNode) === '{}') return;
    let idEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
    if (!idEle) {
      CMessage(langLib['global.lost.id'], 'error');
      return;
    }
    let currentId = isNew ? '' : JSON.parse(activeTreeNode[idEle.id]);
    let id = currentId.id;
    if (fromType === 'relation') {
      let showType = prevTabInfo.showType;
      let currentTabId = tabInfo.id;
      let leftListTabInfo = tabList.find(item => item.showType === 3);
      let leftIdEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
      const filterIdData = advancedQueryMap[currentTabId].find(item => item.asqlColumnName === 'id') || {};
      const { asqlValueType, asqlValue } = filterIdData;
      // 值类型为【值】，直接取值
      if (asqlValueType === 1) {
        id = asqlValue;
      } else if (asqlValueType === 2) { // 值类型为【变量】，取上个面板传入的数据中对应的变量值
        const ele = elementMap[prevTabInfo.id].find(item => item.parameter === asqlValue) || {};
        const { mainTableName, relationColumnName, id: eleId } = ele;
        if (showType !== 2) {
          if (prevListRowData[tabInfo.id] && prevListRowData[tabInfo.id][eleId] && isJsonString(prevListRowData[tabInfo.id][eleId])) {
            id = getValueFromGlobalVariables({
              globalVar: asqlValue,
              treeNodeData: { id: currentId.id },
              userInfo,
            }) || JSON.parse(prevListRowData[tabInfo.id][eleId]).id;
          } else {
            id = getValueFromGlobalVariables({
              globalVar: asqlValue,
              treeNodeData: { id: currentId.id },
              userInfo,
            });
            if (!id && eleId) {
              id = JSON.stringify(prevListRowData[prevTabInfo.id]) === '{}' ? '' : JSON.parse(prevListRowData[prevTabInfo.id][eleId]).id;
            }
          }
        } else {
          const ele = elementMap[prevTabInfo.id].find(item => item.parameter === asqlValue) || {};
          const { mainTableName, relationColumnName, id: eleId } = ele;
          const eleBusData = prevListRowData[prevTabInfo.id][`a${eleId}`] || JSON.stringify({ id: null, name: null });
          id = getValueFromGlobalVariables({
            globalVar: asqlValue,
            treeNodeData: { id: currentId.id },
            userInfo,
          }) || +jsonParse(eleBusData).id;
        }
      }
    }
    const params = {
      tabSource: newTabInfo.relationTableName,
      id: id,
      elementList,
    };
    this.setState({ laoding: true });
    const { defaultData } = this.state;
    if (!id) {
      this.props.setFrameState({
        tabData: {
          ...this.props.tabData,
          [tabId]: defaultData,
        },
        originTabData: {
          ...this.props.originTabData,
          [tabId]: defaultData,
        },
        elementMap: {
          ...elementMap,
          [tabId]: originElementMap[tabId],
        },
      }, () => {
        this.doCheckTrigger();
        this.fetchTabDropDownData();
      });
      this.setState({ laoding: false });
      return;
    }
    getFormDetial(params).then(res => {
      let reduceRes = this.props.reduceData(res, newTabInfo);
      let data = {};
      Object.keys(reduceRes).forEach(item => {
        data[item] = reduceRes[item] && JSON.parse(reduceRes[item]).id ? reduceRes[item] : (defaultData[item] || JSON.stringify({
          name: '',
          id: '',
        }));
      });
      this.props.setFrameState({
        tabData: {
          ...this.props.tabData,
          // [tabId]: { ...defaultData, ...this.props.reduceData(res, newTabInfo) },
          [tabId]: data,
        },
        originTabData: {
          ...this.props.originTabData,
          [tabId]: this.props.reduceData(res, newTabInfo),
        },
        elementMap: {
          ...elementMap,
          [tabId]: originElementMap[tabId],
        },
      }, () => {
        this.doCheckTrigger();
        this.fetchTabDropDownData();
        let SubPanelList = originElementMap[tabId].filter(item => item.basetype === 42) || [];
        for (let i = 0; i < SubPanelList.length; i++) {
          const { relationTabId } = SubPanelList[i];
          let TabInfo = !!relationTabId && tabList.find(item => item.id === relationTabId) || {};
          if (TabInfo.showType === 1) {
            this.getSubPanelListData({}, 1);
          }
          if (TabInfo.showType === 9) {
            this.getSubPanelListData({}, 9);
          }
        }
      });
      this.setState({ laoding: false });
    }, err => this.setState({ laoding: false }));
  };

  // 执行加载触发器
  async doCheckTrigger(type) {
    this.checkTriggerResult(type);
  }

  // 判断触发值是否是变量，如果是变量变成对应的值
  reducevVariableToData = (arr) => {
    if (!arr.length) return;
    let newData = [];
    arr.forEach(item => {
      if (item.endTriggerNum && item.endTriggerNum.indexOf('@@') > -1 && item.endTriggerNum.split('@@').length < 3) {
        item.endTriggerNum = this.getValueFromCurrentTabData(item.endTriggerNum);
      }
      newData.push(item);
    });
    return newData;
  };
  // 数据选择框 根据id获取详情
  fetchDetailById = (eleObj, id) => {
    const { mainTableName: tabSource, mainColumnName, id: eleId, basetype, triggerSign } = eleObj;
    if (basetype === 45 && !id) {
      this.handleNewTriggerEvent(eleObj);
      return;
    }
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
          this.handleNewTriggerEvent(eleObj, res);
        }
      });
    });
  };
  // 触发器实现新(数据选择框)
  handleNewTriggerEvent = (eleObj = {}, selecctedData = {}, data = {}) => {
    const { originTabData, form, triggerMap, activeTreeNode, elementMap = {}, tabInfo = {}, formData, tabData = {}, setFrameState, isNew } = this.props;
    const { id, basetype: eleObjBasetype } = eleObj;
    const eleTriggers = triggerMap[id];
    const targetEleList = []; // 目标控件列表
    const elementList = elementMap[tabInfo.id];
    // triggerType对应触发器值1前端2后3存储4js5http6jira
    // basetype对于的点击事件，区分数据变化，加载
    const triggers = eleTriggers && eleTriggers.filter(item => item.triggerType === 1 && item.basetype === 4) || [];
    let unsetData = {};
    let eventType = arrayClassify(triggers, 'elementEvent') || []; // 处理出来有几种前端触发器事件
    if (!eventType.length) return;
    let reduceEventType = reduceArrObj(eventType, 'endTriggerNum', 'conditionType', 'eventBasepriority', 'methodType');
    let triggerList = this.reducevVariableToData(reduceEventType), ids = ''; // 默认值处理成值
    if (eleObjBasetype === 45) {
      ids = JSON.stringify(selecctedData) !== '{}' ? selecctedData.map(item => item.id).join(',') : '';
    }
    let list = triggerList.filter(item => {
      const { endTriggerNum } = item;
      return validTriggerMatch(item, eleObjBasetype === 45 ? ids : selecctedData.id, endTriggerNum, this.getValueFromCurrentTabData);
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
    }) || [];
    lastList.forEach(trigger => {
      const { relationElementValue, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible } = trigger;
      const targetEle = elementList.find(item => item.id === relationElementId);
      if (!targetEle) {
        console.warn(eleObj, trigger, '触发控件不存在');
      }
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

      } else {
        const funcParam = matchGlobalFunctionParam(relationElementValue);
        let targetEleName = selecctedData[funcParam] || (relationElementValue && relationElementValue.indexOf('@@') > -1 ? this.getValueFromCurrentTabData(relationElementValue, 'data') : relationElementValue);
        if (valueFieldType === 2) {
          unsetData[`a${id}`] = JSON.stringify({ id: targetEleName, name: selecctedData[mainColumnName] });
        } else {
          unsetData[`a${id}`] = JSON.stringify({ id: targetEleName || '', name: targetEleName || '' });
        }
        // 为不是选择框的控件赋值
        if (eleObjBasetype === 45 && !!funcParam && !SEARCH_SELECT_TYPE.includes(basetype)) { // 如果触发器初始控件是多选框并且被触发的控件有对应的paramKey，就拼装数据
          if (JSON.stringify(selecctedData) === '{}') {
            // 当多选框没有值的时候，被复制的对象也是控制
            unsetData[`a${id}`] = JSON.stringify({ id: '', name: '' });
          } else {
            targetEleName = selecctedData.map(item => item[funcParam]).join(',');
            let data1 = {
              id: selecctedData.map(item => item[funcParam]).join(','),
              name: selecctedData.map(item => item[funcParam]).join(','),
            };
            unsetData[`a${id}`] = JSON.stringify(data1);
          }
        } else if (eleObjBasetype === 45 && !funcParam && !SEARCH_SELECT_TYPE.includes(basetype)) {
          unsetData[`a${id}`] = JSON.stringify({ id: targetEleName, name: targetEleName });
        }
        // 为是选择框的控件赋值
        // 如果触发器初始控件是多选框并且被触发的控件是数据选择框，
        if (eleObjBasetype === 45 && [3, 12, 25, 17].includes(basetype) && selecctedData.length) {
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
      if (this.detailFormRef) {
        const { form } = this.detailFormRef.props;
        form && form.resetFields([
          `a${id}`,
          `${IGNORE_FORM_ITEM}${id}`,
        ]);
      }

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
      if (targetIndex !== -1) {
        newElementList.splice(targetIndex, 1, changedItem);
      }
    });
    setFrameState({
      tabData: {
        ...tabData,
        [tabInfo.id]: {
          ...tabData[tabInfo.id],
          ...unsetData,
        },
      },
      elementMap: {
        ...elementMap,
        [tabInfo.id]: newElementList,
      },
    });
  };
  checkTriggerResult = () => {
    const { activeTreeNode, tabList, tabInfo, tabData, triggerMap, elementMap, setFrameState, originElementMap, userInfo } = this.props;
    const elementList = originElementMap[tabInfo.id];
    this.CustomForeach(elementList, async(eleObj, i) => {
      // await simulateFetch();
      // console.log(e);
    });
  };

  async CustomForeach(arr, callback) {
    const { activeTreeNode, tabList, tabInfo, tabData, triggerMap, elementMap, setFrameState, originElementMap, userInfo } = this.props;
    const formData = tabData[tabInfo.id];
    let len = arr.length;
    for (let i = 0; i < len; i++) {
      let item = arr[i];
      const { id, defaultValue, basetype } = item;
      // 该元素有配置触发器
      const targetEleList = triggerMap[item.id] || [];
      const filterTriggerMap = targetEleList.filter(item => item.triggerType === 1 && item.basetype === 4) || [];
      const leftListTabInfo = tabList.find(item => item.showType === 3);
      let elementObj = elementMap[leftListTabInfo.id];
      let idEle = elementObj.find(item => item.relationColumnName === 'id');
      if (!filterTriggerMap.length) continue;
      let value = null;
      if (item.defaultValue && isGlobalOrCustomVar(item.defaultValue)) {
        value = getValueFromGlobalVariables({
          globalVar: item.defaultValue,
          treeNodeData: activeTreeNode && JSON.stringify(activeTreeNode) !== '{}' && JSON.parse(activeTreeNode[`${idEle.id}`]),
          userInfo,
        });
      }
      let dataId = JSON.stringify(formData) !== '{}' && formData[`a${item.id}`] && JSON.parse(formData[`a${item.id}`]).id;
      if (basetype === 3 && ((dataId && !isNaN(Number(dataId)) || value)) || (basetype === 3 && item.defaultValue && !isNaN(item.defaultValue))) {
        dataId = dataId || value || item.defaultValue;
        // 数据选择框
        const { valueFieldType, mainTableName: tabSource, mainColumnName, id: eleId, basetype, relationColumnName } = item;
        this.fetchDetailById(item, dataId);
      } else if (basetype === 3 && !dataId) {
        await this.handleNewTriggerEvent(item);
      } else if (basetype === 45) {
        this.fetchDetailById(item, dataId || item.defaultValue);
      } else {
        await this.handleNewChange(item, dataId || '');
      }
    }
  }

  // 数据变化
  handleNewChange = (eleObj, valStr = '') => {
    const { id, relationColumnType } = eleObj;
    if (relationColumnType === 4) {
      valStr = parseDecimal(valStr + '');
    }
    const { tabList, activeTreeNode, userInfo, originTabData, triggerMap, form, tabInfo, elementMap, setFrameState, originElementMap, getValueFromCurrentTabData, tabData, isNew } = this.props;
    const elementList = elementMap[tabInfo.id] || [];
    const originElementList = originElementMap[tabInfo.id];
    let leftListTabInfo = tabList.find(item => item.showType === 3);
    let leftIdEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
    let newOriginElementMap = JSON.parse(JSON.stringify(originElementMap));
    const triggerData = triggerMap[id] && triggerMap[id].filter(item => item.basetype === 4 && item.triggerType === 1) || [];
    let eventType = arrayClassify(triggerData, 'elementEvent') || []; // 处理出来有几种前端触发器事件
    if (!eventType.length) return;
    let reduceEventType = reduceArrObj(eventType, 'endTriggerNum', 'conditionType', 'eventBasepriority', 'methodType');
    let triggerList = this.reducevVariableToData(reduceEventType); // 默认值处理成值
    let list = triggerList.filter(item => {
      const { endTriggerNum } = item;
      return validTriggerMatch(item, valStr, endTriggerNum, this.getValueFromCurrentTabData);
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
    const targetEleData = {}; // 目标控件的值
    const CascadeDropbox = []; // 级联下拉框
    // 对应的触发器事件
    if (lastList.length) {
      lastList.forEach(item => {
        let {
          beginTriggerNum, endTriggerNum, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible, relationElementValue, canModifyValue,
        } = item;
        relationElementValue = relationElementValue === null ? '' : relationElementValue;
        // const validMatch = validTriggerMatch(item, valStr);
        const targetEle = elementList.find(item => item.id === relationElementId) || {};
        if (JSON.stringify(targetEle) === '{}') {
          console.log(eleObj, item, '触发的控件不存在');
        }
        const { mainTableName: tabSource, basetype, id: targetEleId, valueFieldType, mainColumnName } = targetEle;
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
            treeNodeData: activeTreeNode && JSON.stringify(activeTreeNode) !== '{}' && JSON.parse(activeTreeNode[`${leftIdEle.id}`]),
            userInfo,
          }) || this.getValueFromCurrentTabData(relationElementValue);
          targetEleData[`a${targetEleId}`] = JSON.stringify({ id: value, name: value });
        } else {
          targetEleData[`a${targetEleId}`] = JSON.stringify({ id: value, name: value });
        }
        if (value && SEARCH_SELECT_TYPE.includes(basetype) && !isNaN(Number(value))) {
          this.fetchDetailById(targetEle, value);
        } else if (basetype === 45 && value) {
          this.fetchDetailById(targetEle, value);
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
        // form.resetFields([
        //   `a${id}`,
        //   `${IGNORE_FORM_ITEM}${id}`,
        // ]);
      });
      // 更新元素属性
      // const newElementList = [...newOriginElementMap[tabInfo.id]];
      const newElementList = [...elementList];
      targetEleList.length && targetEleList.forEach(changedItem => {
        const targetIndex = newElementList.findIndex(item => changedItem.id === item.id);
        if (targetIndex !== -1) {
          newElementList.splice(targetIndex, 1, changedItem);
        }
      });
      let obj = {};
      CascadeDropbox.forEach(item => {
        obj[`a${item.id}`] = '';
      });
      // form.setFieldsValue(obj); // 值恢复
      setFrameState({
        elementMap: {
          ...elementMap,
          [tabInfo.id]: [...newElementList],
        },
        tabData: {
          ...tabData,
          [tabInfo.id]: {
            ...tabData[tabInfo.id],
            ...targetEleData,
            [`a${eleObj.id}`]: JSON.stringify({ id: valStr, name: valStr }),
          },
        },
      });
    } else {
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
  getValueFromCurrentTabData = (asqValue, type = '') => {
    if (!asqValue) return;
    if (typeof asqValue === 'object') {
      asqValue = asqValue.varName;
    }
    const { langLib } = this.context;
    const { prevTabInfo, fromType, activeTreeNode, tabInfo = {}, tabList, elementMap = {}, tabData, userInfo } = this.props;
    let leftListTabInfo = tabList.find(item => item.showType === 3);
    let leftIdEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
    if (getValueFromGlobalVariables({
      globalVar: asqValue,
      treeNodeData: activeTreeNode && JSON.stringify(activeTreeNode) !== '{}' && JSON.parse(activeTreeNode[`${leftIdEle.id}`]),
      userInfo,
    })) {
      return getValueFromGlobalVariables({
        globalVar: asqValue,
        treeNodeData: activeTreeNode && JSON.stringify(activeTreeNode) !== '{}' && JSON.parse(activeTreeNode[`${leftIdEle.id}`]),
        userInfo,
      });
    }
    // 是否是时间减法运算
    if (asqValue.indexOf('@@GetDuration') > -1) {
      let rt = /(.+)?(?:\(|（)(.+)(?=\)|）)/.exec(asqValue);
      if (rt.length) {
        let dataArr = [];
        let strArr = rt[2].split(',');
        strArr.forEach(item => {
          dataArr.push(this.getValueFromCurrentTabData(item));
        });
        return timeDiff(dataArr[0], dataArr[1], langLib, strArr[2]);
      }
    }
    // 加减乘除四则混合运算
    if (asqValue.indexOf('@@CompoundArithmetic') > -1) {
      return compoundArithmetic({ asqValue, getValueFromCurrentTabData: this.getValueFromCurrentTabData, CMessage });
    }
    let elementList = null, tabInfoData = null, currentEleValue = '';
    if (type && JSON.stringify(prevTabInfo) !== '{}' && !!prevTabInfo) {
      elementList = elementMap[prevTabInfo.id];
      tabInfoData = tabData[prevTabInfo.id];
    } else {
      tabInfoData = tabData[tabInfo.id] || {};
      elementList = elementMap[tabInfo.id];
    }
    let currentEle = elementList && elementList.find(item => item.parameter === asqValue);
    if (!currentEle) return;
    if (JSON.stringify(prevTabInfo) !== '{}' && !!prevTabInfo && prevTabInfo.showType !== 2 && type) {
      currentEleValue = currentEle && tabInfoData && JSON.stringify(tabInfoData) !== '{}' && tabInfoData[`${currentEle.id}`] && JSON.parse(tabInfoData[`${currentEle.id}`]);
    } else {
      currentEleValue = currentEle && tabInfoData && JSON.stringify(tabInfoData) !== '{}' && tabInfoData[`a${currentEle.id}`] && JSON.parse(tabInfoData[`a${currentEle.id}`]);
    }
    const { valueFieldType, defaultValue } = currentEle;
    if (valueFieldType === 2) {
      return currentEleValue && currentEleValue.name;
    } else {
      return currentEleValue && currentEleValue.id;
    }
  };

  // 获取面板下的下拉数据
  fetchTabDropDownData = () => {
    // this.getValueFromCurrentTabData();
    const { tabInfo = {}, elementMap, filterMap, userInfo } = this.props;
    const elementList = elementMap[tabInfo.id] || [];
    // 下拉框控件列表
    const dropDownList = elementList.filter(item => FILTER_ELEMENT_TYPE.includes(item.basetype) && !!item.mainTableName).map(item => ({
      dataSource: item.mainTableName,
      elementId: item.id,
      columnName: item.mainColumnName
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
          globalMap[item.asqlValue] = getValueFromGlobalVariables({
            globalVar: asqlValue,
            userInfo,
          }) || this.getValueFromCurrentTabData(asqlValue) || '';
        }
      });
    });
    getPageSelectOptions({ dropDownList, globalMap }).then(res => {
      const { tabDropDownData } = this.state;
      this.setState({
        tabDropDownData: {
          ...tabDropDownData,
          ...res,
        },
      });
    });
  };
  // 保存前对额外参数整合
  resumeSaveParams = (values, btn) => {
    const { relationTableName, id: btnId } = btn;
    const { triggerMap, total } = this.state;
    let params = {
      ...values,
      static_tableName: relationTableName,
    };
    return params;
  };
  resetFieldForm = () => {
    if (this.detailFormRef) {
      const { form } = this.detailFormRef.props;
      form && form.resetFields();
    }
  };

  // 点击新建默认回到主面板
  rest = () => {
    if (!!this.detailFormRef) {
      const { form } = this.detailFormRef.props;
      this.resetFieldForm();
      const { originTabData, triggerMap, activeTreeNode, elementMap = {}, tabInfo = {}, formData, tabData = {}, setFrameState, isNew } = this.props;
      this.setState({
        stepList: [],
      });
      this.getDefaultValue(() => {
        const { defaultData } = this.state;
        setTimeout(() => {
          setFrameState({
            tabData: {
              ...tabData,
              [tabInfo.id]: defaultData,
            },
            originTabData: {
              ...originTabData,
              [tabInfo.id]: defaultData,
            },
          }, () => {
            this.fetchTabDropDownData();
            this.doCheckTrigger('rest');
          });
        }, 0);
      });
      // let defaultValue = await this.getDefaultValueFromAllElements(tabInfoElememt);

    }
  };

  // 刷新逻辑处理
  refresh = (btn) => {
    const { fromType, afterSave, tabInfo } = this.props;
    if (btn.elementFormat) {
      this.normalBtnRefresh(btn, () => {
        this.jumpToFile(btn, 1);
      });
    } else {
      if (fromType === 'relation') {
        // 弹出面板内的保存按钮，点击后统一关闭弹框，且重新刷新上一个面板的数据
        afterSave && afterSave(true);
      } else {
        this.props.setFrameState({
          leftList: [],
          fileRelationList: {},
          filePassList: {},
          tabData: {
            ...this.props.tabData,
            [tabInfo.id]: {},
          },
        }, () => {
          this.props.renderLeftList();
        });
        this.updataState({
          fileRelationList: {},
        });
      }
    }
  };

  // 保存
  handleSave = (btn) => {
    const { langLib } = this.context;
    const { activeTreeNode, tabInfo, tabList, originNode, elementMap, triggerMap, prevTabInfo, userInfo } = this.props;
    const { relationTableName, id: btnId } = btn;
    const { fromType, afterSave } = this.props;
    const { form } = this.detailFormRef.props;
    const { fileRelationList, filesData } = this.state;
    form && form.validateFieldsAndScroll((errs, values) => {
      if (errs) return;
      // 整合参数
      const params = this.resumeSaveParams(values, btn);
      // this.setBtnLoading(btn, true);
      // 去除前端的隐藏表单项
      const reqParams = filterHiddenFormData(params);
      // 有配置后台触发器
      const curEleTrigger = triggerMap[btnId];
      let triggerMapData = {};
      let leftListTabInfo = tabList.find(item => item.showType === 3);
      let idEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
      let eleMap = elementMap[tabInfo.id];
      if (curEleTrigger && curEleTrigger.length) {
        let triggerMapData = {};
        curEleTrigger.forEach(item => {
          const { relationColumnValue, valueType } = item;
          if (valueType === 2) {
            // 定义变量的控件
            const parameterEle = elementMap[tabInfo.id].find(ele => ele.parameter === relationColumnValue) || {};
            const { mainTableName, relationColumnName, id } = parameterEle;
            const globalVarValue = getValueFromGlobalVariables({
              userInfo,
              treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
              globalVar: relationColumnValue,
            });
            let currentEle = eleMap.find(item => item.parameter === relationColumnValue);
            if (currentEle && (reqParams[`a${currentEle.id}`] !== '' || reqParams[`a${currentEle.id}`] !== undefined || reqParams[`a${currentEle.id}`] !== null)) {
              triggerMapData[relationColumnValue] = reqParams[`a${currentEle.id}`] || '';
            } else {
              triggerMapData[relationColumnValue] = globalVarValue || '';
            }
          } else {
            const { procedureMap } = item;
            procedureMap && Object.keys(procedureMap).forEach(items => {
              let currentEle = eleMap.find(item => item.parameter === procedureMap[items]);
              if (currentEle && (reqParams[`a${currentEle.id}`] !== '' || reqParams[`a${currentEle.id}`] !== undefined || reqParams[`a${currentEle.id}`] !== null)) {
                triggerMapData[procedureMap[items]] = currentEle && reqParams[`a${currentEle.id}`] || '';
              } else {
                triggerMapData[procedureMap[items]] = getValueFromGlobalVariables({
                  userInfo,
                  treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
                  globalVar: procedureMap[items],
                }) || '';
              }
            });
          }
        });
        reqParams.static_triggerIds = curEleTrigger.filter(item => item.triggerType === 2).map(item => item.id).join(',');
        reqParams.static_procedure_triggerids = curEleTrigger.filter(item => item.triggerType === 3).map(item => item.id).join(',');
        reqParams.static_globalMap = triggerMapData;
      }
      let newParams = {};
      for (let key in reqParams) {
        if (key.substr(0, 1) === 'a') {
          let eleData = eleMap.filter(item => {
            return !NO_SUBMIT_ELEMENT_TYPE.includes(item.basetype);
          });
          let currentEle = eleData.find(item => item.id === Number(key.replace('a', '')));
          if (currentEle) {
            const { relationColumnType, basetype } = currentEle;
            if (basetype === 39 && reqParams[key]) {
              newParams[currentEle.relationColumnName] = reqParams[key].editorState ? reqParams[key].editorState.toHTML() : (reqParams[key] || '');
            } else if (basetype === 50) {
              continue;
            } else {
              if (relationColumnType === 3) {
                newParams[currentEle.relationColumnName] = reqParams[key] || '';
              } else if (relationColumnType === 2 || relationColumnType === 4) {
                if (currentEle.relationColumnName === 'id') {
                  newParams[currentEle.relationColumnName] = reqParams[key] || '';
                } else if (currentEle.relationColumnName === 'orgid') {
                  newParams[currentEle.relationColumnName] = reqParams[key] ? reqParams[key] : -1;
                } else {
                  if (basetype === 1 && typeof reqParams[key] === 'object' && !reqParams[key]) {
                    newParams[currentEle.relationColumnName] = '';
                  } else {
                    newParams[currentEle.relationColumnName] = reqParams[key];
                  }
                }
              } else {
                if (currentEle.relationColumnName) {
                  newParams[currentEle.relationColumnName] = reqParams[key] || '';
                }
              }
            }
          }
        } else {
          newParams[key] = reqParams[key] || '';
        }
      }
      let newData = {
        ...newParams,
        static_tableName: relationTableName,
      };
      if (JSON.stringify(fileRelationList) !== '{}') {
        newData.static_fileIds = fileRelationList;
      }
      if (prevTabInfo && JSON.stringify(prevTabInfo) !== '{}' && prevTabInfo.showType === 4) {
        newData[prevTabInfo.relationColumn] = JSON.parse(activeTreeNode[idEle.id]).id;
      }

      this.setBtnLoading(btn, true);
      const elementObj = elementMap[tabInfo.id] || [];
      const checkMultiChoiceIsExist = elementObj.find(item => item.basetype === 45 && item.elementFormat === 1);
      let checkMultiParams = { ...newData };
      const api = checkMultiChoiceIsExist && checkMultiParams[checkMultiChoiceIsExist.relationColumnName] ? filedRelationInsert : handleSave;
      if (checkMultiChoiceIsExist && checkMultiParams[checkMultiChoiceIsExist.relationColumnName]) {
        delete checkMultiParams.id;
        const { relationColumnName, id } = checkMultiChoiceIsExist;
        checkMultiParams.static_ids = newData[relationColumnName];
        delete checkMultiParams[relationColumnName];
        checkMultiParams.static_elementId = id;
      }
      const submitParams = checkMultiChoiceIsExist && newData[checkMultiChoiceIsExist.relationColumnName] ? checkMultiParams : newData;
      api(submitParams).then(res => {
        CMessage(langLib['message.save.success']);
        form.resetFields();
        this.setBtnLoading(btn, false);
        const btnTriggerMap = triggerMap[btn.id] || [];
        let triggerList = btnTriggerMap.length && btnTriggerMap.filter(item => item.triggerType === 5) || [];
        if (triggerList.length) { // 如果有第三方接口，就第三方接口完成才刷新
          this.httpRequest(btn, () => {
            this.refresh(btn);
          });
          return;
        }
        this.refresh(btn);
      }, err => this.setBtnLoading(btn, false));
    });
  };
  // 状态更新
  updataState = (obj = {}, callback) => {
    console.log(obj, 'update');
    this.setState({
      ...obj,
    }, () => {
      if (callback) {
        callback();
      }
    });
  };

  // 筛选出tab头信息
  filterTabNameList = () => {
    const { matchTabList, isNew, activeTreeNode } = this.props;
    if (isNew) {
      return matchTabList.filter((item) => {
        return item.mainTab === 1 && item.visiabled;
      }).map(tab => ({
        key: tab.id,
        tab: (
          <span title={tab.name}>
            {tab.name}
          </span>
        ),
      }));
    } else if (JSON.stringify(activeTreeNode) !== '{}') {
      return matchTabList.filter((item) => {
        return item.basetype === 1 && item.visiabled && (![9].includes(item.showType));
      }).map(tab => ({
        key: tab.id,
        tab: (
          <span title={tab.name}>
            {tab.name}
          </span>
        ),
      }));
    }
  };
  // 更新配置的按钮loading状态
  setBtnLoading = (btn, loading) => {
    const { tabInfo, elementMap } = this.props;
    const tabId = tabInfo.id;
    const elementList = elementMap[tabInfo.id] || [];
    const newElementList = [...elementList];
    const btnIndex = newElementList.findIndex(item => item.id === btn.id);
    newElementList.splice(btnIndex, 1, {
      ...btn,
      static_loading: loading,
    });
    this.props.setFrameState({
      elementMap: {
        ...elementMap,
        [tabId]: newElementList,
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
        let isTrue = validMatchMultiTrigger(triggerObj, this.getValueFromCurrentTabData);
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
      const { selectedListArr = [] } = this.state;
      const { canLineEdit } = tabInfo;
      const { basetype } = btn;
      let ListArr = canLineEdit === 1 && [7, 43, 44].includes(basetype) ? [record] : selectedListArr;
      let isDefaultTrue = false, isExecuteConditionTrue = false;
      if (!defaultConditions) { // 没有默认条件时返回true
        isDefaultTrue = true;
      } else if (defaultConditions === 1 && ListArr.length && ListArr.length === 1) { // defaultConditions=1且只选择一条数据了返回true
        isDefaultTrue = true;
      } else if (defaultConditions === 1 && (!ListArr.length || ListArr.length !== 1)) {
        isDefaultTrue = false;
        CMessage(langLib['message.error.onlyOne'], 'error');
        return;
      } else if (defaultConditions === 2 && ListArr.length) { // defaultConditions=2且只选择2条及2条以上数据了返回true
        isDefaultTrue = true;
      } else if (defaultConditions === 2 && (!ListArr.length)) {
        CMessage(langLib['message.pease.choose.more'], 'error');
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
          const errMsg = ({ msg, elementList }) => { // 修改错误信息
            const varArr = matchGlobalVars(msg);
            let newStr = msg;
            if (varArr.length) {
              varArr.forEach(item => {
                let currentElement = elementList.find(ele => ele.parameter === item);
                if (currentElement) {
                  newStr = newStr.replace(`{${item}}`, `${currentElement.displayName}`);
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
            const getValueFromCurrentTableColumn = (varName) => {
              if (typeof varName === 'object') {
                varName = varName.varName;
              }
              if (!varName) return;

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
              if (!currentEle) return;
              const { basetype, valueFieldType } = currentEle;
              if (basetype === 17 && valueFieldType === 2) {
                return JSON.parse(item[currentEle.id]).name;
              }
              return JSON.parse(item[currentEle.id]).id;
            };
            let isTrue = validMatchMultiTrigger(triggerObj, getValueFromCurrentTableColumn);
            flagArr.push(isTrue);
          });
          let isTrueArr = flagArr.filter(item => !!item);

          isExecuteConditionTrue = isTrueArr.length === ListArr.length ? true : false;

          if (!isExecuteConditionTrue) {
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
  handleClickBtn = (btn) => {
    const { basetype, id, relationTabId, elementFormat } = btn;
    if (!this.checkBeforeHandleClick(btn)) return;
    switch (basetype) {
      case 24:
        // 普通按钮
        this.handleNormalBtn(btn);
        break;
      case 7:
        this.handleSave(btn);
        break; // 保存按钮
      case 6:
        this.handleDel(btn);
        break;
      case 5:
        this.editListData(btn);
        break;
      case 4:
        if (elementFormat) {
          this.normalBtnRefresh(btn);
          return;
        }
        this.setPopupTabInfo(btn, {}, 'add');
        break;
      case 18:
        if (elementFormat) {
          this.normalBtnRefresh(btn);
          return;
        }
        this.setPopupTabInfo(btn);
        break;
      case 26:
        this.handleArchive(btn);
        break; // 归档按钮(带周期)
      case 28:
        this.handleNormalArchive(btn);
        break; // 归档按钮(不带周期)
      case 29:
        this.doBatchModification(btn);
        break; // 批量修改
      case 30:
        this.doExport(btn);
        break;
      case 34:
        this.doBatchArchive(btn);
        break; // 批量修改
      case 35:
        this.doBatchArchive(btn);
        break; // 批量修改
      default:
        return;
    }
  };
  // 导出
  doExport = (btn) => {
    const { elementFormat = 1 } = btn;
    if (elementFormat === 1) {
      // this.setState({
      //   downLoadLoading: true,
      // });
      this.exportAll(btn);
    } else if (elementFormat === 2) {
      this.exportPart();
    } else {
      this.exportAll(btn);
    }
  };
  // 导出部分
  exportPart = () => {
    console.log('222');
  };
  // 导出全部
  exportAll = (btn) => {
    const { tabInfo, tabList, userInfo, elementMap, searchSelected, searchVal = '', activeTreeNode, advancedQueryMap, prevListRowData, prevTabInfo } = this.props;
    const { calendarList = [], seniorFilter = {} } = this.state;
    const { dataFormat = 0 } = btn;
    let currentTabId = tabInfo.id;
    const leftListTabInfo = tabList.find(item => item.showType === 3);
    let elementObj = elementMap[leftListTabInfo.id];
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
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
    params.calendarList = calendarList;
    params.seniorFilterMap = seniorFilter;
    if (tabInfo.showType === 4) {
      params.seniorFilterMap = {
        ...seniorFilter,
        [tabInfo.relationColumn]: {
          static_connector: 3,
          static_type: 2,
          static_value: JSON.parse(activeTreeNode[idEle.id]).name,
        },
      };
    }
    const globalMap = {}; // 面板组合条件
    const globalQueryMap = {}; // 面板过滤条件ASQL
    const queryList = advancedQueryMap[tabInfo.id] || [];
    // 将过滤条件中的全局变量赋值
    queryList.forEach(item => {
      const { asqlValueType, asqlValue, queryType, apiSql } = item;
      if (queryType === 1) {
        // 值类型为【变量】时，需要将变量对应的值传给后台
        if (asqlValueType === 2) {
          // @@BusinessID 取左侧树的主业务数据（因为左侧树无法配置）
          if (asqlValue === '@@BusinessID') {
            globalMap[item.asqlValue] = JSON.parse(activeTreeNode[idEle.id]).name;
          } else {
            // 当前时间、当前用户
            const globalVar = getValueFromGlobalVariables({
              globalVar: asqlValue,
              userInfo,
            }) || reducePopData(prevListRowData, prevTabInfo, tabInfo, elementMap, asqlValue);
            globalMap[item.asqlValue] = globalVar;
          }
        }
      } else if (queryType === 2) {
        if (!apiSql) return;
        const varNameList = matchGlobalVars(apiSql);
        varNameList.forEach(varName => {
            if (varName === '@@BusinessID') {
              globalQueryMap[varName] = { value: JSON.parse(activeTreeNode[idEle.id]).name, type: 2 };
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
                globalVar = reducePopData1(prevListRowData, prevTabInfo, tabInfo, elementMap, varName);
                const { data, currentEle } = globalVar;
                const { relationColumnType } = currentEle;
                globalQueryMap[varName] = { value: data, type: relationColumnType };
              }

            }
          },
        );
      }
    });
    params.globalMap = globalMap;
    params.globalQueryMap = globalQueryMap;
    params.dataFormat = dataFormat;

    function createObjectURL(object) {
      return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
    }

    let that = this;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', query.FULL_EXPORT_ALL_TO_EXCEL, true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('token', userInfo.token);
    xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');
    xhr.onload = function(e) {
      if (this.status === 200) {
        let blob = this.response;
        let filename = tabInfo.name + '.xls';
        if (window.navigator.msSaveOrOpenBlob) {
          navigator.msSaveBlob(blob, filename);
          navigator.msSaveBlob(blob);
        } else {
          let a = document.createElement('a');
          let url = createObjectURL(blob);
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
  // 批量归档
  doBatchArchive = (btn) => {
    const { langLib } = this.context;
    const { tabInfo } = this.props;
    const { showType, id } = tabInfo;
    const { relationTableName, id: btnId, tableName, basetype } = btn;
    if (showType === 6) {
      const { triggerMap, selectedArr, afterSave, elementMap, userInfo, prevTabInfo, originTabData } = this.props;
      const list = originTabData[tabInfo.id];
      const { form } = this.detailFormRef.props;
      form.validateFields().then(res => {
          // 去除前端的隐藏表单项
          const reqParams = filterHiddenFormData(res);
          // 找出面板的id字段控件
          let idEle = elementMap[prevTabInfo.id].find(item => item.relationColumnName === 'id');
          let data = {};
          data.static_tableName = relationTableName;
          data.ids = list.map(item => item[`${idEle.id}`]).join(',');
          // data.id = reqParams[`a${idEle.id}`];
          let api = null;
          switch (basetype) {
            case 34:
              api = doBatchArchiveCycle;
              break;
            case 35:
              api = doBatchArchiveNormal;
              break;
            default:
              api = '';
          }
          // 有配置后台触发器
          const curEleTrigger = triggerMap[btnId];
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
                  // treeNodeData: { id: reqParams[`a${idEle.id}`] },
                  globalVar: relationColumnValue,
                });
                triggerMapData[relationColumnValue] = globalVarValue || reqParams[`a${parameterEle.id}`] || '';
              }
            });
            data.static_triggerIds = curEleTrigger.map(item => item.id).join(',');
            data.static_globalMap = triggerMapData;
          }
          ;
          api(data).then(res => {
            CMessage(langLib['message.save.success']);
            afterSave && afterSave(true);
          }, err => {
            afterSave && afterSave();
          });
        },
      ).catch(err => console.log(err));
    }
  }
  ;
  // 列表中的普通按钮
  normalBtnInList = (btn) => {
    const { langLib } = this.context;
    const { selectedListArr, currentForm } = this.state;
    const { tabList, prevTabInfo, afterSave } = this.props;
    const { relationTabId, elementFormat } = btn;
    if (!this.checkBeforeHandleClick(btn)) return;
    this.storedProcedure(btn);
    if (!relationTabId) return;
    this.setPopupTabInfo(btn, selectedListArr.length ? selectedListArr[selectedListArr.length - 1] : {});
  };
  // 存储过程
  storedProcedure = (btn, otherParams = '') => {
    const { relationTabId, id: btnId, elementFormat } = btn;
    const { selectedListArr } = this.state;
    const { activeTreeNode, userInfo, tabList, formData, prevTabInfo, tabInfo, triggerMap, elementMap, prevListRowData, tabData } = this.props;
    const curEleTrigger = triggerMap[btnId] || [];
    let leftListTabInfo = tabList.find(item => item.showType === 3);
    let idEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
    const getIds = type => curEleTrigger.filter(item => item.triggerType === type).map(item => item.id).join(',');
    let static_globalMap;
    if (curEleTrigger && curEleTrigger.length) {
      if (!selectedListArr.length) return;
      let tabInfoData = {}; // 面板数据
      if (!otherParams) {
        tabInfoData = selectedListArr[0] || {}; // 面板数据
      } else if (otherParams && otherParams.type === 'ROW_EDIT') {
        tabInfoData = otherParams.data;
      }

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
            treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
            globalVar: relationColumnValue,
          });
          triggerMapData[relationColumnValue] = tabInfoData[`a${parameterEle.id}`] || globalVarValue || '';
        } else {
          const { procedureMap } = item;
          procedureMap && Object.keys(procedureMap).forEach(items => {
            let currentEle = elementMap[tabInfo.id].find(item => item.parameter === procedureMap[items]);
            triggerMapData[procedureMap[items]] = currentEle && tabInfoData[currentEle.id] && (JSON.parse(tabInfoData[currentEle.id]).id || tabInfoData[`a${currentEle.id}`]) || getValueFromGlobalVariables({
              userInfo,
              treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
              globalVar: procedureMap[items],
            });
            if (procedureMap[items] === '@@GlobalIds' && !triggerMapData[procedureMap[items]]) {
              const idEle = elementMap[tabInfo.id].find(ele => ele.relationColumnName === 'id');
              triggerMapData[procedureMap[items]] = selectedListArr.map(item => item[`a${idEle.id}`]).join(',');
            }
          });
        }
      });
      static_globalMap = triggerMapData;
    } else {
      this.normalBtnRefresh(btn, () => {
        this.jumpToFile(btn);
      });
      return;
    }
    const params = {
      static_globalMap,
      static_triggerIds: getIds(2),
      static_procedure_triggerids: getIds(3),
    };
    if (params.static_triggerIds || params.static_procedure_triggerids) {
      normalButton(params).then(res => {
        const { langLib } = this.context;
        CMessage(langLib['message.check.success'], 'success');
        this.normalBtnRefresh(btn, () => {
          this.jumpToFile(btn);
        });
        // this.setBtnLoading(btn, false);
      }, err => console.log(err));
    }
  };
  // 列表中的编辑按钮
  editListData = (btn) => {
    const { langLib } = this.context;
    const { selectedListArr } = this.state;
    const { relationTabId, id: btnId, elementFormat } = btn;
    if (relationTabId) {
      if (selectedListArr.length !== 1) {
        CMessage(langLib['message.please.choose'], 'error');
        return;
      } else {
        this.setPopupTabInfo(btn, selectedListArr[0], '', 'list');
      }
    } else if (elementFormat) {
      this.normalBtnRefresh(btn);
    }
  };
  // 删除
  handleDel = (btn) => {
    const { langLib } = this.context;
    const { tabInfo } = this.props;
    const { showType } = tabInfo;
    if (showType === 1) {
      this.delListMethod(btn); // 列表删除
    } else if (showType === 2) {
      this.delFormList(btn); // 表单删除
      // this.handleNormalBtnCopy(btn);
    }
  };
  // 表单的删除
  delFormList = (btn) => {
    let that = this;
    const { langLib } = this.context;
    const { elementMap, activeTreeNode, tabList, triggerMap } = this.props;
    const leftListTabinfo = tabList.find(item => item.showType === 3);
    let idEle = elementMap[leftListTabinfo.id].find(item => item.relationColumnName === 'id');
    const { id } = JSON.parse(activeTreeNode[idEle.id]);
    const { relationTableName, id: eleId } = btn;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      content: '',
      onOk() {
        let params = {
          tableName: relationTableName,
          id,
        };
        delList(params).then(res => {
          CMessage(langLib['message.del.success']);
          close();
          const triggerList = triggerMap[eleId] || [];
          if (triggerList && triggerList.length) {
            that.handleNormalBtnCopy(btn);
          }
          const httpTriggerList = triggerList.length && triggerList.filter(item => item.triggerType === 5) || [];
          if (httpTriggerList.length) {
            that.httpRequest(btn);
          }

          // this.setBtnLoading(btn, false);
          // this.setState({ tabData: {} }, () => form && form.resetFields());
          if (btn.elementFormat) {
            that.normalBtnRefresh(btn);
          } else {
            that.props.setFrameState({
              pageNum: 1,
              leftList: [],
              fileRelationList: [],
            }, () => {
              that.props.renderLeftList();
            });
          }
        });
      },
      onCancel: () => close(),
    });

  };
  // 列表的删除
  delListMethod = (btn) => {
    const { langLib } = this.context;
    const { relationTableName } = btn;
    const { selectedListArr } = this.state;
    const { elementMap, tabInfo } = this.props;
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
            ids: selectedListArr.map(item => item[`a${idEle.id}`]).join(','),
          };
          del(params).then(res => {
            that.getData(1, 10);
            // that.httpRequest(btn);
            closeModal();
            that.setState({
              selectedListArr: [],
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
  // 归档按钮（带周期）
  handleArchive = (btn) => {
    const { selectedListArr } = this.state;
    const { langLib } = this.context;
    const { relationTableName, id: btnId, tableName } = btn;
    const { activeTreeNode, tabList, afterSave, prevTabInfo, tabInfo, triggerMap, elementMap, prevListRowData, userInfo, tabData } = this.props;

    const { showType, id } = tabInfo;
    const { form } = this.detailFormRef.props;
    form.validateFields().then(res => {
      // 去除前端的隐藏表单项
      const reqParams = filterHiddenFormData(res);
      // 找出面板的id字段控件
      let leftListTabInfo = tabList.find(item => item.showType === 3);
      let idEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
      const elementList = elementMap[tabInfo.id] || [];
      let currentIdEle = elementList.find(item => item.relationColumnName === 'id');
      let data = {};
      data.static_tableName = relationTableName;
      data.id = reqParams[`a${currentIdEle.id}`];
      // 有配置后台触发器
      const curEleTrigger = triggerMap[btnId];
      if (curEleTrigger && curEleTrigger.length) {
        let triggerMapData = {};
        curEleTrigger.forEach(item => {
          const { relationColumnValue, valueType } = item;
          if (valueType === 2) {
            // 定义变量的控件
            const parameterEle = elementMap[tabInfo.id].find(ele => ele.parameter === relationColumnValue) || {};
            const globalVarValue = getValueFromGlobalVariables({
              userInfo,
              treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
              globalVar: relationColumnValue,
            });
            if (globalVarValue) {
              triggerMapData[relationColumnValue] = globalVarValue;
            } else {
              if (!!parameterEle && (reqParams[`a${parameterEle.id}`] !== '' || reqParams[`a${parameterEle.id}`] !== undefined || reqParams[`a${parameterEle.id}`] !== null)) {
                triggerMapData[relationColumnValue] = reqParams[`a${parameterEle.id}`];
              } else {
                triggerMapData[relationColumnValue] = globalVarValue || '';
              }
            }
          } else {
            const { procedureMap } = item;
            procedureMap && Object.keys(procedureMap).forEach(items => {
              let currentEle = elementList.find(item => item.parameter === procedureMap[items]);
              if (!!currentEle && (reqParams[`a${currentEle.id}`] !== '' || reqParams[`a${currentEle.id}`] !== undefined || reqParams[`a${currentEle.id}`] !== null)) {
                triggerMapData[procedureMap[items]] = reqParams[`a${currentEle.id}`];
              } else {
                triggerMapData[procedureMap[items]] = getValueFromGlobalVariables({
                  userInfo,
                  treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
                  globalVar: procedureMap[items],
                }) || '';
              }
            });
          }
        });
        const getIds = type => curEleTrigger.filter(item => item.triggerType === type).map(item => item.id).join(',');
        data.static_triggerIds = getIds(2);
        data.static_procedure_triggerids = getIds(3);
        data.static_globalMap = triggerMapData;
      }
      // if (data.static_procedure_triggerids) {
      // this.handleNormalBtnCopy(btn); // todo 需求不清楚，一会要加，一会不要加
      // }
      this.setBtnLoading(btn, true);
      doArchiveCycle(data).then(res => {
        CMessage(langLib['message.check.success'], 'success');
        const btnTriggerMap = triggerMap[btn.id] || [];
        let triggerList = btnTriggerMap.length && btnTriggerMap.filter(item => item.triggerType === 5) || [];
        if (triggerList.length) {
          this.httpRequest(btn, () => {
            this.refresh(btn);
          });
          return;
        }
        this.refresh(btn);
        this.setBtnLoading(btn, false);
      }, err => this.setBtnLoading(btn, false))
      ;
    }).catch(err => console.log(err));
  };
  // 归档按钮（不带周期）
  handleNormalArchive = (btn) => {
    const { selectedListArr } = this.state;
    const { langLib } = this.context;
    const { relationTableName, id: btnId, tableName } = btn;
    const { activeTreeNode, tabList, prevTabInfo, tabInfo, triggerMap, elementMap, prevListRowData, userInfo, tabData, afterSave } = this.props;
    const { showType, id } = tabInfo;
    const { form } = this.detailFormRef.props;
    form.validateFields().then(res => {
        // 去除前端的隐藏表单项
        const reqParams = filterHiddenFormData(res);
        // 找出面板的id字段控件
        let leftListTabInfo = tabList.find(item => item.showType === 3);
        let idEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
        const elementList = elementMap[tabInfo.id];
        let currentIdEle = elementList.find(item => item.relationColumnName === 'id');
        let data = {};
        data.static_tableName = relationTableName;
        data.id = reqParams[`a${currentIdEle.id}`];
        // 有配置后台触发器
        const curEleTrigger = triggerMap[btnId];
        if (curEleTrigger && curEleTrigger.length) {
          let triggerMapData = {};
          curEleTrigger.forEach(item => {
            const { relationColumnValue, valueType } = item;
            if (valueType === 2) {
              // 定义变量的控件
              const parameterEle = elementMap[tabInfo.id].find(ele => ele.parameter === relationColumnValue) || {};
              const globalVarValue = getValueFromGlobalVariables({
                userInfo,
                treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
                globalVar: relationColumnValue,
              });
              if (globalVarValue) {
                triggerMapData[relationColumnValue] = globalVarValue;
              } else {
                if (parameterEle && reqParams[`a${parameterEle.id}`] !== '' || reqParams[`a${parameterEle.id}`] !== undefined || reqParams[`a${parameterEle.id}`] !== null) {
                  triggerMapData[relationColumnValue] = reqParams[`a${parameterEle.id}`];
                } else {
                  triggerMapData[relationColumnValue] = globalVarValue || '';
                }
              }
            } else {
              const { procedureMap } = item;
              procedureMap && Object.keys(procedureMap).forEach(items => {
                let currentEle = elementList.find(item => item.parameter === procedureMap[items]);
                if (!!currentEle && (reqParams[`a${currentEle.id}`] !== '' || reqParams[`a${currentEle.id}`] !== undefined || reqParams[`a${currentEle.id}`] !== null)) {
                  triggerMapData[procedureMap[items]] = reqParams[`a${currentEle.id}`];
                } else {
                  triggerMapData[procedureMap[items]] = getValueFromGlobalVariables({
                    userInfo,
                    treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
                    globalVar: procedureMap[items],
                  }) || '';
                }
              });
            }
          });
          const getIds = type => curEleTrigger.filter(item => item.triggerType === type).map(item => item.id).join(',');
          data.static_triggerIds = getIds(2);
          data.static_procedure_triggerids = getIds(3);
          data.static_globalMap = triggerMapData;
        }
        // if (data.static_procedure_triggerids) {
        //   this.handleNormalBtnCopy(btn); // todo 需求不清楚，一会要加，一会不要加
        // }
        this.setBtnLoading(btn, true);
        doArchiveNormal(data).then(res => {
          CMessage(langLib['message.check.success'], 'success');
          const btnTriggerMap = triggerMap[btn.id] || [];
          let triggerList = btnTriggerMap.length && btnTriggerMap.filter(item => item.triggerType === 5) || [];
          if (triggerList.length) {
            this.httpRequest(btn, () => {
              this.refresh(btn);
            });
            return;
          }
          this.refresh(btn);
          this.setBtnLoading(btn, false);
        }, err => this.setBtnLoading(btn, false))
        ;
      },
    ).catch(err => console.log(err));
  };
  // 批量修改
  doBatchModification = (btn) => {
    const { langLib } = this.context;
    const { selectedListArr } = this.state;
    const { fromType, afterSave, fileRelationList, activeTreeNode, tabInfo, tabData, tabList, originNode, elementMap, triggerMap, prevTabInfo, userInfo } = this.props;
    const { relationTableName, id: btnId } = btn;
    const { form } = this.detailFormRef.props;
    form && form.validateFieldsAndScroll((errs, values) => {
      if (errs) return;
      // 整合参数
      const params = this.resumeSaveParams(values, btn);
      // 去除前端的隐藏表单项
      const reqParams = filterHiddenFormData(params);
      // 有配置后台触发器
      const curEleTrigger = triggerMap[btnId];
      let triggerMapData = {};
      let leftListTabInfo = tabList.find(item => item.showType === 3);
      let idEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
      let eleMap = elementMap[tabInfo.id];
      if (curEleTrigger && curEleTrigger.length) {
        let triggerMapData = {};
        curEleTrigger.forEach(item => {
          const { relationColumnValue, valueType } = item;
          if (valueType === 2) {
            const globalVarValue = getValueFromGlobalVariables({
              userInfo,
              treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
              globalVar: relationColumnValue,
            });
            let currentEle = eleMap.find(item => item.parameter === relationColumnValue);
            if (currentEle && (reqParams[`a${currentEle.id}`] !== '' || reqParams[`a${currentEle.id}`] !== undefined || reqParams[`a${currentEle.id}`] !== null)) {
              triggerMapData[relationColumnValue] = reqParams[`a${currentEle.id}`];
            } else {
              triggerMapData[relationColumnValue] = globalVarValue || '';
            }
          } else {
            const { procedureMap } = item;
            procedureMap && Object.keys(procedureMap).forEach(items => {
              let currentEle = eleMap.find(item => item.parameter === procedureMap[items]);
              const globalVarValue = getValueFromGlobalVariables({
                userInfo,
                treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
                globalVar: procedureMap[items],
              });
              if (currentEle && (reqParams[`a${currentEle.id}`] !== '' || reqParams[`a${currentEle.id}`] !== undefined || reqParams[`a${currentEle.id}`] !== null)) {
                triggerMapData[procedureMap[items]] = reqParams[`a${currentEle.id}`];
              } else {
                triggerMapData[procedureMap[items]] = globalVarValue || '';
              }
            });
          }
        });
        reqParams.static_triggerIds = curEleTrigger.filter(item => item.triggerType === 2).map(item => item.id).join(',');
        reqParams.static_procedure_triggerids = curEleTrigger.filter(item => item.triggerType === 3).map(item => item.id).join(',');
        reqParams.static_globalMap = triggerMapData;
      }
      let newParams = {};

      for (let key in reqParams) {
        if (key.substr(0, 1) === 'a') {
          let eleData = eleMap.filter(item => {
            return !NO_SUBMIT_ELEMENT_TYPE.includes(item.basetype);
          });
          let currentEle = eleData.find(item => item.id === Number(key.replace('a', '')));
          if (currentEle) {
            const { relationColumnType } = currentEle;
            if (relationColumnType === 3) {
              newParams[currentEle.relationColumnName] = reqParams[key] ? reqParams[key] : TIME_DEFAULT_VALUES[0];
            } else if (relationColumnType === 2) {
              if (currentEle.relationColumnName === 'id') {
                newParams[currentEle.relationColumnName] = reqParams[key];
              } else if (currentEle.relationColumnName === 'orgid') {
                newParams[currentEle.relationColumnName] = reqParams[key] ? reqParams[key] : -1;
              } else {
                newParams[currentEle.relationColumnName] = reqParams[key] ? reqParams[key] : 0;
              }
            } else {
              newParams[currentEle.relationColumnName] = reqParams[key];
            }
          }
        } else {
          newParams[key] = reqParams[key];
        }
      }
      let newData = {
        ...newParams,
        static_tableName: relationTableName,
      };
      if (fileRelationList.length) {
        newData.static_fileIds = fileRelationList.join(',');
      }
      if (prevTabInfo && JSON.stringify(prevTabInfo) !== '{}' && prevTabInfo.showType === 4) {
        newData[prevTabInfo.relationColumn] = JSON.parse(activeTreeNode[idEle.id]).id;
      }
      let tabInfoIdEle = prevTabInfo && elementMap[prevTabInfo.id].find(item => item.relationColumnName === 'id'); // id控件
      const selectedData = tabData[tabInfo.id];
      let ids = [];
      Object.keys(selectedData).forEach(items => {
        if (selectedData[items][tabInfoIdEle.id]) {
          ids.push(selectedData[items][tabInfoIdEle.id]);
        }
      });
      newData.static_ids = ids.join(',');
      this.setBtnLoading(btn, true);
      leftListBatchUpdate(newData).then(res => {
        // this.httpRequest(btn);
        CMessage(langLib['message.save.success']);
        form.resetFields();
        this.setBtnLoading(btn, false);
        const btnTriggerMap = triggerMap[btn.id] || [];
        let triggerList = btnTriggerMap.length && btnTriggerMap.filter(item => item.triggerType === 5) || [];
        if (triggerList.length) {
          this.httpRequest(btn, () => {
            this.refresh(btn);
          });
          return;
        }
        this.refresh(btn);
        // if (fromType === 'relation') {
        //   // 弹出面板内的保存按钮，点击后统一关闭弹框，且重新刷新上一个面板的数据
        //   afterSave && afterSave(true);
        // } else {
        //
        // }
      }, err => this.setBtnLoading(btn, false));
    });
  };
  // 多面板跳转
  multiTabBtn = (btn, record) => {
    if (!this.checkBeforeHandleClick(btn, record)) return;
    const { tabInfo, elementMap } = this.props;
    const { jumpMenuList } = btn;
    if (!jumpMenuList) return;
    let elementList = elementMap[tabInfo.id] || [];
    for (let i = 0; i < jumpMenuList.length; i++) {
      let condition = jumpMenuList[i];
      const { preconditions } = condition;
      let normalArr = jsonParse(preconditions, 'array') || [];
      let newCondition = reducerVariableToArray(normalArr, record, elementList);
      if (multiDataComparison(newCondition)) {
        const { jumpTabId } = condition;
        const { tabList } = this.props;
        let eleObj = { relationTabId: jumpTabId };
        this.setPopupTabInfo(eleObj, record);
        this.httpRequest(btn, '', { type: 'ROW_EDIT', data: record });
        this.storedProcedure(btn, { type: 'ROW_EDIT', data: record });
        return;
      }
    }
  };
  // 多菜单跳转
  multiJumpBtn = (btn, record) => {
    if (!this.checkBeforeHandleClick(btn, record)) return;
    const { tabInfo, elementMap } = this.props;
    const { jumpMenuList } = btn;
    if (!jumpMenuList) return;
    let elementList = elementMap[tabInfo.id] || [];
    for (let i = 0; i < jumpMenuList.length; i++) {
      let condition = jumpMenuList[i];
      const { preconditions } = condition;
      let normalArr = jsonParse(preconditions, 'array') || [];
      let newCondition = reducerVariableToArray(normalArr, record, elementList);
      if (multiDataComparison(newCondition)) {
        this.multiJumpToFile(condition, record);
        this.httpRequest(btn, '', { type: 'ROW_EDIT', data: record });
        this.storedProcedure(btn, { type: 'ROW_EDIT', data: record });
        return;
      }
    }
  };
  // 多菜单跳转
  multiJumpToFile = (btn, record) => {
    const { tabInfo, elementMap, user, userInfo, functionData, tabs } = this.props;
    const { passParam, jumpFunctionId } = btn;
    const { langLib } = this.context;
    if (!jumpFunctionId) return;
    let result = controlAuthority(user.functionList, jumpFunctionId);
    if (!result.length) {
      CMessage(langLib['message.warn.nopromiss'], 'error');
      return;
    }
    let data = record;
    const { id, dataSourceType, showType } = tabInfo;
    if (showType !== 1 && dataSourceType !== 2) {

    }
    let passParams = jsonParse(passParam, 'array') || [];
    const elementList = elementMap[tabInfo.id] || [];
    const fileData = JumpFileDate(functionData.id, data, elementList, passParams, userInfo, getValueFromGlobalVariables, '');
    const { tabKey, comKey, title } = getFunctionComDetail(result[0]);
    this.jumpFile(tabKey, comKey, title, fileData, result);
    this.httpRequest(btn, '', { type: 'ROW_EDIT', data: record });
    this.storedProcedure(btn, { type: 'ROW_EDIT', data: record });
  };
  // 菜单跳转时逻辑处理
  jumpFile = (tabKey, comKey, title, fileData, result) => {
    const { tabs, afterSave } = this.props;
    if (!tabKey) return;
    if (afterSave) afterSave(false);
    const { dispatch } = this.context;
    jumpFileOfCommon({ tabKey, comKey, title, tabs, fileData, functionData: result[0], dispatch });
  };

  // 切换面板
  handleChangeTab = (activeTabKey) => {
    const { tabData, matchTabList, setFrameState, elementMap } = this.props;
    const tabInfo = matchTabList.filter(item => item.id === +activeTabKey)[0] || {};
    // this.setState({
    //   selectedListArr: [],
    // });
    setFrameState({
      tabInfo,
      fileRelationList: {},
    }, () => {
      let SubPanelList = elementMap[tabInfo.id].filter(item => item.basetype === 42) || [];
      if (tabInfo.showType === 4 || tabInfo.showType === 1 || (tabInfo.showType === 2 && SubPanelList.length)) {
        this.getData();
      } else {
        (!tabData.hasOwnProperty(tabInfo.id)) && this.getData();
      }
    });
  };
  // 关闭弹出面板
  handleCancelModal = (needReFetch = false) => {
    this.setState({
      visible: false,
      popupTabInfo: {},
      selectedListArr: [],
      type: '',
    }, () => {
      // @TODO: 切换页面后需要保存页码的数据，否则每次关闭弹框都重新获取第一页
      needReFetch && this.getData();
    });
  };

  // 获取所有空间的默认值,只对于表单的中的控件
  // 判断全局变量是否有值，如果没有值，在去看是否是数据选择框，如果不是，直接取默认值
  async getDefaultValueFromAllElements(element = []) {
    let obj = {};
    if (!element.length) return;
    let formElement = element.filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype)) || [];
    const { activeTreeNode, userInfo, tabList, elementMap, tabs, filePassList } = this.props;
    const fileData = tabs.activeTabData.fileData || '';
    let leftListTabInfo = tabList.find(item => item.showType === 3);
    let leftIdEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
    for (const item of formElement) {
      let { id, basetype, defaultValue, mainColumnName, mainTableName, relationTableName, relationColumnName, parameter } = item;
      if (defaultValue) {
        let valueId = getValueFromGlobalVariables({
          userInfo,
          treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[`${leftIdEle.id}`]) : {},
          globalVar: defaultValue,
        });
        let valueName = getValueFromGlobalVariables({
          userInfo,
          treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[`${leftIdEle.id}`]) : {},
          globalVar: defaultValue,
          isRealValue: false,
        });
        if (valueId) {
          let data = {
            id: valueId, name: valueName,
          };
          obj[`a${id}`] = JSON.stringify(data);
        } else {
          if ((fileData[defaultValue] && fileData[defaultValue].value && fileData[defaultValue].type === 2) || (basetype === 3 && !isNaN(Number(defaultValue)))) {
            let mainId = fileData[defaultValue] ? fileData[defaultValue].value : defaultValue;
            await getNormalSearchDetail({
              tabSource: mainTableName,
              id: mainId,
            }).then(res => {
              return new Promise(resolve => {
                obj[`a${id}`] = JSON.stringify({ id: res.id, name: res[mainColumnName] });
                resolve();
              });
            });
          } else if (defaultValue && basetype === 45) {
            await getCheckBoxSearchDetail({ tableName: mainTableName, ids: defaultValue }).then(res => {
              return new Promise(resolve => {
                obj[`a${id}`] = JSON.stringify({
                  id: res.map(item => item.id).join(','),
                  name: res.map(item => item[mainColumnName]).join(','),
                });
                resolve();
              });
            });
          } else if (defaultValue.indexOf('@@') > -1) {
          } else {
            obj[`a${id}`] = JSON.stringify({ id: defaultValue, name: defaultValue });
          }
        }
      }
    }
    return obj;
  };

  // 设置弹出面板信息
  setPopupTabInfo = (eleObj, listRowData = {}, type) => {
    const { tabList, setFrameState, tabData, tabInfo, elementMap, originElementMap, filePassList } = this.props;
    const { relationTabId, elementFormat, jumpType } = eleObj;
    if (jumpType === 2) { // 跳转菜单
      // 将带a的key转换成正常的
      let record = listRowData;
      const { showType } = tabInfo;
      if (showType === 2) {
        Object.keys(listRowData).forEach(item => {
          record[item.replace('a', '')] = listRowData[item];
        });
      }
      this.multiJumpBtn(eleObj, record);
      return;
    }
    if (!relationTabId) return;
    const tabInfoId = tabInfo.id;
    const { showType } = tabInfo;
    const popupTabInfo = tabList.find(item => item.id === relationTabId);
    if (!popupTabInfo) return;
    const popupElementMapList = elementMap[relationTabId];
    let data = {};
    const elementMapList = elementMap[tabInfoId];
    // let   = this.getDefaultValueFromAllElements(elementMapList);
    const { defaultData } = this.state;
    if (showType === 2) {
      const tabInfoData = tabData[tabInfoId];
      elementMapList.forEach((item) => {
        let hasDefaultValueEle = popupElementMapList.find(items => {
          return items.defaultValue && items.defaultValue.indexOf('@@') > -1 && items.defaultValue === item.parameter;
        });
        if (hasDefaultValueEle) {
          data[`a${hasDefaultValueEle.id}`] = tabInfoData[`a${item.id}`];
        }
      });
    }
    let currentTabData = showType !== 2 ? listRowData : tabData[tabInfo.id];
    const initData = {
      ...data,
      // ...defaultData,
    };
    setFrameState({
      tabData: {
        ...tabData,
        [tabInfo.id]: currentTabData,
        [relationTabId]: JSON.stringify(listRowData) !== '{}' ? listRowData : initData,
      },
      elementMap: {
        ...elementMap,
        [relationTabId]: originElementMap[relationTabId],
      },
      originTabData: {
        ...this.props.originTabData,
        [relationTabId]: JSON.stringify(listRowData) !== '{}' ? listRowData : data,
      },
    });
    this.setState({
      popupTabInfo,
      visible: true,
      type,
    });
  };
  // 调转菜单
  jumpToFile = (btn, type) => {
    const { tabInfo, elementMap, user, userInfo, functionData, tabs } = this.props;
    const { passParam, jumpFunctionId } = btn;
    const { langLib } = this.context;
    if (!jumpFunctionId) {
      return;
    }
    let result = controlAuthority(user.functionList, jumpFunctionId);
    if (!result.length) {
      CMessage(langLib['message.warn.nopromiss'], 'error');
      return;
    }
    let data;
    const { showType } = tabInfo;
    if (showType === 2) {
      const { form } = this.detailFormRef && this.detailFormRef.props;
      data = form && form.getFieldsValue(); // 获取表单中的所有数据值
    } else {
      const { selectedListArr } = this.state;
      data = selectedListArr[0] || {};
    }
    let passParams = jsonParse(passParam, 'array') || [];
    const elementList = elementMap[tabInfo.id] || [];
    const fileData = JumpFileDate(functionData.id, data, elementList, passParams, userInfo, getValueFromGlobalVariables, type);
    const { tabKey, comKey, title } = getFunctionComDetail(result[0]);

    this.jumpFile(tabKey, comKey, title, fileData, result);
  };
  // 设置弹出面板信息
  setPopupTabInfo1 = (eleObj, listRowData = {}, type) => {
    const { tabList, setFrameState, tabData, tabInfo, elementMap, advancedQueryMap } = this.props;
    const { relationTabId, selectListTabId } = eleObj;
    if (!selectListTabId) return;
    const tabInfoId = tabInfo.id;
    const { showType } = tabInfo;
    const popupTabInfo = tabList.find(item => item.id === selectListTabId);
    const popupElementMapList = elementMap[selectListTabId];
    let data = {};
    const elementMapList = elementMap[tabInfoId];
    // let defaultObj = this.getDefaultValueFromAllElements(elementMapList);
    const { defaultData } = this.state;
    if (showType === 2) {
      const tabInfoData = tabData[tabInfoId];
      elementMapList.forEach((item) => {
        let hasDefaultValueEle = popupElementMapList.find(items => {
          return items.defaultValue && items.defaultValue.indexOf('@@') > -1 && items.defaultValue === item.parameter;
        });
        if (hasDefaultValueEle) {
          data[`a${hasDefaultValueEle.id}`] = tabInfoData[`a${item.id}`];
        } else {
          data[`a${item.id}`] = defaultData[`a${item.id}`] && JSON.parse(defaultData[`a${item.id}`]).id ? defaultData[`a${item.id}`] : JSON.stringify({
            name: '',
            id: '',
          });
        }
      });
    }
    setFrameState({
      tabData: {
        ...tabData,
        [selectListTabId]: JSON.stringify(listRowData) !== '{}' ? listRowData : data,
      },
      originTabData: {
        ...this.props.originTabData,
        [selectListTabId]: JSON.stringify(listRowData) !== '{}' ? listRowData : data,
      },
    })
    ;
    this.setState({
      popupTabInfo,
      visible: true,
      type,
    });
  };
  // 普通按钮
  handleNormalBtn = (btn) => {
    const { id: btnId, relationTabId, elementFormat } = btn;
    const { tabList, activeTreeNode, prevTabInfo, tabInfo, triggerMap, elementMap, prevListRowData, userInfo, tabData, afterSave, filePassList } = this.props;
    const { showType, id } = tabInfo;
    let leftListTabInfo = tabList.find(item => item.showType === 3);
    let leftIdEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
    let reqParams = tabData[id]; // 面板数据
    let idEle = elementMap[id].find(item => item.relationColumnName === 'id');
    const curEleTrigger = triggerMap[btnId] || [];
    const getIds = type => curEleTrigger.filter(item => item.triggerType === type).map(item => item.id).join(',');
    let static_globalMap;
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
            treeNodeData: JSON.parse(activeTreeNode[`${leftIdEle.id}`]),
            globalVar: relationColumnValue,
          });
          if (JSON.stringify(parameterEle) !== '{}' && (jsonParse(reqParams[`a${parameterEle.id}`]).id !== '' || jsonParse(reqParams[`a${parameterEle.id}`]).id !== undefined || jsonParse(reqParams[`a${parameterEle.id}`]).id !== null)) {
            triggerMapData[relationColumnValue] = jsonParse(reqParams[`a${parameterEle.id}`]).id;
          } else {
            triggerMapData[relationColumnValue] = globalVarValue || '';
          }
        } else {
          const { procedureMap } = item;
          procedureMap && Object.keys(procedureMap).forEach(items => {
            let currentEle = elementMap[tabInfo.id].find(item => item.parameter === procedureMap[items]);
            if (currentEle && (jsonParse(reqParams[`a${currentEle.id}`]).id !== '' || jsonParse(reqParams[`a${currentEle.id}`]).id !== undefined || jsonParse(reqParams[`a${currentEle.id}`]).id !== null)) {
              triggerMapData[procedureMap[items]] = jsonParse(reqParams[`a${currentEle.id}`]).id || '';
            } else {
              triggerMapData[procedureMap[items]] = getValueFromGlobalVariables({
                userInfo,
                treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[`${leftIdEle.id}`]) : {},
                globalVar: procedureMap[items],
              }) || '';
            }
          });
        }
      });
      static_globalMap = triggerMapData;
    } else {
      this.normalBtnRefresh(btn, () => {
        this.jumpToFile(btn, 1);
      });
    }
    const params = {
      static_globalMap,
      static_triggerIds: getIds(2),
      static_procedure_triggerids: getIds(3),
    };
    const { langLib } = this.context;
    relationTabId && this.setPopupTabInfo(btn);
    if (params.static_triggerIds || params.static_procedure_triggerids) {
      this.setBtnLoading(btn, true);
      normalButton(params).then(res => {
        const btnTriggerMap = triggerMap[btn.id] || [];
        let triggerList = btnTriggerMap.length && btnTriggerMap.filter(item => item.triggerType === 5) || [];
        if (triggerList.length) {
          this.httpRequest(btn, () => {
            this.refresh(btn);
          });
          return;
        }
        CMessage(langLib['message.save.success']);
        this.refresh(btn);
        this.setBtnLoading(btn, false);
      }, err => this.setBtnLoading(btn, false));
    } else {
      this.httpRequest(btn, () => {
        this.refresh(btn);
      });
    }
  };
  // 普通按钮刷新
  normalBtnRefresh = (btn, callback) => {
    const { fromType, afterSave } = this.props;
    const { basetype, elementFormat } = btn;
    const { langLib } = this.context;
    if (BTN_ELEMENT_TYPE.includes(basetype) && basetype !== 30) { // 普通按钮
      if (elementFormat === 1) { // 刷新本面板
        this.getData();
        callback && callback();
      } else if (elementFormat === 2 && fromType === 'relation') { // 关闭本面板并刷新上一个面板
        afterSave && afterSave(true);
        callback && callback();
      } else if (elementFormat === 3) {
        this.handleRefreshAll();
        callback && callback();
      } else {
        callback && callback();
      }
    }
  };
  // 刷新全面板
  handleRefreshAll = () => {
    const { tabs } = this.props;
    const { activeTabKey: tabKey } = tabs;
    this.context.dispatch({
      type: 'tabs/updateTabInfo',
      payload: {
        tabKey,
        isRefreshing: true,
      },
    });
    setTimeout(() => {
      this.context.dispatch({
        type: 'tabs/updateTabInfo',
        payload: {
          tabKey,
          isRefreshing: false,
        },
      });
    }, 0);
  };
  // 类似普通按钮的功能
  handleNormalBtnCopy = (btn) => {
    const { id: btnId, relationTabId, elementFormat } = btn;
    const { prevTabInfo, tabInfo, triggerMap, elementMap, prevListRowData, userInfo, tabData, afterSave } = this.props;
    const { showType, id } = tabInfo;
    let tabInfoData = tabData[id]; // 面板数据
    // 找出面板的id字段控件
    let idEle = elementMap[id].find(item => item.relationColumnName === 'id');
    const curEleTrigger = triggerMap[btnId] || [];
    const getIds = type => curEleTrigger.filter(item => item.triggerType === type).map(item => item.id).join(',');
    let static_globalMap;
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
            treeNodeData: JSON.parse(tabInfoData[`a${idEle.id}`]),
            globalVar: relationColumnValue,
          });
          triggerMapData[relationColumnValue] = (tabInfoData[`a${parameterEle.id}`] && JSON.parse(tabInfoData[`a${parameterEle.id}`]).id) || globalVarValue || '';
        } else {
          const { procedureMap } = item;
          procedureMap && Object.keys(procedureMap).forEach(items => {
            let currentEle = elementMap[tabInfo.id].find(item => item.parameter === procedureMap[items]);
            triggerMapData[procedureMap[items]] = currentEle && tabInfoData[`a${currentEle.id}`] && JSON.parse(tabInfoData[`a${currentEle.id}`]).id || getValueFromGlobalVariables({
              userInfo,
              treeNodeData: JSON.parse(tabInfoData[`a${idEle.id}`]),
              globalVar: procedureMap[items],
            });
          });
        }
      });
      static_globalMap = triggerMapData;
    }
    const params = {
      static_globalMap,
      static_triggerIds: getIds(2),
      static_procedure_triggerids: getIds(3),
    };
    if (params.static_triggerIds || params.static_procedure_triggerids) {
      this.setBtnLoading(btn, true);
      normalButton(params).then(res => {
        this.setBtnLoading(btn, false);
      }, err => this.setBtnLoading(btn, false));
    }
  };
  // 第三方接口请求
  httpRequest = (btn, callback, otherParam = '') => {
    const { triggerMap, userInfo } = this.props;
    const { id } = btn;
    const btnTriggerMap = triggerMap[id] || [];
    let triggerList = btnTriggerMap.length && btnTriggerMap.filter(item => item.triggerType === 5) || [];
    let arr = []; // 所有参数集合
    let globalMap = {};
    if (triggerList.length) {
      const { langLib } = this.context;
      let params = { triggerIds: triggerList.map(item => item.id).join(',') };
      triggerList.forEach(item => arr.push(...item.httpRequestList));
      arr.forEach(item => {
        if (isGlobalOrCustomVar(item.paramValue)) {
          globalMap[item.paramValue] = getValueFromGlobalVariables({
            globalVar: item.paramValue,
            userInfo,
          });
          if (!globalMap[item.paramValue] && !otherParam) { // 兼容表单中的
            globalMap[item.paramValue] = this.getValueFromCurrentTabData(item.paramValue);
          } else if (!globalMap[item.paramValue] && otherParam && otherParam.type === 'ROW_EDIT') {
            globalMap[item.paramValue] = this.getValueFromCurrentColumn(item.paramValue, otherParam.data);
          }
        }
      });
      params.globalMap = globalMap;

      httpRequest(params).then(res => {
        CMessage(langLib['message.check.success']);
        if (callback) {
          callback();
        }
      });
    }
  };

  // 获取面板内容
  getTabContent = () => {
    const { userInfo, functionData, originTabData, filterMap, tabInfo, fileRelationList, updataPageIndexOrSize, ele = {}, params = {}, tabList, leftStatusList, isNew, form, actionType, elementMap = {}, tabData = {}, tabDropDownList, triggerMap, setFrameState, originElementMap, activeTreeNode, changeSelectedRows, fromType, prevListRowData } = this.props;
    const { currentForm, visible, popupTabInfo, tabDropDownData, filesData, stepList, externalParameters } = this.state;
    const { jumpUrl, id: tabId } = tabInfo;
    let content = null, SubPanelEle = null, SubPanelTabInfo = null;
    const elementListArr = elementMap[tabId] || [];
    let SubPanelList = elementListArr.filter(item => item.basetype === 42) || [];
    SubPanelList.length && SubPanelList.forEach(item => {
      const { relationTabId } = item;
      let TabInfo = !!relationTabId && tabList.find(item => item.id === relationTabId) || {};
      if (TabInfo.showType === 1) {
        SubPanelEle = item;
        SubPanelTabInfo = TabInfo;
      }
    });
    if (SubPanelEle) {
      let btnArr = JSON.stringify(elementMap) !== '{}' && elementMap[tabId].filter(item => BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
      let footer = btnArr.length ? <FooterButton
        triggerMap={triggerMap}
        fromType={fromType}
        elementList={elementMap[tabId]}
        handleClickBtn={this.handleClickBtn}
      /> : null;
      const formProps = {
        stepList,
        setPopupTabInfo: this.setPopupTabInfo,
        setPopupTabInfo1: this.setPopupTabInfo1,
        fetchTabDropDownData: this.fetchTabDropDownData,
        fileRelationList: fileRelationList,
        tabDropDownData: tabDropDownData,
        getSubPanelListData: this.getSubPanelListData,
        getValueFromCurrentTabData: this.getValueFromCurrentTabData,
        wrappedComponentRef: form => this.detailFormRef = form,
      };
      console.log(currentForm);
      const listProps = {
        formData: currentForm,
        updataState: this.updataState,
        updataPageIndexOrSize: this.getSubPanelListData,
        setPopupTabInfo: this.setPopupTabInfo,
        selectedListArr: this.state.selectedListArr,
        tabInfo: SubPanelTabInfo,
        SubPanel: SubPanelEle,
      };
      return <div key={tabId} className={fromType ? styles.contentWrapModal : styles.contentWrap}>
        <div className={styles.content2}>
          <Form>
            <MixedPanel
              {...this.props}
              formProps={formProps}
              listProps={listProps}
            />
          </Form>
        </div>
        {footer}
      </div>;
    }
    switch (tabInfo.showType) {
      case 1:
        let elementObj = elementMap[tabInfo.id] || [];
        let btnGroup = elementObj.filter((item) => {
          return (BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
        }) || [];
        let topBtn = btnGroup.length ? <ListBtn
          {...this.props}
          handleClickBtn={this.handleClickBtn}
          normalBtnInList={this.normalBtnInList}
        /> : null;
        let styleContent = this.props.checkboxType === 'radio' || this.props.checkboxType === 'checkbox' ? styles.contentWrap1 : styles.contentWrap;
        return content =
          <div key={tabId} className={styleContent}>
            <div className={styles.content}>
              <DetailList
                {...this.props}
                tabList={tabList}
                triggerMap={triggerMap}
                elementMap={elementMap}
                originElementMap={originElementMap}
                activeTreeNode={activeTreeNode}
                tabInfo={tabInfo}
                formData={currentForm}
                tabData={tabData}
                tabDropDownData={tabDropDownData}
                updataState={this.updataState}
                updataPageIndexOrSize={this.getRelationList}
                fetchListData={this.getRelationList}
                btnGroups={topBtn}
                setPopupTabInfo={this.setPopupTabInfo}
                selectedListArr={this.state.selectedListArr}
                multiJump={this.multiJumpBtn}
                saveInListBtn={this.saveInList}
                multiTabJump={this.multiTabBtn}
              />
            </div>
          </div>;
      case 2:
        let btnArr = JSON.stringify(elementMap) !== '{}' && elementMap[tabId].filter(item => BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
        let footer = btnArr.length ? <FooterButton
          triggerMap={triggerMap}
          fromType={fromType}
          elementList={elementMap[tabId]}
          handleClickBtn={this.handleClickBtn}
        /> : null;
        return content = <div key={tabId} className={fromType ? styles.contentWrapModal : styles.contentWrap}>
          <div className={styles.content2}>
            <Form>
              <DetailForm
                {...this.props}
                isNew={isNew}
                triggerMap={triggerMap}
                elementMap={elementMap}
                updataState={this.updataState}
                // elementMap={currentElementMap}
                originElementMap={originElementMap}
                activeTreeNode={activeTreeNode}
                tabInfo={tabInfo}
                formData={getDefaultValueFromCurrentTab({ currentTabData: tabData[tabId], elementMap, tabInfo }) || {}}
                originTabData={originTabData}
                tabData={tabData}
                filterMap={filterMap}
                setPopupTabInfo={this.setPopupTabInfo}
                setPopupTabInfo1={this.setPopupTabInfo1}
                setCustomPopUpList={this.setCustomPopUpList}
                fetchTabDropDownData={this.fetchTabDropDownData}
                fileRelationList={this.state.fileRelationList}
                prevListRowData={prevListRowData}
                tabDropDownData={tabDropDownData}
                getValueFromCurrentTabData={this.getValueFromCurrentTabData}
                wrappedComponentRef={form => this.detailFormRef = form}
                stepList={stepList}
              />
            </Form>
          </div>
          {footer}
        </div>;
      case 4:
        return content = <div key={tabId} className={styles.contentWrap}>
          <RelationPopupList
            {...this.props}
            tabList={tabList}
            triggerMap={triggerMap}
            elementMap={elementMap}
            originElementMap={originElementMap}
            activeTreeNode={activeTreeNode}
            tabInfo={tabInfo}
            formData={currentForm}
            tabData={tabData}
            tabDropDownList={tabDropDownList}
            leftStatusList={leftStatusList}
            setFrameState={setFrameState}
            handleClickBtn={this.handleClickBtn}
            fetchListData={this.getRelationList}
            updataState={this.updataState}
            tabDropDownData={tabDropDownData}
            updataPageIndexOrSize={this.getRelationList}
            normalBtnInList={this.normalBtnInList}
            checkBeforeHandleClick={this.checkBeforeHandleClick}
            setPopupTabInfo={this.setPopupTabInfo}
            selectedListArr={this.state.selectedListArr}
            multiJump={this.multiJumpBtn}
            saveInListBtn={this.saveInList}
            multiTabJump={this.multiTabBtn}
          />
        </div>;
      case 6:
        let btnArr1 = JSON.stringify(elementMap) !== '{}' && elementMap[tabId].filter(item => BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
        let footer1 = btnArr1.length ? <FooterButton
          triggerMap={triggerMap}
          fromType={fromType}
          elementList={elementMap[tabId]}
          handleClickBtn={this.handleClickBtn}
        /> : null;
        return content = <div key={tabId} className={styles.contentWrap}>
          <div className={styles.content2}>
            <Form>
              <DetailForm
                {...this.props}
                isNew={isNew}
                triggerMap={triggerMap}
                elementMap={elementMap}
                originElementMap={originElementMap}
                activeTreeNode={activeTreeNode}
                tabInfo={tabInfo}
                formData={tabData[tabId] || {}}
                tabData={tabData}
                setPopupTabInfo={this.setPopupTabInfo}
                tabDropDownList={tabDropDownList}
                fileRelationList={fileRelationList}
                prevListRowData={prevListRowData}
                tabDropDownData={tabDropDownData}
                wrappedComponentRef={form => this.detailFormRef = form}
              />
            </Form>
          </div>
          {footer1}
        </div>;
      case 7:
        return (
          <div className={styles.dataSty}>
            <RelationFileTab
              wrappedComponentRef={ref => this.relationFileTabRef = ref}
              functionData={functionData}
              userInfo={userInfo}
            />
          </div>
        );
      case 11:
        return (
          <div className={styles.contentWrap}>
            <iframe src={`${jumpUrl}?${qsStringify(externalParameters)}`}
                    frameBorder={0}
                    style={{ 'width': '100%', 'height': 'calc(100%)' }}
            />
          </div>
        );
      default:
        return null;
    }
    return (
      { content }
    );
  };
  // 列表中的保存
  saveInList = (eleObj, record) => {
    if (!this.checkBeforeHandleClick(eleObj, record)) return;
    const { activeTreeNode, tabInfo, tabList, elementMap, triggerMap, userInfo } = this.props;
    const { id: btnId, relationTableName } = eleObj;
    const elementList = elementMap[tabInfo.id];
    const curEleTrigger = triggerMap[btnId] || [];
    let triggerMapData = {};
    let leftListTabInfo = tabList.find(item => item.showType === 3);
    let idEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id');
    let reqParams = {};
    if (curEleTrigger && curEleTrigger.length) {
      let triggerMapData = {};
      curEleTrigger.forEach(item => {
        const { relationColumnValue, valueType } = item;
        if (valueType === 2) {
          // 定义变量的控件
          const parameterEle = elementMap[tabInfo.id].find(ele => ele.parameter === relationColumnValue) || {};
          const { mainTableName, relationColumnName, id } = parameterEle;
          const globalVarValue = getValueFromGlobalVariables({
            userInfo,
            treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
            globalVar: relationColumnValue,
          });
          let currentEle = elementList.find(item => item.parameter === relationColumnValue);
          if (currentEle && (record[`${currentEle.id}`] !== '' || record[`${currentEle.id}`] !== undefined || record[`${currentEle.id}`] !== null)) {
            triggerMapData[relationColumnValue] = JSON.parse(record[`${currentEle.id}`]).id || '';
          } else {
            triggerMapData[relationColumnValue] = globalVarValue || '';
          }
        } else {
          const { procedureMap } = item;
          procedureMap && Object.keys(procedureMap).forEach(items => {
            let currentEle = elementList.find(item => item.parameter === procedureMap[items]);
            if (currentEle && (record[`${currentEle.id}`] !== '' || record[`${currentEle.id}`] !== undefined || record[`${currentEle.id}`] !== null)) {
              triggerMapData[procedureMap[items]] = currentEle && JSON.parse(record[`${currentEle.id}`]).id || '';
            } else {
              triggerMapData[procedureMap[items]] = getValueFromGlobalVariables({
                userInfo,
                treeNodeData: JSON.stringify(activeTreeNode) !== '{}' ? JSON.parse(activeTreeNode[idEle.id]) : {},
                globalVar: procedureMap[items],
              }) || '';
            }
          });
        }
      });
      reqParams.static_triggerIds = curEleTrigger.filter(item => item.triggerType === 2).map(item => item.id).join(',');
      reqParams.static_procedure_triggerids = curEleTrigger.filter(item => item.triggerType === 3).map(item => item.id).join(',');
      reqParams.static_globalMap = triggerMapData;
    }
    let newParams = {};
    Object.keys(record).forEach(item => {
      let elementObj = elementList.find(items => +items.id === +item && !NO_SUBMIT_ELEMENT_TYPE.includes(items.basetype));
      if (elementObj) {
        const value = JSON.parse(record[elementObj.id]).id;
        newParams[elementObj.relationColumnName] = value || '';
        if (elementObj.relationColumnName === 'orgid') newParams[elementObj.relationColumnName] = value || -1;
      }
    });
    let newReqParams = {
      ...reqParams,
      ...newParams,
      static_tableName: relationTableName,
    };
    const { langLib } = this.context;
    handleSave(newReqParams).then(res => {
      CMessage(langLib['message.save.success']);
      const curEleTrigger = triggerMap[btnId] || [];
      let triggerList = curEleTrigger.length && curEleTrigger.filter(item => item.triggerType === 5) || [];
      if (triggerList.length) { // 如果有第三方接口，就第三方接口完成才刷新
        this.httpRequest(eleObj, '', { type: 'ROW_EDIT', data: record });
        return;
      }
      this.normalBtnRefresh(eleObj, () => {
        this.getData();
      });
    }, err => console.log(err));
  };
  // 获取行编辑中某列的数据
  getValueFromCurrentColumn = (varName, record) => {
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
    return JSON.parse(record[currentEle.id]).id;
  };

  render() {
    const { loading, tabInfo, fromType, tabData, prevTabInfo } = this.props;
    const { loadingStatus, visiblePopup, popupTabInfo = {}, formData = {}, visible, type } = this.state;
    const tabCls = classNames({
      'custom-pageConfig-tabs': true,
      [styles.tabWrap]: true,
    });
    return (
      <div className={styles.wrap} id="listObj">
        <CSpin spinning={loading}>
          {fromType === 'relation' ? this.getTabContent() : <Card
            className={tabCls}
            animated={false}
            bordered={false}
            tabList={this.filterTabNameList()}
            activeTabKey={`${tabInfo.id}`}
            onTabChange={activeTabKey => this.handleChangeTab(activeTabKey)}
          >
            {this.getTabContent()}
          </Card>}
        </CSpin>
        <RenderModal
          visible={visible}
          title={popupTabInfo.name}
          onCancel={() => this.handleCancelModal(false)}
          footer={null}
          size="large"
        >
          <ContentContainer
            {...this.props}
            fromType="relation"
            tabInfo={popupTabInfo}
            prevTabInfo={tabInfo}
            prevListRowData={tabData}
            type={type}
            afterSave={(flag) => this.handleCancelModal(flag)}
          />
        </RenderModal>
      </div>
    );
  }
};

export default ContentContainer;
