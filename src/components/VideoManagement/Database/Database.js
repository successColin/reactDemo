import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Drawer, Pagination } from 'antd';
import { CTable, CSearch } from '@/components/common/BasicWidgets';
import CModal from '@/components/common/CreateModal/CreateModal';
import DeviceDetail from './DeviceDetail/DeviceDetail';
import FaultData from './FaultData/FaultData';
import ErrorCode from '@/components/ErrorCode/ErrorCode';
import { getDevices } from '@/services/videoManager';
import Styles from './Database.less';

const { TabPane } = Tabs;

class Database extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      activeKey: 'deviceData',
      showModal: false,
      modalType: false,
      pageSize: 10,
      pageNum: 1,
      keywords: '',
      record: {}, // 单条数据记录
    };
  }

  componentDidMount() {
    console.log('did-----histort');
    this.fetch();
  }

  fetch = () => {
    const { pageSize, pageNum, keywords } = this.state;
    this.setState({ loading: true });
    getDevices({ pageSize, pageNum, keywords }).then(res => {
      const { list, total } = res;
      this.setState({ deviceData: list, deviceTotal: total, loading: false });
    });
  };

  getDeviceColumns = () => {
    return [
      {
        title: <FormattedMessage id="global.keycode"/>,
        dataIndex: 'deviceCode',
      }, {
        title: <FormattedMessage id="global.name"/>,
        dataIndex: 'deviceName',
      }, {
        title: <FormattedMessage id="global.status"/>,
        dataIndex: 'stateName',
      }, {
        title: <FormattedMessage id="appHomeConfig.module.url"/>,
        dataIndex: 'rootPath',
        render: (text) => <span title={text}>{text}</span>,
      }, {
        title: <FormattedMessage id="menu.table.operation"/>,
        dataIndex: '',
        render: (text, record) => <div><span onClick={() => this.showModalDetail('device', record)}
                                             className={Styles.clickSpan} title={text}>查看详情</span></div>,
      },
    ];
  };

  showModalDetail = (type, record) => {
    this.setState({
      modalType: type,
      record,
    }, () => {
      this.handleClickDeviceBase();
    });
  };

  // 点击设备获取详情
  handleClickDeviceBase = () => {
    const { update, deviceConfig } = this.props;
    const { deviceVisible, deviceIsShow } = deviceConfig;
    if (!deviceVisible && !deviceIsShow) { // 如果隐藏，值改成true
      update({
        deviceConfig: {
          deviceVisible: true,
          deviceIsShow: true,
        },
      });
    }
    if (deviceVisible && deviceIsShow) { // 如果资料面板展示，需要改成隐藏
      update({
        deviceConfig: {
          deviceVisible: true,
          deviceIsShow: false,
        },
      });
    }
    if (deviceVisible && !deviceIsShow) { // 如果资料面板隐藏，资料面板展示
      update({
        deviceConfig: {
          deviceVisible: true,
          deviceIsShow: true,
        },
      });
    }
  };

  // 切换选项卡
  changeTabKey = (activeKey) => {
    console.log(typeof activeKey, activeKey);
    this.setState({ activeKey });
  };
  // 获取组件内容
  getContent = (key) => {
    const { loading, activeKey, deviceData, deviceTotal, pageSize, pageNum } = this.state;
    if (key === 'deviceData') {
      const pagination = {
        total: deviceTotal,
        current: pageNum,
        className: Styles.paginationSty,
        pageSize,
        pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
        onChange: (page, newPageSize) => {
          this.setState({
            pageNum: page,
            pageSize: newPageSize,
          }, () => {
            this.fetch();
          });
        },
        onShowSizeChange: (current, pageSize) => {
          this.setState({
            pageNum: 1,
            pageSize: pageSize,
          }, () => {
            this.fetch();
          });
        },
        showTotal: (total, range) => {
          return (
            <div><FormattedMessage id="global.total"/>{total}</div>
          );
        },
      };
      return (
        <div style={{ width: '100%', height: '100%' }}>
          <CTable
            className={Styles.tablelist}
            columns={this.getDeviceColumns()}
            dataSource={deviceData}
            pagination={false}
            scroll={{ x: 'max-content', y: 92 }}
            loading={loading}
            rowKey={record => record.id}
          />
          <Pagination {...pagination}></Pagination>
        </div>);
    }
  };
  // 搜索
  searchDetails = (keywords) => {
    this.setState({ keywords, pageNum: 1 }, () => {
      this.fetch();
    });
  };

  render() {
    const { activeKey, showModal, modalType, record } = this.state;
    const { deviceConfig, update } = this.props;
    const { deviceVisible, deviceIsShow } = deviceConfig;
    return (
      <div className={Styles.databaseWrap}>
        {/*<div className={Styles.headerTitle}>*/}
        {/*  <span><FormattedMessage id="video.search.information"/></span>*/}
        {/*  {activeKey === 'deviceData' && <CSearch*/}
        {/*    className={Styles.search}*/}
        {/*    onSearch={e => this.searchDetails(e)}*/}
        {/*    onChange={e => !e.target.value && this.searchDetails(e.target.value)}*/}
        {/*  />}*/}
        {/*</div>*/}
        <Tabs
          tabBarExtraContent={activeKey === 'deviceData' && <CSearch
            className={Styles.search}
            onSearch={e => this.searchDetails(e)}
            onChange={e => !e.target.value && this.searchDetails(e.target.value)}
          />}
          activeKey={activeKey}
          animated={false}
          className={`userTabStyle ${Styles.tabContent}`}
          onChange={key => {
            this.changeTabKey(key, 'key');
          }}
        >
          <TabPane tab={<FormattedMessage id="video.equipment.information"/>} key="deviceData">
            {this.getContent('deviceData')}
          </TabPane>
          <TabPane tab={<FormattedMessage id="video.fault.information"/>} key="faultData">
            {/*<FaultData/>*/}
            <div className={Styles.error}>
              <ErrorCode/>
            </div>
          </TabPane>
        </Tabs>

        <Drawer
          title="查看详情"
          visible={deviceVisible}
          onClose={() => update({
            deviceConfig: {
              ...deviceConfig,
              deviceIsShow: false,
            },
          })}
          placement="left"
          // centered="true"
          // destroyOnClose="true"
          footer={null}
          mask={false}
          width={'70%'}
          getContainer={() => document.getElementById('main-container')}
          className={deviceIsShow ? Styles.modal : ''}
        >
          {modalType === 'fault' ? <FaultData/> : <DeviceDetail record={record}/>}
        </Drawer>
      </div>
    );
  }
}

export default Database;
