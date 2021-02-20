/*
 * @Description: 
 * @Author: tjf
 * @Date: 2020-05-12 11:36:31
 * @LastEditTime: 2020-05-29 14:35:49
 * @LastEditors: tjf
 */
import { Component } from 'react';
import classNames from 'classnames';
import { Col } from 'antd';
import { getDataByElementId } from '@/services/board';
import { BaseContext } from '@/constants/global';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
import styles from './NumberItem.less';

class ChartNumberItem extends Component {
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
    const { id, colorCode } = eleObj;
    let itemData = JSON.stringify(summaryData) === '{}' ? [] : summaryData[id];
    const boxCls = classNames({
      [styles.box]: true,
      [styles.chartNumberbox]: true,
    });
    itemData = itemData.length > 3 ? itemData.slice(0, 3) : itemData;
    return itemData.map(item => {
      const iconCls = classNames({
        'iconfont': true,
        [`icon-${item.iconName}`]: true,
        [styles.icon]: true,
      });
      return (
        <Col span={8} className={styles.itemNumber} key={item.id}>
          <CSpin spinning={loading}>
            <div className={boxCls}>
              <div className={styles.summaryBox}>
                <div className={styles.iconWrap}>
                  <span className={iconCls} style={{ color: colorCode }}></span>
                </div>
                <p className={styles.name}>{item.name}</p>
                <p className={styles.count} style={{ color: item.colorCode }}>{item.count}</p>
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
export default ChartNumberItem;
