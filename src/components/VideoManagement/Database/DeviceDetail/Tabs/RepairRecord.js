import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Card, List, Row, Col, Upload, Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import Zmage from 'react-zmage';
import { BaseContext } from '@/constants/global';
import { CTextArea, CInput, CSearch } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import Styles from './detail.less';
import { getWorkOrder, getWorkOrderData } from '@/services/videoManager';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { getBase64 } from '@/utils/common';

class RepairRecord extends Component {
  static contextType = BaseContext;

  static getDerivedStateFromProps(props, state) {
    const { record } = props;
    const { record: stateRecord } = state;
    if (record.id !== stateRecord.id) {
      return {
        record,
      };
    }
    return null;
  }

  constructor() {
    super();
    this.state = {
      data: [],
      record: {},
      loading: false,
      loading1: false,
      details: {}, // 工单详情
      hasMore: true,
      previewVisible: false,
      workOrderConfig: { pageNum: 1, pageSize: 10, keywords: '' },
      select: '',
      previewImage: '',
    };
  }


  componentDidMount() {
    this.fetchWorkOrder(res => {
      const { select } = this.state;
      const { total } = res;
      this.setState({
        loading: false,
        data: res.list || [],
        hasMore: total > res.list.length ? true : false,
        select: res.list.length ? res.list[0].id : '',
        details: {},
      }, () => {
        !!res.list.length && this.getWorkOrderInfo();
      });
    });
  }

  componentDidUpdate(preProps, preState) {
    if (preProps.record.id !== this.props.record.id) {
      this.fetchWorkOrder(res => {
        const { select } = this.state;
        const { total } = res;
        this.setState({
          loading: false,
          data: res.list || [],
          hasMore: total > res.list.length ? true : false,
          select: res.list.length ? res.list[0].id : '',
          details: {},
        }, () => {
          !!res.list.length && this.getWorkOrderInfo();
        });
      });
    }
  }

  fetchWorkOrder = (callback) => {
    const { record } = this.state;
    const { workOrderConfig: { pageNum, pageSize, keywords } } = this.state;
    getWorkOrder({ deviceId: record.id, keywords, pageNum, pageSize }).then(res => {
      callback && callback(res);
    });
  };

  // 下拉加载更多
  handleInfiniteOnLoad = (a, b) => {
    let { data, workOrderConfig, hasMore } = this.state;
    hasMore && this.setState({
      loading: true,
      workOrderConfig: {
        ...workOrderConfig,
        pageNum: workOrderConfig.pageNum + 1,
      },
    }, () => {
      this.fetchWorkOrder(res => {
        const { total } = res;
        data = data.concat(res.list);
        this.setState({
          data,
          loading: false,
          hasMore: total > data.length ? true : false,
        });
      });
    });
  };

  handleSelect = (item) => {
    this.setState({
      select: item.id,
    }, () => {
      this.getWorkOrderInfo();
    });
  };
  // 获取详情
  getWorkOrderInfo = () => {
    const { select } = this.state;
    this.setState({ loading1: true });
    getWorkOrderData({ id: select }).then(res => {
      this.setState({ details: res, loading1: false });
    });
  };
  handlePreview = async file => {
    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };

  getFormConfigs() {
    const { langLib } = this.context;
    const { details, previewVisible, previewImage } = this.state;
    const publicProps = { disabled: false };
    // 描述
    const publicBasicConfig = [
      {
        key: 'repairUserName',
        colSpan: 12,
        label: <FormattedMessage id="video.workorder.name"/>,
        config: {
          initialValue: details.repairUserName || '',
        },
        component: <CInput {...publicProps} />,

      }, {
        key: 'repairTime',
        colSpan: 12,
        label: <FormattedMessage id="video.workorder.time"/>,
        config: {
          initialValue: details.repairTime || '',
        },
        component: <CInput {...publicProps} />,

      }, {
        key: 'faultSymptom',
        label: <FormattedMessage id="video.workorder.error1"/>,
        config: {
          initialValue: details.faultSymptom || '',
        },
        colSpan: 24,
        component: <CTextArea/>,
      }, {
        key: 'faultCause',
        label: <FormattedMessage id="video.workorder.error2"/>,
        config: {
          initialValue: details.faultCause || '',
        },
        colSpan: 24,
        component: <CTextArea/>,
      }, {
        key: 'solution',
        label: <FormattedMessage id="video.workorder.error3"/>,
        config: {
          initialValue: details.solution || '',
        },
        colSpan: 24,
        component: <CTextArea/>,
      }, {
        key: 'file',
        label: '图片',
        config: {
          initialValue: details.files || [],
        },
        colSpan: 24,
        component:
          (details.files && details.files.length ? <Upload
              listType="picture-card"
              disabled={true}
              onPreview={this.handlePreview}
              fileList={details.files && details.files.map((item, index) => ({
                name: item.fileName,
                url: item.fileUrl,
                status: 'done',
                uid: index,
              })) || []}
            /> : <div style={{ lineHeight: '32px' }}>暂无数据</div>
          ),
      },
    ];

    let dataConfig = [];
    return [
      ...publicBasicConfig,
      ...dataConfig,
    ];
  }

  renderList = (item, current) => {
    const { select } = this.state;
    return (<div className={`${Styles.listItem} ${select === item.id ? Styles.on : ''}`}
                 onClick={() => this.handleSelect(item)}>
      <Row key={item.id}>
        <Col span={3}>
          <span className="iconfont icon-list-first custom-color"/>
        </Col>
        <Col span={21}>
          <span className={Styles.block}>{'维修人员: ' + (item.repairUserName || '')}</span>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {item.repairTime || ''}
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {'故障现象: ' + (item.faultSymptom || '')}
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {'工单状态: ' + (item.stateName || '')}
        </Col>
      </Row>
    </div>);
  };
  searchDetails = (val = '') => {
    this.setState({
      workOrderConfig: { pageNum: 1, pageSize: 10, keywords: val },
    }, () => {
      this.fetchWorkOrder((res) => {
        const { total } = res;
        this.setState({
          loading: false,
          data: res.list || [],
          hasMore: total > res.list.length ? true : false,
          select: res.list.length ? res.list[0].id : '',
        }, () => {
          !!res.list.length && this.getWorkOrderInfo();
        });
      });
    });
  };

  render() {
    const { loading1, previewImage, previewVisible } = this.state;
    const { form } = this.props;
    return (
      <div className={Styles.detailWrap}>
        <div className={Styles.left}>
          <CSearch
            className={Styles.search}
            onSearch={e => this.searchDetails(e)}
            onChange={e => !e.target.value && this.searchDetails()}
          />
          <div className={`demo-infinite-container ${Styles.listWrap}`}>
            <InfiniteScroll
              initialLoad={false}
              pageStart={0}
              loadMore={this.handleInfiniteOnLoad}
              hasMore={!this.state.loading && this.state.hasMore}
              useWindow={false}
            >
              <List
                bordered={false}
                dataSource={this.state.data}
                renderItem={(item, index) => (
                  <List.Item key={item.name}>
                    {this.renderList(item, index)}
                  </List.Item>
                )}
              >
                {this.state.loading && this.state.hasMore && (
                  <div className="demo-loading-container">
                    <Spin/>
                  </div>
                )}
              </List>
            </InfiniteScroll>

          </div>
        </div>
        <div className={Styles.right}>
          <FormItems
            formConfigs={this.getFormConfigs()}
            form={form}
            loading={loading1}
          />
        </div>
        <CreateModal visible={previewVisible} footer={null}
                     zIndex={23335}
                     onCancel={() => this.setState({ previewVisible: false })}>
          <Zmage
            controller={{
              // 关闭按钮
              close: true,
              // 缩放按钮
              zoom: false,
              // 旋转按钮
              rotate: true,
            }}
            zIndex={23336}
            onZooming={state => {
              console.info('Zooming State: ', state);
            }}
            style={{ width: '100%' }} src={previewImage}
          />
        </CreateModal>
      </div>
    );
  }
}

export default RepairRecord;
