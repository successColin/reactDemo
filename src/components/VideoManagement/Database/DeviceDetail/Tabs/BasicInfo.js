import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Card } from 'antd';
import { BaseContext } from '@/constants/global';
import { CTextArea, CInput, CSearch } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import Styles from './detail.less';

const { TabPane } = Tabs;

class BasicInfo extends Component {
  static contextType = BaseContext;

  constructor() {
    super();
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    console.log('did-----histort');
  }

  getFormConfigs() {
    const { langLib } = this.context;
    const { deviceObj = {}, form } = this.props;
    const publicProps = { disabled: false };
    // 描述
    const publicBasicConfig = [
      {
        key: 'deviceCode',
        colSpan: 12,
        label: <FormattedMessage id="video.device.info"/>,
        config: {
          initialValue: deviceObj.deviceCode || '',
        },
        component: <CInput {...publicProps} />,

      }, {
        key: 'deviceName',
        colSpan: 12,
        label: <FormattedMessage id="video.device.name"/>,
        config: {
          initialValue: deviceObj.deviceName || '',
        },
        component: <CInput {...publicProps} />,
      },
      {
        key: 'stateName',
        colSpan: 12,
        label: <FormattedMessage id="video.device.status"/>,
        config: {
          initialValue: deviceObj.stateName || '',
        },
        component: <CInput {...publicProps} />,
      },
      {
        key: 'manufacturerName',
        colSpan: 12,
        label: <FormattedMessage id="video.device.manufacturerName"/>,
        config: {
          initialValue: deviceObj.manufacturerName || '',
        },
        component: <CInput {...publicProps} />,
      },
      {
        key: 'factorySerialNumber',
        colSpan: 12,
        label: <FormattedMessage id="video.device.sno"/>,
        config: {
          initialValue: deviceObj.factorySerialNumber || '',
        },
        component: <CInput {...publicProps} />,
      },
      {
        key: 'manufacturedDate',
        colSpan: 12,
        label: <FormattedMessage id="video.device.manufacturerDate"/>,
        config: {
          initialValue: deviceObj.manufacturedDate || '',
        },
        component: <CInput {...publicProps} />,
      },
      {
        key: 'deliveryDate',
        colSpan: 12,
        label: <FormattedMessage id="video.device.deliveryDate"/>,
        config: {
          initialValue: deviceObj.deliveryDate || '',
        },
        component: <CInput {...publicProps} />,
      }, {
        key: 'expiryDate',
        colSpan: 12,
        label: <FormattedMessage id="video.device.release"/>,
        config: {
          initialValue: deviceObj.expiryDate || '',
        },
        component: <CInput {...publicProps} />,
      }, {
        key: 'categoryName',
        colSpan: 12,
        label: <FormattedMessage id="video.device.categoryName"/>,
        config: {
          initialValue: deviceObj.categoryName || '',
        },
        component: <CInput {...publicProps} />,
      },
    ];

    let dataConfig = [];
    return [
      ...publicBasicConfig,
      ...dataConfig,
    ];
  }

  render() {
    const { loading, activeKey } = this.state;
    const { form } = this.props;
    return (
      <div className={Styles.basicInfo}>
        <FormItems
          formConfigs={this.getFormConfigs()}
          form={form}
          loading={loading}
        />
      </div>
    );
  }
}

export default BasicInfo;
