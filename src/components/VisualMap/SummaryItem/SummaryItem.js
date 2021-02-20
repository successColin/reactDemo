/*
 * @Author: Fus
 * @Date:   2020-03-13 09:00:46
 * @Desc: 单个汇总控件
 */
import { Component } from 'react';
import classNames from 'classnames';
import { Col } from 'antd';
import { getHomeSummaryData } from '@/services/homeChart';
import { BaseContext } from '@/constants/global';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
import {
  controlAuthority,
  getFunctionComDetail,
  getValueFromGlobalVariables,
  jsonParse,
  jumpFileOfCommon,
} from '@/utils/common';
import styles from '../SummaryList.less';

class SummaryItem extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    eleObj: {}, // 控件对象
  };

  static getDerivedStateFromProps(props, state) {
    const { chartMap } = props;
    const { thisChartMap } = state;
    const newThisChartMap = { ...thisChartMap };
    Object.keys(thisChartMap).forEach(varName => {
      newThisChartMap[varName] = chartMap[varName];
    });
    if (JSON.stringify(newThisChartMap) !== JSON.stringify(thisChartMap)) {
      return {
        thisChartMap: newThisChartMap,
      };
    }
    return null;
  }

  state = {
    thisChartMap: {}, // 该图表中包含的变量名
    isFetched: false, // 是否已请求过接口
    loading: false, // 接口加载状态
    summaryData: {},
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    // 排除首次加载该图表数据及变量未更新
    if (this.state.isFetched && JSON.stringify(prevState.thisChartMap) !== JSON.stringify(this.state.thisChartMap)) {
      this.fetchData();
    }
  }

  // 获取汇总控件数据
  fetchData = () => {
    const { eleObj = [] } = this.props;
    const { id: elementIds } = eleObj;
    const thisChartMap = this.getSummaryEleGlobalVar();
    this.setState({ loading: true });
    getHomeSummaryData({ elementIds, chartMap: thisChartMap }).then(summaryData => {
      this.setState({
        loading: false,
        summaryData,
        isFetched: true,
        thisChartMap,
      });
    }, err => this.setState({ loading: false }));
  };
  // 获取汇总控件中的变量名
  getSummaryEleGlobalVar = () => {
    const { eleObj, chartMap } = this.props;
    const { globalTotalVars } = eleObj;
    const thisChartMap = {};
    if (!globalTotalVars || !globalTotalVars.length) return {};
    globalTotalVars.forEach(varName => {
      thisChartMap[varName] = chartMap[varName];
    });
    return thisChartMap;
  };
  // 汇总中 的点击事件
  summaryClick = (eleObj) => {
    const { jumpType, relationTabId, columnSpan, id, displayName, colorCode, relationFunctionId, iconName, functionDto, userFunctionPermissionDto } = eleObj;
    if (jumpType === 2 && relationFunctionId) {  // 执行跳转菜单，带参数
      const { user } = this.props;
      let result = controlAuthority(user.functionList, relationFunctionId); // 先找到有没有对应的菜单
      const { langLib } = this.context;
      if (!result.length) {
        CMessage(langLib['message.warn.nopromiss'], 'error');
        return;
      }
      this.getJumpData(eleObj);
    }
  };
  // 获取到跳转菜单的参数
  getJumpData = (eleObj) => {
    const { userInfo, functionData } = this.props;
    const { passParam, relationFunctionId, userFunctionPermissionDto, functionDto } = eleObj;
    let passParams = jsonParse(passParam, 'array') || [];
    let result = { jumpTag: functionData.id };
    for (let item of passParams) {
      const { value } = item;
      let varValue = getValueFromGlobalVariables({
        globalVar: `${value}`,
        userInfo,
        globalMapType: 'globalMapType',
      });
      if (!varValue.value && (value === '@@GraphicalGobalId' || value === '@@GraphicalGobalTableName')) {
        varValue = this.getSummaryEleGlobalVar()[value];
      }
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
    const { summaryData, loading } = this.state;
    const { eleObj } = this.props;
    const { columnSpan, id, displayName, colorCode, relationFunctionId, iconName, relationTabId } = eleObj;
    const iconCls = classNames({
      'iconfont': true,
      [`icon-${iconName}`]: true,
      [styles.icon]: true,
    });
    const boxCls = classNames({
      [styles.box]: true,
      [styles.hasFunction]: relationFunctionId || relationTabId,
    });
    return (
      <div className={styles.item} key={id}>
        <CSpin spinning={loading}>
          <div className={boxCls}
               onClick={() => this.summaryClick(eleObj)}
          >
            <div className={styles.iconWrap}>
              <i className={iconCls} style={{ color: colorCode }}/>
            </div>
            <div>
              <p className={styles.count}>{summaryData[id]}</p>
              <p className={styles.name}>{displayName}</p>
            </div>
          </div>

        </CSpin>
      </div>
    );
  }
}

export default SummaryItem;
