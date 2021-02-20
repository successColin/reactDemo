/*
 * @Author: Fus
 * @Date:   2020-03-02 13:37:49
 * @Desc: 单个图表控件展示效果
 */
import React, { Component } from 'react';
import echarts from 'echarts';
import { Empty } from 'antd';
import { getHomeChartData } from '@/services/homeChart';
import { CSpin } from '@/components/common/BasicWidgets';
import { CHART_TYPE } from '@/constants/homeChart';
import styles from './ChartItem.less';

// 折线图带区域
const getLineAreaStyle = color => ({
  origin: 'start',
  color: {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color },
      { offset: 1, color: '#fff' },
    ],
  },
});
// 默认颜色组
const initColor = [
  '#FB7633',
  '#186CF9',
  '#FD4591',
  '#FAB71C',
  '#5D40F0',
  '#186CF9',
  '#6EB5FF',
  '#0EB6CA',
  '#3B5DAB',
  '#E44A4A',
];
// 默认配置
const initConfigs = {
  toolbox: {
    show: false,
  },
  title: {
    text: '',
  },
  color: initColor,
  grid: {
    left: 20,
    right: 20,
    bottom: 40,
    top: 55,
    containLabel: true,
  },
  series: [],
  legend: {
    type: 'scroll',
    itemWidth: 8,
    itemHeight: 8,
    right: 20,
    top: 15,
    width: '60%',
    textStyle:{
      color: '#666666'
    }
  },
  tooltip: {
    trigger: 'axis',
    confine: true,
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#333333',
      },
    },
  },
  yAxis: [{
    type: 'value',
    axisTick: {
      show: false,
    },
    splitLine: {
      lineStyle: {
        color: '#E2E7EB',
      },
    },
    axisLine: {
      show: false,
      symbol: false,
      lineStyle: {
        color: '#E2E7EB',
      },
    },
    axisLabel: { textStyle: { color: '#7F7F7F', }},
    splitNumber: 5,
  }],
};

class ChartItem extends Component {
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

  static defaultProps = {
    showType: 'normal', // 展现形式 normal-常规（包含折线、柱状）、pie-饼图
  };

  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
    this.state = {
      thisChartMap: {}, // 该图表中包含的变量名
      isLoaded: false, // 是否已请求过接口
      showNoData: false, // 无数据
      chartData: {
        xAxis: [],
        yAxis: {},
      }, // 接口返回数据
    };
  }

  componentDidMount() {
    // this.fetchData();
    setTimeout(() => {
      this.chartContainer = echarts.init(this.chartRef.current);
      this.initChart(true);
    }, 0);
    let resizeTimeout;
    // 修改尺寸
    window.addEventListener('resize', () => {
      // 避免移动一帧resize一次
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(this.chartResize, 100);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // 排除首次加载该图表数据及变量未更新
    if (this.state.isLoaded && JSON.stringify(prevState.thisChartMap) !== JSON.stringify(this.state.thisChartMap)) {
      this.fetchData();
    }
  }

  // 获取数据
  fetchData = () => {
    const { eleObj } = this.props;
    const { thisChartMap } = this.state;
    this.setState({ loading: true });
    getHomeChartData({ elementId: eleObj.id, chartMap: thisChartMap }).then(chartData => {
      this.setState({
        loading: false,
        chartData,
        isLoaded: true,
      }, () => {
        chartData.xAxis && chartData.yAxis && this.initChart();
      });
    }, err => this.setState({ loading: false }));
  };
  // 修改尺寸
  chartResize = () => {
    this.chartContainer && this.chartContainer.resize();
  };
  getChartConfig = (isRoot) => {
    const { showType, lineList } = this.props;
    switch (showType) {
      case 'pie':
        return this.getPieConfig(isRoot);
      default:
        return this.getNormalConfig(isRoot);
    }
  };
  // 获取饼图的配置
  getPieConfig = (isRoot) => {
    const { chartMap, eleObj, lineList, thisChartGlobalVars } = this.props;
    const { chartData } = this.state;
    const lineLen = lineList.length;
    let thisChartMap = {}; // 该图表中包含的变量名
    let legend = []; // 图例
    let series = []; // 数据
    lineList.forEach((pieLine, index) => {
      const { id, name, globalVars, axisUnitX, axisUnitY } = pieLine;
      const yList = chartData.yAxis[id] || [];
      const xList = chartData.xAxis || [];
      const data = yList.map((y, i) => ({
        name: `${xList[i]}${axisUnitX}`,
        value: y,
      }));
      const perLeft = lineLen ? parseInt(100 / (lineLen)) : 0;
      const left = perLeft * index;
      const centerX = lineLen === 1 ? '35%' : left + perLeft / lineLen;
      // 饼图数据只有一条
      if (thisChartGlobalVars) {
        const thisVars = {};
        thisChartGlobalVars.forEach(varName => {
          thisVars[varName] = chartMap[varName];
        });
        thisChartMap = { ...thisChartMap, ...thisVars };
      }
      legend.push({
        ...initConfigs.legend,
        orient: 'vertical',
        left: `${perLeft * (index + 1) - 40}%`,
        top: 5,
        data: chartData.xAxis.map(item => `${item}${axisUnitX}`),
      });
      series.push({
        type: 'pie',
        name,
        radius: ['50%', '66%'],
        center: [centerX, '50%'],
        data,
        tooltip: {
          ...initConfigs.tooltip,
          trigger: 'item',
          formatter: `{a} <br/>{b}: {c}${axisUnitY} ({d}%)`, // 多个饼图提示只能使用一个
        },
        label: {
          show: false,
          // normal: {
          //   show: false,
          //   position: 'center',
          // },
          // emphasis: {
          //   show: true,
          //   textStyle: {
          //     fontSize: '16',
          //     fontWeight: 'bold',
          //   },
          // },
        },
        labelLine: {
          normal: {
            show: false,
          },
        },
      });
    });
    isRoot && this.setState({ thisChartMap }, () => this.fetchData());
    return {
      xAxis: [{ show: false }],
      series,
      legend,
      yAxis: null,
    };
  };
  // 生成单条数据
  getNormalConfig = (isRoot) => {
    const { chartMap, lineList } = this.props;
    const { chartData } = this.state;
    const { xAxis = [], yAxis = {} } = chartData;
    if (!lineList || !lineList.length) return {};
    const xUnit = lineList[0].axisUnitX;
    const color = []; // 颜色
    const legendData = []; // 图例
    let thisChartMap = {}; // 该图表中包含的变量名
    let series = lineList.map((lineItem, index) => { // y轴
      const { chartType, id, name, colorCode, globalVars, axisUnitY } = lineItem;
      if (globalVars) {
        const thisVars = {};
        globalVars.forEach(varName => {
          thisVars[varName] = chartMap[varName];
        });
        thisChartMap = { ...thisChartMap, ...thisVars };
      }
      const yList = chartData.yAxis[id] || [];
      color.push(colorCode);
      legendData.push(name);
      const data = yList.map(item => ({
        value: item,
        tooltip: {
          ...initConfigs.tooltip,
          trigger: 'item',
          formatter: `{a} <br/>{b}: {c}${axisUnitY}`, // 多个饼图提示只能使用一个,
        },
      }));
      const _obj = {
        type: CHART_TYPE[chartType || 1].type,
        data,
        name,
        smooth: true,
        // barWidth: 10,
        itemStyle: {
          barBorderRadius: [5, 5, 0, 0],
        },
        barWidth: 40
      };
      if (chartType === 1 && colorCode) { // 折线图配区域样式
        const areaStyle = getLineAreaStyle(colorCode);
        _obj.areaStyle = areaStyle;
      }
      return _obj;
    });
    const x = xAxis.map(item => `${item}${xUnit}`); // x轴+单位
    isRoot && this.setState({ thisChartMap }, () => this.fetchData());
    return {
      xAxis: { axisTick: { show: false }, data: x, axisLine:{lineStyle:{color:'#E2E7EB'}}, axisLabel: { textStyle: { color: '#7F7F7F', }} },
      series,
      legend: {
        ...initConfigs.legend,
        data: legendData,
      },
      color: color.length ? color : initColor,
      yAxis: initConfigs.yAxis,
    };
  };
  // 生成图表
  initChart = (isRoot) => {
    const { showType } = this.props;
    const customConfigs = this.getChartConfig(isRoot);
    const { series } = customConfigs;
    let configs = {
      ...initConfigs,
      ...customConfigs,
    };
    this.chartContainer && this.chartContainer.setOption(configs);
    const showNoData = showType === 'pie' && series[0] && !series[0].data.length;
    this.setState({ showNoData });
  };

  render() {
    const { loading, showNoData } = this.state;
    return (
      <CSpin spinning={loading}>
        {showNoData && (
          <Empty
            className={styles.empty}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
        <div ref={this.chartRef} style={{ width: '100%', height: '100%' }}/>
      </CSpin>
    );
  }
}

export default ChartItem;
