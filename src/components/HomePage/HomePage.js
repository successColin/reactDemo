/*
 * @Author: Fus
 * @Date:   2019-09-24 18:51:29
 * @Desc: 主页
 */
import { Component } from 'react';
import { Row, Col, Progress } from 'antd';
import Chart from './Chart/Chart';
import styles from './HomePage.less';

const countData = [
  {
    count: 289,
    name: '总故障设备',
  }, {
    count: 201,
    name: '故障工单',
  }, {
    count: 108,
    name: '新报修',
  }, {
    count: 211,
    name: '累计接修',
  },
];
const chartsData = {
  chart1: {
    title: 'MTBF趋势图',
    type: 'chart1',
    legendData: ['冲压车间', '焊装车间'],
    xAxisData: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    series: [
      {
        name: '冲压车间',
        type: 'line',
        stack: '冲压车间',
        symbol: 'circle',
        data: [400, 550, 600, 500, 450, 550, 490, 550, 650, 500, 400, 315],
        color: '#1D7DE7',
        smooth: true,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        areaStyle: {
          origin: 'start',
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#1D7DE7' },
              { offset: 1, color: '#fff' },
            ],
          },
        },
      },
      {
        name: '焊装车间',
        type: 'line',
        stack: '焊装车间',
        symbol: 'circle',
        data: [200, 300, 250, 300, 300, 400, 390, 350, 400, 300, 250, 430],
        color: '#ED4E80',
        smooth: true,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        areaStyle: {
          origin: 'start',
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#ED4E80' },
              { offset: 1, color: '#fff' },
            ],
          },
        },
      },
    ],
  },
  chart2: {
    title: 'MTTR趋势图',
    type: 'chart2',
    legendData: ['冲压车间', '焊装车间'],
    xAxisData: ['08-07', '08-08', '08-09', '08-10', '08-11', '08-12', '08-13'],
    series: [
      {
        name: '冲压车间',
        type: 'line',
        symbol: 'circle',
        data: [50, 60, 45, 90, 78, 130, 120],
        color: '#FA541C',
        smooth: true,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#FA541C' },
              { offset: 1, color: '#fff' },
            ],
          },
        },
      }, {
        name: '焊装车间',
        type: 'line',
        symbol: 'circle',
        data: [40, 70, 90, 40, 108, 120, 150],
        color: '#1D7DE7',
        smooth: true,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#1D7DE7' },
              { offset: 1, color: '#fff' },
            ],
          },
        },
      },
    ],
  },
  chart3: {
    color: ['#298EF7', '#7395F8', '#ED4E80'],
    title: '工单占比',
    type: 'chart3',
    tooltip: {
      formatter: '{b}: <br/>{c}（{d}%）',
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          normal: {
            show: false,
            position: 'center',
          },
          emphasis: {
            show: true,
          },
        },
        labelLine: {
          normal: {
            show: false,
          },
        },
        data: [
          { value: 335, name: '计划工单' },
          { value: 310, name: '保养工单' },
          { value: 234, name: '故障工单' },
        ],
      },
    ],
  },
  chart4: {
    color: ['#3894F2', '#6EB5FF', '#ED4E80', '#9DD6FF'],
    type: 'chart4',
    xAxisData: ['08-07', '08-08', '08-09', '08-10', '08-11', '08-12', '08-13'],
    legendData: ['创建工单', '执行工单', '技术完成工单', '关闭工单'],
    series: [
      {
          name: '创建工单',
          type: 'bar',
          barGap: 0,
          barWidth: 14,
          data: [320, 332, 301, 334, 390, 21, 122],
      },
      {
          name: '关闭工单',
          type: 'bar',
          barWidth: 14,
          data: [220, 182, 191, 234, 290, 12, 211],
      },
      {
          name: '执行工单',
          type: 'bar',
          barWidth: 14,
          data: [150, 232, 201, 154, 190, 4, 312],
      },
      {
          name: '技术完成工单',
          type: 'bar',
          barWidth: 14,
          data: [98, 77, 101, 99, 40, 33, 111],
      },
    ],
  },
  chart5: {
    color: ['#3894F2'],
    type: 'chart5',
    xAxisData: ['Fanuc机器人', '风机', '电机', '主轴', '传送带'],
    series: [{
      data: [400, 300, 250, 220, 100],
      type: 'line',
      smooth: true,
      // itemStyle: {
      //   color: '#3894F2',
      //   borderColor: '#fff',
      //   borderWidth: 1,
      // },
      lineStyle: {
        width: 3,
        shadowColor: '#ddd',
        shadowOffsetX: 4,
        shadowOffsetY: 4,
      },
    }],
  },
};
class HomePage extends Component {
  render() {
    return (
      <div className={styles.wrap}>
        <div className={styles.top}>
          <div className={styles.item}>
            <Row>
              {countData.map((item, index) => (
                <Col span={6} className={`${styles.countWrap} ${styles[`icon-${index + 1}`]}`} key={item.name}>
                  <div className={styles.box}>
                    <div className={styles.iconWrap}>
                      <i className={`iconfont icon-homePage-${index + 1}`} />
                    </div>
                    <div>
                      <p className={`${styles.count}`}>{item.count}</p>
                      <p>{item.name}</p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
        <div className={styles.middle}>
          <div className={styles.item}>
            <Row>
              <Col span={8}>
                <div className={styles.block}>
                  <div className={styles.tit}>{chartsData.chart1.title}</div>
                  <div className={styles.content}>
                    <Chart config={chartsData.chart1} />
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className={styles.block}>
                  <div className={styles.tit}>{chartsData.chart2.title}</div>
                  <div className={styles.content}>
                    <Chart config={chartsData.chart2} />
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className={`${styles.block} ${styles.perBlock}`}>
                  <div className={styles.tit}>{chartsData.chart3.title}</div>
                  <div className={styles.content}>
                    <Row>
                      <Col span={14} className={styles.perLine}>
                        <div className={styles.progressBox}>
                          <Progress percent={38.11} strokeWidth={6} strokeColor="#298EF7" />
                          <span className={styles.text}>计划工单</span>
                        </div>
                        <div className={styles.progressBox}>
                          <Progress percent={35.27} strokeWidth={6} strokeColor="#7395F8" />
                          <span className={styles.text}>保养工单</span>
                        </div>
                        <div className={styles.progressBox}>
                          <Progress percent={26.62} strokeWidth={6} strokeColor="#ED4E80" />
                          <span className={styles.text}>故障工单</span>
                        </div>
                      </Col>
                      <Col span={10}>
                        <Chart config={chartsData.chart3} />
                      </Col>
                    </Row>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.item}>
            <Row>
              <Col span={16}>
                <div className={styles.block}>
                  <div className={styles.tit}>近一周工单完成情况统计</div>
                  <div className={styles.content}>
                    <Chart config={chartsData.chart4} />
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className={styles.block}>
                  <div className={styles.tit}>近一周设备停机时长TOP5</div>
                  <div className={styles.content}>
                    <Chart config={chartsData.chart5} />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}
export default HomePage;