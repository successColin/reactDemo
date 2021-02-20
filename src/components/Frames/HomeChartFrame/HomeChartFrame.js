/*
 * @Author: Fus
 * @Date:   2020-02-24 10:21:33
 * @Desc: 首页报表框架
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import classNames from 'classnames';
import ContentContainer from '@/components/Frames/ExplorerFrame/ContentContainer/ContentContainer';
import FilterForm from './FilterForm/FilterForm';
import SummaryList from './SummaryList/SummaryList';
import ChartList from './ChartList/ChartList';
import { CMessage, CSpin } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import Empty from '@/components/HomePage/Empty';
import { BaseContext, NEED_CLEAR_SATATE_TABS } from '@/constants/global';
import { NOT_HOME_CHART_FILTER_ELEMENTS, SEARCH_SELECT_TYPE } from '@/constants/element';
import { getPageConfig } from '@/services/frame';
import { SELECT_ELEMETN_TYPE } from '@/constants/element';
import {
  getValueFromGlobalVariables,
  isGlobalOrCustomVar,
  matchGlobalDateRange,
  getSelectSearchInfoById, getFunctionComDetail, controlAuthority, jsonParse, jumpFileOfCommon,
} from '@/utils/common';
import { getPageSelectOptions } from '@/services/frame';
import styles from './HomeChartFrame.less';

@connect(state => ({
  userInfo: state.user.userInfo,
  user: state.user,
  tabs: state.tabs,
  functionData: state.tabs.activeTabData.functionData,
}))
class HomeChartFrame extends Component {
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
    popupTabInfo: {}, // 主面板的弹出面板
    triggerPopupEle: {}, // 触发的按钮
    seniorFilter: {}, // 高级筛选控件
    filterEles: [], // 筛选条件控件
    summaryEles: [], // 汇总控件
    chartEles: [], // 报表控件
    loadingPage: false, // 加载配置信息
    formData: {}, // 表单数据
    chartMap: {}, // sql中变量对应的值
    searchSelectInfoMap: {}, // 数据选择框获取过详情的数据存储
    contentVisible: false, // 弹出面板
  };

  componentDidMount() {
    this.fetchPageConfig();
  }

  // 获取配置数据
  fetchPageConfig = () => {
    const { langLib } = this.context;
    const { functionData } = this.props;
    const { id: functionId } = functionData;
    this.setState({ loadingPage: true });
    getPageConfig({ functionId }).then(pageConfig => {
      const { tabList, framePramDto, triggerMap, elementMap, advancedQueryMap, filterMap } = pageConfig;
      if (!framePramDto || !tabList.length || JSON.stringify(elementMap) === '{}' || (tabList.length && (!tabList.find(item => item.mainTab === 1))) || (tabList.length && tabList.find(item => item.mainTab === 1) && !(tabList.find(item => item.mainTab === 1).visiabled))) {
        this.setState({ showInitHome: true, loadingPage: false });
        return;
      }
      const tabInfo = tabList.find(item => item.mainTab === 1) || tabList[0] || {};
      const { id: tabId } = tabInfo;
      const eleList = elementMap[tabId] || [];
      const everyPartEles = this.setEleParts(false, elementMap, tabId);
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
        if (newSearchSelectInfoMap[detailkey] && formData[id] && formData[id].name !== newSearchSelectInfoMap[detailkey].name) {
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
  ) => {
    const eleList = elementMap[tabId] || [];
    const filterEles = eleList.filter(item => !NOT_HOME_CHART_FILTER_ELEMENTS.includes(item.basetype)) || [];
    let _obj = { filterEles };
    if (!onlyFilterItem) {
      const seniorFilter = eleList.find(item => item.basetype === 33); // 高级筛选控件
      const summaryEles = eleList.filter(item => item.basetype === 37) || []; // 汇总控件
      const chartEles = eleList.filter(item => item.basetype === 38) || []; // 报表控件
      const chartVarMap = this.getChartSqlVars(chartEles, filterEles);
      const summaryVarMap = this.getSummarySqlVars(summaryEles, filterEles);
      _obj = {
        seniorFilter,
        summaryEles,
        chartEles,
        filterEles,
        chartMap: { ...chartVarMap, ...summaryVarMap },
      };
    }
    return _obj;
  };
  // 获取汇总控件中sql的变量
  getSummarySqlVars = (summaryEles, filterEles) => {
    const chartMap = {};
    summaryEles.forEach(eleObj => {
      const { globalTotalVars } = eleObj;
      if (!globalTotalVars || !globalTotalVars.length) return {};
      globalTotalVars.forEach(varName => {
        // 定义该变量的控件
        const defineEleObj = filterEles.find(item => item.parameter === varName) || {};
        const { defaultValue, basetype: baseType } = defineEleObj;
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
              globalMapType: 'globalQueryMap',
            });
          }
        }
        // 先取默认值，再查控件的值
        let data = defaultVal || this.getGlobalVarValue({
          varName,
          eleObj: defineEleObj,
          globalMapType: 'globalQueryMap',
        });
        let newData = {
          ...data,
          baseType,
        };
        chartMap[varName] = newData;
      });
    });
    return chartMap;
  };
  // 获取图表控件sql中的变量
  getChartSqlVars = (chartEles, filterEles) => {
    const chartMap = {};
    chartEles.forEach(chartEleObj => {
      const { chartList } = chartEleObj;
      if (chartList && chartList.length) {
        chartList.forEach(lineItem => {
          const { globalVars } = lineItem;
          if (globalVars && globalVars.length) {
            globalVars.forEach(varName => {
              // 定义该变量的控件
              const defineEleObj = filterEles.find(item => item.parameter === varName) || {};
              const { defaultValue, basetype: baseType } = defineEleObj;
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
                    globalMapType: 'globalQueryMap',
                  });
                }
              }
              let data = defaultVal || this.getGlobalVarValue({
                varName,
                eleObj: defineEleObj,
                globalMapType: 'globalQueryMap',
              });
              let newData = {
                ...data,
                baseType,
              };
              // 先取默认值，再查控件的值
              chartMap[varName] = newData;
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
        value: valId || 0,
      };
    }
    const { userInfo } = this.props;
    const { langLib } = this.context;
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
      const { parameter, basetype: baseType } = eleObj;
      if (parameter) {
        let paramKeyName = parameter;
        // 时间区间
        if (eleIdInfoArr.length > 1) {
          const rangeType = eleIdInfoArr[1];
          paramKeyName = `@@DateRange(${parameter},${rangeType === 'start' ? 1 : 2})`;
        }
        const curVarValue = chartMap[paramKeyName];
        newChartMap[paramKeyName] = {
          type: curVarValue && curVarValue.type ? curVarValue.type : 1,
          value: formData[eleId].id,
          baseType,
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
    const { tabList } = this.state;
    const popupTabInfo = tabList.find(item => item.id === eleObj[tabIdKey]);
    const unSetData = {
      popupTabInfo,
      contentVisible: true,
      triggerPopupEle: eleObj,
    };
    this.setState(unSetData);
  };
  // 汇总中 的点击事件
  summaryClick = (eleObj) => {
    const { jumpType, relationTabId, columnSpan, id, displayName, colorCode, relationFunctionId, iconName, functionDto, userFunctionPermissionDto } = eleObj;
    if (jumpType === 1 && relationTabId) { // 执行弹出面板
      this.setPopupTabInfo({ eleObj });
    } else if (jumpType === 2 && relationFunctionId) {  // 执行跳转菜单，带参数
      const { user } = this.props;
      let result = controlAuthority(user.functionList, relationFunctionId); // 先找到有没有对应的菜单
      const { langLib } = this.context;
      if (!result.length) {
        CMessage(langLib['message.warn.nopromiss'], 'error');
        return;
      }
      this.getJumpData(eleObj);
    } else if (jumpType === 3) { // jumpType值为3 什么都不执行
      return;
    } else if (!jumpType) { // jumpType值不存在，执行原逻辑
      if ((!relationTabId || relationTabId) && relationFunctionId) {
        this.jumpToFunction(relationFunctionId, userFunctionPermissionDto, functionDto);
      } else if (relationTabId && !relationFunctionId) {
        this.setPopupTabInfo({ eleObj });
      }
    }
  };
  // 获取到跳转菜单的参数
  getJumpData = (eleObj) => {
    const { userInfo } = this.props;
    const { passParam, relationFunctionId, userFunctionPermissionDto, functionDto } = eleObj;
    let passParams = jsonParse(passParam, 'array') || [];
    let result = { jumpTag: 1 };
    for (let item of passParams) {
      const { value } = item;
      const varValue = getValueFromGlobalVariables({
        globalVar: `${value}`,
        userInfo,
        globalMapType: 'globalMapType',
      });
      if (varValue.value) {
        item = {
          ...item,
          ...varValue,
        };
      }
      result[item.key] = item;
    }
    this.jumpToFunction(relationFunctionId, userFunctionPermissionDto, functionDto, result);
  };
  // 跳转菜单
  jumpToFunction = (id, attributes, functionDto, fileData = {}) => {
    const { langLib } = this.context;
    const { tabs } = this.props;
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
    const { dispatch } = this.context;
    jumpFileOfCommon({ tabKey, comKey, title, tabs, fileData, functionData, dispatch });
  };

  render() {
    const { triggerPopupEle, popupTabInfo, contentVisible, visible, seniorFilter, elementMap, tabList, triggerMap, advancedQueryMap, filterMap, framePramDto, loadingPage, summaryEles, chartEles, filterEles, tabDropDownData, originElementMap, chartMap, formData, tabInfo, showFilter, showInitHome } = this.state;
    const { userInfo, functionData, user, tabs } = this.props;
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
    const contentProps = {
      elementMap,
      tabList,
      triggerMap,
      advancedQueryMap,
      filterMap,
      framePramDto,
      originElementMap,
      userInfo,
      functionData,
      user,
      tabs,
    };
    const filterEleCls = classNames({
      [styles.filterWrap]: true,
      [styles.show]: showFilter,
    });
    if (showInitHome) {
      return <Empty/>;
    }
    return (
      <div className={styles.wrap}>
        <div className={styles.indexHeader}>
          <span>系统主页</span>
          <div className={`${styles.filter} chartFilter`} onClick={this.handleOpenFilter}>高级筛选</div>
        </div>
        <CSpin spinning={loadingPage}>
          {/* {(seniorFilter && seniorFilter.visiabled) && (
            <div
              className={`${filterEleCls} ${showFilter ? 'showFilter' : ''}`}
              onClick={this.handleOpenFilter}
              onMouseOver={() => this.setState({ showFilter: true })}
              onMouseOut={() => this.setState({ showFilter: false })}
            >
              <i className={`iconfont icon-high_filter ${showFilter ? '' : 'custom-color'}`}/>
              <span className={styles.line}/>
              <FormattedMessage id="global.filter"/>
            </div>
          ) || null} */}
          {summaryEles.length ? (
            <SummaryList
              summaryEles={summaryEles}
              getGlobalVarValue={this.getGlobalVarValue}
              chartMap={chartMap}
              summaryClick={this.summaryClick}
            />
          ) : null}
          <ChartList
            chartEles={chartEles}
            chartMap={chartMap}
            summaryClick={this.summaryClick}
          />
        </CSpin>
        <CreateModal
          visible={contentVisible}
          title={popupTabInfo.name}
          onCancel={() => this.setState({ contentVisible: false })}
          footer={null}
          className={styles.modal}
          size="large"
        >
          <ContentContainer
            className={styles.container}
            {...contentProps}
            fromType="inPopup"
            tabInfo={popupTabInfo}
            prevTabInfo={tabInfo}
            prevEleObj={triggerPopupEle}
            afterSave={() => this.setState({ contentVisible: false })}
          />
        </CreateModal>
        <CreateModal
          visible={visible}
          title={<FormattedMessage id="menu.header.filter"/>}
          onCancel={() => this.setState({ visible: false })}
          footer={null}
        >
          <FilterForm
            {...FilterFormProps}
            handleSubmit={this.handleSubmit}
            handleCancel={() => this.setState({ visible: false })}
            handleReset={this.handleResetFilter}
          />
        </CreateModal>
      </div>
    );
  }
}

export default HomeChartFrame;
