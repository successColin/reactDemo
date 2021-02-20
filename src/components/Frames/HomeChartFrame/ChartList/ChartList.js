/*
 * @Author: Fus
 * @Date:   2020-03-02 10:07:52
 * @Desc: 图表控件列表
 */
import { Component } from 'react';
import { Col } from 'antd';
import { FormattedMessage } from 'react-intl';
import ChartItem from './ChartItem/ChartItem';
import styles from './ChartList.less';

class ChartList extends Component {
  // 渲染一个控件内多个图表
  getChartList = (args) => {
    const { pieLines = [], normalLines = [], showChartLen, eleObj } = args;
    const { chartList } = eleObj;
    // 该图表中出现的变量名
    let thisChartGlobalVars = [];
    if (chartList && chartList.length) {
      chartList.forEach(line => {
        if (line.globalVars && line.globalVars.length) {
          thisChartGlobalVars = [...thisChartGlobalVars, ...line.globalVars];
        }
      });
    }
    const perWidth = `${parseInt(100 / showChartLen)}%`;

    const getSingleChart = ({
                              showType = 'normal',
                              lineList = normalLines,
                              key,
                            }) => (
      <div style={{ width: perWidth, height: '100%', display: 'inline-block' }}>
        <ChartItem
          {...args}
          lineList={lineList}
          showType={showType}
          key={key}
          thisChartGlobalVars={thisChartGlobalVars}
        />
      </div>
    );
    const normalChart = getSingleChart({ key: `normal${eleObj.id}` });
    const ChartList = normalLines.length ? [normalChart] : [];
    for (let i = 0; i < pieLines.length; i++) {
      // 饼图，一条数据一个图
      const pieChart = getSingleChart({
        showType: 'pie',
        lineList: [pieLines[i]],
        key: `pie${pieLines[i].id}`,
      });
      ChartList.push(pieChart);
    }
    return ChartList;
  };
  // 渲染图表控件列表
  renderEleList = () => {
    const { chartEles = [], summaryClick } = this.props;
    return chartEles.map(eleObj => {
      const { columnSpan, displayName, chartList, visiabled, relationTabId, relationFunctionId } = eleObj;
      const itemProps = {
        ...this.props,
        eleObj,
      };
      if (!visiabled) return null;
      if (!chartList || !chartList.length) return null;
      const pieLines = chartList.filter(item => item.chartType === 3) || [];
      const normalLines = chartList.filter(item => item.chartType !== 3) || [];
      itemProps.normalLines = normalLines;
      if (pieLines.length) itemProps.pieLines = pieLines;
      // 一个区域内展示的图表个数为：饼图个数 + 1（除饼图外若没有有其他类型的，则为0）
      const showChartLen = pieLines.length + (normalLines.length ? 1 : 0);
      const ChartList = this.getChartList({
        ...itemProps,
        showChartLen,
      });
      const lookMore = (!!relationTabId || !!relationFunctionId) &&
        <div className={styles.more} onClick={() => summaryClick(eleObj)}>
          <FormattedMessage id="global.details"/>
          <span className="iconfont custom-color icon-right"></span>
        </div>;
      return (
        <Col span={columnSpan} className={styles.col} key={`chart_${eleObj.id}`}>
          <div className={styles.block}>
            <div className={styles.tit}>{displayName} {lookMore}</div>
            <div className={styles.content}>
              {ChartList}
            </div>
          </div>
        </Col>
      );
    });
  };

  render() {
    return this.renderEleList();
  }
}

export default ChartList;
