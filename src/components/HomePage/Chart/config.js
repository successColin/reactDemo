/*
 * @Author: Fus
 * @Date:   2019-09-25 10:20:16
 * @Desc: 图标配置项
 */

export const setConfig = ({
  type = 'chart1', // 图表
  legendData = [], // 图例数据
  xAxisData = [], // x轴数据
  series = [], // 数据
  color = [], // 颜色
  tooltip = null,
}) => {
  let initTooltip = {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  };
  return {
    color,
    toolbox: {
      show: false,
    },
    title: {
      text: '',
    },
    tooltip: tooltip || initTooltip,
    legend: {
      type: 'scroll',
      itemWidth: 8,
      itemHeight: 8,
      right: 0,
      top: 10,
      data: legendData,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      // borderColor: '#D7DEDE',
    },
    xAxis: xAxisData.length ? [
      {
        type: 'category',
        boundaryGap: type === 'chart4' ? true : false,
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: '#7F7F7F',
          },
        },
      },
    ] : { show: false },
    yAxis: type === 'chart3' ? { show: false } : [{
      type: 'value',
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: '#D7DEDE',
        },
      },
      axisLine: {
        show: false,
        symbol: false,
        lineStyle: {
          color: '#7F7F7F',
        },
      },
    }],
    series,
  };
};