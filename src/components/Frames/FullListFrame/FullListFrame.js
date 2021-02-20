/*
 * @Author: Fus
 * @Date:   2019-11-06 16:39:28
 * @Desc: 全列表框架
 */
import { Component } from 'react';
import { connect } from 'dva';
import { CMessage } from '@/components/common/BasicWidgets';
import { BaseContext } from '@/constants/global';
import { getFullListPageConfig } from '@/services/fullListFrame';
import { getList } from '@/services/leftListFrame';
import ContentContainer from './ContentContainer/ContentContainer';
import styles from './FullListFrame.less';
import { BTN_ELEMENT_TYPE, FILTER_ELEMENT_TYPE, HIDE_IN_LIST_ELEMENT_TYPE } from '@/constants/element';
import { getParamsValueFromState, validTriggerMatch } from '@/utils/common';
import { getValueFromGlobalVariables, matchGlobalVars, jsonParse, reduceDataToJsonString } from '@/utils/common';
import { getParamList, getThirdData } from '@/services/framePage';
import { getParams } from '@/services/global';
import { getPageSelectOptions } from '@/services/frame';


@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
  tabs: state.tabs,
  user: state.user,
}))
class FullListFrame extends Component {
  static contextType = BaseContext;
  state = {
    visiblePopup: false, // 弹出面板显示状态
    frameData: {}, // 框架信息
    triggerMap: {}, // 触发器数据
    tabList: [], // 面板列表
    tabInfo: {}, // 当前面板信息
    elementMap: {}, // 控件map
    originElementMap: {}, // 原始控件信息
    filterMap: {}, // 过滤器map
    advancedQueryMap: {}, // 过滤条件map
    loadingStatus: {
      page: false, // 面板配置信息
      data: false, // 面板数据
    },
    pageSize: 10,
    pageIndex: 1,
    data: {}, // 列表数据
    loading: false, // 列表loading
    mainTab: [],
    searchSelected: '', // 需要查找的字段
    searchVal: '', // 需要查找的内容
    fileInputData: [], // 菜单输入参数
    tabDropDownData: {}, // 获取下拉列表
    seniorFilter: {}, // 高级筛选的值
    filePassList: {},  // 图片参数的值
  };

  componentDidMount() {
    const { functionData, userInfo } = this.props;
    getParamList({ functionId: functionData.id }).then(res => {
      this.setState({
        fileInputData: res,
      }, () => {
        this.fetchPage();
      });
    });

  }

  // 获取面板配置
  fetchPage = () => {
    const { langLib } = this.context;
    const { functionData, userInfo } = this.props;
    getFullListPageConfig({ functionId: functionData.id }).then(res => {
      const { tabList, framePramDto, triggerMap, elementMap, filterMap, advancedQueryMap } = res;
      this.setState({ tabList, framePramDto, triggerMap, elementMap }, () => {
        if (JSON.stringify(elementMap) === '{}' || !framePramDto || !tabList.length) {
          CMessage(langLib['message.error.noPageConfig'], 'error');
          return;
        }
        // 第一个面板取主面板 > 列表类型的第一个面板 > 第一个面板
        const tabInfo = tabList.find(item => item.mainTab === 1) || tabList.find(item => item.showType === 1) || tabList[0] || {};
        this.setState({
          frameData: framePramDto || {},
          triggerMap,
          tabList,
          tabInfo,
          elementMap,
          filterMap,
          originElementMap: elementMap,
          advancedQueryMap,
          userInfo,
          functionData,
        }, () => {
          const { dataSourceType } = tabInfo;
          if (dataSourceType === 2) { // 根据数据源的类型来调用不同的接口来获取数据
            this.getParamsByApi(tabInfo);
          } else {
            this.getList();
          }
        });
      });
    }, err => {
    });
  };
  // 通过api接口获取参数
  getParamsByApi = (tabInfo) => {
    const { commonApiHeaderId, id } = tabInfo;
    getParams({
      commonApiHeaderId,
      tabId: id,
    }).then((res = []) => {
      let apiParams = {};
      res.forEach(item => {
        apiParams[item.paramKey] = item.initValue;
      });
      this.setState({ apiParams }, () => {
        this.getListByApi();
      });
    });
  };
  // 根据第三方接口获取第三方数据
  getListByApi = () => {
    const { apiParams } = this.state;
    let params = {};
    Object.keys(apiParams).forEach(item => {
      params[item] = getParamsValueFromState(apiParams[item], this.state);
    });
    const { tabInfo } = this.state;
    const { commonApiHeaderId, id } = tabInfo;
    let newParams = {
      commonApiHeaderId,
      tabId: id,
      paramMap: params,
    };
    this.setState({ loading: true });
    getThirdData(newParams).then(res => {
      const { tabInfo, elementMap, tabList } = this.state;
      let mainTab = tabList.find(item => {
        return item.mainTab === 1;
      }) || tabList[0];
      const elementList = elementMap[mainTab.id];
      let listData = reduceDataToJsonString(elementList, res.dataList);
      let list = { ...res, datalist: listData };
      this.setState({
        data: list,
        loading: false,
        mainTab: elementList,
      });
    }, err => {
      this.setState({ loading: false });
    });
  };
  // 通过数据源获取列表数据
  getList = () => {
    const { userInfo, tabs } = this.props;
    const { tabInfo, tabList, framePramDto, triggerMap, elementMap, pageSize, pageIndex, searchSelected, searchVal, advancedQueryMap, seniorFilter, fileData } = this.state;
    const { dataSourceType } = tabInfo;
    if (dataSourceType === 2) {
      this.getListByApi();
      return;
    }
    if (tabInfo.showType === 1 && tabInfo.visiabled) {
      let currentTabId = tabInfo.id;
      let elementList = elementMap[currentTabId].filter((item) => {
        return !HIDE_IN_LIST_ELEMENT_TYPE.includes(item.basetype);
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
      const queryList = advancedQueryMap[currentTabId] || [];
      const globalMap = {}; // 面板过滤条件组合方式
      const globalQueryMap = {}; // 面板过滤条件 asql 方式
      let params = {
        tabSource: tabInfo.relationTableName,
        elementList,
        pageNum: pageIndex,
        pageSize: pageSize,
        tabId: currentTabId,
      };
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
              });
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
                globalQueryMap[varName] = globalVar;
              }
            },
          );
        }
      });
      const fileData = tabs.activeTabData.fileData || '';
      let filterSqlBaseType = fileData && queryList.filter(item => item.basetype === 3 && fileData.jumpTag === item.jumpFunctionId) || [];
      const { fileInputData } = this.state;
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
      params.globalMap = globalMap;
      params.globalQueryMap = globalQueryMap;
      this.setState({ loading: true });
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
      } else if (!searchSelected && !searchVal) {
        params.calendarList = [];
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
      params.seniorFilterMap = seniorFilter;
      getList(params).then(res => {
        this.setState({
          data: this.seBtnDataToCurrentFormList(res),
          loading: false,
          mainTab: elementMap[currentTabId],
        }, () => {
          tabInfo.canLineEdit === 1 && this.fetchTabDropDownData();
        });
      });
    } else {
      CMessage('请设置主面板并且主面板展示类型为列表类型', 'error');
    }
  };
  // 获取面板下的下拉数据
  fetchTabDropDownData = () => {
    const { tabInfo, elementMap, filterMap } = this.state;
    const { userInfo } = this.props;
    const relationTableId = tabInfo.id;
    const elementList = elementMap[relationTableId] || [];
    // 下拉框控件列表
    const dropDownList = elementList.filter(item => FILTER_ELEMENT_TYPE.includes(item.basetype) && !!item.mainTableName).map(item => ({
      dataSource: item.mainTableName,
      elementId: item.id,
      columnName: item.mainColumnName
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
          globalMap[item.asqlValue] = getValueFromGlobalVariables({
            globalVar: asqlValue,
            userInfo,
            globalMapType: 'globalMapType',
          });
        }
      });
    });
    getPageSelectOptions({ dropDownList, globalMap }).then(tabDropDownData => {
      this.setState({
        tabDropDownData,
      });
    });
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
    const { tabInfo, elementMap, triggerMap } = this.state;
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
      const { tabInfo, elementMap, userInfo, tabList } = this.state;
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
    const { endTriggerNum, elementId } = triggerObj;
    let elementIdValue = JSON.parse(record[elementId]).id;
    return validTriggerMatch(triggerObj, elementIdValue, endTriggerNum, getValueFromCurrentTableColumn);
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


  render() {
    const { functionData, userInfo, tabs, user } = this.props;
    const { tabDropDownData, filePassList } = this.state;
    return (
      <div className={styles.wrap}>
        <ContentContainer
          {...this.state}
          updataState={this.updataState}
          getList={this.getList}
          fromType="normal"
          userInfo={userInfo}
          tabs={tabs}
          user={user}
          fullTabDropDownData={tabDropDownData}
          functionData={functionData}
          filePassList={filePassList}
        />
      </div>
    );
  }
}

export default FullListFrame;
