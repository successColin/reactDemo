/*
 * @Description: 
 * @Author: tjf
 * @Date: 2020-05-12 11:36:32
 * @LastEditTime: 2020-05-29 14:37:46
 * @LastEditors: tjf
 */

import { Component } from 'react';
import classNames from 'classnames';
import { Col } from 'antd';
import { getDataByElementId } from '@/services/board';
import { BaseContext } from '@/constants/global';
import { CSpin } from '@/components/common/BasicWidgets';
import styles from './NumberItem.less';

class NumberItem extends Component {
  static contextType = BaseContext
  static defaultProps = {
    eleObj: {}, // 控件对象
  }
  static getDerivedStateFromProps (props, state) {
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
  }
  componentDidMount () {
    this.fetchData();
  }
  componentDidUpdate (prevProps, prevState) {
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
    getDataByElementId({ elementId: eleObj.id, chartMap: thisChartMap }).then(summaryData => {
      this.setState({
        loading: false,
        summaryData,
        isFetched: true,
        thisChartMap,
      });
    }, err => this.setState({ loading: false }));
  }
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
  }
  renderItems = () => {
    const { summaryData, loading } = this.state;
    const { eleObj } = this.props;
    const { id, iconName, elementPcStyle } = eleObj;
    let itemData = JSON.stringify(summaryData) === '{}' ? [] : summaryData[id];
    const iconCls = classNames({
      'iconfont': true,
      [`icon-${iconName}`]: true,
      [styles.icon]: true,
    });
    const boxCls = classNames({
      [styles.box]: true,
    });
    const itemCls = classNames({
      [styles.item]: true,
      [styles.middleItem]: elementPcStyle === 2,
    });
    itemData = itemData.length > 6 ? itemData.slice(0, 6) : itemData;
    return itemData.map(item => {
      return (
        <Col span={8} className={itemCls} key={item.id}>
          <CSpin spinning={loading}>
            <div className={boxCls}>
              <div className={styles.summaryBox}>
                <p className={styles.count} style={{ color: item.colorCode }}>{item.count}</p>
                <p className={styles.name}>{item.name}</p>
              </div>
            </div>

          </CSpin>
        </Col>
      );
    });
  }
  render () {
    return this.renderItems();
  }
}
export default NumberItem;
