import React, { Component } from 'react';
import { Divider, Form, Breadcrumb, Spin } from 'antd';
import echarts from 'echarts';
import moment from 'moment';
import SearchQuery from './SearchQuery/SearchQuery';
import { CTable, CButton } from '@/components/common/BasicWidgets';
import { getChartQuery } from '@/services/userManager';
import { getCookie } from '@/utils/common';
import axios from 'axios';
import Styles from './SanjiuReport.less';

const OptionConfig = (xData = [], yData = [], list = []) => {
  return {
    legend: {
      data: ['计划工单', '保养工单', '故障工单'],
      right: 50,
      top: 10,
      itemWidth: 15,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '100px',
      containLabel: true,
      // borderColor: '#D7DEDE',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    xAxis: {
      type: 'category',
      data: xData,
    },
    yAxis: {
      type: 'value',
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
      },
    },
    series: [{
      data: yData.cmpData, // 计划工单
      type: 'bar',
      name: '计划工单',
      barGap: '0',
      showBackground: true,
      itemStyle: {
        normal: {
          barBorderRadius: [4, 4, 0, 0],
          color: function(params) {
            const { dataIndex } = params;
            const { type = 1 } = list[dataIndex] || {};

            if (type === 1) {
              return '#B1E3FF';
            } else if (type === 2) {
              return '#1e8bfc';
            }
          },
        },
      },
    }, {
      data: yData.pmData, // 保养工单
      type: 'bar',
      name: '保养工单',
      showBackground: true,
      itemStyle: {
        normal: {
          barBorderRadius: [4, 4, 0, 0],
          color: function(params) {
            const { dataIndex } = params;
            const { type = 1 } = list[dataIndex] || {};

            if (type === 1) {
              return '#ED4E80';
            } else if (type === 2) {
              return '#3afcaa';
            }
          },
        },
      },
    }, {
      data: yData.cmuData, // 故障工单
      type: 'bar',
      name: '故障工单',
      showBackground: true,
      itemStyle: {
        normal: {
          barBorderRadius: [4, 4, 0, 0],
          color: function(params) {
            const { dataIndex } = params;
            const { type = 1 } = list[dataIndex] || {};

            if (type === 1) {
              return '#3894F2';
            } else if (type === 2) {
              return '#fcb530';
            }
          },
        },
      },
    }],
  };
};


class SanjiuReport extends Component {
  constructor() {
    super();
    this.state = {
      chartData: [], // 图表数据
      queryParams: {}, // 请求参数
      clickList: [], // 下钻的路径
      loading: false,
    };
  }

  componentDidMount() {
    this.chartContainer = echarts.init(document.getElementById('chartId'));
    this.getChartData({ nodeId: 'P0' });
    let resizeTimeout;
    window.addEventListener('resize', () => {
      // 避免移动一帧resize一次
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(this.chartResize, 100);
    });
  }

  getChartData = (params) => {
    this.setState({ loading: true });
    getChartQuery(params).then((res = []) => {
      this.setState({
        chartData: res,
        loading: false,
      }, () => {

        let xData = res.map(item => item.name);
        let cmuData = res.map(item => item.cmucount); // 故障工单
        let pmData = res.map(item => item.pmcount); // 故障工单
        let cmpData = res.map(item => item.cmpcount); // 计划工单

        const Options = OptionConfig(xData, { cmuData, pmData, cmpData }, res);
        this.chartContainer.setOption(Options);
        this.chartContainer.off('click');
        this.chartContainer.on('click', (data) => {
          let { dataIndex } = data; // 获取柱子的下标，根据下标找到源数据
          const barData = res[dataIndex];
          const { childCount, name } = barData;
          const { queryParams } = this.state;
          const nodeId = barData.type === 1 ? `P${barData.id}` : `D${barData.id}`;
          const searchParams = {
            ...queryParams,
            nodeId,
          };
          if (!!childCount) {
            const { clickList } = this.state;
            clickList.push({
              name,
              nodeId,
            });
            this.setState({ clickList });
            this.getChartData(searchParams);
          }
        });
      });
    });
  };


  // 图表改变
  chartResize = () => {
    this.chartContainer && this.chartContainer.resize();
  };
  // 点击面包屑时的操作
  goBack = (item, index) => {
    const { queryParams, clickList } = this.state;
    const nodeId = item.nodeId;
    const searchParams = {
      ...queryParams,
      nodeId,
    };
    const newClickList = clickList.slice(0, index + 1);
    this.setState({ clickList: newClickList });
    this.getChartData(searchParams);
  };


  // 查询
  handleSubmit = () => {
    this.props.form.validateFields((errs, values) => {
      if (errs) return;
      const dateTimeFormat = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss');
      const nodeId = values.nodeId ? `P${values.nodeId}` : 'P0';
      const params = {
        endDate: values.endDate ? dateTimeFormat(values.endDate) : '',
        startDate: values.startDate ? dateTimeFormat(values.startDate) : '',
        nodeId,
      };
      this.setState({
        queryParams: params,
        clickList: [{ name: values.IGNORE_FORM_ITEM_nodeId, nodeId }],
      }, () => {
        this.getChartData(params);
      });
    });

  };
  // 查询条件清除
  handleRest = () => {
    const { form } = this.props;
    form.resetFields();
  };
  // 面包屑
  renderStep = () => {
    const { clickList = [] } = this.state;
    return <Breadcrumb>
      {
        clickList.map((item, index) =>
          (<Breadcrumb.Item onClick={() => {
            this.goBack(item, index);
          }} key={`${item.id}_${item.name}`}>{item.name}</Breadcrumb.Item>),
        )
      }
    </Breadcrumb>;
  };
  export = () => {
    this.props.form.validateFields((errs, values) => {
      if (errs) return;
      const dateTimeFormat = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss');
      const nodeId = values.nodeId ? `P${values.nodeId}` : 'P0';
      const params = {
        endDate: values.endDate ? dateTimeFormat(values.endDate) : '',
        startDate: values.startDate ? dateTimeFormat(values.startDate) : '',
        nodeId,
      };
      this.setState({
        queryParams: params,
      }, () => {
        this.doExport();
      });
    });
  };

  doExport = () => {

    const { queryParams } = this.state;

    let img = new Image();
    img.src = this.chartContainer.getDataURL({
      type: 'png',
      pixelRatio: 1, // 放大2倍
      backgroundColor: '#fff',
    });

    img.onload = function() {
      let canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      let dataURL = canvas.toDataURL('image/png');
      /**
       * 将以base64的图片url数据转换为Blob
       * 用url方式表示的base64图片数据
       */
      let base64 = {
        dataURL, // 用url方式表示的base64图片数据
        type: 'image/png', // 文件类型
      };
      const convertBase64UrlToBlob = (base64) => {
        let urlData = base64.dataURL;
        let type = base64.type;
        let bytes = null;
        if (urlData.split(',').length > 0) {// 是否带前缀
          bytes = window.atob(urlData.split(',')[1]); // 去掉url的头，并转换为byte
        } else {
          bytes = window.atob(urlData);
        }
        // 处理异常,将ascii码小于0的转换为大于0
        let ab = new ArrayBuffer(bytes.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < bytes.length; i++) {
          ia[i] = bytes.charCodeAt(i);
        }
        return new Blob([ab], { type: type });
      };

      function createObjectURL(object) {
        return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
      }
      let formData = new FormData();
      formData.append('file', convertBase64UrlToBlob(base64));
      formData.append('nodeId', queryParams.nodeId);
      formData.append('name', '工单数量统计.xls');
      formData.append('endDate', queryParams.endDate);
      formData.append('startDate', queryParams.startDate);
      axios({
        method: 'post',
        url: '/report/excel',
        responseType: 'blob',
        data: formData,
        headers: {
          token: getCookie('token'),
          'content-type': 'application/json;charset=UTF-8',
        },
      }).then(res => {
        let blob = res.data;
        let filename = '工单数量统计.xls';
        if (window.navigator.msSaveOrOpenBlob) {
          navigator.msSaveBlob(blob, filename);
          navigator.msSaveBlob(blob);
        } else {
          let a = document.createElement('a');
          let url = createObjectURL(blob);
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);

        }
      });
    };

  };

  render() {
    const { form } = this.props;
    const { chartData, loading } = this.state;
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '故障工单',
        dataIndex: 'cmucount',
        key: 'cmucount',
        sorter: (a, b) => a.cmucount - b.cmucount,
      },
      {
        title: '计划工单',
        dataIndex: 'cmpcount',
        key: 'cmpcount',
        sorter: (a, b) => a.cmpcount - b.cmpcount,
      },
      {
        title: '保养工单',
        dataIndex: 'pmcount',
        key: 'pmcount',
        sorter: (a, b) => a.pmcount - b.pmcount,
      },
      {
        title: '工单数量',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count - b.count,
      },
    ];
    const dom = this.renderStep();
    return <div className={Styles.contentWrap}>
      <SearchQuery form={form} rest={this.handleRest} submit={this.handleSubmit} dom={this.refs.content}
                   exportPdf={this.export}/>
      <div className={Styles.chartAndList} ref="content">
        <div className={Styles.chartWrap}>
          <div className={Styles.chartTitContent}>
            <div className={Styles.chartTit}> 设备工单统计</div>
            <Divider/>
            <span className={`${Styles.backBtn} custom-color`}>{dom}</span>
          </div>
          <Spin spinning={loading}>
            <div id="chartId" className={Styles.chartContent}>

            </div>
          </Spin>
        </div>
        <div className={Styles.listWrap}>
          <div className={Styles.listTitContent}>
            <div className={Styles.listTit}> 工单数据列表</div>
            <Divider/>
            <CTable loading={loading} rowKey="id" className={Styles.ctable} pagination={false} columns={columns}
                    dataSource={chartData}/>
          </div>
        </div>
      </div>
    </div>;
  }
}


export default Form.create()(SanjiuReport);
