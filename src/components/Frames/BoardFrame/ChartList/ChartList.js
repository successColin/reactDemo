/*
 * @Description:
 * @Author: tjf
 * @Date: 2020-05-11 09:44:40
 * @LastEditTime: 2020-05-29 14:33:33
 * @LastEditors: tjf
 */
import { Component } from 'react';
import { Col } from 'antd';
import classNames from 'classnames';
import ChartItem from './ChartItem/ChartItem';
import ChartNumberItem from './ChartItem/ChartNumberItem';
import NumberItem from './ChartItem/NumberItem';
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
    // const perWidth = `${parseInt(100 / showChartLen)}%`;
    const perWidth = '100%';

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
    if (ChartList.length) {
      return ChartList;
    }
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
  }

  // 渲染图表控件列表
  renderEleList = () => {
    const { chartEles = [] } = this.props;
    return chartEles.map(eleObj => {
      const { columnSpan, displayName, chartList, visiabled } = eleObj;
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
      const boxCls = classNames({
        [styles.col]: true,
        [styles.middleChartWrap]: eleObj.elementPcStyle === 2,
      });
      if (eleObj.showType === 1) {
        return (
          <Col span={24} className={boxCls} key={`chart_${eleObj.id}`}>
            <div className={styles.block}>
              <div className={styles.content}>
                <NumberItem
                  {...this.props}
                  eleObj={eleObj}
                  key={`summaryItem_${eleObj.id}`}
                />
              </div>
            </div>
          </Col>
        );
      } else if (eleObj.showType === 2) {
        return (
          <Col span={24} className={styles.col} key={`chart_${eleObj.id}`}>
            <div className={styles.block}>
              <div className={styles.content}>
                <ChartNumberItem
                  {...this.props}
                  eleObj={eleObj}
                  key={`summaryItem_${eleObj.id}`}
                />
              </div>
            </div>
          </Col>
        );
      } else if (eleObj.showType === 3) {
        return (
          <Col span={24} className={styles.col} key={`chart_${eleObj.id}`}>
            <div className={styles.block}>
              <div className={styles.content}>
                {ChartList}
              </div>
            </div>
          </Col>
        );
      }

    });
  }
  render () {
    return this.renderEleList();
  }
}
export default ChartList;
