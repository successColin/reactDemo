/*
 * @Author: Fus
 * @Date:   2020-05-06 08:53:37
 * @Desc: 看板大屏配置
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import classNames from 'classnames';
import { CMessage, CSpin } from '@/components/common/BasicWidgets';
import Empty from '@/components/HomePage/Empty';
import { BaseContext } from '@/constants/global';
import ChartList from './ChartList/ChartList';
import WorkList from './WorkList/BoardWorkList';
import { NOT_HOME_CHART_FILTER_ELEMENTS, SEARCH_SELECT_TYPE } from '@/constants/element';
import { getBoardPage, getFunctionPermission } from '@/services/board';
import { SELECT_ELEMETN_TYPE } from '@/constants/element';
import {
  getValueFromGlobalVariables,
  isGlobalOrCustomVar,
  matchGlobalDateRange,
  getSelectSearchInfoById,
  matchGlobalVars,
  formatTime,
  getFunctionComDetail,
  getCookie,
} from '@/utils/common';
import { getPageSelectOptions } from '@/services/frame';
import styles from './BoardFrame.less';

const userInfo = getCookie('eaminfo') && JSON.parse(unescape(getCookie('eaminfo')));

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  // userInfo: state.user.userInfo,
  tabs: state.tabs,
  user: state.user,
  langLib: state.global.langLib, // 本地语言包内容
}))
class BoardFrameRoute extends Component {
  static contextType = BaseContext;
  state = {
    showInitHome: false, // 是否展示默认主页图
    visible: false, // 筛选弹窗显示状态
    showFilter: false, // 筛选入口显示状态
    // pageConfig: {}, // 配置数据
    elementMap: {},
    tabList: [],
    triggerMap: {},
    advancedQueryMap: {},
    filterMap: {},
    framePramDto: {},
    originElementMap: {}, // 原始控件map
    tabDropDownData: [], // 下拉框数据
    tabInfo: {}, // 面板信息
    seniorFilter: {}, // 高级筛选控件
    filterEles: [], // 筛选条件控件
    summaryEles: [], // 汇总控件
    chartEles: [], // 报表控件
    loadingPage: false, // 加载配置信息
    formData: {}, // 表单数据
    chartMap: {}, // sql中变量对应的值
    searchSelectInfoMap: {}, // 数据选择框获取过详情的数据存储
    leftChart: [], // 左侧图表
    middleChart: [],
    rightChart: [], // 右侧图表
    leftNumberEles: [],
    leftChartEles: [],
    leftNumberChartEles: [],
    rightNumberEles: [],
    rightChartEles: [],
    rightNumberChartEles: [],
    tableListEles: [],
    elementList: [],
    pageNum: 1,
    pageSize: 15,
    currentTime: '',
    currentDay: '',
    boardIsFullScreen: false,
  };

  componentDidMount() {
    const functionId = this.props.location.query['functionId'];
    this.getFunctionPermission(functionId);
    this.updateTime = setInterval(() => {
      this.getTime();
    }, 1000);
    document.getElementById('boardRouteWrap').addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        this.setState({ boardIsFullScreen: true });
      } else {
        this.setState({ boardIsFullScreen: false });
      }
      this.refs.getList.relizeFullScreen();
    });
  }

  componentWillUnmount() {
    this.updateTime && clearInterval(this.updateTime);
  }

  getFunctionPermission = (functionId) => {
    getBoardPage({ functionId }).then(pageConfig => {
      const { tabList, framePramDto, triggerMap, elementMap, advancedQueryMap, filterMap } = pageConfig;
      if (!framePramDto || !tabList.length || JSON.stringify(elementMap) === '{}') {
        this.setState({ showInitHome: true, loadingPage: false });
        return;
      }
      const tabInfo = tabList.find(item => item.mainTab === 1) || tabList[0] || {};
      const { id: tabId } = tabInfo;
      const eleList = elementMap[tabId] || [];
      const everyPartEles = this.setEleParts(false, elementMap, tabId, pageConfig);
      this.setState({
        elementMap,
        tabList,
        triggerMap,
        advancedQueryMap,
        filterMap,
        framePramDto,
        originElementMap: elementMap,
        tabInfo,
        loadingPage: false,
        ...everyPartEles,
      }, () => {
        this.fetchTabDropDownData();
      });
    }, err => this.setState({ loadingPage: false }));
  };

  // 获取配置数据
  fetchPageConfig = () => {
    const { functionData, langLib } = this.props;
    const { id: functionId } = functionData;
    this.setState({ loadingPage: true });
    getBoardPage({ functionId }).then(pageConfig => {
      const { tabList, framePramDto, triggerMap, elementMap, advancedQueryMap, filterMap } = pageConfig;
      if (!framePramDto || !tabList.length || JSON.stringify(elementMap) === '{}') {
        this.setState({ showInitHome: true, loadingPage: false });
        return;
      }
      const tabInfo = tabList.find(item => item.mainTab === 1) || tabList[0] || {};
      const { id: tabId } = tabInfo;
      const eleList = elementMap[tabId] || [];
      const everyPartEles = this.setEleParts(false, elementMap, tabId, pageConfig);
      this.setState({
        elementMap,
        tabList,
        triggerMap,
        advancedQueryMap,
        filterMap,
        framePramDto,
        originElementMap: elementMap,
        tabInfo,
        loadingPage: false,
        ...everyPartEles,
      }, () => {
        this.fetchTabDropDownData();
      });
    }, err => this.setState({ loadingPage: false }));
  };
  /**
   * 获取面板下的下拉数据
   *  @param {string} type 下拉类型 （normal-普通下拉，cascade-级联下拉）
   */
  fetchTabDropDownData = () => {
    const { elementMap, filterMap, tabInfo = {}, tabDropDownData } = this.state;
    const elementList = elementMap[tabInfo.id] || [];
    // 下拉框控件列表
    const dropDownList = elementList.filter(item => SELECT_ELEMETN_TYPE.includes(item.basetype) && !!item.mainTableName && item.elementFormat === 1)
      .map(item => ({ dataSource: item.mainTableName, elementId: item.id, columnName: item.mainColumnName }));
    if (!dropDownList.length) {
      return;
    }
    const globalMap = {};
    Object.keys(filterMap).map(key => {
      filterMap[key].forEach(item => {
        const { asqlValue, asqlValueType } = item;
        if (asqlValueType === 2 || isGlobalOrCustomVar(asqlValue)) {
          globalMap[item.asqlValue] = this.getGlobalVarValue({ varName: asqlValue });
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
    });
  };
  // 打开筛选表单框，判断数据选择框是否已请求过获取详情接口
  handleOpenFilter = () => {
    const { filterEles, formData, searchSelectInfoMap } = this.state;
    const newFormData = { ...formData };
    const newSearchSelectInfoMap = { ...searchSelectInfoMap };
    filterEles.forEach(eleObj => {
      const { defaultValue, id, basetype, mainTableName } = eleObj;
      let valueObj = newFormData[id] || { id: '', name: '' };
      // 无值且有默认值时
      if (!valueObj.id && defaultValue) {
        valueObj = { id: defaultValue, name: defaultValue };
        if (isGlobalOrCustomVar(defaultValue)) {
          const value = this.getGlobalVarValue({ varName: defaultValue });
          valueObj = { id: value, name: value };
        }
      }
      // 数据选择框
      if (SEARCH_SELECT_TYPE.includes(basetype)) {
        const detailkey = `${mainTableName}_${valueObj.id}`;
        if (newSearchSelectInfoMap[detailkey] && formData[id].name !== newSearchSelectInfoMap[detailkey].name) {
          valueObj = newSearchSelectInfoMap[detailkey].valueObj;
        } else {
          getSelectSearchInfoById(eleObj, valueObj.id, (res) => {
            const { valueObj: resultObj } = res;
            newFormData[id] = resultObj;
            newSearchSelectInfoMap[detailkey] = res;
            this.setState({ formData: newFormData, searchSelectInfoMap: newSearchSelectInfoMap });
          });
        }
      }
      newFormData[id] = valueObj;
    });
    this.setState({ visible: true, formData: newFormData });
  };
  // 根据控件map更新各模块控件信息
  setEleParts = (
    onlyFilterItem = true,
    elementMap = this.state.elementMap,
    tabId = this.state.tabInfo.id,
    pageConfig,
  ) => {
    const eleList = elementMap[tabId] || [];
    const filterEles = eleList.filter(item => !NOT_HOME_CHART_FILTER_ELEMENTS.includes(item.basetype)) || [];
    let _obj = { filterEles };
    if (!onlyFilterItem) {
      const seniorFilter = eleList.find(item => item.basetype === 33); // 高级筛选控件
      const summaryEles = eleList.filter(item => item.basetype === 37) || []; // 汇总控件
      const chartEles = eleList.filter(item => item.basetype === 41) || []; // 大屏报表控件
      const tableListEles = eleList.filter(item => item.basetype === 42) || []; // 大屏列表控件
      const chartVarMap = this.getChartSqlVars(chartEles, filterEles);
      const summaryVarMap = this.getSummarySqlVars(summaryEles, filterEles);
      const leftChart = chartEles.filter(item => item.elementPcStyle === 1) || [];
      const middleChart = chartEles.filter(item => item.elementPcStyle === 2) || [];
      const rightChart = chartEles.filter(item => item.elementPcStyle === 3) || [];

      const leftNumberEles = leftChart.filter(item => item.showType === 1) || [];
      const leftChartEles = leftChart.filter(item => item.showType === 3) || [];
      const leftNumberChartEles = leftChart.filter(item => item.showType === 2) || [];

      const rightNumberEles = rightChart.filter(item => item.showType === 1) || [];
      const rightChartEles = rightChart.filter(item => item.showType === 3) || [];
      const rightNumberChartEles = rightChart.filter(item => item.showType === 2) || [];


      _obj = {
        seniorFilter,
        summaryEles,
        chartEles,
        filterEles,
        chartMap: { ...chartVarMap, ...summaryVarMap },
        leftChart,
        rightChart,
        leftNumberEles,
        leftChartEles,
        leftNumberChartEles,
        rightNumberEles,
        rightChartEles,
        rightNumberChartEles,
        middleChart,
        tableListEles,
      };
      console.log(_obj);
    }
    return _obj;
  };
  // 获取汇总控件中sql的变量
  getSummarySqlVars = (summaryEles, filterEles) => {
    const chartMap = {};
    // const { userInfo } = this.props;
    summaryEles.forEach(eleObj => {
      const { globalTotalVars } = eleObj;
      if (!globalTotalVars || !globalTotalVars.length) return {};
      globalTotalVars.forEach(varName => {
        // 定义该变量的控件
        const defineEleObj = filterEles.find(item => item.parameter === varName) || {};
        const { defaultValue } = defineEleObj;
        let defaultVal = null;
        if (defaultValue) { // 默认值有真实值
          defaultVal = {
            type: 1,
            value: defaultValue,
          };
          if (isGlobalOrCustomVar(defaultValue)) { // 默认值为变量
            defaultVal = this.getGlobalVarValue({
              varName: defaultValue,
              eleObj: defineEleObj,
              userInfo,
              globalMapType: 'globalQueryMap',
            });
          }
        }
        // 先取默认值，再查控件的值
        chartMap[varName] = defaultVal || this.getGlobalVarValue({
          varName,
          eleObj: defineEleObj,
          userInfo,
          globalMapType: 'globalQueryMap',
        });
      });
    });
    return chartMap;
  };
  // 获取图表控件sql中的变量
  getChartSqlVars = (chartEles, filterEles) => {
    const chartMap = {};
    // const { userInfo } = this.props;
    chartEles.forEach(chartEleObj => {
      const { chartList } = chartEleObj;
      if (chartList && chartList.length) {
        chartList.forEach(lineItem => {
          const { globalVars } = lineItem;
          if (globalVars && globalVars.length) {
            globalVars.forEach(varName => {
              // 定义该变量的控件
              const defineEleObj = filterEles.find(item => item.parameter === varName) || {};
              const { defaultValue } = defineEleObj;
              let defaultVal = null;
              if (defaultValue) { // 默认值有真实值
                defaultVal = {
                  type: 1,
                  value: defaultValue,
                };
                if (isGlobalOrCustomVar(defaultValue)) { // 默认值为变量
                  defaultVal = this.getGlobalVarValue({
                    varName: defaultValue,
                    eleObj: defineEleObj,
                    userInfo,
                    globalMapType: 'globalQueryMap',
                  });
                }
              }
              // 先取默认值，再查控件的值
              chartMap[varName] = defaultVal || this.getGlobalVarValue({
                varName,
                eleObj: defineEleObj,
                userInfo,
                globalMapType: 'globalQueryMap',
              });
            });
          }
        });
      }
    });
    return chartMap;
  };
  /**
   * 获取变量名对应的值
   */
  getGlobalVarValue = ({
                         varName = '',
                         eleObj = {},
                         globalMapType,
                       }) => {
    if (!varName) return;
    const dateRangeConfig = matchGlobalDateRange(varName);
    // 时间区间的起始结束值
    if (dateRangeConfig) {
      const { filterEles, formData } = this.state;
      const { rangeType, originTimeVarName } = dateRangeConfig;
      const eleObj = filterEles.find(item => item.parameter === originTimeVarName);
      if (!eleObj) {
        return globalMapType === 'globalMap' ? '' : {
          type: 3,
          value: '',
        };
      }
      const { id } = eleObj;
      const valueObj = formData[`${id}_${rangeType}`] || {};
      const valId = valueObj.id || '';
      return globalMapType === 'globalMap' ? valId : {
        type: 3,
        value: valId,
      };
    }
    // const { userInfo, langLib } = this.props;
    const globalVar = getValueFromGlobalVariables({
      globalVar: varName,
      userInfo,
      eleObj,
      globalMapType,
    });
    return globalVar;
  };
  // 提交搜索条件
  handleSubmit = () => {
    const { chartMap, filterEles, formData } = this.state;
    const newChartMap = { ...chartMap };
    Object.keys(formData).forEach(eleId => {
      const eleIdInfoArr = eleId.split('_');
      const compareId = eleIdInfoArr.length ? eleIdInfoArr[0] : eleId;
      const eleObj = filterEles.find(item => item.id === +compareId);
      if (!eleObj) return;
      const { parameter } = eleObj;
      if (parameter) {
        let paramKeyName = parameter;
        // 时间区间
        if (eleIdInfoArr.length > 1) {
          const rangeType = eleIdInfoArr[1];
          paramKeyName = `@@DateRange(${parameter},${rangeType === 'start' ? 1 : 2})`;
        }
        const curVarValue = chartMap[paramKeyName];
        newChartMap[paramKeyName] = {
          type: curVarValue ? curVarValue.type : 1,
          value: formData[eleId].id,
        };
      }
    });
    const partEles = this.setEleParts(false);
    this.setState({
      ...partEles,
      chartMap: newChartMap,
      visible: false,
      formData,
    });
  };
  // 更新筛选控件
  setFilterEle = ({ elementMap, ...otherItemObj }, callback) => {
    const { filterEles } = this.setEleParts(true, elementMap);
    this.setState({
      elementMap,
      filterEles,
      ...otherItemObj,
    }, () => callback && callback());
  };
  // 重置筛选条件
  handleResetFilter = () => {
    const { originElementMap } = this.state;
    const everyPartEles = this.setEleParts(false, originElementMap);
    this.setState({
      elementMap: originElementMap,
      ...everyPartEles,
      formData: {},
      visible: false,
    });
  };
  setContainerState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  };

  // 跳转菜单
  jumpToFunction = (id, attributes, functionDto) => {
    const { langLib } = this.props;
    if (!id) return;
    if (!functionDto || !attributes || !attributes.canview) {
      CMessage(langLib['global.noPermisssion'], 'error');
      return;
    }
    const functionData = {
      ...functionDto,
      frameBaseType: functionDto.frameTypeId,
      attributes,
    };
    const { tabKey, comKey, title } = getFunctionComDetail(functionData);
    if (!tabKey) return;
    this.context.dispatch({
      type: 'tabs/addTab',
      payload: {
        tabKey,
        comKey,
        title,
        functionData,
      },
    });
  };

  renderChart = (chartData) => {
    const { chartMap } = this.state;
    chartData = chartData.filter(item => item.visiabled === 1) || [];
    if (chartData.length) {
      chartData = chartData.length > 3 ? chartData.slice(0, 3) : chartData;
      return chartData.map((item, key) => {
        const boxCls = classNames({
          [styles.chartWrap]: true,
          [styles.chartNumberWrap]: item.showType === 2,
        });
        return (
          <div className={boxCls}>
            <div className={styles.title}>
              {item.elementPcStyle === 2 ? null : <span>{item.displayName}</span>}
            </div>

            <ChartList
              chartEles={[item]}
              chartMap={chartMap}
            />
          </div>
        );
      });
    } else {
      return null;
    }
  };

  renderList = (listData) => {
    const { elementMap, filterMap, tabInfo = {}, tabDropDownData, chartMap, advancedQueryMap, tabList, pageNum, pageSize, boardIsFullScreen } = this.state;
    if (listData.length) {
      return listData.map((item, key) => {
        const eleList = elementMap[item.relationTabId] || [];
        const elementList = eleList.map(item => {
          const { relationColumnName, name, displayName, basetype: baseType, mainColumnName, mainTableName, elementMultiRelation, id, relationColumnType, elementFormat, visiabled } = item;
          return {
            elementId: id,
            displayName,
            relationColumnName,
            name: relationColumnName,
            baseType,
            mainColumnName,
            mainTableName,
            elementMultiRelation,
            relationColumnType,
            elementFormat,
            visiabled,
          };
        });
        const queryList = advancedQueryMap[item.relationTabId] || [];
        const globalMap = {};
        const globalQueryMap = {};
        // 将过滤条件中的全局变量赋值
        queryList.forEach(obj => {
          const { asqlValueType, asqlValue, queryType, basetype, apiSql } = obj;
          // 面板过滤条件为组合条件方式
          if (queryType === 1 && basetype === 1) {
            // 值类型为【变量】时，需要将变量对应的值传给后台
            if (asqlValueType === 2 || isGlobalOrCustomVar(asqlValue)) {
              globalMap[obj.asqlValue] = this.getGlobalVarValues({ varName: asqlValue });
            }
          } else if (queryType === 2 && basetype === 2) { // SQL过滤条件方式
            const varArr = matchGlobalVars(apiSql);
            varArr.forEach(varName => {
              globalQueryMap[varName] = this.getGlobalVarValues({ varName, globalMapType: 'globalQueryMap' });
            });
          }
        });
        const tabId = item.relationTabId;
        const tabSource = tabList.find(item => item.id === tabId) || {};
        const contentProps = {
          elementList,
          tabId,
          tabSource: tabSource.relationTableName,
          pageNum,
          pageSize,
          globalMap,
          globalQueryMap,
        };
        const mainTabInfo = tabList.find(item => item.basetype === 6 && item.mainTab === 1) || {};
        const boxCls = classNames({
          [styles.listWrap]: true,
        });
        return (
          <div className={styles.listWrap}>
            <WorkList
              {...contentProps}
              fromType="normal"
              tabInfo={mainTabInfo}
              ref="getList"
              boardIsFullScreen={boardIsFullScreen}
            />
          </div>
        );
      });
    } else {
      return null;
    }
  };
  getTime = () => {
    this.setState({
      currentTime: formatTime(new Date()),
    });
  };
  getDay = () => {
    let day;
    switch (new Date().getDay()) {
      case 0:
        day = '星期天';
        break;
      case 1:
        day = '星期一';
        break;
      case 2:
        day = '星期二';
        break;
      case 3:
        day = '星期三';
        break;
      case 4:
        day = '星期四';
        break;
      case 5:
        day = '星期五';
        break;
      case 6:
        day = '星期六';
      default:
        break;
    }
    return day;
  };
  changeFullScreen = () => {
    const { boardIsFullScreen } = this.state;
    if (boardIsFullScreen) {
      this.handleExitFullscreen();
    } else {
      this.handleFullScreen();
    }
    // let full = boardIsFullScreen ? false : true;
    // this.setState({
    //   boardIsFullScreen: full,
    // });
  };
  // 全屏
  handleFullScreen = () => {
    var element = document.getElementById('boardRouteWrap');
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  };

  // 退出全屏
  handleExitFullscreen = () => {
    const { boardIsFullScreen } = this.state;
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  };

  render() {
    const { visible, seniorFilter, elementMap, tabList, triggerMap, advancedQueryMap, filterMap, framePramDto, loadingPage, summaryEles, chartEles, filterEles, tabDropDownData, originElementMap, chartMap, formData, tabInfo, showFilter, showInitHome, leftChart, rightChart, leftNumberEles, leftChartEles, leftNumberChartEles, rightNumberEles, rightChartEles, rightNumberChartEles, middleChart, tableListEles, currentTime, boardIsFullScreen } = this.state;
    const FilterFormProps = {
      elementMap,
      tabList,
      triggerMap,
      advancedQueryMap,
      filterMap,
      framePramDto,
      tabInfo,
      formData,
      tabDropDownData,
      filterEles,
      originElementMap,
      getGlobalVarValue: this.getGlobalVarValue,
      setContainerState: this.setContainerState,
      setFilterEle: this.setFilterEle,
    };
    const filterEleCls = classNames({
      [styles.filterWrap]: true,
      [styles.show]: showFilter,
    });
    if (showInitHome) {
      return <Empty/>;
    }
    const iconCls = classNames({
      'iconfont': true,
      'icon-fullScreen': !boardIsFullScreen,
      'icon-exitFullScreen': boardIsFullScreen,
      [styles.iconfont]: true,
    });
    const wrapCls = classNames({
      [styles.wrap]: true,
      [styles.boardRouteWrap]: true,
      [styles.fullScreen]: boardIsFullScreen,
    });
    const mainTabInfo = tabList.find(item => item.mainTab === 1) || {};
    return (
      <div className={wrapCls} id="boardRouteWrap">
        <CSpin spinning={loadingPage}>
          <div className={styles.boardWrap}>
            <div className={styles.headWrap}>
              <div className={styles.title}>{mainTabInfo.name}</div>
              <div className={styles.header_inner_left}></div>
              <div className={styles.header_inner_right}>
                <span className={styles.time}>{currentTime}</span>
                <span>|</span>
                <span className={styles.date_week}>{this.getDay()}</span>
                <span>|</span>
                <span onClick={() => this.changeFullScreen()} className={iconCls}></span>
              </div>
            </div>
            <div className={styles.contentWrap}>
              <div className={styles.leftWrap}>

                {leftChart.length ? this.renderChart(leftChart) : null}

              </div>
              <div className={styles.middleWrap}>
                <div className={styles.middleChart}>
                  {middleChart.length ? this.renderChart(middleChart) : null}
                </div>
                <div className={styles.middleList}>
                  {tableListEles.length ? this.renderList(tableListEles) : null}
                </div>
              </div>
              <div className={styles.rightWrap}>
                {rightChart.length ? this.renderChart(rightChart) : null}
              </div>
            </div>
          </div>


        </CSpin>
      </div>
    );
  }
}

export default BoardFrameRoute;
