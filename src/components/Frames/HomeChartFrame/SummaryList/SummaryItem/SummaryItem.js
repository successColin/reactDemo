/*
 * @Author: Fus
 * @Date:   2020-03-13 09:00:46
 * @Desc: 单个汇总控件
 */
import { Component } from 'react';
import TweenOne from 'rc-tween-one';
import Children from 'rc-tween-one/lib/plugin/ChildrenPlugin';
import classNames from 'classnames';
import { Col, InputNumber } from 'antd';
import { getHomeSummaryData } from '@/services/homeChart';
import { BaseContext } from '@/constants/global';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
import { getFunctionComDetail } from '@/utils/common';
import styles from '../SummaryList.less';
TweenOne.plugins.push(Children);
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
    animation: {
      duration: 5000,
    },
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
  summaryClick = () => {
    const { summaryClick, eleObj } = this.props;
    summaryClick(eleObj);
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
    const animation = {
        Children: { 
          value: summaryData[id] || 0,floatLength: 0,
        }, 
        duration: 1000,
    }
    return (
      <Col span={columnSpan} className={styles.item} key={id}>
        <CSpin spinning={loading}>
          <div className={boxCls}
               onClick={() => this.summaryClick()}
          >
            <div className={styles.iconWrap}>
              {/* <i className={iconCls} /> */}
              <i className={iconCls}  style={{ color: colorCode }}/>
            </div>
            <div>
              <TweenOne
                animation={animation}
                className={styles.count}
              >
                0
              </TweenOne>
              {/* <p className={styles.count}>{summaryData[id]}</p> */}
              <p className={styles.name}>{displayName}</p>
            </div>
          </div>

        </CSpin>
      </Col>
    );
  }
}

export default SummaryItem;
