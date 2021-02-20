/*
 * @Author: Fus
 * @Date:   2019-09-25 09:06:37
 * @Desc: 生成图表
 */
import React, { Component } from 'react';
import echarts from 'echarts';
import { setConfig } from './config';

class Chart extends Component {
  static defaultProps = {
    config: {}, // 图表配置项
  }
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
  }
  componentDidMount() {
    setTimeout(() => {
      this.chartContainer = echarts.init(this.chartRef.current);
      this.initChart();
    }, 0);
    let resizeTimeout;
    window.addEventListener('resize', () => {
      // 避免移动一帧resize一次
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(this.chartResize, 100);
    });
  }
  chartResize = () => {
    this.chartContainer && this.chartContainer.resize();
  }
  // 生成图表
  initChart = () => {
    const { config = {} } = this.props;
    const finalConfig = setConfig({
      ...config,
    });
    this.chartContainer && this.chartContainer.setOption(finalConfig);
  }
  render() {
    return (
      <div ref={this.chartRef} style={{ width: '100%', height: '100%' }} />
    );
  }
}
export default Chart;