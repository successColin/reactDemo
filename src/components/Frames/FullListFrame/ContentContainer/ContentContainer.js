/*
 * @Author: Fus
 * @Date:   2019-11-07 09:10:20
 * @Desc: 面板容器
 */
import React, { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { message } from 'antd';
import { CButton, CMessage, CSpin } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import FullList from './FullList/FullList';
import RelationPopupList from './PopupList/PopupList';
import qsStringify from 'qs-stringify';
import moment from 'moment';
import classNames from 'classnames';
import DetailForm from './DetailForm/DetailForm';
import FooterButton from './FooterButton/FooterButton';
import RelationFileTab from '@/components/common/RelationFileTab/RelationFileTab';
import MessageTemplate from '@/components/common/MessageTemplate/MessageTemplate';
import BPMAuditPanel from '@/components/Frames/FullListFrame/ContentContainer/BPMAuditPanel/BPMAuditPanel';
import DetailList from '@/components/Frames/FullListFrame/ContentContainer/DetailList/DetailList';
import ListBtn from '@/components/Frames/FullListFrame/ContentContainer/ListButton/FooterButton';
import query from '@/constants/query';
import {
  BTN_ELEMENT_TYPE,
  NO_SUBMIT_ELEMENT_TYPE,
  TIME_DEFAULT_VALUES,
  IGNORE_FORM_ITEM,
  HIDE_IN_LIST_ELEMENT_TYPE, SEARCH_SELECT_TYPE, FILTER_ELEMENT_TYPE,
} from '@/constants/element';
import {
  controlAuthority,
  filterHiddenFormData, getDefaultConfirmProps, getFunctionComDetail,
  getValueFromGlobalVariables,
  isGlobalOrCustomVar,
  jsonParse, matchGlobalFunctionParam,
  matchGlobalVars, parseDecimal, validTriggerMatch,
  reducerVariableToArray,
  multiDataComparison,
  getParamsValueFromState, jumpFileOfCommon, compoundArithmetic, validMatchMultiTrigger,
} from '@/utils/common';
import styles from './ContentContainer.less';
import {
  updateOrInsertFull,
  getList,
  getFormDetial,
  delFullList,
  fullBatchUpdate,
  normalButton,
  doUpdate, filedRelationInsert,
} from '@/services/leftListFrame';
import { BaseContext, NEED_CLEAR_SATATE_TABS } from '@/constants/global';
import {
  getPageSelectOptions,
  httpRequest,
  doBatchArchiveNormal,
  doBatchArchiveCycle, getNormalSearchDetail, getCheckBoxSearchDetail,
} from '@/services/frame';
import {
  arrayClassify, getDefaultValueFromCurrentTab,
  JumpFileDate,
  reduceArrObj,
  timeDiff,
} from '@/components/Frames/LeftListFrame/method';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import { getParams } from '@/services/global';
import { getThirdData } from '@/services/framePage';

const initQueryParams = {
  pageNum: 1,
  pageSize: 10,
};

class ContentContainer extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    fromType: 'normal', // 调用处（inPopup为弹出面板内，normal为普通）
  };
  state = {
    visiblePopup: false, // 弹出面板显示状态
    listRowData: {}, // 上一个面板的行数据(最后在props中取值)
    formData: {}, // 表单数据
    listData: {}, // 列表数据
    originFormData: {}, // 原始表单数据
    data: {},
    defaultData: {}, // 默认值
    tabData: {}, // 所有面板的数据
    triggerPopupEle: {}, // 按钮类型
    loadingStatus: {
      page: false, // 面板配置信息
      data: false, // 面板数据
    },
    btnType: '', // 点击新增时的标记
    fileRelationList: {}, // 图片
    pageIndex: 1,
    pageSize: 10,
    selectedArr: [], // 列表选中的数据
    popLoading: false, // 弹框中的loading
    downLoadLoading: false, // 下载的loading
    popType: 'inPopup', // 默认inPopup，只有点击高级筛选是fiterPopup
    filterEle: [], // 高级筛选的元素列表
    stepList: [], // 进度条列表
    thirdData: {}, // bpm数据集合
    externalParameters: {}, // 引入外部页面参数集合
    seniorFilter: {}, // 高级筛选的条件
    filePassList: {},  // 图片参数的值
  };

  componentDidMount() {
    const { fromType } = this.props;
    if (fromType === 'inPopup') {
      this.doFetchPageData();
    }
  }

  // 获取页面的业务数据
  async doFetchPageData() {
    const { tabInfo, prevListRowData, prevTabInfo, selectedArr, elementMap, userInfo } = this.props;
    const { showType, fileRelationTableName, fileRelationParam, fileRelationColumnName, tableGroupName } = tabInfo;
    // 列表
    if (showType === 1 || showType === 4 || showType === 5) {
      console.log('列表');
      this.fetchListData({});
      return;
    } else if (showType === 2 || showType === 6) { // 表单
      const tabInfoElememt = elementMap[tabInfo.id] || [];
      let defaultValue = await this.getDefaultValueFromAllElements(tabInfoElememt);
      let preData = this.getPreTabData(defaultValue);
      this.setState({
        defaultData: { ...defaultValue, ...preData },
      });
      if (JSON.stringify(prevListRowData) === '{}') {
        console.log(defaultValue, 'defaultValue');
        this.setState({
          tabData: {
            [tabInfo.id]: defaultValue,
          },
          originFormData: {
            [tabInfo.id]: defaultValue,
          },
        }, () => {
          this.fetchTabDropDownData();
          this.checkTriggerResult();
        });
      } else {
        this.fetchFormData();
      }
    } else if (showType === 7) {
      let idEle = elementMap[prevTabInfo.id].find(item => item.relationColumnName === 'id');
      if (idEle && JSON.stringify(prevListRowData) !== '{}') {
        this.relationFileTabRef && this.relationFileTabRef.fetchRelationFiles({
          relationId: this.getPrevTabWidgetValue({ globalVar: fileRelationParam }),
          relationTableName: fileRelationTableName,
          relationColumnName: fileRelationColumnName,
          tableGroupName: tableGroupName,
        });
      }
    } else if (showType === 8) {
      let idEle = elementMap[prevTabInfo.id].find(item => item.relationColumnName === 'id');
      if (idEle && JSON.stringify(prevListRowData) !== '{}') {
        this.messageRef && this.messageRef.getDetial({
          messageInstanceId: prevListRowData[`a${idEle.id}`],
        });
      }
    } else if (showType === 10) {
      const { commonApiHeaderId, id } = tabInfo;
      getParams({
        commonApiHeaderId,
        tabId: id,
      }).then((res = []) => {
        let apiParams = {};
        res.forEach(item => {
          if (item.initValue.indexOf('@@') > -1) {
            let relationId = getValueFromGlobalVariables({
              userInfo,
              globalVar: item.initValue,
            }) || getParamsValueFromState(item.initValue, { userInfo });
            if (!relationId) {
              const { prevTabInfo, prevListRowData, elementMap } = this.props;
              if (JSON.stringify(prevTabInfo) === '{}' && JSON.stringify(prevListRowData) === '{}') return;
              let eleoBJ = elementMap[prevTabInfo.id].find(items => items.parameter === item.initValue);
              if (!eleoBJ) return;
              let jsonName = prevListRowData[`${eleoBJ.id}`];
              let id = jsonName && JSON.parse(jsonName) && JSON.parse(jsonName).id;
              apiParams[item.paramKey] = (id === 'undefined' || id === 'null' || !id) ? -1 : id;
            } else {
              apiParams[item.paramKey] = relationId || '';
            }
          } else {
            apiParams[item.paramKey] = item.initValue || '';
          }
        });
        let newParams = {
          commonApiHeaderId,
          tabId: id,
          paramMap: apiParams,
        };
        this.getBPMNPanelData(tabInfo, newParams);
      });
    } else if (showType === 11) {
      this.getExternalParameters();
    }
  }

  getPrevTabWidgetValue = ({ globalVar }) => {
    const { userInfo, elementMap, prevTabInfo, prevListRowData } = this.props;
    let relationId = getValueFromGlobalVariables({
      userInfo,
      globalVar,
    });
    if (!relationId) {
      let eleoBJ = elementMap[prevTabInfo.id].find(item => item.parameter === globalVar);
      if (!eleoBJ) return;
      const { showType } = prevTabInfo;
      let jsonName = prevListRowData[`${eleoBJ.id}`];
      if (showType === 2) {
        jsonName = prevListRowData[`a${eleoBJ.id}`];
      }
      let id = jsonName && JSON.parse(jsonName) && JSON.parse(jsonName).id;
      relationId = id || globalVar;
    }
    return relationId;
  };
  // 获取外部页面的参数
  getExternalParameters = () => {
    const { tabInfo: { id }, elementMap, tabList, userInfo, prevTabInfo, prevListRowData } = this.props;
    const elementList = elementMap[id] || [];
    const paramElement = elementList.filter(item => !!item.parameter) || [];
    let externalParameters = {};
    paramElement.forEach(item => {
      const { defaultValue, parameter } = item;
      let idEle = elementMap[prevTabInfo.id].find(item => item.relationColumnName === 'id');
      if (JSON.stringify(prevListRowData) !== '{}') {
        externalParameters[parameter] = this.getPrevTabWidgetValue({ globalVar: defaultValue }) || defaultValue;
      }
    });
    this.setState({ externalParameters });
  };

  // 获取bpm流程面板的数据信息
  // 根据面板获取是否有子面板，如果有子面板，就获取子面板中的数据
  getBPMNPanelData = (tabInfo, newParams) => {
    getThirdData(newParams).then(res => {
      const { elementMap, tabList, userInfo } = this.props;
      const elementList = elementMap[tabInfo.id] || [];
      const subPanel = elementList.find(item => item.basetype === 42);
      if (!subPanel || !subPanel.relationTabId) {

      } else {
        const { relationTabId } = subPanel;
        const listPanel = tabList.find(item => item.id === relationTabId); // 获取子面板关联的面板信息
        const { commonApiHeaderId, id } = listPanel;
        getParams({ commonApiHeaderId, tabId: id }).then((data = []) => {
          let params = {};
          data.forEach(item => {
            params[item.paramKey] = res[item.paramKey] || getParamsValueFromState(item.initValue, { userInfo });
          });
          let newParams = {
            commonApiHeaderId,
            tabId: id,
            paramMap: params,
          };
          getThirdData(newParams).then(listdata => {
            this.setState({
              thirdData: {
                formData: res,
                listData: listdata,
              },
            });
          });
        });
      }
    });
  };

  getPreTabData = (defaultValue) => {
    const { tabInfo, elementMap, prevListRowData, prevTabInfo } = this.props;
    if (JSON.stringify(prevTabInfo) === '{}') {
      return defaultValue;
    }

    const { showType } = prevTabInfo;
    const tabInfoId = prevTabInfo.id;
    const popupElementMapList = elementMap[tabInfo.id];
    let data = {};
    const elementMapList = elementMap[tabInfoId];
    if (showType === 2) {
      const tabInfoData = prevListRowData;
      elementMapList.forEach((item) => {
        let hasDefaultValueEle = popupElementMapList.find(items => {
          return items.defaultValue && items.defaultValue.indexOf('@@') > -1 && items.defaultValue === item.parameter;
        });
        if (hasDefaultValueEle) {
          data[`a${hasDefaultValueEle.id}`] = tabInfoData[`a${item.id}`];
        }
      });
    }
    return data;
  };

  // 获取所有空间的默认值,只对于表单的中的控件
  // 判断全局变量是否有值，如果没有值，在去看是否是数据选择框，如果不是，直接取默认值
  async getDefaultValueFromAllElements(element = []) {
    let obj = {};
    if (!element.length) return;
    let formElement = element.filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype)) || [];
    const { userInfo, tabs } = this.props;
    const fileData = tabs.activeTabData.fileData || '';
    for (const item of formElement) {
      let { id, basetype, defaultValue, mainColumnName, mainTableName } = item;
      if (defaultValue) {
        let valueId = getValueFromGlobalVariables({
          userInfo,
          globalVar: defaultValue,
        });
        let valueName = getValueFromGlobalVariables({
          userInfo,
          globalVar: defaultValue,
          isRealValue: false,
        });
        if (valueId) {
          let data = {
            id: valueId, name: valueName,
          };
          obj[`a${id}`] = JSON.stringify(data);
        } else {
          if (fileData[defaultValue]) {
            obj[`a${id}`] = fileData[defaultValue].data;
          } else if (basetype === 3 && !isNaN(Number(defaultValue))) {
            await getNormalSearchDetail({
              tabSource: mainTableName,
              id: defaultValue,
            }).then(res => {
              return new Promise(resolve => {
                obj[`a${id}`] = JSON.stringify({ id: defaultValue, name: res[mainColumnName] });
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
            obj[`a${id}`] = JSON.stringify({ id: '', name: '' });
          } else {
            obj[`a${id}`] = JSON.stringify({ id: defaultValue, name: defaultValue });
          }
        }
      }
    }
    return obj;
  };

  // 获取表单数据
  fetchFormData = () => {
    const { langLib } = this.context;
    let { tabList, originElementMap, tabInfo, prevTabInfo, prevListRowData, elementMap, advancedQueryMap, fromType } = this.props;
    const relationTabId = prevTabInfo.id;
    const queryList = advancedQueryMap[tabInfo.id] || [];
    const elementList = elementMap[tabInfo.id] && elementMap[tabInfo.id].filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype)).map(item => {
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
    let id = null;
    if ((!Array.isArray(prevListRowData)) && fromType === 'inPopup' && JSON.stringify(prevListRowData) !== '{}') {
      // 面板过滤条件
      const filterIdData = queryList.find(item => item.asqlColumnName === 'id') || {};
      const { asqlValueType, asqlValue } = filterIdData;
      // 值类型为【值】，直接取值
      if (asqlValueType === 1) {
        id = asqlValue;
      } else if (asqlValueType === 2) { // 值类型为【变量】，取上个面板传入的数据中对应的变量值
        const ele = elementMap[prevTabInfo.id].find(item => item.parameter === asqlValue) || {};
        const { showType } = prevTabInfo;
        if (showType === 2) {
          id = this.getValueFromFilter({ varName: asqlValue }) || JSON.parse(prevListRowData[`a${ele.id}`]).id;
        } else {
          id = this.getValueFromFilter({ varName: asqlValue }) || JSON.parse(prevListRowData[`${ele.id}`]).id;
        }
      }
    }
    const params = {
      tabSource: tabInfo.relationTableName,
      id,
      elementList,
    };
    const { defaultData } = this.state;
    if (id) {
      getFormDetial(params).then(res => {
        let reduceRes = this.reduceFormData(elementMap[relationTabId], res);
        let data = {};
        Object.keys(reduceRes).forEach(item => {
          data[item] = reduceRes[item] && JSON.parse(reduceRes[item]).id ? reduceRes[item] : (defaultData[item] || JSON.stringify({
            name: '',
            id: '',
          }));
        });
        console.log('fetchFormData', data);
        this.setState({
          tabData: {
            [tabInfo.id]: data,
          },
          originFormData: {
            [tabInfo.id]: data,
          },
        }, () => {
          this.fetchTabDropDownData();
          this.checkTriggerResult();
          let SubPanelList = originElementMap[tabInfo.id].filter(item => item.basetype === 42) || [];
          for (let i = 0; i < SubPanelList.length; i++) {
            const { relationTabId } = SubPanelList[i];
            let TabInfo = !!relationTabId && tabList.find(item => item.id === relationTabId) || {};
            if (TabInfo.showType === 9) {
              this.getSubPanelListData({}, 9);
            }
          }
        });
      });
    } else {
      this.setState({
        tabData: {
          [tabInfo.id]: defaultData,
        },
        originFormData: {
          [tabInfo.id]: defaultData,
        },
      }, () => {
        this.fetchTabDropDownData();
        this.checkTriggerResult();
      });
    }
  };
  // 获取子面板中列表的数据
  getSubPanelListData = ({ queryParams = initQueryParams, calendarList = [] }, type = 1) => {
    const { tabList, userInfo, elementMap, advancedQueryMap, tabInfo } = this.props;
    const tabId = tabInfo.id;
    const { pageNum, pageSize } = queryParams;
    const tabInfoElememt = elementMap[tabId];
    let SubPanelList = tabInfoElememt.filter(item => item.basetype === 42) || [];
    let listTabInfo = null;
    for (let i = 0; i < SubPanelList.length; i++) {
      const { relationTabId } = SubPanelList[i];
      let TabInfo = !!relationTabId && tabList.find(item => item.id === relationTabId);
      listTabInfo = TabInfo;
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
              });
              if (!globalVar.value && !globalVar.type) {
                globalVar = this.getFilterData(varName, 'obj');
              }
              globalQueryMap[varName] = globalVar;
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
  checkTriggerResult = () => {
    const { tabInfo, originElementMap } = this.props;
    const elementList = originElementMap[tabInfo.id];
    this.CustomForeach(elementList, async(eleObj, i) => {
    });
  };

  async CustomForeach(arr, callback) {
    const { tabInfo, triggerMap, userInfo } = this.props;
    const { tabData } = this.state;
    const formData = tabData[tabInfo.id] || {};
    let len = arr.length;
    for (let i = 0; i < len; i++) {
      let item = arr[i];
      const { basetype } = item;
      // 该元素有配置触发器
      const targetEleList = triggerMap[item.id] || [];
      const filterTriggerMap = targetEleList.filter(item => item.triggerType === 1 && item.basetype === 4) || [];
      if (!filterTriggerMap.length) continue;
      let value = null;
      if (item.defaultValue && isGlobalOrCustomVar(item.defaultValue)) {
        value = getValueFromGlobalVariables({
          globalVar: item.defaultValue,
          userInfo,
        });
      }
      let dataId = JSON.stringify(formData) !== '{}' && formData[`a${item.id}`] && JSON.parse(formData[`a${item.id}`]).id;
      if (basetype === 3 && (dataId && !isNaN(Number(dataId)) || value)) {
        dataId = dataId || value;
        // 数据选择框
        const { valueFieldType, mainTableName: tabSource, mainColumnName, id: eleId, basetype, relationColumnName } = item;
        this.fetchDetailById(item, dataId);
      } else if (basetype === 3 && !dataId) {
        this.handleNewTriggerEvent(item);
      } else if (basetype === 45) {
        this.fetchDetailById(item, dataId || item.defaultValue);
      } else {
        await this.handleNewChange(item, dataId);
      }
    }
  }

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
      const { tabInfo } = this.props;
      const { tabData } = this.state;
      let resData = basetype === 45 ? {
        id: res.map(item => item.id).join(','),
        name: res.map(item => item[mainColumnName]).join(','),
      } : {
        id: res.id || '',
        name: res[mainColumnName] || '',
      };
      this.setState({
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
  // 触发器实现新(数据选择框)
  handleNewTriggerEvent = (eleObj = {}, selecctedData = {}) => {
    const { triggerMap, elementMap = {}, tabInfo = {}, updataState } = this.props;
    const { tabData, originFormData } = this.state;
    const { id, basetype: eleObjBasetype } = eleObj;
    const eleTriggers = triggerMap[id];
    const targetEleList = []; // 目标控件列表
    const elementList = elementMap[tabInfo.id];
    // triggerType对应触发器值1前端2后3存储4js5http6jira
    // basetype对于的点击事件，区分数据变化，加载
    const triggers = eleTriggers && eleTriggers.filter(item => item.triggerType === 1 && item.basetype === 4) || [];
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
    });
    lastList.forEach(trigger => {
        const { relationElementValue, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible } = trigger;
        const targetEle = elementList.find(item => item.id === relationElementId);
        // 全局函数入参
        if (!targetEle) return;
        const { basetype, id, valueFieldType, mainColumnName, relationColumnName } = targetEle;
        if (relationElementValue === '@@InitValue') {
          let formData = originFormData;
          unsetData[`a${id}`] = formData[[`a${id}`]];
          let targetEleValue = formData[[`a${id}`]] && JSON.parse(formData[[`a${id}`]]) && JSON.parse(formData[[`a${id}`]]).id;
          // 该控件为选择框，则需要继续校验该控件的触发器
          if (targetEleValue && SEARCH_SELECT_TYPE.includes(basetype) && !isNaN(Number(targetEleValue))) {
            if (basetype === 17 && valueFieldType === 2) return;
            this.fetchDetailById(targetEle, +targetEleValue);
          }
        } else if (relationElementValue === '@@Null') {
          unsetData[`a${id}`] = JSON.stringify({ id: '', name: '' });
        } else if (!relationElementValue) {
          // targetEleData = { ...targetEleData };
        } else {
          const funcParam = matchGlobalFunctionParam(relationElementValue);
          let targetEleName = selecctedData[funcParam] || (relationElementValue && relationElementValue.indexOf('@@') > -1 ? this.getValueFromCurrentTabData(relationElementValue) : relationElementValue);
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
        const { form } = this.detailFormRef.props;
        form && form.resetFields([
          `a${id}`,
          `${IGNORE_FORM_ITEM}${id}`,
        ]);
        targetEleList.push({
          ...targetEle,
          requisite: relationElementRequisite,
          readonly: relationElementReadonly,
          visiabled: relationElementVisible,
        });
      },
    );
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
    this.setState({
      tabData: {
        ...tabData,
        [tabInfo.id]: {
          ...tabData[tabInfo.id],
          ...unsetData,
        },
      },
    });
  };
  // 数据变化
  handleNewChange = (eleObj, valStr) => {
    const { id, relationColumnType } = eleObj;
    if (relationColumnType === 4) {
      valStr = parseDecimal(valStr + '');
    }
    const { userInfo, originTabData, triggerMap, tabInfo, elementMap, updataState, originElementMap, getValueFromCurrentTabData, isNew } = this.props;
    const { tabData } = this.state;
    const elementList = elementMap[tabInfo.id] || [];
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
          relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible, relationElementValue, canModifyValue,
        } = item;
        relationElementValue = relationElementValue === null ? '' : relationElementValue;
        const targetEle = elementList.find(item => item.id === relationElementId) || {};
        const { mainTableName: tabSource, basetype, id: targetEleId, valueFieldType, mainColumnName } = targetEle;
        if (targetEle.elementFormat === 2) CascadeDropbox.push(targetEle);
        let value = relationElementValue;
        if (relationElementValue === '@@InitValue') {
          let formData = originTabData[tabInfo.id];
          targetEleData[`a${targetEleId}`] = formData[[`a${targetEleId}`]];
        } else if (relationElementValue === '@@Null') {
          targetEleData[`a${targetEleId}`] = JSON.stringify({ id: '', name: '' });
        } else if (!relationElementValue) {
        } else if (isGlobalOrCustomVar(relationElementValue)) {
          value = getValueFromGlobalVariables({
            globalVar: relationElementValue,
            userInfo,
          }) || this.getValueFromCurrentTabData(relationElementValue);
          targetEleData[`a${targetEleId}`] = JSON.stringify({ id: value, name: value });
        } else {
          targetEleData[`a${targetEleId}`] = JSON.stringify({ id: value, name: value });
        }
        if (value && SEARCH_SELECT_TYPE.includes(basetype) && !isNaN(Number(value))) {
          this.fetchDetailById(targetEle, +value);
        } else if (basetype === 45 && value) {
          this.fetchDetailById(targetEle, value);
        }
        // 属性的改变-改变对应数据
        targetEleList.push({
          ...targetEle,
          requisite: relationElementRequisite,
          readonly: relationElementReadonly,
          visiabled: relationElementVisible,
        });
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
      updataState({
        elementMap: {
          ...elementMap,
          [tabInfo.id]: [...newElementList],
        },
      });
      this.setState({
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
      this.setState({
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
  };
  // 获取列表数据
  fetchListData = () => {
    console.log('do fetchlist');
    const { pageIndex, pageSize, searchSelected, searchVal, seniorFilter } = this.state;
    const { fileInputData, tabs, fromType, userInfo, tabList, tabInfo, framePramDto, triggerMap, elementMap, advancedQueryMap } = this.props;
    let currentTabId = tabInfo.id;
    let elementList = elementMap[currentTabId].filter((item) => {
      return !BTN_ELEMENT_TYPE.includes(item.basetype);
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
          elementMultiRelation: item.elementMultiRelation,
        };
      } else {
        return {
          name: item.relationColumnName,
          baseType: item.basetype,
          mainColumnName: item.mainColumnName,
          mainTableName: item.mainTableName,
          elementId: item.id,
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
      pageNum: pageIndex,
      pageSize: pageSize,
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
        value: searchVal || '',
        tableName: currentEle.mainTableName || currentEle.relationTableName,
        elementId: currentEle.id,
      }];
    } else if (!searchSelected && !searchVal) {
      params.calendarList = [];
    } else {
      params.calendarList = quickQuerySelect.map(item => {
        return {
          field: item.mainColumnName || item.relationColumnName,
          value: searchVal || '',
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
              });
              if (!globalVar.value && !globalVar.type) {
                globalVar = this.getFilterData(varName, 'obj');
              }
              globalQueryMap[varName] = globalVar;
            }
          },
        );
      }
    });
    params.globalMap = globalMap;
    params.globalQueryMap = globalQueryMap;
    params.seniorFilterMap = seniorFilter;
    this.setState({ popLoading: true });
    if (fromType === 'normal') {
      this.props.getList();
    } else {
      getList(params).then(res => {
        this.setState({
          data: this.seBtnDataToCurrentFormList(res),
          popLoading: false,
        }, () => {
          tabInfo.canLineEdit === 1 && this.fetchTabDropDownData();
        });
      });
    }
  };
  /**
   * 根据面板的类型将对应的按钮的值转换进数组
   * @param tabInfo
   * @param elementMap
   * @param triggerMap
   * @param dataSource
   * @returns {[]}
   */
  seBtnDataToCurrentFormList = (dataSource) => {
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
      const { tabInfo, elementMap, userInfo, tabList } = this.props;
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
  // 赛选对应控件值
  getFilterData = (asqlValue, type) => {
    const { elementMap, prevTabInfo, prevListRowData } = this.props;
    const { id, showType } = prevTabInfo;
    const preTabInfoElementMap = elementMap[id];
    let currentAsql = preTabInfoElementMap.find(item => item.parameter === asqlValue);
    if (!currentAsql) return;
    const { relationColumnType } = currentAsql;
    if (type) {
      return JSON.stringify(prevListRowData) !== '{}' ? {
        value: showType === 2 ? (JSON.parse(prevListRowData[`a${currentAsql.id}`]).id || '') : (JSON.parse(prevListRowData[currentAsql.id]).id || ''),
        type: relationColumnType,
      } : { value: '', type: relationColumnType };
    } else {
      if (JSON.stringify(prevListRowData) !== '{}') {
        return showType === 2 ? (prevListRowData[`a${currentAsql.id}`] && JSON.parse(prevListRowData[`a${currentAsql.id}`]).id || '') : (JSON.parse(prevListRowData[currentAsql.id]).id || '');
      } else {
        return prevListRowData[currentAsql.id];
      }
    }
  };
  // 表单数据处理
  reduceFormData = (elementList, objRes = {}) => {
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
  // 设置弹出面板信息
  setPopupTabInfo = (eleObj, listRowData = {}, type) => {
    const { tabList, updataState, originElementMap, tabInfo, elementMap } = this.props;
    const { relationTabId, jumpType } = eleObj;
    if (jumpType === 3) { // 不执行任何逻辑
      return;
    } else if (jumpType === 2) { // 跳转菜单
      // 将带a的key转换成正常的
      let record = listRowData;
      const { showType } = tabInfo;
      if (showType === 2) {
        Object.keys(listRowData).forEach(item => {
          if (item.indexOf('a') > -1) record[item.replace('a', '')] = listRowData[item];
        });
      }
      this.multiJumpBtn(eleObj, record);
      return;
    }
    if (!relationTabId) return;
    const popupTabInfo = tabList.find(item => item.id === relationTabId);
    if (!popupTabInfo) return;
    updataState({
      elementMap: {
        ...elementMap,
        [relationTabId]: originElementMap[relationTabId],
      },
    });
    this.setState({
      popupTabInfo,
      listRowData,
      visiblePopup: true,
      triggerPopupEle: eleObj,
      popType: 'inPopup',
      btnType: type,
    });
  };
  // 关闭弹出面板
  handleCloseModal = (flag) => {
    if (this.props.tabInfo.mainTab === 1) {
      this.setState({
        fileRelationList: {},
      });
      this.props.updataState({ filePassList: {} });
    }
    this.setState({
      visiblePopup: false,
      selectedArr: [],
      btnType: '',
    }, () => {
      flag && this.doFetchPageData();
    });
  };// 更新主区块loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
        [type]: loading,
      },
    });
  };
  // 获取面板下的下拉数据
  fetchTabDropDownData = () => {
    const { tabInfo, elementMap, filterMap } = this.props;
    const relationTableId = tabInfo.id;
    const elementList = elementMap[relationTableId] || [];
    // 下拉框控件列表
    const dropDownList = elementList.filter(item => FILTER_ELEMENT_TYPE.includes(item.basetype) && !!item.mainTableName).map(item => ({
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
      case '@@Null':
        return '';
      default:
        return '';
    }
  };
  // 全局变量的值
  getValueFromCurrentTabData = (asqValue) => {
    if (!asqValue) return;
    if (typeof asqValue === 'object') {
      asqValue = asqValue.varName;
    }
    const { langLib } = this.context;
    const { tabInfo = {}, tabList, elementMap = {}, userInfo } = this.props;
    if (getValueFromGlobalVariables({
      globalVar: asqValue,
      userInfo,
    })) {
      return getValueFromGlobalVariables({
        globalVar: asqValue,
        userInfo,
      });
    }
    // 加减乘除四则混合运算
    if (asqValue.indexOf('@@CompoundArithmetic') > -1) {
      return compoundArithmetic({ asqValue, getValueFromCurrentTabData: this.getValueFromCurrentTabData, CMessage });
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

    const { tabData } = this.state;
    const relationTableId = tabInfo.id;
    let elementList = elementMap[relationTableId];

    let currentEle = elementList && elementList.find(item => item.parameter === asqValue);
    if (!currentEle) return;
    let tabInfoData = tabData[relationTableId] || {};
    let currentEleValue = currentEle && tabInfoData[`a${currentEle.id}`] && JSON.parse(tabInfoData[`a${currentEle.id}`]);
    const { valueFieldType, defaultValue } = currentEle;
    if (valueFieldType === 2) {
      return currentEleValue && currentEleValue.name || getValueFromGlobalVariables({
        globalVar: defaultValue,
        userInfo,
      }) || defaultValue || '';
    } else {
      return currentEleValue && currentEleValue.id || getValueFromGlobalVariables({
        globalVar: defaultValue,
        userInfo,
      }) || defaultValue || '';
    }
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
      const { selectedArr = [] } = this.state;
      const { canLineEdit } = tabInfo;
      const { basetype } = btn;
      let ListArr = canLineEdit === 1 && [7, 43, 44].includes(basetype) ? [record] : selectedArr;
      let isDefaultTrue = false, isExecuteConditionTrue = false;
      if (!defaultConditions) { // 没有默认条件时返回true
        isDefaultTrue = true;
      } else if (defaultConditions === 1 && ListArr.length === 1) { // defaultConditions=1且只选择一条数据了返回true
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
      console.log(isDefaultTrue, isExecuteConditionTrue, 'finally');
      return isDefaultTrue && isExecuteConditionTrue;
    }
  };
  // 点击按钮
  handleClickBtn = (btn) => {
    const { basetype, id, relationTabId } = btn;
    if (!this.checkBeforeHandleClick(btn)) return;
    switch (basetype) {
      case 24:
        this.normalBtn(btn);
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
        this.setPopupTabInfo(btn, {}, 'add');
        break;
      case 18:
        this.setPopupTabInfo(btn);
        break;
      case 29:
        this.doBatchModification(btn);
        break;
      case 30:
        this.doExport(btn);
        break;
      case 34:
        this.batchArchiveButton(btn); // 批量归档按钮(带周期)
        break;
      case 35:
        this.batchArchiveButton(btn); // 批量归档按钮(不带周期)
        break;
      case 43:
        this.multiJumpBtn(btn);      // 多菜单跳转
        break;
      case 44:
        this.multiTabBtn(btn);      // 多面板跳转
        break;
      default:
        return;
    }
  };
  httpQuestInList = (btn, record) => {
    const { userInfo, triggerMap, elementMap, tabInfo } = this.props;
    const { id } = btn;
    const btnTriggerMap = triggerMap[id] || [];
    let arr = []; // 所有参数集合
    let globalMap = {};
    let triggerList = btnTriggerMap.length && btnTriggerMap.filter(item => item.triggerType === 5);
    if (triggerList.length) {
      let params = { triggerIds: triggerList.map(item => item.id).join(',') };
      const { langLib } = this.context;
      triggerList.forEach(item => arr.push(...item.httpRequestList));
      arr.forEach(item => {
        if (isGlobalOrCustomVar(item.paramValue)) {
          let globalValue = getValueFromGlobalVariables({
            globalVar: item.paramValue,
            userInfo,
          }) || getParamsValueFromState(item.paramValue, { userInfo });
          globalMap[item.paramValue] = globalValue;
          if (!globalMap[item.paramValue]) {
            let elementList = elementMap[tabInfo.id] || [];
            let currentEle = elementList.find(items => items.parameter === item.paramValue);
            if (!currentEle) {
              globalMap[item.paramValue] = '';
            } else {
              globalMap[item.paramValue] = record[`a${currentEle.id}`];
            }
          }
        }
      });
      params.globalMap = globalMap;
      httpRequest(params).then(res => {
        CMessage(langLib['message.check.success']);
      });
    }
  };
  // 获取行编辑中某列的数据
  getValueFromCurrentColumn = (varName, record) => {
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
    return JSON.parse(record[currentEle.id]).id;
  };
  // 列表中的保存
  saveInList = (eleObj, record) => {
    if (!this.checkBeforeHandleClick(eleObj, record)) return;
    const { tabInfo, tabList, elementMap, triggerMap, userInfo } = this.props;
    const { id: btnId, relationTableName } = eleObj;
    const elementList = elementMap[tabInfo.id];
    const curEleTrigger = triggerMap[btnId] || [];
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
    updateOrInsertFull(newReqParams).then(res => {
      CMessage(langLib['message.save.success']);
      const curEleTrigger = triggerMap[btnId] || [];
      let triggerList = curEleTrigger.length && curEleTrigger.filter(item => item.triggerType === 5) || [];
      if (triggerList.length) { // 如果有第三方接口，就第三方接口完成才刷新
        this.httpRequest(eleObj, '', { type: 'ROW_EDIT', data: record });
        return;
      }
      this.doFetchPageData();
    }, err => console.log(err));
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
        this.httpQuestInList(btn, record);
        const { tabList } = this.props;
        const popupTabInfo = tabList.find(item => item.id === jumpTabId);
        this.httpRequest(btn, '', { type: 'ROW_EDIT', data: record });
        this.storedProcedure(btn, { type: 'ROW_EDIT', data: record });
        if (!popupTabInfo) return;
        this.setState({
          popupTabInfo,
          listRowData: record,
          visiblePopup: true,
          popType: 'inPopup',
        });
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
        return;
      }
    }
  };
  // 批量归档按钮(不带周期)
  batchArchiveButton = (btn) => {
    const { langLib } = this.context;
    const { tabInfo } = this.props;
    const { showType, id } = tabInfo;
    const { relationTableName, id: btnId, tableName, basetype } = btn;
    if (showType === 6) {
      const { triggerMap, selectedArr, afterSave, elementMap, userInfo, prevTabInfo } = this.props;
      const { form } = this.detailFormRef.props;
      form.validateFields().then(res => {
          // 去除前端的隐藏表单项
          const reqParams = filterHiddenFormData(res);
          // 找出面板的id字段控件
          let idEle = elementMap[prevTabInfo.id].find(item => item.relationColumnName === 'id');
          let data = {};
          data.static_tableName = relationTableName;
          data.ids = selectedArr.map(item => item[`a${idEle.id}`]).join(',');
          // data.id = reqParams[`a${idEle.id}`];
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
                triggerMapData[relationColumnValue] = reqParams[`a${parameterEle.id}`] || globalVarValue || '';
              }
            });
            data.static_triggerIds = curEleTrigger.map(item => item.id).join(',');
            data.static_globalMap = triggerMapData;
          }
          ;
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
          api(data).then(res => {
            CMessage(langLib['message.save.success']);
            afterSave && afterSave(true);
          }, err => {
            afterSave && afterSave();
          });
        },
      ).catch(err => console.log(err));
    }
  };

  // 获取getGlobalIds
  getGlobalIds = (variable) => {
    if (variable !== '@@GlobalIds') return '';
    const { fromType } = this.props;
    if (fromType === 'inPopup') {
      const { prevTabInfo, userInfo, tabInfo, triggerMap, elementMap, selectedArr } = this.props;
      const pretabId = prevTabInfo.id;
      const preIdEle = elementMap[pretabId].find(item => item.relationColumnName === 'id');
      return selectedArr.length ? selectedArr.map(item => item[`a${preIdEle.id}`]).join(',') : '';
    } else {
      const { selectedArr } = this.state;
      const { tabInfo, elementMap } = this.props;
      const tabInfoId = tabInfo.id;
      const tabInfoEle = elementMap[tabInfoId].find(item => item.relationColumnName === 'id');
      return selectedArr.length ? selectedArr.map(item => item[`a${tabInfoEle.id}`]).join(',') : '';
    }
  };
  // 获取页面中的所有数据
  getAllFormData = (variable, eleMap, reqParams) => {
    if (variable !== '@@StringifyFormData') return '';
    // 去掉按钮
    let eleData = eleMap.filter(item => {
      return !NO_SUBMIT_ELEMENT_TYPE.includes(item.basetype);
    });
    // 去掉id
    let eleList = eleData.filter(item => item.relationColumnName !== 'id');
    let data = {};
    let index = 0;
    eleList.forEach((item) => {
      const { id, relationColumnName, relationColumnType } = item;
      if (!reqParams[`a${id}`]) return;
      index += 1;
      data[`key${index}`] = {
        name: relationColumnName,
        value: reqParams[`a${id}`],
        type: relationColumnType,
      };
      data.total = index;
    });
    return JSON.stringify(data);
  };

  // 更新配置的按钮loading状态
  setBtnLoading = (btn, loading) => {
    const { tabInfo, elementMap, updataState } = this.props;
    const tabId = tabInfo.id;
    const elementList = elementMap[tabInfo.id] || [];
    const newElementList = [...elementList];
    const btnIndex = newElementList.findIndex(item => item.id === btn.id);
    newElementList.splice(btnIndex, 1, {
      ...btn,
      static_loading: loading,
    });
    updataState({
      elementMap: {
        ...elementMap,
        [tabId]: newElementList,
      },
    });
  };
  // 保存
  handleSave = (btn) => {
    const { langLib } = this.context;
    const { fileRelationList } = this.state;
    const { btnType, prevTabInfo, userInfo, tabInfo, triggerMap, elementMap, afterSave, fromType, selectedArr, filePassList } = this.props;
    const { id } = btn;
    const pretabId = prevTabInfo.id;
    const preIdEle = elementMap[pretabId].find(item => item.relationColumnName === 'id');
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
              }) || this.getGlobalIds(relationColumnValue);
              let currentEle = eleMap.find(item => item.parameter === relationColumnValue);
              triggerMapData[relationColumnValue] = currentEle && reqParams[`a${currentEle.id}`] || globalVarValue || '';
            } else {
              const { procedureMap } = item;
              procedureMap && Object.keys(procedureMap).forEach(items => {
                let currentEle = eleMap.find(item => item.parameter === procedureMap[items]);
                const globalVarValue = getValueFromGlobalVariables({
                  userInfo,
                  globalVar: procedureMap[items],
                  // }) || this.getGlobalIds(procedureMap[items]) || this.getAllFormData(procedureMap[items], eleMap, reqParams);
                }) || this.getGlobalIds(procedureMap[items]);
                triggerMapData[procedureMap[items]] = currentEle && reqParams[`a${currentEle.id}`] || globalVarValue;
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
                    newParams[currentEle.relationColumnName] = reqParams[key];
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
                  newParams[currentEle.relationColumnName] = reqParams[key] || '';
                }
              }
            }
          } else {
            if (reqParams[key]) {
              newParams[key] = reqParams[key];
            }
          }
        }
        if (JSON.stringify(fileRelationList) !== '{}') {
          newParams.static_fileIds = fileRelationList;
        }
        let params = {
          ...newParams,
          static_tableName: tabInfo.relationTableName,
        };
        const btnTriggerMap = triggerMap[btn.id] || [];
        let triggerList = btnTriggerMap.length && btnTriggerMap.filter(item => item.triggerType === 5) || [];
        if (btnType === 'add' && prevTabInfo && JSON.stringify(prevTabInfo) !== '{}' && prevTabInfo.showType === 4) {
          CMessage(langLib['saving.business'], 'error');
          return;
        }
        const elementObj = elementMap[tabInfo.id] || [];
        const checkMultiChoiceIsExist = elementObj.find(item => item.basetype === 45 && item.elementFormat === 1);
        const api = checkMultiChoiceIsExist && params[checkMultiChoiceIsExist.relationColumnName] ? filedRelationInsert : updateOrInsertFull;
        let checkMultiParams = { ...params };
        if (checkMultiChoiceIsExist && params[checkMultiChoiceIsExist.relationColumnName]) {
          delete checkMultiParams.id;
          const { relationColumnName, id } = checkMultiChoiceIsExist;
          checkMultiParams.static_ids = params[relationColumnName];
          delete checkMultiParams[relationColumnName];
          checkMultiParams.static_elementId = id;
        }
        const submitParams = checkMultiChoiceIsExist && params[checkMultiChoiceIsExist.relationColumnName] ? checkMultiParams : params;
        this.setBtnLoading(btn, true);
        if (btnType === 'add') {
          api(submitParams).then(res => {
            if (triggerList.length) {
              this.saveHttpRequest(btn, params, () => {
                this.refresh(btn);
              });
              return;
            }
            this.refresh(btn);
            CMessage(langLib['message.save.success']);
          }, err => {
            this.setBtnLoading(btn, false);
          });
          return;
        }

        if (selectedArr.length && selectedArr.length !== 1) {
          const ids = selectedArr.map(item => item[`a${preIdEle.id}`]).join(',');
          params.static_ids = ids;
          doUpdate(params).then(res => {
            this.setBtnLoading(btn, false);
            if (triggerList.length) {
              this.saveHttpRequest(btn, params, () => {
                this.refresh(btn);
              });
              return;
            }
            this.refresh(btn);
            CMessage(langLib['message.save.success']);
          }, (err) => {
            this.setBtnLoading(btn, false);
          });
        } else {
          api(submitParams).then(res => {
            this.setBtnLoading(btn, true);
            if (triggerList.length) {
              this.saveHttpRequest(btn, params, () => {
                this.refresh(btn);
              });
              return;
            }
            this.refresh(btn);
            CMessage(langLib['message.save.success']);
          }, err => {
            this.setBtnLoading(btn, false);
          });
        }
      }
    });
  };
  // 刷新逻辑处理
  refresh = (btn, type) => {
    const { fromType, afterSave, tabInfo, prevTabInfo } = this.props;
    if (btn.elementFormat) {
      this.normalBtnRefresh(btn, () => {
        this.jumpToFile(btn, type);
      });
    } else {
      if (fromType === 'inPopup') {
        // 弹出面板内的保存按钮，点击后统一关闭弹框，且重新刷新上一个面板的数据
        afterSave && afterSave(true);
      } else if (prevTabInfo.mainTab === 1) {
        this.props.getList();
      }
    }
  };

  // 删除
  handleDel = (ele) => {
    const { tabInfo } = this.props;
    const { showType } = tabInfo;
    if (showType === 1) {
      this.handleDelList(ele);
    } else if (showType === 2) {
      console.log('表单删除');
    }
  };
  // 列表删除
  handleDelList = (ele) => {
    const { langLib } = this.context;
    const { selectedArr } = this.state;
    const { tabList, elementMap, tabInfo, afterSave, fromType, data, updataState } = this.props;
    let { total, pageNum, pageSize } = data;
    const { relationTableName } = ele;
    let that = this;
    let elementObj = elementMap[tabInfo.id] || [];
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
    if (!idEle) return;
    if (selectedArr.length) {
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        content: '',
        onOk() {
          let params = {
            tableName: relationTableName,
            ids: selectedArr.map((item) => item[`a${idEle.id}`] || item[idEle.id]).join(','),
          };
          delFullList(params).then(res => {
            that.setState({
              selectedArr: [],
            }, () => {
              if ((pageNum - 1) * pageSize === (total - selectedArr.length) && pageNum !== 1) {
                pageNum = pageNum - 1;
              }
              updataState({
                pageIndex: pageNum,
                pageSize: pageSize,
              }, () => {
                that.httpRequest(ele);
                if (fromType === 'inPopup') {
                  // 弹出面板内的保存按钮，点击后统一关闭弹框，且重新刷新上一个面板的数据
                  // afterSave && afterSave(true);
                  that.doFetchPageData();
                } else {
                  that.props.getList();
                }
              });
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
  // 列表中的编辑按钮
  editListData = (btn) => {
    const { langLib } = this.context;
    const { selectedArr } = this.state;
    if (selectedArr.length !== 1) {
      CMessage(langLib['message.please.choose'], 'error');
      return;
    } else {

      this.setPopupTabInfo(btn, selectedArr[0]);
      this.httpRequest(btn);
    }
  };
  // 普通按钮
  normalBtn = (ele) => {
    const { langLib } = this.context;
    const { selectedArr, formData } = this.state;
    const { tabList, tabInfo } = this.props;
    const { showType } = tabInfo;
    const { relationTabId } = ele;
    if (showType === 2) {
      this.handleNormalBtn(ele);
      return;
    } else {
      this.storedProcedure(ele);
      this.httpRequest(ele);
      this.jumpToFile(ele);
      this.hrefUrl(ele);
    }

    if (!relationTabId) return;
    let currentTab = tabList.find(item => item.id === relationTabId);
    if (!currentTab) return;
    if (currentTab.showType === 6) {
      if (!selectedArr.length) {
        CMessage(langLib['message.please.choose'], 'error');
        return;
      }
      this.setPopupTabInfo(ele, {}, 'add');
    } else {
      this.setPopupTabInfo(ele, selectedArr.length !== 1 ? selectedArr : selectedArr[0]);
    }
  };
  // 列表上的普通按钮跳转url
  hrefUrl = (eleObj) => {
    const { selectedArr } = this.state;
    let data = selectedArr[0] || {};
    const { url } = eleObj;
    if (!url) return;
    const varNameList = matchGlobalVars(url);
    const { userInfo } = this.props;
    let resultUrl = url;
    varNameList.forEach(varName => {
      // 当前时间、当前用户
      let globalVar = getValueFromGlobalVariables({
        globalVar: varName,
        userInfo,
      });
      const { tabInfo, elementMap } = this.props;
      const elementList = elementMap[tabInfo.id] || [];
      const varElement = elementList.find(item => item.parameter === varName);
      if (varElement && JSON.stringify(data) !== '{}') {
        const { id } = varElement;
        globalVar = JSON.parse(data[id]).id;
      }
      resultUrl = resultUrl.replace(`{${varName}}`, globalVar);
    });
    window.open(resultUrl);
  };
  // 表单中的普通按钮
  handleNormalBtn = (btn) => {
    const { id: btnId, relationTabId } = btn;
    const { tabInfo, triggerMap, elementMap, userInfo } = this.props;
    const { showType, id } = tabInfo;
    const { tabData } = this.state;
    if (showType !== 2) return;
    let tabInfoData = tabData[id]; // 面板数据
    // 找出面板的id字段控件
    const element = elementMap[id];
    let idEle = element.find(item => item.relationColumnName === 'id');
    const curEleTrigger = triggerMap[btnId] || [];
    const getIds = type => curEleTrigger.filter(item => item.triggerType === type).map(item => item.id).join(',');
    let static_globalMap;
    if (curEleTrigger && curEleTrigger.length) {
      const { form } = this.detailFormRef.props;
      let values = form.getFieldsValue();
      // 去除前端的隐藏表单项
      let reqParams = filterHiddenFormData(values);
      let triggerMapData = {};
      curEleTrigger.forEach(item => {
        const { relationColumnValue, valueType } = item;
        if (valueType === 2) {
          // 定义变量的控件
          const parameterEle = elementMap[tabInfo.id].find(ele => ele.parameter === relationColumnValue) || {};
          const { mainTableName, relationColumnName, id } = parameterEle;
          const globalVarValue = getValueFromGlobalVariables({
            userInfo,
            globalVar: relationColumnValue,
          }) || this.getGlobalIds(relationColumnValue);
          triggerMapData[relationColumnValue] = (tabInfoData[`a${parameterEle.id}`] && JSON.parse(tabInfoData[`a${parameterEle.id}`]).id) || globalVarValue || '';
        } else {
          const { procedureMap } = item;
          procedureMap && Object.keys(procedureMap).forEach(items => {
            let currentEle = elementMap[tabInfo.id].find(item => item.parameter === procedureMap[items]);
            triggerMapData[procedureMap[items]] = currentEle && tabInfoData[`a${currentEle.id}`] && JSON.parse(tabInfoData[`a${currentEle.id}`]).id || this.getAllFormData(procedureMap[items], element, reqParams) || getValueFromGlobalVariables({
              userInfo,
              globalVar: procedureMap[items],
            }) || this.getGlobalIds(procedureMap[items]);
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
    relationTabId && this.setPopupTabInfo(btn, tabInfoData);
    // this.httpRequest(btn);
    if (params.static_triggerIds || params.static_procedure_triggerids) {
      normalButton(params).then(res => {
        const btnTriggerMap = triggerMap[btn.id] || [];
        let triggerList = btnTriggerMap.length && btnTriggerMap.filter(item => item.triggerType === 5) || [];
        if (triggerList.length) {
          this.httpRequest(btn, () => {
            this.refresh(btn, 1);
          });
          return;
        }
        this.normalBtnRefresh(btn, () => {
          this.jumpToFile(btn, 1);
        });
      }, err => console.log(err));
    }
  };
  // 存储过程
  storedProcedure = (btn, otherParams) => {
    const { relationTabId, id: btnId, elementFormat } = btn;
    const { selectedArr } = this.state;
    const { userInfo, tabList, formData, prevTabInfo, tabInfo, triggerMap, elementMap, prevListRowData, tabData } = this.props;
    const curEleTrigger = triggerMap[btnId] || [];
    let idEle = elementMap[tabInfo.id].find(item => item.relationColumnName === 'id');
    const getIds = type => curEleTrigger.filter(item => item.triggerType === type).map(item => item.id).join(',');
    let static_globalMap;
    if (curEleTrigger && curEleTrigger.length) {
      if (!selectedArr.length) return;
      let tabInfoData = {}; // 面板数据
      if (!otherParams) {
        tabInfoData = selectedArr[0] || {}; // 面板数据
      } else if (otherParams && otherParams.type === 'ROW_EDIT') {
        tabInfoData = otherParams.data;
      }
      let triggerMapData = {};
      curEleTrigger.forEach(item => {
        const { relationColumnValue, valueType } = item;
        if (valueType === 2) {
          // 定义变量的控件
          const parameterEle = elementMap[tabInfo.id].find(ele => ele.parameter === relationColumnValue) || {};
          if (!parameterEle) return;
          const { mainTableName, relationColumnName, id } = parameterEle;
          const fieldKey = mainTableName ? id : relationColumnName;
          const globalVarValue = getValueFromGlobalVariables({
            userInfo,
            treeNodeData: JSON.parse(tabInfoData[`${idEle.id}`]),
            globalVar: relationColumnValue,
          }) || this.getGlobalIds(relationColumnValue);

          triggerMapData[relationColumnValue] = tabInfoData[`a${parameterEle.id}`] || globalVarValue || '';
        } else {
          const { procedureMap } = item;
          procedureMap && Object.keys(procedureMap).forEach(items => {
            let currentEle = elementMap[tabInfo.id].find(item => item.parameter === procedureMap[items]);
            triggerMapData[procedureMap[items]] = currentEle && tabInfoData[currentEle.id] && JSON.parse(tabInfoData[currentEle.id]).id || getValueFromGlobalVariables({
              userInfo,
              treeNodeData: JSON.parse(tabInfoData[`${idEle.id}`]),
              globalVar: procedureMap[items],
            }) || this.getGlobalIds(procedureMap[items]);
          });
        }
      });
      static_globalMap = triggerMapData;
    } else {
      this.normalBtnRefresh(btn);
    }
    const params = {
      static_globalMap,
      static_triggerIds: getIds(2),
      static_procedure_triggerids: getIds(3),
    };
    if (params.static_triggerIds || params.static_procedure_triggerids) {
      // this.setBtnLoading(btn, true);
      normalButton(params).then(res => {
        const { langLib } = this.context;
        const { fromType, setFrameState } = this.props;
        if (fromType === 'normal') {
          this.setState({
            selectedArr: [],
          }, () => {
            this.normalBtnRefresh(btn);
          });
        } else {
          setFrameState({
            selectedArr: [],
          }, () => {
            this.normalBtnRefresh(btn);
          });
        }

        CMessage(langLib['message.check.success']);
        // this.setBtnLoading(btn, false);
      }, err => console.log(err));
    }
  };
  // 批量保存按钮
  doBatchModification = (btn) => {
    const { langLib } = this.context;
    const { fileRelationList } = this.state;
    const { selectedArr, userInfo, tabList, tabInfo, relationTableId, triggerMap, elementMap, afterSave, fromType, prevTabInfo } = this.props;
    const { id } = btn;
    let relationId = tabInfo.id;
    let elementObj = elementMap[prevTabInfo.id] || [];
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
    if (!idEle) return;
    const { form } = this.detailFormRef.props;
    form.validateFields((err, values) => {
      if (!err) {
        // 去除前端的隐藏表单项
        let reqParams = filterHiddenFormData(values);
        const curEleTrigger = triggerMap[id];
        let newParams = {};
        let eleMap = elementMap[relationId];
        if (curEleTrigger && curEleTrigger.length) {
          let triggerMapData = {};
          curEleTrigger.forEach(item => {
            const { relationColumnValue, valueType } = item;
            if (valueType === 2) {
              // 定义变量的控件
              const parameterEle = elementMap[relationId].find(ele => ele.parameter === relationColumnValue) || {};
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
            let eleData = elementMap[relationId].filter(item => {
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
            if (reqParams[key]) {
              newParams[key] = reqParams[key];
            }
          }
        }
        if (JSON.stringify(fileRelationList) !== '{}') {
          newParams.static_fileIds = fileRelationList;
        }
        let params = {
          ...newParams,
          static_tableName: tabInfo.relationTableName,
          static_ids: selectedArr.map(item => item[`a${idEle.id}`]).join(','),
        };
        fullBatchUpdate(params).then(res => {
          this.httpRequest(btn);
          // this.relationFile(res);
          if (fromType === 'inPopup') {
            // 弹出面板内的保存按钮，点击后统一关闭弹框，且重新刷新上一个面板的数据
            afterSave && afterSave(true);
          }
          CMessage(langLib['message.save.success']);
        });
      }
    });
  };
  // 第三方接口请求
  saveHttpRequest = (btn, paramsData, callback) => {
    const { userInfo, triggerMap, tabInfo, elementMap } = this.props;
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
          if (getValueFromGlobalVariables({
            globalVar: item.paramValue,
            userInfo,
          })) {
            globalMap[item.paramValue] = getValueFromGlobalVariables({
              globalVar: item.paramValue,
              userInfo,
            });
          } else {
            let eleList = elementMap[tabInfo.id] || [];
            let element = eleList.find(items => items.parameter === item.paramValue);
            globalMap[item.paramValue] = element ? paramsData[element.relationColumnName] : '';
          }
        }
      });
      params.globalMap = globalMap;
      httpRequest(params).then(res => {
        const { langLib } = this.context;
        CMessage(langLib['message.check.success']);
        if (callback) {
          callback();
        }
      });
      ;
    }
  };
  // 第三方接口请求
  httpRequest = (btn, callback, otherParam = '') => {
    const { userInfo, triggerMap } = this.props;
    const { id } = btn;
    const btnTriggerMap = triggerMap[id] || [];
    let arr = []; // 所有参数集合
    let globalMap = {};
    let triggerList = btnTriggerMap.length && btnTriggerMap.filter(item => item.triggerType === 5);
    if (triggerList.length) {
      let params = { triggerIds: triggerList.map(item => item.id).join(',') };
      const { langLib } = this.context;
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
        if (callback) {
          callback();
        }
        CMessage(langLib['message.check.success']);
      });
    }
  };
  // 导出
  doExport = (btn) => {
    const { elementFormat = 1 } = btn;
    if (elementFormat === 1) {
      this.setState({
        downLoadLoading: true,
      });
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
    const { tabInfo, userInfo, elementMap, searchSelected, advancedQueryMap, functionData } = this.props;
    let { searchVal, seniorFilter, fileInputData, tabs } = this.props;
    const { dataFormat = 0 } = btn;

    if (this.props.fromType !== 'normal') {
      searchVal = this.state.searchVal;
      seniorFilter = this.state.seniorFilter;
    }
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
    const fileData = tabs.activeTabData.fileData || '';
    let filterSqlBaseType = fileData && queryList.filter(item => item.basetype === 3 && fileData.jumpTag === item.jumpFunctionId) || [];
    params.jumpTag = fileData ? fileData.jumpTag : null;
    if (filterSqlBaseType.length && filterSqlBaseType[0].filterSql) {
      const filterSql = filterSqlBaseType[0].filterSql;
      const varNameList = matchGlobalVars(filterSql);
      varNameList.forEach(varName => {
        if (varName === '@@BusinessID') {

        } else {
          // 当前时间、当前用户
          let globalVar = getValueFromGlobalVariables({
            globalVar: varName,
            userInfo,
            globalMapType: 'globalMapType',
          });
          if (globalVar.value) {
            globalQueryMap[varName] = globalVar;
          } else {
            let obj = fileInputData.find(item => item.name === varName);
            if (obj && fileData[varName]) {
              let normalData = jsonParse(fileData[varName], 'object');
              globalQueryMap[varName] = normalData;
            }
          }
        }
      });
    }
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
    if (type) {
      const { form } = this.detailFormRef && this.detailFormRef.props;
      data = form && form.getFieldsValue(); // 获取表单中的所有数据值
    } else {
      const { selectedArr } = this.state;
      data = selectedArr[0] || {};
    }
    let passParams = jsonParse(passParam, 'array') || [];
    const elementList = elementMap[tabInfo.id] || [];
    const fileData = JumpFileDate(functionData.id, data, elementList, passParams, userInfo, getValueFromGlobalVariables, type);
    const { tabKey, comKey, title } = getFunctionComDetail(result[0]);
    this.jumpFile(tabKey, comKey, title, fileData, result);
  };
  // 多菜单跳转
  multiJumpToFile = (btn, record) => {
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
    let data = record;
    const { id, dataSourceType, showType } = tabInfo;
    let passParams = jsonParse(passParam, 'array') || [];
    const elementList = elementMap[tabInfo.id] || [];
    const fileData = JumpFileDate(functionData.id, data, elementList, passParams, userInfo, getValueFromGlobalVariables, '');
    const { tabKey, comKey, title } = getFunctionComDetail(result[0]);
    this.jumpFile(tabKey, comKey, title, fileData, result);
  };
  // 菜单跳转时逻辑处理
  jumpFile = (tabKey, comKey, title, fileData, result) => {
    const { tabs, afterSave } = this.props;
    if (!tabKey) return;
    if (afterSave) afterSave(false);
    const { dispatch } = this.context;
    jumpFileOfCommon({ tabKey, comKey, title, tabs, fileData, functionData: result[0], dispatch });
  };
  // 普通按钮刷新
  normalBtnRefresh = (btn, callback) => {
    const { fromType, afterSave } = this.props;
    const { basetype, elementFormat } = btn;
    const { langLib } = this.context;
    if (BTN_ELEMENT_TYPE.includes(basetype) && basetype !== 30) { // 普通按钮
      if (elementFormat === 1) { // 刷新本面板
        this.doFetchPageData();
        callback && callback();
      } else if (elementFormat === 2 && fromType === 'inPopup') { // 关闭本面板并刷新上一个面板
        afterSave && afterSave();
        callback && callback();
      } else if (elementFormat === 3) {
        this.handleRefreshAll();
        callback && callback();
        return;
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
  // 更新该组件内状态
  setFrameState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  };
  // 获取面板内容
  getTabContent = () => {
    const { functionData, userInfo, filterMap, fromType, elementMap, tabList, tabInfo = {}, triggerMap, relationTableId, tabDropDownList, prevListRowData, originElementMap, selectedArr, updataState, filePassList } = this.props;
    const { originFormData, downLoadLoading, formData, listData, data, tabData, tabDropDownData, fileRelationList, popLoading, stepList, thirdData, externalParameters } = this.state;
    const { showType, jumpUrl } = tabInfo;
    let content = null;
    const publicProps = {
      ...this.props,
      fullListData: data,
      selectedArr: this.state.selectedArr,
      setFrameState: this.setFrameState,
      setPopupTabInfo: this.setPopupTabInfo,
      handleClickBtn: this.handleClickBtn,
      multiJump: this.multiJumpBtn,
      multiTabJump: this.multiTabBtn,
      saveInListBtn: this.saveInList,
    };
    // 底层列表
    if (fromType === 'normal') {
      return (
        <CSpin spinning={downLoadLoading}>
          <FullList
            {...publicProps}
            tabDropDownData={this.props.fullTabDropDownData}
            fetchListData={this.fetchListData}
          />
        </CSpin>
      );
    } else {
      switch (showType) {
        case 1:
          let elementObj = elementMap[tabInfo.id];
          let btnGroup = elementObj.filter((item) => {
            return (BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
          }) || [];
          let topBtn = btnGroup.length ? <ListBtn
            {...this.props}
            handleClickBtn={this.handleClickBtn}
          /> : null;
          const wrapSty = this.props.checkboxType === 'checkbox' || this.props.checkboxType === 'radio' ? styles.showTypeOneSty : styles.showTypeOneStyNormal;
          return <div className={wrapSty}>
            <CSpin spinning={downLoadLoading}>
              <DetailList
                {...this.props}
                tabList={tabList}
                triggerMap={triggerMap}
                originElementMap={originElementMap}
                saveInListBtn={this.saveInList}
                loading={popLoading}
                tabInfo={tabInfo}
                formData={data}
                tabData={tabData}
                tabDropDownData={tabDropDownData}
                updataState={this.setFrameState}
                updataPageIndexOrSize={this.fetchListData}
                btnGroups={topBtn}
                multiJump={this.multiJumpBtn}
                multiTabJump={this.multiTabBtn}
                setPopupTabInfo={this.setPopupTabInfo}
                selectedListArr={this.state.selectedArr}
              />
            </CSpin>
          </div>;
        case 2:
          const formSty = classNames({
            [styles.showFormSty]: true,
          });
          return <div className={formSty}>
            <DetailForm
              {...this.props}
              prevListRowData={prevListRowData}
              triggerMap={triggerMap}
              elementMap={elementMap}
              tabInfo={tabInfo}
              filterMap={filterMap}
              relationTableId={tabInfo.id}
              formData={getDefaultValueFromCurrentTab({
                currentTabData: tabData[tabInfo.id],
                elementMap,
                tabInfo,
              }) || {}}
              originFormData={originFormData}
              tabData={tabData}
              tabDropDownData={tabDropDownData}
              setFrameState={this.setFrameState}
              setPopupTabInfo={this.setPopupTabInfo}
              fileRelationList={fileRelationList}
              filePassList={filePassList}
              originElementMap={originElementMap}
              getValueFromCurrentTabData={this.getValueFromCurrentTabData}
              wrappedComponentRef={form => this.detailFormRef = form}
              stepList={stepList}
              updataState={updataState}
            />
            <FooterButton
              triggerMap={triggerMap}
              elementList={elementMap[tabInfo.id]}
              handleClickBtn={this.handleClickBtn}
            />
          </div>;
        case 4:
          const wrapSty2 = classNames({
            [styles.showTypeOneSty]: this.props.checkboxType === 'radio',
            [styles.showTypeOneStyNormal]: this.props.checkboxType !== 'radio',
          });
          let elementObj1 = elementMap[tabInfo.id];
          let btnGroup1 = elementObj1.filter((item) => {
            return (BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
          }) || [];
          let topBtn1 = btnGroup1.length ? <ListBtn
            {...this.props}
            handleClickBtn={this.handleClickBtn}
          /> : null;
          return <div className={wrapSty2}>
            <RelationPopupList
              {...this.props}
              handleClickBtn={this.handleClickBtn}
              tabList={tabList}
              triggerMap={triggerMap}
              originElementMap={originElementMap}
              // activeTreeNode={activeTreeNode}
              loading={popLoading}
              tabInfo={tabInfo}
              formData={data}
              btnGroups={topBtn1}
              tabData={tabData}
              updataState={this.setFrameState}
              updataPageIndexOrSize={this.fetchListData}
              setPopupTabInfo={this.setPopupTabInfo}
              selectedListArr={this.state.selectedArr}
              multiJump={this.multiJumpBtn}
              multiTabJump={this.multiTabBtn}
            />
          </div>;
        case 5:
          return <div>
            功能未开发
          </div>;
        case 6:
          return <div>
            <div>
              <DetailForm
                {...this.props}
                prevListRowData={prevListRowData}
                triggerMap={triggerMap}
                elementMap={elementMap}
                tabInfo={tabInfo}
                filterMap={filterMap}
                relationTableId={tabInfo.id}
                formData={tabData[tabInfo.id] || {}}
                tabDropDownData={tabDropDownData}
                tabData={tabData}
                setFrameState={this.setFrameState}
                fileRelationList={fileRelationList}
                filePassList={filePassList}
                originElementMap={originElementMap}
                getValueFromCurrentTabData={this.getValueFromCurrentTabData}
                wrappedComponentRef={form => this.detailFormRef = form}
                updataState={updataState}
              />
            </div>
            <FooterButton
              triggerMap={triggerMap}
              elementList={elementMap[tabInfo.id]}
              handleClickBtn={this.handleClickBtn}
            />
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
        case 8:
          return (
            <MessageTemplate ref={ref => this.messageRef = ref}/>
          );
        case 10:
          return (
            <BPMAuditPanel
              {...this.props}
              reduceFormData={this.reduceFormData}
              functionData={functionData}
              triggerMap={triggerMap}
              tabInfo={tabInfo}
              tabList={tabList}
              elementMap={elementMap}
              dataMap={thirdData}
              btnGroups={topBtn}
              updataState={this.setFrameState}
              setPopupTabInfo={this.setPopupTabInfo}
              selectedListArr={this.state.selectedArr}
            />);
        case 11:
          return (
            <div className={styles.normalContent}>
              <iframe src={`${jumpUrl}?${qsStringify(externalParameters)}`}
                      frameborder={0}
                      style={{ 'width': '100%', 'height': 'calc(100%)' }}/>
            </div>
          );
        default:
          return null;
      }
    }
  };

  render() {
    const { btnType, visiblePopup, popupTabInfo = {}, listRowData, selectedArr, popType } = this.state;
    const { tabInfo } = this.props;
    const { showType } = tabInfo;
    const renderContent = this.getTabContent();
    const CreateModalConfig = popType === 'inPopup' ? {
      visible: visiblePopup,
      title: popupTabInfo.name,
      size: 'large',
      onCancel: () => this.handleCloseModal(),
      footer: null,
    } : {};
    return (
      <div className={showType === 2 || showType === 6 ? styles.wrap1 : styles.wrap}>
        {renderContent}
        <CreateModal
          {...CreateModalConfig}
        >
          {visiblePopup && popType === 'inPopup' ? (
            <ContentContainer
              {...this.props}
              fromType={'inPopup'}
              tabInfo={popupTabInfo}
              prevTabInfo={tabInfo}
              prevListRowData={listRowData}
              selectedArr={selectedArr}
              btnType={btnType}
              afterSave={() => this.handleCloseModal(true)}
            />
          ) : null}
        </CreateModal>
      </div>
    );
  }
}

export default ContentContainer;
