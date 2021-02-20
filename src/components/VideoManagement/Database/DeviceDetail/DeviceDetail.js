import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Card, Form } from 'antd';
import { CTable, CSearch } from '@/components/common/BasicWidgets';
import BasicInfo from './Tabs/BasicInfo';
import RepairRecord from './Tabs/RepairRecord';
import RelationFiles from './Tabs/RelationFiles';
import { getInfo, getWorkOrder } from '@/services/videoManager';
import Styles from './DeviceDetail.less';

const { TabPane } = Tabs;

class DeviceDetail extends Component {
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
      loading: false,
      activeKey: 'basicInfo',
      showDeviceDetail: false,
      showFaultDetail: false,
      deviceObj: {}, // 基本信息详情
      record: {},
      workOrderConfig: { // 工单配置
        pageNum: 1,
        pageSize: 10,
        keywords: '',
      },
    };
  }

  componentDidMount() {
    console.log('did-----histort');
    this.fetchInfo();
  }

  componentDidUpdate(preProps, preState) {
    if (preProps.record.id !== this.props.record.id) {
      this.fetchInfo();
    }
  }


  // 获取设备详情
  fetchInfo = () => {
    const { record } = this.state;
    getInfo({ id: record.id }).then(res => {
      this.setState({ deviceObj: res });
    });
  };

  // 切换选项卡
  changeTabKey = (activeKey) => {
    console.log(typeof activeKey, activeKey);
    this.setState({ activeKey });
  };


  render() {
    const { loading, activeKey, deviceObj, record } = this.state;
    console.log(record);
    const { form } = this.props;
    return (
      <div className={Styles.deviceDetail}>
        <Tabs
          activeKey={activeKey}
          animated={false}
          className={'userTabStyle'}
          onChange={key => {
            this.changeTabKey(key, 'key');
          }}
        >
          <TabPane tab={<FormattedMessage id="video.spectacle.info"/>} key="basicInfo">
            <BasicInfo deviceObj={deviceObj} form={form}/>
          </TabPane>
          <TabPane tab={<FormattedMessage id="video.device.repair"/>} key="repairRecord">
            <RepairRecord record={record} form={form}/>
          </TabPane>
          <TabPane tab={<FormattedMessage id="video.device.document"/>} key="relationFiles">
            <RelationFiles record={record} form={form}/>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Form.create({})(DeviceDetail);
;
